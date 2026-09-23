import { BirthdayTripData, LiveAlertScenario, SurpriseItem } from '../types';
import { getConsolidatedSurprises } from './surpriseSync';
import { extractScenarioDateTimeComponents, sortScenariosByStartTime } from './timeLock';

/**
 * Maps a SurpriseItem category or title keywords into a LiveAlertScenario category
 */
export function deriveScenarioCategory(surprise: SurpriseItem): LiveAlertScenario['category'] {
  const title = (surprise.title || '').toLowerCase();
  
  if (title.includes('診') || title.includes('密醫') || title.includes('推拿') || title.includes('身心靈')) {
    return 'clinic';
  }
  if (title.includes('密室') || title.includes('逃脫') || title.includes('特務') || surprise.category === 'activity') {
    if (title.includes('密室') || title.includes('逃脫')) return 'escape';
  }
  if (title.includes('法式')) {
    return 'french';
  }
  if (
    surprise.category === 'cake' ||
    title.includes('生日') ||
    title.includes('慶生') ||
    title.includes('蛋糕')
  ) {
    if (title.includes('餐') || title.includes('大餐') || title.includes('隱糧') || title.includes('晚餐')) {
      return 'dinner';
    }
    return 'birthday';
  }
  if (
    title.includes('餐') ||
    title.includes('隱糧') ||
    title.includes('晚餐') ||
    title.includes('午餐') ||
    title.includes('吃')
  ) {
    return 'dinner';
  }
  if (title.includes('燒肉') || title.includes('烤肉')) {
    return 'bbq';
  }
  return 'sparkles';
}

/**
 * Formats date and time into standard Taiwanese locale display, e.g. "10/16 (五) 18:00"
 */
export function formatScenarioTimeLabel(dateStr: string, timeStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = weekDays[dateObj.getDay()] || '';
    return `${month}/${day} (${weekDay}) ${timeStr}`;
  } catch {
    return `${dateStr} ${timeStr}`;
  }
}

/**
 * Derives a clean, readable badge from time and title
 */
export function deriveScenarioBadge(timeStr: string, titleStr: string): string {
  const cleanTitle = (titleStr || '')
    .replace(/^[\s\S]*?[🕯️🎂🍽️🧖‍♀️🩺🗝️✨💌🎁📸🥩🍷🍷🥐🌸\s]+/u, '')
    .trim();
  const short = cleanTitle.substring(0, 6) || '神秘驚喜';
  return `${timeStr} ${short}`;
}

/**
 * Converts a SurpriseItem into a full LiveAlertScenario.
 * If a custom override exists in customAlertScenarios, custom message/badge/category are preserved.
 */
export function convertSurpriseToScenario(
  surprise: SurpriseItem,
  customOverride?: LiveAlertScenario
): LiveAlertScenario {
  // Determine date
  let date = surprise.date;
  if (!date) {
    if (surprise.dayNumber === 1 || (surprise.timing && (surprise.timing.includes('Day 1') || surprise.timing.includes('10/16')))) {
      date = '2026-10-16';
    } else if (surprise.dayNumber === 3 || (surprise.timing && (surprise.timing.includes('Day 3') || surprise.timing.includes('10/18')))) {
      date = '2026-10-18';
    } else {
      date = '2026-10-17';
    }
  }

  // Determine time
  let time = surprise.time;
  if (!time) {
    const match = (surprise.timing || '').match(/(\d{1,2}:\d{2})/);
    time = match ? match[1] : '18:00';
  }

  const triggerTime = `${date} ${time}`;
  const timeLabel = formatScenarioTimeLabel(date, time);
  const category = customOverride?.category || deriveScenarioCategory(surprise);
  const badge = customOverride?.badge || deriveScenarioBadge(time, surprise.title);

  // Preserve stable ID
  const scenarioId = customOverride?.id || `alert-${surprise.id}`;

  return {
    id: scenarioId,
    triggerTime: customOverride?.triggerTime || triggerTime,
    timeLabel: customOverride?.timeLabel || timeLabel,
    title: surprise.title,
    message: customOverride?.message || surprise.description || '由蔡寶為晴寶秘密安排的專屬浪漫行程！',
    secondaryHint: customOverride?.secondaryHint || surprise.hint || '蔡寶精心準備的驚喜！💕',
    category,
    badge,
    linkedSurpriseId: surprise.id,
    isCustom: surprise.isStandalone || customOverride?.isCustom || false
  };
}

/**
 * Synchronizes and generates all active Live Alert Scenarios directly from the consolidated surprises!
 *
 * Rules:
 * 1. Single Source of Truth: All active surprise items in tripData (including itinerary activities with isSecretSurprise: true)
 *    generate exactly one matching LiveAlertScenario.
 * 2. If an itinerary activity is toggled as secret surprise or a surprise is added, an alert card appears immediately.
 * 3. If an itinerary activity is un-toggled or a surprise is deleted, the alert card is removed immediately.
 * 4. Custom alert scenario push messages (from AddEditAlertCardModal) are merged by linkedSurpriseId.
 * 5. Strictly excludes any invalid items ('請半天假', '私心燒肉').
 * 6. Respects user hidden scenarios in tripData.settings.hiddenScenarioIds.
 * 7. Strictly sorts all generated scenarios chronologically by start time.
 */
export function getSynchronizedAlertScenarios(tripData: BirthdayTripData): LiveAlertScenario[] {
  if (!tripData) return [];

  const consolidatedSurprises = getConsolidatedSurprises(tripData);
  const customAlerts = tripData.customAlertScenarios || [];
  const hiddenIds = new Set(tripData.settings.hiddenScenarioIds || []);

  // Build map of custom alerts by linkedSurpriseId or id
  const customBySurpriseId = new Map<string, LiveAlertScenario>();
  const customById = new Map<string, LiveAlertScenario>();
  
  customAlerts.forEach(c => {
    if (c.linkedSurpriseId) customBySurpriseId.set(c.linkedSurpriseId, c);
    customById.set(c.id, c);
  });

  const generatedScenarios: LiveAlertScenario[] = [];
  const coveredSurpriseIds = new Set<string>();

  for (const surprise of consolidatedSurprises) {
    if (!surprise || !surprise.title) continue;
    
    // Safety filter: never create surprise alert for regular half-day leave or bbq
    if (surprise.title.includes('請半天假') || surprise.title.includes('私心燒肉') || surprise.title.includes('壽星跨日整點')) {
      continue;
    }

    if (coveredSurpriseIds.has(surprise.id)) continue;
    coveredSurpriseIds.add(surprise.id);

    // Look for matching custom override
    const override = 
      customBySurpriseId.get(surprise.id) ||
      (surprise.activityId ? customBySurpriseId.get(surprise.activityId) : undefined) ||
      customById.get(`alert-${surprise.id}`) ||
      customById.get(surprise.id);

    const scenario = convertSurpriseToScenario(surprise, override);

    // Skip if hidden by user
    if (hiddenIds.has(scenario.id) || (override && hiddenIds.has(override.id))) {
      continue;
    }

    generatedScenarios.push(scenario);
  }

  return sortScenariosByStartTime(generatedScenarios);
}

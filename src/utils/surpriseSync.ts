import { ActivityItem, BirthdayTripData, DayItinerary, SurpriseItem } from '../types';
import { sortSurprisesByStartTime } from './timeLock';

/**
 * Derives a category for a surprise based on the activity category and title
 */
export function deriveSurpriseCategory(act: ActivityItem): 'gift' | 'cake' | 'activity' | 'memory' | 'letter' {
  if (act.category === 'dining') return 'cake';
  if (act.category === 'birthday_surprise') return 'gift';
  if (act.category === 'sightseeing' || act.category === 'photo_spot') return 'memory';
  if (act.title.includes('信') || act.title.includes('卡片')) return 'letter';
  return 'activity';
}

/**
 * Computes the union of:
 * 1. Independently set surprises (standalone surprises, not tied to an itinerary activity)
 * 2. Secret itinerary items from daily schedule (activities with isSecretSurprise === true)
 *
 * Items with isSecretSurprise === false (like '請半天假') are strictly EXCLUDED.
 */
export function getConsolidatedSurprises(tripData: BirthdayTripData): SurpriseItem[] {
  if (!tripData) return [];

  // 1. Gather all secret activities from the daily itinerary
  const secretItineraryItems: SurpriseItem[] = [];
  const existingSurprises = tripData.surprises || [];

  if (Array.isArray(tripData.itinerary)) {
    tripData.itinerary.forEach((day: DayItinerary) => {
      if (!Array.isArray(day.activities)) return;

      day.activities.forEach((act: ActivityItem) => {
        // ONLY include if isSecretSurprise is explicitly true
        if (act.isSecretSurprise === true) {
          // Look up if an existing surprise record holds unlock state or custom codes
          const existing = existingSurprises.find(
            s => s.activityId === act.id || s.id === `surp-act-${act.id}` || s.id === act.id
          );

          const timeMatch = act.time.match(/(\d{1,2}:\d{2})/);
          const actTime = existing?.time || (timeMatch ? timeMatch[1] : '18:00');
          const actDate = existing?.date || day.date || (day.dayNumber === 2 ? '2026-10-17' : day.dayNumber === 3 ? '2026-10-18' : '2026-10-16');

          secretItineraryItems.push({
            id: existing?.id || `surp-act-${act.id}`,
            title: act.title,
            timing: existing?.timing || `Day ${day.dayNumber} ${act.time}`,
            date: actDate,
            time: actTime,
            location: act.location || '台南神秘地點',
            description: act.description || '由蔡寶為晴寶秘密安排的專屬浪漫行程！',
            isUnlocked: existing ? existing.isUnlocked : false,
            unlockCode: act.surpriseUnlockCode || existing?.unlockCode || '0520',
            hint: act.surpriseHint || existing?.hint || '秘密行程，等妳親自揭曉 💕',
            category: existing?.category || deriveSurpriseCategory(act),
            activityId: act.id,
            dayNumber: day.dayNumber,
            isStandalone: false,
            sourceType: 'itinerary'
          });
        }
      });
    });
  }

  // 2. Gather independent surprises
  const secretActivityIds = new Set(secretItineraryItems.map(s => s.activityId).filter(Boolean));
  const secretIds = new Set(secretItineraryItems.map(s => s.id));
  const secretTitles = new Set(secretItineraryItems.map(s => s.title.replace(/^[\s\S]*?[🕯️🎂🍽️🧖‍♀️🩺🗝️✨💌🎁📸\s]+/u, '').trim().toLowerCase()));

  const standaloneItems: SurpriseItem[] = [];

  const addStandaloneIfValid = (s: SurpriseItem) => {
    if (!s || !s.title) return;
    const cleanTitle = s.title.trim();
    if (cleanTitle.includes('請半天假') || cleanTitle.includes('私心燒肉') || cleanTitle.includes('壽星跨日整點')) return;

    // Skip if already in secretItineraryItems by activityId or ID
    if (s.activityId && secretActivityIds.has(s.activityId)) return;
    if (secretIds.has(s.id)) return;

    // Prevent duplicate appearance if exact title matches secret item
    const normalizedTitle = cleanTitle.replace(/^[\s\S]*?[🕯️🎂🍽️🧖‍♀️🩺🗝️✨💌🎁📸\s]+/u, '').trim().toLowerCase();
    if (normalizedTitle.length > 2 && secretTitles.has(normalizedTitle)) return;

    // Deduplicate within standaloneItems
    if (standaloneItems.some(item => item.id === s.id || item.title.trim() === cleanTitle)) return;

    // Deduce date and time if missing to ensure proper sorting
    let date = s.date;
    let time = s.time;
    if (!date) {
      if (s.dayNumber === 1 || (s.timing && (s.timing.includes('Day 1') || s.timing.includes('10/16')))) {
        date = '2026-10-16';
      } else if (s.dayNumber === 3 || (s.timing && (s.timing.includes('Day 3') || s.timing.includes('10/18')))) {
        date = '2026-10-18';
      } else {
        date = '2026-10-17';
      }
    }
    if (!time) {
      const match = (s.timing || '').match(/(\d{1,2}:\d{2})/);
      time = match ? match[1] : '18:00';
    }

    standaloneItems.push({
      ...s,
      date,
      time,
      isStandalone: true,
      sourceType: 'standalone'
    });
  };

  // From tripData.standaloneSurprises
  if (Array.isArray(tripData.standaloneSurprises)) {
    tripData.standaloneSurprises.forEach(addStandaloneIfValid);
  }

  // From tripData.surprises
  if (Array.isArray(existingSurprises)) {
    existingSurprises.forEach(addStandaloneIfValid);
  }

  // 3. Combine and sort strictly by start time
  const consolidated = [...standaloneItems, ...secretItineraryItems];
  return sortSurprisesByStartTime(consolidated);
}

/**
 * Takes the updated list of surprises from SurprisePlanner and syncs back to tripData:
 * - Standalone surprises are saved to tripData.standaloneSurprises
 * - Itinerary-linked surprises update the corresponding DayItinerary activities
 * - tripData.surprises is updated with the sorted consolidated list
 */
export function updateConsolidatedSurprises(
  tripData: BirthdayTripData,
  newSurprises: SurpriseItem[]
): BirthdayTripData {
  if (!tripData) return tripData;

  const standaloneList: SurpriseItem[] = [];
  const updatedItinerary = (tripData.itinerary || []).map(day => {
    return {
      ...day,
      activities: (day.activities || []).map(act => {
        // Find if this activity is in newSurprises
        const matched = newSurprises.find(s => s.activityId === act.id || s.id === `surp-act-${act.id}`);
        if (matched) {
          return {
            ...act,
            isSecretSurprise: true,
            surpriseHint: matched.hint || act.surpriseHint,
            surpriseUnlockCode: matched.unlockCode || act.surpriseUnlockCode
          };
        } else {
          // If this activity was previously secret but is no longer in newSurprises, it was deleted by user
          if (act.isSecretSurprise) {
            return {
              ...act,
              isSecretSurprise: false
            };
          }
          return act;
        }
      })
    };
  });

  // Extract standalone items
  newSurprises.forEach(s => {
    if (s.isStandalone || s.sourceType === 'standalone' || !s.activityId) {
      standaloneList.push({
        ...s,
        isStandalone: true,
        sourceType: 'standalone'
      });
    }
  });

  return {
    ...tripData,
    itinerary: updatedItinerary,
    standaloneSurprises: standaloneList,
    surprises: sortSurprisesByStartTime(newSurprises)
  };
}

import { ActivityItem, DayItinerary, SurpriseItem, LiveAlertScenario } from '../types';

export interface ActivityLockStatus {
  isUnlocked: boolean;
  unlockTime: Date;
  startTime: Date;
  minutesUntilUnlock: number;
  formattedUnlockTime: string;
  formattedStartTime: string;
}

/**
 * Parses an activity time string like "15:00 - 17:00" or "09:30" and a date "2026-10-16"
 * into exact Start Date and Unlock Date (1 hour before).
 */
export function getActivityLockStatus(
  dateStr: string, 
  timeStr: string, 
  effectiveTime: Date
): ActivityLockStatus {
  // Extract the starting HH:mm from strings like "15:00 - 17:00", "09:30", "18:00"
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  let hours = 12;
  let minutes = 0;
  
  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
  }

  // Parse date
  const cleanDateStr = dateStr.trim();
  const [year, month, day] = cleanDateStr.includes('-') 
    ? cleanDateStr.split('-').map(Number)
    : [2026, 10, 16];

  const startTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
  // Unlock exactly 1 hour (60 minutes) before start time
  const unlockTime = new Date(startTime.getTime() - 60 * 60 * 1000);

  const diffMs = unlockTime.getTime() - effectiveTime.getTime();
  const minutesUntilUnlock = Math.max(0, Math.ceil(diffMs / (60 * 1000)));
  const isUnlocked = effectiveTime.getTime() >= unlockTime.getTime();

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedUnlockTime = `${pad(unlockTime.getMonth() + 1)}/${pad(unlockTime.getDate())} ${pad(unlockTime.getHours())}:${pad(unlockTime.getMinutes())}`;
  const formattedStartTime = `${pad(startTime.getHours())}:${pad(startTime.getMinutes())}`;

  return {
    isUnlocked,
    unlockTime,
    startTime,
    minutesUntilUnlock,
    formattedUnlockTime,
    formattedStartTime
  };
}

export interface DayLockSummary {
  totalActivities: number;
  unlockedCount: number;
  lockedCount: number;
  isEntireDayLocked: boolean;
  earliestUnlockTime: Date | null;
  formattedEarliestUnlockTime: string;
  isUnlocked: boolean;
}

export function getDayLockSummary(
  day: DayItinerary, 
  effectiveTime: Date
): DayLockSummary {
  if (!day.activities || day.activities.length === 0) {
    return {
      totalActivities: 0,
      unlockedCount: 0,
      lockedCount: 0,
      isEntireDayLocked: false,
      earliestUnlockTime: null,
      formattedEarliestUnlockTime: '',
      isUnlocked: true
    };
  }

  let unlockedCount = 0;
  let earliestUnlock: Date | null = null;

  day.activities.forEach((act) => {
    const status = getActivityLockStatus(day.date, act.time, effectiveTime);
    if (status.isUnlocked) {
      unlockedCount++;
    }
    if (!earliestUnlock || status.unlockTime < earliestUnlock) {
      earliestUnlock = status.unlockTime;
    }
  });

  const lockedCount = day.activities.length - unlockedCount;
  // A day is locked if no activities are unlocked yet (i.e. before 1 hour of the earliest activity)
  const isEntireDayLocked = unlockedCount === 0;

  let formattedEarliestUnlockTime = '';
  if (earliestUnlock) {
    const d = earliestUnlock as Date;
    const pad = (n: number) => n.toString().padStart(2, '0');
    formattedEarliestUnlockTime = `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  return {
    totalActivities: day.activities.length,
    unlockedCount,
    lockedCount,
    isEntireDayLocked,
    earliestUnlockTime: earliestUnlock,
    formattedEarliestUnlockTime,
    isUnlocked: !isEntireDayLocked
  };
}

/**
 * Calculates unlock status for a Surprise item given its timing string (e.g. "Day 1 晚上 18:00", "Day 2 睡前", "Day 3 晚上 18:00")
 */
export function getSurpriseLockStatus(
  timing: string,
  effectiveTime: Date,
  isUnlockedManually: boolean = false
): { isUnlocked: boolean; unlockTime: Date; formattedUnlockTime: string } {
  // Parse Day number
  let dayNum = 1;
  if (timing.includes('Day 2') || timing.includes('10/17') || timing.includes('第二天')) dayNum = 2;
  if (timing.includes('Day 3') || timing.includes('10/18') || timing.includes('第三天')) dayNum = 3;

  // Day dates: 2026-10-16, 2026-10-17, 2026-10-18
  const dayOfMonth = 15 + dayNum;

  // Parse time
  const match = timing.match(/(\d{1,2}):(\d{2})/);
  let hours = 18;
  let minutes = 0;
  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
  } else if (timing.includes('早上') || timing.includes('早餐')) {
    hours = 9;
  } else if (timing.includes('下午') || timing.includes('午後')) {
    hours = 14;
  } else if (timing.includes('晚上') || timing.includes('晚餐')) {
    hours = 18;
  } else if (timing.includes('睡前') || timing.includes('深夜')) {
    hours = 22;
  }

  const startTime = new Date(2026, 9, dayOfMonth, hours, minutes, 0, 0); // Month is 0-indexed (9 = Oct)
  // Unlock 1 hour before start
  const unlockTime = new Date(startTime.getTime() - 60 * 60 * 1000);
  
  // Time unlocked if effectiveTime is past unlockTime OR manually unlocked
  const isUnlocked = effectiveTime.getTime() >= unlockTime.getTime() || isUnlockedManually;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedUnlockTime = `${pad(unlockTime.getMonth() + 1)}/${pad(unlockTime.getDate())} ${pad(unlockTime.getHours())}:${pad(unlockTime.getMinutes())}`;

  return {
    isUnlocked,
    unlockTime,
    formattedUnlockTime
  };
}

export interface TimePreset {
  id: string;
  label: string;
  badge: string;
  iso: string | null;
}

export const TIME_SIMULATOR_PRESETS: TimePreset[] = [
  {
    id: 'realtime',
    label: '⏰ 當前真實時間',
    badge: '系統時間',
    iso: null
  },
  {
    id: 'sim_before_trip',
    label: '9/14 10:00 (出發前一個月 · 行程保密中)',
    badge: '全行程封存未開放',
    iso: '2026-09-14T10:00:00'
  },
  {
    id: 'd1_before_trip',
    label: '10/16 14:00 (Day 1 出發前 1 小時 · 解鎖 Day 1 總結與出發)',
    badge: '解鎖 Day 1 總結',
    iso: '2026-10-16T14:00:00'
  },
  {
    id: 'd1_hotel_checkin',
    label: '10/16 16:30 (Day 1 入住煙波前)',
    badge: '解鎖飯店入住',
    iso: '2026-10-16T16:30:00'
  },
  {
    id: 'd1_dinner_time',
    label: '10/16 18:00 (Day 1 煙波晚餐 🍽️ 即時情境通知)',
    badge: '觸發 18:00 晚餐通知',
    iso: '2026-10-16T18:00:00'
  },
  {
    id: 'd1_clinic_night',
    label: '10/16 23:00 (Day 1 密醫看診 🩺 即時情境通知)',
    badge: '觸發 23:00 密醫特診',
    iso: '2026-10-16T23:00:00'
  },
  {
    id: 'd2_birthday_morning',
    label: '10/17 00:00 (Day 2 晴寶生日整點 🎂 生日祝福通知)',
    badge: '觸發 00:00 壽星通知',
    iso: '2026-10-17T00:00:00'
  },
  {
    id: 'd2_breakfast_before',
    label: '10/17 07:30 (Day 2 早餐前 1 小時 · 解鎖 Day 2 總結與早餐)',
    badge: '解鎖 Day 2 總結',
    iso: '2026-10-17T07:30:00'
  },
  {
    id: 'd2_leather_escape',
    label: '10/17 15:00 (Day 2 密室逃脫特務 🗝️ 默契挑戰通知)',
    badge: '觸發 15:00 密室通知',
    iso: '2026-10-17T15:00:00'
  },
  {
    id: 'd2_french_dinner',
    label: '10/17 18:00 (Day 2 法式慶生大餐 🕯️ 寫字盤即時通知)',
    badge: '觸發 18:00 法式大餐通知',
    iso: '2026-10-17T18:00:00'
  },
  {
    id: 'd3_snacks_tour',
    label: '10/18 08:30 (Day 3 小吃前 1 小時 · 解鎖 Day 3 總結與小吃)',
    badge: '解鎖 Day 3 總結',
    iso: '2026-10-18T08:30:00'
  },
  {
    id: 'd3_bbq_finale',
    label: '10/18 18:00 (Day 3 蔡寶私心頂級燒肉 🥩 即時通知)',
    badge: '觸發 18:00 燒肉通知',
    iso: '2026-10-18T18:00:00'
  },
  {
    id: 'd3_trip_completed',
    label: '10/18 23:00 (Day 3 行程圓滿完成)',
    badge: '全部驚喜全部解鎖',
    iso: '2026-10-18T23:00:00'
  }
];

// Helper to parse time string like "10:00 - 11:00" or "09:30" into minutes from 00:00
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 9999;
  const match = timeStr.match(/(\d{1,2})\s*[:：]\s*(\d{2})/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return hours * 60 + minutes;
  }
  return 9999;
}

// Sort activities chronologically based on their start time
export function sortActivitiesChronologically(activities: ActivityItem[]): ActivityItem[] {
  return [...activities].sort((a, b) => {
    const minA = parseTimeToMinutes(a.time);
    const minB = parseTimeToMinutes(b.time);
    return minA - minB;
  });
}

/**
 * Computes an exact timestamp (milliseconds since epoch) for a SurpriseItem
 * based on its timing string or dayNumber so items can be chronologically sorted.
 */
export function getSurpriseStartTime(item: SurpriseItem): number {
  if (!item) return 0;
  const timing = (item.timing || '').trim();

  // 1. Try full ISO date or YYYY-MM-DD HH:mm
  const fullDateMatch = timing.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s](\d{1,2}):(\d{2}))?/);
  if (fullDateMatch) {
    const y = parseInt(fullDateMatch[1], 10);
    const m = parseInt(fullDateMatch[2], 10) - 1;
    const d = parseInt(fullDateMatch[3], 10);
    const h = fullDateMatch[4] ? parseInt(fullDateMatch[4], 10) : 12;
    const min = fullDateMatch[5] ? parseInt(fullDateMatch[5], 10) : 0;
    return new Date(y, m, d, h, min, 0, 0).getTime();
  }

  // 2. Try MM/DD (e.g. "10/16 (五) 18:00" or "10-17 15:00" or "10/17")
  const mdMatch = timing.match(/(\d{1,2})[月/-](\d{1,2})(?:日)?(?:\s*.*?(\d{1,2}):(\d{2}))?/);
  if (mdMatch) {
    const m = parseInt(mdMatch[1], 10) - 1;
    const d = parseInt(mdMatch[2], 10);
    const h = mdMatch[3] ? parseInt(mdMatch[3], 10) : 12;
    const min = mdMatch[4] ? parseInt(mdMatch[4], 10) : 0;
    return new Date(2026, m, d, h, min, 0, 0).getTime();
  }

  // 3. Try Day 1 / Day 2 / Day 3 / etc.
  let dayNum = item.dayNumber || 1;
  const dayMatch = timing.match(/Day\s*(\d+)|第([一二三四五12345])天/i);
  if (dayMatch) {
    if (dayMatch[1]) {
      dayNum = parseInt(dayMatch[1], 10);
    } else if (dayMatch[2]) {
      const map: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 };
      dayNum = map[dayMatch[2]] || 1;
    }
  }

  // Day 1 starts 2026-10-16
  const dayOfMonth = 15 + dayNum;

  // Parse time HH:mm
  const timeMatch = timing.match(/(\d{1,2}):(\d{2})/);
  let hours = 18;
  let minutes = 0;

  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = parseInt(timeMatch[2], 10);
  } else if (timing.includes('00:00') || timing.includes('跨日') || timing.includes('整點')) {
    hours = 0;
    minutes = 0;
  } else if (timing.includes('清晨') || timing.includes('早餐') || timing.includes('早上')) {
    hours = 9;
    minutes = 0;
  } else if (timing.includes('中午') || timing.includes('午餐')) {
    hours = 12;
    minutes = 0;
  } else if (timing.includes('下午') || timing.includes('午後')) {
    hours = 15;
    minutes = 0;
  } else if (timing.includes('傍晚')) {
    hours = 17;
    minutes = 0;
  } else if (timing.includes('晚上') || timing.includes('晚餐')) {
    hours = 18;
    minutes = 0;
  } else if (timing.includes('深夜') || timing.includes('睡前') || timing.includes('宵夜')) {
    hours = 23;
    minutes = 0;
  }

  return new Date(2026, 9, dayOfMonth, hours, minutes, 0, 0).getTime();
}

/**
 * Sorts surprise items chronologically by their start time.
 */
export function sortSurprisesByStartTime(surprises: SurpriseItem[]): SurpriseItem[] {
  return [...surprises].sort((a, b) => {
    const timeA = getSurpriseStartTime(a);
    const timeB = getSurpriseStartTime(b);
    if (timeA !== timeB) return timeA - timeB;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Universal date/time parser that extracts a Unix timestamp from various Taiwanese & travel formats:
 * - Full ISO: "2026-10-16 15:00", "2026/10/16 15:00 - 17:00"
 * - Month/Day: "10/16 (五) 15:00", "10/16 15:00", "10月16日 15:00"
 * - Day N: "Day 1 15:00", "Day 1 下午 15:00", "D1 15:00", "第一天 15:00"
 * - Itinerary titles: "蔡寶請半天假！台中出發", "隱糧晚餐", "生日整點", "密室逃脫", "法式晚餐", "神級燒肉"
 */
export function extractTimestampFromTiming(text: string, fallbackDate: string = '2026-10-16'): number {
  if (!text) return 0;
  const raw = text.trim();

  // 1. Full YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = raw.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2}))?/);
  if (ymdMatch) {
    const y = parseInt(ymdMatch[1], 10);
    const m = parseInt(ymdMatch[2], 10) - 1;
    const d = parseInt(ymdMatch[3], 10);
    const h = ymdMatch[4] ? parseInt(ymdMatch[4], 10) : 12;
    const min = ymdMatch[5] ? parseInt(ymdMatch[5], 10) : 0;
    return new Date(y, m, d, h, min, 0, 0).getTime();
  }

  // 2. MM/DD or MM-DD or MM月DD日
  const mdMatch = raw.match(/(\d{1,2})[月/-](\d{1,2})(?:日)?(?:\s*.*?(\d{1,2}):(\d{2}))?/);
  if (mdMatch) {
    const m = parseInt(mdMatch[1], 10) - 1;
    const d = parseInt(mdMatch[2], 10);
    const h = mdMatch[3] ? parseInt(mdMatch[3], 10) : 12;
    const min = mdMatch[4] ? parseInt(mdMatch[4], 10) : 0;
    return new Date(2026, m, d, h, min, 0, 0).getTime();
  }

  // 3. Day 1 / Day 2 / Day 3 / D1 / D2 / D3 / 第一天
  let dayNum = 0;
  const dayMatch = raw.match(/(?:Day|D)\s*(\d+)|第([一二三四五12345])天/i);
  if (dayMatch) {
    if (dayMatch[1]) {
      dayNum = parseInt(dayMatch[1], 10);
    } else if (dayMatch[2]) {
      const map: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 };
      dayNum = map[dayMatch[2]] || 1;
    }
  }

  let dayOfMonth = 16;
  if (dayNum > 0) {
    dayOfMonth = 15 + dayNum;
  } else if (raw.includes('10/16') || raw.includes('10-16') || raw.includes('10月16')) {
    dayOfMonth = 16;
  } else if (raw.includes('10/17') || raw.includes('10-17') || raw.includes('10月17')) {
    dayOfMonth = 17;
  } else if (raw.includes('10/18') || raw.includes('10-18') || raw.includes('10月18')) {
    dayOfMonth = 18;
  } else if (fallbackDate) {
    const parts = fallbackDate.split('-');
    if (parts.length === 3) dayOfMonth = parseInt(parts[2], 10) || 16;
  }

  // Time extraction
  let hours = 12;
  let minutes = 0;
  const timeMatch = raw.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = parseInt(timeMatch[2], 10);
  } else if (raw.includes('00:00') || raw.includes('跨日') || raw.includes('整點') || raw.includes('壽星大日子') || raw.includes('壽星跨日整點')) {
    hours = 0; minutes = 0;
  } else if (raw.includes('清晨') || raw.includes('早餐') || raw.includes('早上')) {
    hours = 9; minutes = 0;
  } else if (raw.includes('中午') || raw.includes('午餐')) {
    hours = 12; minutes = 0;
  } else if (raw.includes('下午') || raw.includes('午後') || raw.includes('出發')) {
    hours = 15; minutes = 0;
  } else if (raw.includes('傍晚')) {
    hours = 17; minutes = 0;
  } else if (raw.includes('晚上') || raw.includes('晚餐')) {
    hours = 18; minutes = 0;
  } else if (raw.includes('深夜') || raw.includes('睡前') || raw.includes('宵夜') || raw.includes('特診')) {
    hours = 23; minutes = 0;
  }

  return new Date(2026, 9, dayOfMonth, hours, minutes, 0, 0).getTime();
}

/**
 * Parses any timing/string into standardized YYYY-MM-DD, HH:mm, and label
 */
export function extractScenarioDateTimeComponents(timing: string, fallbackDate: string = '2026-10-16'): { date: string; time: string; label: string } {
  const ts = extractTimestampFromTiming(timing, fallbackDate);
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekDay = weekDays[d.getDay()] || '五';

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
    label: `${d.getMonth() + 1}/${d.getDate()} (${weekDay}) ${hours}:${minutes}`
  };
}

/**
 * Parses the start/trigger time of a LiveAlertScenario into milliseconds.
 * Ensures custom scenarios (such as "蔡寶請半天假") sort chronologically at their exact start time.
 */
export function parseScenarioStartTime(scenario: LiveAlertScenario): number {
  if (!scenario) return 0;

  // 1. Try triggerTime
  if (scenario.triggerTime) {
    const t = extractTimestampFromTiming(scenario.triggerTime);
    if (t > 0) return t;
  }

  // 2. Try timeLabel
  if (scenario.timeLabel) {
    const t = extractTimestampFromTiming(scenario.timeLabel);
    if (t > 0) return t;
  }

  // 3. Try badge
  if (scenario.badge) {
    const t = extractTimestampFromTiming(scenario.badge);
    if (t > 0) return t;
  }

  // 4. Try title
  if (scenario.title) {
    const t = extractTimestampFromTiming(scenario.title);
    if (t > 0) return t;
  }

  return 0;
}

/**
 * Returns a short readable time badge for chips, e.g. "10/16 15:00"
 */
export function getShortScenarioTimeTag(scenario: LiveAlertScenario): string {
  const ts = parseScenarioStartTime(scenario);
  if (ts === 0) return scenario.timeLabel || '';
  const d = new Date(ts);
  const m = d.getMonth() + 1;
  const date = d.getDate();
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${m}/${date} ${h}:${min}`;
}

/**
 * Sorts live alert scenarios strictly chronologically by their trigger/start time.
 */
export function sortScenariosByStartTime(scenarios: LiveAlertScenario[]): LiveAlertScenario[] {
  return [...scenarios].sort((a, b) => {
    const timeA = parseScenarioStartTime(a);
    const timeB = parseScenarioStartTime(b);
    if (timeA !== timeB) return timeA - timeB;
    return a.id.localeCompare(b.id);
  });
}



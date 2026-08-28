import { ActivityItem, DayItinerary } from '../types';

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
      formattedEarliestUnlockTime: ''
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
    formattedEarliestUnlockTime
  };
}

/**
 * Calculates unlock status for a Surprise item given its timing string (e.g. "Day 1 晚上 18:00", "Day 2 睡前", "Day 3 晚上 18:00")
 */
export function getSurpriseLockStatus(
  timing: string,
  isUnlockedManually: boolean,
  effectiveTime: Date
): { isUnlocked: boolean; unlockTime: Date; formattedUnlockTime: string } {
  // If explicitly unlocked by password or boyfriend, it's unlocked
  if (isUnlockedManually) {
    return {
      isUnlocked: true,
      unlockTime: new Date(0),
      formattedUnlockTime: '已揭曉'
    };
  }

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
  const isUnlocked = effectiveTime.getTime() >= unlockTime.getTime();

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
    id: 'd1_before_trip',
    label: '10/16 14:00 (Day 1 出發前 1 小時)',
    badge: '解鎖出發行程',
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
    label: '10/16 17:30 (Day 1 煙波晚餐前 30 分鐘)',
    badge: '解鎖 18:00 晚餐',
    iso: '2026-10-16T17:30:00'
  },
  {
    id: 'd1_clinic_night',
    label: '10/16 22:15 (Day 1 密醫看診前 45 分鐘)',
    badge: '解鎖 23:00 密醫特診',
    iso: '2026-10-16T22:15:00'
  },
  {
    id: 'd2_birthday_morning',
    label: '10/17 08:00 (Day 2 晴寶生日！早堂早餐)',
    badge: '解鎖 10/17 慶生上午',
    iso: '2026-10-17T08:00:00'
  },
  {
    id: 'd2_leather_escape',
    label: '10/17 12:30 (Day 2 皮革手作 & 密室前)',
    badge: '解鎖手作與密室',
    iso: '2026-10-17T12:30:00'
  },
  {
    id: 'd2_french_dinner',
    label: '10/17 17:15 (Day 2 法式慶生大餐前 45 分)',
    badge: '解鎖 18:00 法式大餐',
    iso: '2026-10-17T17:15:00'
  },
  {
    id: 'd3_snacks_tour',
    label: '10/18 08:45 (Day 3 小吃巡禮前 45 分)',
    badge: '解鎖 10/18 小吃與奇美',
    iso: '2026-10-18T08:45:00'
  },
  {
    id: 'd3_bbq_finale',
    label: '10/18 17:15 (Day 3 蔡寶私心燒肉前 45 分)',
    badge: '解鎖 18:00 和牛燒肉',
    iso: '2026-10-18T17:15:00'
  },
  {
    id: 'd3_trip_completed',
    label: '10/18 23:00 (Day 3 行程圓滿完成)',
    badge: '全部驚喜全部解鎖',
    iso: '2026-10-18T23:00:00'
  }
];

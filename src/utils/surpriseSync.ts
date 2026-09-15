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
            s => s.activityId === act.id || s.id === `surp-act-${act.id}` || (s.title && s.title.includes(act.title))
          );

          secretItineraryItems.push({
            id: existing?.id || `surp-act-${act.id}`,
            title: act.title,
            timing: `Day ${day.dayNumber} ${act.time}`,
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
  // An independent surprise is one that has no activityId OR whose activityId does not exist in the itinerary
  const allItineraryActivityIds = new Set(
    (tripData.itinerary || []).flatMap(d => (d.activities || []).map(a => a.id))
  );

  const standaloneItems: SurpriseItem[] = [];

  // From tripData.standaloneSurprises (if present)
  if (Array.isArray(tripData.standaloneSurprises)) {
    tripData.standaloneSurprises.forEach((s) => {
      // Exclude if title mentions '請半天假'
      if (s.title && s.title.includes('請半天假')) return;
      standaloneItems.push({
        ...s,
        isStandalone: true,
        sourceType: 'standalone'
      });
    });
  }

  // Also check tripData.surprises for existing standalone items that haven't been migrated yet
  existingSurprises.forEach((s) => {
    // If it's already an itinerary secret, skip (handled above)
    if (s.activityId && allItineraryActivityIds.has(s.activityId)) {
      return;
    }
    // If id starts with surp-act- but not in itinerary secrets, skip
    if (s.id.startsWith('surp-act-')) {
      return;
    }
    // Never include '請半天假' as surprise
    if (s.title && s.title.includes('請半天假')) {
      return;
    }
    // Check if already in standaloneItems
    if (!standaloneItems.some(item => item.id === s.id)) {
      standaloneItems.push({
        ...s,
        isStandalone: true,
        sourceType: 'standalone'
      });
    }
  });

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

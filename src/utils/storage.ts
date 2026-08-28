import { BirthdayTripData } from '../types';
import { tainanBirthdayPreset, tokyoBirthdayPreset } from '../defaultData';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const STORAGE_KEY = 'my_girlfriend_birthday_trip_tainan_v2';
const FIRESTORE_TRIP_DOC = 'trips/qingbao_tainan_2026';

export function loadTripData(): BirthdayTripData {
  // 1. Check if there's encoded data in URL hash for quick sharing
  try {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#trip=')) {
      const encoded = hash.substring(6);
      const jsonStr = decodeURIComponent(escape(atob(encoded)));
      const parsed = JSON.parse(jsonStr) as BirthdayTripData;
      if (parsed && parsed.settings && parsed.itinerary) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse URL hash trip data:', e);
  }

  // 2. Check localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as BirthdayTripData;
      if (parsed && parsed.settings && parsed.itinerary && parsed.settings.girlfriendName?.includes('晴寶')) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read from localStorage:', e);
  }

  // 3. Return Tainan Birthday Trip default preset
  return tainanBirthdayPreset;
}

export function saveTripData(data: BirthdayTripData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save trip data to localStorage:', e);
  }
}

// Sync whole trip to Firestore Cloud (Only allowed for logged-in authorized users)
export async function syncTripToCloud(data: BirthdayTripData): Promise<boolean> {
  try {
    const currentUser = auth.currentUser;
    const currentEmail = currentUser?.email?.toLowerCase();
    
    // Check if user is logged in with authorized emails
    const authorizedBf = (data.settings.boyfriendEmail || 'stew3048@gmail.com').toLowerCase();
    const authorizedGf = (data.settings.girlfriendEmail || 'sng828388@gmail.com').toLowerCase();

    const isAuthorized = currentEmail && (
      currentEmail === authorizedBf || 
      currentEmail === 'stew3048@gmail.com' ||
      currentEmail === authorizedGf ||
      currentEmail === 'sng828388@gmail.com'
    );

    if (!isAuthorized) {
      // Silently skip cloud write for guests/unauthorized users
      return false;
    }

    const docRef = doc(db, 'trips', 'qingbao_tainan_2026');
    await setDoc(docRef, {
      ...data,
      cloudSyncedAt: new Date().toISOString(),
      lastUpdatedBy: currentEmail
    }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to sync trip to Firestore:', e);
    return false;
  }
}

// Fetch whole trip from Firestore Cloud
export async function fetchTripFromCloud(): Promise<BirthdayTripData | null> {
  try {
    const docRef = doc(db, 'trips', 'qingbao_tainan_2026');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as BirthdayTripData;
    }
  } catch (e) {
    console.warn('Failed to fetch trip from Firestore:', e);
  }
  return null;
}

// Real-time subscribe to Firestore Cloud Trip
export function subscribeToTripFromCloud(
  onUpdate: (data: BirthdayTripData) => void,
  onError?: (err: Error) => void
) {
  try {
    const docRef = doc(db, 'trips', 'qingbao_tainan_2026');
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const cloudData = snap.data() as BirthdayTripData;
          if (cloudData && cloudData.settings && cloudData.itinerary) {
            onUpdate(cloudData);
          }
        } else {
          // Initialize in Firestore if doesn't exist
          syncTripToCloud(tainanBirthdayPreset);
        }
      },
      (err) => {
        console.warn('Firestore trip subscription notice:', err);
        if (onError) onError(err);
      }
    );
  } catch (e: any) {
    console.warn('Failed to set up Firestore trip snapshot:', e);
    if (onError) onError(e);
    return () => {};
  }
}

export function getPresetByName(name: 'tainan' | 'tokyo'): BirthdayTripData {
  switch (name) {
    case 'tainan':
      return JSON.parse(JSON.stringify(tainanBirthdayPreset));
    case 'tokyo':
      return JSON.parse(JSON.stringify(tokyoBirthdayPreset));
    default:
      return JSON.parse(JSON.stringify(tainanBirthdayPreset));
  }
}

export function exportTripToJson(data: BirthdayTripData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `${data.settings.girlfriendName || '晴寶'}_台南煙波浪漫生日手冊_${data.settings.destination || 'BirthdayTrip'}.json`;
  a.download = fileName.replace(/\s+/g, '_');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateShareableUrl(data: BirthdayTripData): string {
  try {
    // Compact version for URL
    const jsonStr = JSON.stringify(data);
    const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#trip=${encoded}`;
  } catch (e) {
    console.error('Error generating share URL:', e);
    return window.location.href;
  }
}

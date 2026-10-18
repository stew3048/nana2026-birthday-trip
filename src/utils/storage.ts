import { BirthdayTripData, ExpenseItem, DiningItem, PackingItem } from '../types';
import { tainanBirthdayPreset, tokyoBirthdayPreset } from '../defaultData';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, deleteField, onSnapshot } from 'firebase/firestore';

const STORAGE_KEY = 'my_girlfriend_birthday_trip_tainan_v2';
const FIRESTORE_TRIP_DOC = 'trips/qingbao_tainan_2026';

export const MOCK_EXPENSE_IDS = new Set(['exp-1', 'exp-2', 'exp-3', 'exp-4', 'exp-5', 'exp-6', 'exp-7', 'exp-8']);
export const EXACT_MOCK_TITLES = new Set([
  '台南煙波大飯店 尊榮客房 2 晚 (含雙人早餐 & 三溫暖泳池)',
  '煙波大飯店 隱糧義式雙人晚餐 (Day 1)',
  '台南手作皮革體驗 雙人課程費用 (Day 2)',
  '台南密室逃脫 雙人挑戰門票 (Day 2)',
  '晴寶生日奢華浪漫雙人晚餐 ＆ 客製蛋糕 (Day 2)',
  '奇美博物館 雙人門票 ＆ 埃及特展沉浸式 VR 體驗 (Day 3)',
  '碳佐麻里 精品燒肉 A5 和牛大餐 (Day 3 蔡寶私心燒肉)',
  '秘密生日禮物 ＆ 精美手寫卡片'
]);

export const DEFAULT_MOCK_DINING_NAMES = new Set([
  '台南煙波大飯店 隱糧義式餐酒館 (Secret and Senses)',
  '煙波大飯店 煙波早堂超豐盛自助早餐',
  '晴寶專屬浪漫奢華生日晚餐',
  '晴寶特選：台南道地小吃美食巡禮',
  '碳佐麻里 精品燒肉 (蔡寶私心指定燒肉！)'
]);

export const DEFAULT_MOCK_PACKING_NAMES = new Set([
  '晴寶美美泳裝 & 拍照太陽眼鏡 (煙波泳池玩水必備)',
  '晴寶生日仙氣洋裝 / 小禮服 (Day 2 慶生晚餐穿)',
  '貼心暖男隨身包 (止痛藥、防蚊液、隨身面紙、濕紙巾)',
  '隨身補光自拍棒 & 拍立得相機 (含兩盒粉彩底片)',
  '20000mAh 快充行動電源 (充飽電兩顆)',
  '晴寶保濕保養品、面膜 & 護唇膏 (泡完三溫暖敷臉)',
  '雙人健保卡 & 身份證件 (蔡寶保管)',
  '舒適好走休閒鞋 (逛國華街吃小吃與奇美博物館漫步)'
]);

export function isMockExpense(item: any): boolean {
  if (!item) return false;
  if (MOCK_EXPENSE_IDS.has(item.id)) return true;
  if (typeof item.title === 'string' && EXACT_MOCK_TITLES.has(item.title.trim())) return true;
  return false;
}

export function filterOutMockExpenses(expenses: any[]): ExpenseItem[] {
  if (!Array.isArray(expenses)) return [];
  return expenses.filter(e => !isMockExpense(e));
}

// Scans all browser localStorage and sessionStorage keys to recover any user-entered expenses
export function scanAndRecoverUserExpenses(): {
  found: boolean;
  sourceKey?: string;
  recoveredExpenses: ExpenseItem[];
} {
  const result = scanAndRecoverAllTripData();
  return {
    found: result.recoveredExpenses.length > 0,
    sourceKey: result.sourceKey,
    recoveredExpenses: result.recoveredExpenses
  };
}

export interface FullRecoveryResult {
  hasData: boolean;
  sourceKey?: string;
  recoveredExpenses: ExpenseItem[];
  recoveredDining: DiningItem[];
  recoveredPackingList: PackingItem[];
}

// Scans all browser storage for user-entered content across expenses, dining, and packingList
export function scanAndRecoverAllTripData(): FullRecoveryResult {
  const candidateKeys = [
    'qingbao_user_real_expenses_backup',
    'my_girlfriend_birthday_trip_tainan_v2',
    'my_girlfriend_birthday_trip_tainan',
    'my_girlfriend_birthday_trip',
    'my_girlfriend_birthday_trip_tainan_v1',
    'qingbao_saved_expenses_backup',
    'qingbao_trip_expenses',
    'tainan_birthday_trip',
    'tripData',
    'birthday_trip_data'
  ];

  const allKeys = new Set(candidateKeys);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) allKeys.add(k);
    }
  } catch (e) {}

  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k) allKeys.add(k);
    }
  } catch (e) {}

  let bestExpenses: ExpenseItem[] = [];
  let bestDining: DiningItem[] = [];
  let bestPackingList: PackingItem[] = [];
  let detectedSource = '';

  for (const key of allKeys) {
    try {
      const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') continue;

      // 1. Check expenses
      let expList: any[] = [];
      if (Array.isArray(parsed)) expList = parsed;
      else if (Array.isArray(parsed.expenses)) expList = parsed.expenses;

      const realExp = expList
        .filter(item => {
          if (!item || typeof item !== 'object' || !item.title) return false;
          if (isMockExpense(item)) return false;
          return typeof item.amount === 'number' || typeof item.amount === 'string';
        })
        .map((item, idx) => ({
          id: item.id || `recovered-exp-${Date.now()}-${idx}`,
          title: String(item.title).trim(),
          amount: Number(item.amount) || 0,
          category: item.category || 'other',
          date: item.date || '2026-10-17',
          currency: item.currency || 'TWD',
          isPaidByBoyfriend: typeof item.isPaidByBoyfriend === 'boolean' ? item.isPaidByBoyfriend : true,
          notes: item.notes || ''
        }));

      if (realExp.length > bestExpenses.length) {
        bestExpenses = realExp;
        detectedSource = key;
      }

      // 2. Check dining
      if (Array.isArray(parsed.dining) && parsed.dining.length > 0) {
        const diningItems: DiningItem[] = parsed.dining
          .filter((d: any) => d && typeof d === 'object' && d.name)
          .map((d: any, idx: number) => ({
            id: d.id || `recovered-din-${Date.now()}-${idx}`,
            name: String(d.name).trim(),
            category: d.category || 'restaurant',
            status: d.status || 'confirmed',
            dateTime: d.dateTime || '2026-10-17 18:00',
            location: d.location || '',
            locationUrl: d.locationUrl || '',
            bookingCode: d.bookingCode || '',
            specialRequest: d.specialRequest || '',
            mustEatDishes: d.mustEatDishes || '',
            notes: d.notes || ''
          }));

        const hasCustomDining = diningItems.some(d => !DEFAULT_MOCK_DINING_NAMES.has(d.name.trim()));
        if (hasCustomDining || (bestDining.length === 0 && diningItems.length > 0)) {
          bestDining = diningItems;
          detectedSource = key;
        }
      }

      // 3. Check packingList
      if (Array.isArray(parsed.packingList) && parsed.packingList.length > 0) {
        const packingItems: PackingItem[] = parsed.packingList
          .filter((p: any) => p && typeof p === 'object' && p.name)
          .map((p: any, idx: number) => ({
            id: p.id || `recovered-pack-${Date.now()}-${idx}`,
            name: String(p.name).trim(),
            category: p.category || 'essentials',
            isChecked: Boolean(p.isChecked),
            isSweetheartSpecial: Boolean(p.isSweetheartSpecial),
            note: p.note || ''
          }));

        const hasCustomPacking = packingItems.some(p => !DEFAULT_MOCK_PACKING_NAMES.has(p.name.trim()));
        if (hasCustomPacking || (bestPackingList.length === 0 && packingItems.length > 0)) {
          bestPackingList = packingItems;
          detectedSource = key;
        }
      }
    } catch (e) {}
  }

  const hasData = bestExpenses.length > 0 || bestDining.length > 0 || bestPackingList.length > 0;
  return {
    hasData,
    sourceKey: detectedSource,
    recoveredExpenses: bestExpenses,
    recoveredDining: bestDining,
    recoveredPackingList: bestPackingList
  };
}

export function loadTripData(): BirthdayTripData {
  // 1. Check if there's encoded data in URL hash for quick sharing
  try {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#trip=')) {
      const encoded = hash.substring(6);
      const jsonStr = decodeURIComponent(escape(atob(encoded)));
      const parsed = JSON.parse(jsonStr) as BirthdayTripData;
      if (parsed && parsed.settings && parsed.itinerary) {
        return {
          ...parsed,
          expenses: filterOutMockExpenses(parsed.expenses || [])
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse URL hash trip data:', e);
  }

  // 2. Check localStorage across current and previous candidate keys
  const candidateKeys = [
    STORAGE_KEY,
    'qingbao_user_real_expenses_backup',
    'my_girlfriend_birthday_trip_tainan',
    'my_girlfriend_birthday_trip',
    'my_girlfriend_birthday_trip_tainan_v1'
  ];

  for (const key of candidateKeys) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved) as BirthdayTripData;
        if (parsed && parsed.settings && parsed.itinerary && parsed.settings.girlfriendName?.includes('晴寶')) {
          let cleanExpenses = filterOutMockExpenses(parsed.expenses || []);
          if (cleanExpenses.length === 0) {
            const recovered = scanAndRecoverUserExpenses();
            if (recovered.found) {
              cleanExpenses = recovered.recoveredExpenses;
            }
          }
          const initialPhotos = (parsed.photos && parsed.photos.length > 0 && parsed.photos.some(p => Boolean(p.imageUrl)))
            ? parsed.photos
            : tainanBirthdayPreset.photos;

          return {
            ...parsed,
            expenses: cleanExpenses,
            photos: initialPhotos
          };
        }
      }
    } catch (e) {
      console.warn('Failed to read from localStorage key:', key, e);
    }
  }

  // 3. Fallback to Tainan Birthday Trip default preset with recovered expenses if any
  const base = JSON.parse(JSON.stringify(tainanBirthdayPreset));
  const recovered = scanAndRecoverUserExpenses();
  if (recovered.found) {
    base.expenses = recovered.recoveredExpenses;
  }
  return base;
}

export function saveTripData(data: BirthdayTripData): void {
  try {
    const cleanExpenses = filterOutMockExpenses(data.expenses || []);
    
    // Large base64 photo data URLs should NOT be crammed into localStorage (5MB browser limit)
    // because photos are persisted in Firestore's dedicated 'tainan_birthday_photos' collection
    const safePhotos = (data.photos || []).map(p => {
      if (p.imageUrl && p.imageUrl.startsWith('data:') && p.imageUrl.length > 1000) {
        return {
          ...p,
          imageUrl: '' // preserve all photo metadata, strip large base64 payload from localStorage
        };
      }
      return p;
    });

    const cleanData: BirthdayTripData = {
      ...data,
      expenses: cleanExpenses,
      photos: safePhotos
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));
    } catch (quotaErr) {
      // If localStorage is near or at quota, purge old legacy keys to free up space
      const legacyKeys = [
        'my_girlfriend_birthday_trip_tainan',
        'my_girlfriend_birthday_trip',
        'my_girlfriend_birthday_trip_tainan_v1',
        'qingbao_saved_expenses_backup',
        'tainan_birthday_trip'
      ];
      for (const lk of legacyKeys) {
        try { localStorage.removeItem(lk); } catch (e) {}
      }

      // Save without photos array as fallback
      const minimalData: BirthdayTripData = {
        ...cleanData,
        photos: []
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalData));
      } catch (innerErr) {
        // Gracefully ignore if browser storage is strictly full
      }
    }

    if (cleanExpenses.length > 0) {
      try {
        localStorage.setItem('qingbao_user_real_expenses_backup', JSON.stringify(cleanExpenses));
      } catch (e) {}
    }
  } catch (e) {
    // Avoid crashing or dumping red errors into console
    console.warn('Notice: localStorage write was bypassed:', e);
  }
}

export function isAuthorizedForCloudSync(): boolean {
  return true;
}

// Sync whole trip to Firestore Cloud
export async function syncTripToCloud(data: BirthdayTripData): Promise<boolean> {
  try {
    const docRef = doc(db, 'trips', 'qingbao_tainan_2026');
    // Ensure data is completely free of undefined values (which crash Firestore)
    const sanitizedData = JSON.parse(JSON.stringify(data));
    
    // In the main trip document, do NOT store heavy base64 data URLs inside the nested photos array.
    // Each photo is already persisted individually in the 'tainan_birthday_photos' Firestore collection.
    // Writing large base64 strings into array properties causes Firestore INVALID_ARGUMENT (code: 3)
    // because single document limit is 1MB.
    if (Array.isArray(sanitizedData.photos)) {
      sanitizedData.photos = sanitizedData.photos.map((p: any) => {
        if (p && typeof p === 'object' && p.imageUrl && p.imageUrl.startsWith('data:') && p.imageUrl.length > 1000) {
          return {
            ...p,
            imageUrl: '' // heavy image data is retrieved from 'tainan_birthday_photos' collection
          };
        }
        return p;
      });
    }

    const currentEmail = auth.currentUser?.email || (typeof window !== 'undefined' ? (() => { try { return localStorage.getItem('qingbao_trip_fast_auth'); } catch(e){ return null; } })() : null) || 'qingbao-app';

    await setDoc(docRef, {
      ...sanitizedData,
      cloudSyncedAt: data.cloudSyncedAt || new Date().toISOString(),
      lastUpdatedBy: currentEmail
    }, { merge: true });
    return true;
  } catch (e: any) {
    console.warn('Notice: Firestore trip sync encountered issue, local data preserved:', e?.message || e);
    return false;
  }
}

// Dedicated helper to immediately clear active live broadcast from Firestore
export async function clearActiveLiveAlertFromCloud(): Promise<boolean> {
  try {
    const docRef = doc(db, 'trips', 'qingbao_tainan_2026');
    await updateDoc(docRef, {
      activeLiveAlert: deleteField()
    });
    return true;
  } catch (e) {
    console.warn('Failed to clear active live alert from Firestore:', e);
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
          // Document does not exist in Firestore; DO NOT blindly overwrite with presets!
          console.log('Firestore trip document not found yet.');
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

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  onSnapshot, 
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore using the specific database ID if available (omit parameter for default database)
const customDbId = firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId !== '(default)' 
  ? firebaseConfigData.firestoreDatabaseId 
  : undefined;
export const db = customDbId ? getFirestore(app, customDbId) : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Logout Error:', error);
    throw error;
  }
}

export interface SnackVoteItem {
  id: string;
  name: string;
  category: string; // 'savory' | 'sweet' | 'drink' | 'night_market'
  recommendedSpots: string; // e.g. "六千牛肉湯 / 文章牛肉湯"
  status: 'want' | 'must' | 'maybe' | 'pass'; // 'want' = 晴寶想吃, 'must' = 必吃, 'maybe' = 可吃可不吃, 'pass' = pass
  girlfriendVote?: 'want' | 'must' | 'maybe' | 'pass' | null; // 晴寶的心願狀態
  boyfriendVote?: 'want' | 'must' | 'maybe' | 'pass' | null; // 蔡寶的心願狀態
  notes?: string;
  votedBy?: 'qingbao' | 'caibao' | 'both';
  likesCount: number;
  locationArea?: string; // e.g. "中西區 / 安平區"
  isCustomAdded?: boolean;
  customAddedBy?: string;
  updatedAt?: string;
}

export const DEFAULT_TAINAN_SNACKS: SnackVoteItem[] = [
  {
    id: 'snack-beef-soup',
    name: '溫體溫潤牛肉湯',
    category: 'savory',
    recommendedSpots: '六千泓佐牛肉湯 / 文章牛肉湯 / 阿村牛肉湯',
    status: 'must',
    girlfriendVote: 'must',
    boyfriendVote: 'must',
    votedBy: 'both',
    likesCount: 2,
    locationArea: '中西區 / 安平區',
    notes: '一早現沖粉嫩溫體牛，配一碗牛肉肉燥飯＋薑絲醬油膏！'
  },
  {
    id: 'snack-squid-noodles',
    name: '鮮甜小卷米粉',
    category: 'savory',
    recommendedSpots: '邱家小卷米粉 / 葉家小卷米粉',
    status: 'want',
    girlfriendVote: 'want',
    boyfriendVote: null,
    votedBy: 'qingbao',
    likesCount: 1,
    locationArea: '國華街 中西區',
    notes: 'Q彈鮮嫩整尾小卷，湯頭清甜鮮美，粗米粉超順口！'
  },
  {
    id: 'snack-shrimp-rice',
    name: '古早味火燒蝦仁飯',
    category: 'savory',
    recommendedSpots: '矮仔成蝦仁飯 / 集品蝦仁飯',
    status: 'want',
    girlfriendVote: 'want',
    boyfriendVote: null,
    votedBy: 'qingbao',
    likesCount: 1,
    locationArea: '海安路 中西區',
    notes: '濃郁蝦高湯炊飯，一定要加一顆半熟鴨蛋黃戳破流出！'
  },
  {
    id: 'snack-eel-noodles',
    name: '生炒鱔魚意麵 (鑊氣乾炒)',
    category: 'savory',
    recommendedSpots: '阿江鱔魚意麵 / 進福炒鱔魚專家',
    status: 'must',
    girlfriendVote: 'must',
    boyfriendVote: 'must',
    votedBy: 'both',
    likesCount: 2,
    locationArea: '民族路 中西區',
    notes: '酸甜微甜鑊氣十足，鱔魚爽脆彈牙，台南經典靈魂！'
  },
  {
    id: 'snack-sugar-cake',
    name: '外酥內軟古早味白糖粿',
    category: 'sweet',
    recommendedSpots: '林家白糖粿 / 游爸爸蕃薯椪白糖粿',
    status: 'want',
    girlfriendVote: 'want',
    boyfriendVote: null,
    votedBy: 'qingbao',
    likesCount: 1,
    locationArea: '國華街商圈',
    notes: '現炸熱呼呼糯米糰裹上花生糖粉與芝麻，晴寶甜點必備！'
  },
  {
    id: 'snack-pudding',
    name: '府城手作焦糖香濃布丁',
    category: 'sweet',
    recommendedSpots: '紅磚布丁 / 依蕾特布丁 / 銀波布丁',
    status: 'want',
    girlfriendVote: 'want',
    boyfriendVote: null,
    votedBy: 'qingbao',
    likesCount: 1,
    locationArea: '安平 / 中西區',
    notes: '苦甜焦糖香＋綿密蛋香，吃完幸福感滿分！'
  },
  {
    id: 'snack-winter-melon',
    name: '義豐阿川冬瓜檸檬 / 冬瓜鮮奶',
    category: 'drink',
    recommendedSpots: '義豐冬瓜茶 (赤崁樓前)',
    status: 'want',
    girlfriendVote: 'want',
    boyfriendVote: 'want',
    votedBy: 'both',
    likesCount: 2,
    locationArea: '赤崁樓旁',
    notes: '古法熬煮冬瓜磚，加新鮮檸檬汁消暑解渴又生津！'
  },
  {
    id: 'snack-rice-cake',
    name: '富盛號黑碗粿 & 魚羹',
    category: 'savory',
    recommendedSpots: '富盛號碗粿 / 一味品碗粿',
    status: 'maybe',
    girlfriendVote: null,
    boyfriendVote: 'maybe',
    votedBy: 'caibao',
    likesCount: 1,
    locationArea: '永樂市場 國華街',
    notes: '用竹籤切塊淋上特調黑醬油與蒜泥，傳承七十年老味道。'
  },
  {
    id: 'snack-fruit-ice',
    name: '莉莉水果店 季節新鮮水果切盤 & 芒果冰',
    category: 'sweet',
    recommendedSpots: '莉莉水果店 / 裕成水果行',
    status: 'want',
    girlfriendVote: 'want',
    boyfriendVote: null,
    votedBy: 'qingbao',
    likesCount: 1,
    locationArea: '孔廟對面',
    notes: '吃完鹹食來一盤沾甘草糖粉的番茄切盤與水果冰！'
  },
  {
    id: 'snack-pork-bun',
    name: '阿松割包 (特製豬舌包 & 甜醬)',
    category: 'savory',
    recommendedSpots: '阿松割包',
    status: 'maybe',
    girlfriendVote: null,
    boyfriendVote: 'maybe',
    votedBy: 'caibao',
    likesCount: 1,
    locationArea: '永樂市場',
    notes: '特製花生芝麻甜醬，附一碗濃郁清爽大骨湯！'
  }
];

// Collection reference
const SNACKS_COLLECTION = 'tainan_snacks_votes';

// Subscribe to Snacks List from Firestore
export function subscribeToSnacks(
  onSuccess: (snacks: SnackVoteItem[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, SNACKS_COLLECTION);
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          // Initialize with default list if empty
          initializeDefaultSnacks();
          onSuccess(DEFAULT_TAINAN_SNACKS);
        } else {
          const list: SnackVoteItem[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as SnackVoteItem);
          });
          onSuccess(list);
        }
      },
      (err) => {
        console.warn('Firestore snapshot listener error:', err);
        if (onError) onError(err);
      }
    );
    return unsub;
  } catch (e: any) {
    console.warn('Failed to subscribe to Firestore:', e);
    if (onError) onError(e);
    return () => {};
  }
}

// Initialize Default Snacks to Firestore
export async function initializeDefaultSnacks() {
  try {
    for (const item of DEFAULT_TAINAN_SNACKS) {
      const docRef = doc(db, SNACKS_COLLECTION, item.id);
      await setDoc(docRef, { ...item, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (e) {
    console.warn('Error initializing snacks in Firestore:', e);
  }
}

// Helper to check if current user is authorized
function isAuthorizedForWrite(): boolean {
  const email = auth.currentUser?.email?.toLowerCase();
  if (email) {
    if (email === 'stew3048@gmail.com' || email === 'sng828388@gmail.com' || email.includes('stew') || email.includes('cai')) {
      return true;
    }
  }
  // Also check local storage custom configured emails or role preview
  try {
    const role = localStorage.getItem('qingbao_trip_user_role');
    if (role === 'boyfriend' || role === 'girlfriend') {
      return true;
    }
    const tripSaved = localStorage.getItem('my_girlfriend_birthday_trip_tainan_v2');
    if (tripSaved && email) {
      const parsed = JSON.parse(tripSaved);
      const bf = parsed?.settings?.boyfriendEmail?.toLowerCase();
      const gf = parsed?.settings?.girlfriendEmail?.toLowerCase();
      if (email === bf || email === gf) return true;
    }
  } catch (e) {
    // ignore
  }
  return false;
}

// Update a snack vote
export async function updateSnackVote(
  snackId: string, 
  updates: Partial<SnackVoteItem>
) {
  try {
    if (!isAuthorizedForWrite()) {
      console.warn('Snack update blocked: unauthenticated or unauthorized user.');
      return false;
    }
    const docRef = doc(db, SNACKS_COLLECTION, snackId);
    await setDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to update snack vote in Firestore:', e);
    return false;
  }
}

// Add new custom snack
export async function addCustomSnack(snack: Omit<SnackVoteItem, 'id'>) {
  try {
    if (!isAuthorizedForWrite()) {
      console.warn('Add snack blocked: unauthenticated or unauthorized user.');
      return null;
    }
    const id = 'snack-custom-' + Date.now();
    const docRef = doc(db, SNACKS_COLLECTION, id);
    const newSnack: SnackVoteItem = {
      ...snack,
      id,
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, newSnack);
    return newSnack;
  } catch (e) {
    console.error('Failed to add custom snack to Firestore:', e);
    return null;
  }
}

// Delete custom snack
export async function deleteSnackItem(snackId: string) {
  try {
    if (!isAuthorizedForWrite()) {
      console.warn('Delete snack blocked: unauthenticated or unauthorized user.');
      return false;
    }
    const docRef = doc(db, SNACKS_COLLECTION, snackId);
    await deleteDoc(docRef);
    return true;
  } catch (e) {
    console.error('Failed to delete snack in Firestore:', e);
    return false;
  }
}

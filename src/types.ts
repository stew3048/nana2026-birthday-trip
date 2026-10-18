export type ActivityCategory =
  | 'sightseeing' // 浪漫景點
  | 'dining' // 浪漫大餐
  | 'birthday_surprise' // 生日驚喜
  | 'cafe' // 甜點咖啡
  | 'hotel' // 住宿飯店
  | 'shopping' // 逛街購物
  | 'transit' // 交通接駁
  | 'photo_spot' // 拍照打卡
  | 'relax'; // 放鬆SPA/溫泉

export interface ActivityItem {
  id: string;
  time: string; // e.g. "09:30" or "09:30 - 11:00"
  title: string;
  category: ActivityCategory;
  location?: string;
  locationUrl?: string; // Google Maps search link or custom link
  description?: string;
  outfitTip?: string; // e.g. "建議淺色系洋裝、帶好走的鞋子"
  notes?: string; // e.g. "已電話預約 訂位代號 #7829"
  isSecretSurprise?: boolean; // If true, boyfriend can hide this in presentation mode
  surpriseHint?: string; // e.g. "神秘行程，等妳親自揭曉 💕"
  surpriseUnlockCode?: string; // e.g. "0520" or "love"
  cost?: number;
  photoUrl?: string;
}

export interface DayItinerary {
  id: string;
  dayNumber: number;
  date: string; // e.g. "2026-09-15"
  themeTitle: string; // e.g. "Day 1: 抵達浪漫之都 & 高空夜景晚餐"
  dayDescription?: string;
  weatherForecast?: string; // e.g. "晴時多雲 24°C"
  todayOutfitTip?: string;
  activities: ActivityItem[];
}

export interface SurpriseItem {
  id: string;
  title: string;
  timing: string; // Display string, e.g. "Day 2 20:00" or "10/17 (六) 20:00"
  date?: string; // Standardized ISO date: "2026-10-16", "2026-10-17", "2026-10-18"
  time?: string; // Standardized 24h time: "20:00", "15:00", "23:00"
  location: string;
  description: string;
  isUnlocked: boolean;
  unlockCode?: string; // e.g. "0520" or "love"
  hint: string;
  iconName?: string;
  category: 'gift' | 'cake' | 'activity' | 'memory' | 'letter';
  activityId?: string; // linked to Itinerary ActivityItem
  dayNumber?: number;
  isStandalone?: boolean; // true if created independently in surprise tasks
  sourceType?: 'itinerary' | 'standalone';
}

export interface DiningItem {
  id: string;
  name: string;
  category: 'restaurant' | 'cafe' | 'bar' | 'dessert' | 'street_food';
  status: 'confirmed' | 'to_book' | 'waitlist' | 'wishlist';
  dateTime?: string;
  location: string;
  locationUrl?: string;
  bookingCode?: string;
  specialRequest?: string; // e.g. "已備註女友生日需寫字盤 + 窗邊夜景位"
  mustEatDishes?: string;
  notes?: string;
  pricePerPerson?: number;
  dayId?: string;
}

export interface PackingItem {
  id: string;
  name: string;
  category: 'sweetheart_care' | 'essentials' | 'outfits' | 'electronics' | 'cosmetics' | 'documents';
  isChecked: boolean;
  isSweetheartSpecial?: boolean; // 特別為她準備的貼心好物
  note?: string; // e.g. "她拍照最喜歡的底片相機"
}

export interface ExpenseItem {
  id: string;
  title: string;
  category: 'flight_transit' | 'hotel' | 'food' | 'tickets' | 'gifts' | 'shopping' | 'other';
  amount: number;
  currency: 'TWD' | 'JPY' | 'USD' | 'EUR' | 'KRW';
  date: string;
  isPaidByBoyfriend: boolean;
  notes?: string;
}

export interface PhotoMemory {
  id: string;
  title: string;
  date: string;
  caption: string;
  imageUrl: string;
  location?: string;
  tag?: string;
}

export interface LoveLetter {
  recipientName: string; // e.g. "最親愛的小涵"
  authorName: string; // e.g. "永遠愛妳的男友"
  title: string;
  openingText: string;
  bodyParagraphs: string[];
  closingText: string;
  signature?: string;
  musicAutoPlay?: boolean;
}

export interface DayHighlightCard {
  dayNumber: number;
  dateBadge: string; // e.g. "Day 1 · 10/16 (五)"
  title: string;
  description: string;
  tag1?: string;
  tag2?: string;
  isSecretSurprise?: boolean;
}

export interface TripSettings {
  id: string;
  tripTitle: string; // e.g. "⭐ 晴寶2026生日專屬之旅"
  girlfriendName: string; // e.g. "晴寶 ⭐"
  boyfriendName: string; // e.g. "蔡寶 🙋‍♂️"
  destination: string; // e.g. "台南 Tainan"
  startDate: string; // e.g. "2026-10-16"
  endDate: string; // e.g. "2026-10-18"
  coverImageUrl: string;
  romanticThemeColor: 'rose' | 'amber' | 'lavender' | 'emerald' | 'sunset';
  secretModePassword?: string;
  customNotes?: string;
  boyfriendEmail?: string; // e.g. "stew3048@gmail.com"
  girlfriendEmail?: string;
  dayHighlights?: DayHighlightCard[];
  hiddenScenarioIds?: string[];
  dismissedAlertIds?: string[];
}

export interface SnackVoteItem {
  id: string;
  name: string;
  category: string; // 'savory' | 'sweet' | 'drink' | 'night_market'
  recommendedSpots: string; // e.g. "六千牛肉湯 / 文章牛肉湯"
  status: 'want' | 'must' | 'maybe' | 'pass'; // 總體心願狀態 (若兩人皆想吃/必吃則為 must/want，且雙向指定)
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

export interface LiveAlert {
  id: string;
  triggerTime: string; // e.g. "10-16 18:00" or "10-16 23:00"
  timeLabel: string;
  title: string;
  message: string;
  iconType: 'dinner' | 'clinic' | 'birthday' | 'escape' | 'bbq' | 'hotel' | 'pool' | 'leather';
  accentColor: string;
  audioEffect?: 'chime' | 'romantic' | 'bell';
  isSpecialSurprise?: boolean;
}

export interface LiveAlertScenario {
  id: string;
  triggerTime: string; // e.g. "2026-10-16 18:00"
  timeLabel: string; // e.g. "10/16 (五) 18:00"
  title: string;
  message: string;
  secondaryHint: string;
  category: 'dinner' | 'clinic' | 'birthday' | 'escape' | 'french' | 'bbq' | 'sparkles';
  badge: string;
  linkedSurpriseId?: string;
  isCustom?: boolean;
}

export interface BirthdayTripData {
  version: string;
  cloudSyncedAt?: string;
  lastUpdatedBy?: string;
  settings: TripSettings;
  itinerary: DayItinerary[];
  surprises: SurpriseItem[];
  standaloneSurprises?: SurpriseItem[];
  dining: DiningItem[];
  packingList: PackingItem[];
  expenses: ExpenseItem[];
  photos: PhotoMemory[];
  loveLetter: LoveLetter;
  snacks?: SnackVoteItem[];
  customAlertScenarios?: LiveAlertScenario[];
  activeLiveAlert?: {
    id: string;
    scenarioId: string;
    title: string;
    message: string;
    secondaryHint: string;
    timeLabel: string;
    badge: string;
    category: 'dinner' | 'clinic' | 'birthday' | 'escape' | 'french' | 'bbq' | 'sparkles';
    sentAt: string;
    readAt?: string;
  } | null;
}


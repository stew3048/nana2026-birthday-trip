import React, { useState } from 'react';
import { 
  Plus, 
  MapPin, 
  Clock, 
  Shirt, 
  ExternalLink, 
  Sparkles, 
  Trash2, 
  Edit3, 
  ChevronUp, 
  ChevronDown, 
  Gift, 
  Eye, 
  EyeOff, 
  Calendar,
  CloudSun,
  Coffee,
  Utensils,
  Camera,
  Hotel,
  ShoppingBag,
  Car,
  Heart,
  Lock,
  Unlock,
  ShieldCheck,
  Star,
  Hourglass,
  ArrowUpDown,
  ListOrdered,
  Key,
  X,
  CheckCircle2
} from 'lucide-react';
import { ActivityCategory, ActivityItem, DayItinerary, SurpriseItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { getActivityLockStatus, getDayLockSummary, sortActivitiesChronologically } from '../utils/timeLock';

interface ItineraryViewProps {
  itinerary: DayItinerary[];
  onUpdateItinerary: (newItinerary: DayItinerary[]) => void;
  secretModePassword?: string;
  onSyncSecretSurprise?: (activity: ActivityItem, dayNumber: number, isDeleted?: boolean) => void;
  surprises?: SurpriseItem[];
}

const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '24:00'
];

const TIME_PRESETS = [
  { label: '🌅 09:00 - 10:30 (晨光啟程)', time: '09:00 - 10:30' },
  { label: '🍜 12:00 - 13:30 (午餐美食)', time: '12:00 - 13:30' },
  { label: '🌸 14:00 - 16:00 (浪漫景點)', time: '14:00 - 16:00' },
  { label: '🍽️ 18:00 - 20:00 (浪漫晚餐)', time: '18:00 - 20:00' },
  { label: '🌙 21:00 - 23:00 (夜晚小酌)', time: '21:00 - 23:00' },
  { label: '🩺 23:00 - 24:00 (密醫特診)', time: '23:00 - 24:00' },
];

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  itinerary,
  onUpdateItinerary,
  secretModePassword = '0520',
  onSyncSecretSurprise,
  surprises = []
}) => {
  const { 
    isBoyfriend, 
    isGirlfriend, 
    isAuthorizedEditor,
    isGuest,
    role, 
    effectiveTime, 
    boyfriendForceUnlockAll,
    setBoyfriendForceUnlockAll
  } = useAuth();

  const canEdit = isBoyfriend || isAuthorizedEditor; // 只有蔡寶管理者可以編輯！

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [unlockedActivityIds, setUnlockedActivityIds] = useState<string[]>([]);
  const [passwordUnlockModalAct, setPasswordUnlockModalAct] = useState<ActivityItem | null>(null);
  const [unlockPasswordInput, setUnlockPasswordInput] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [unlockSuccess, setUnlockSuccess] = useState('');
  const [isEditingActivity, setIsEditingActivity] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    dayIndex: number;
    activity: ActivityItem;
    isNew: boolean;
  } | null>(null);

  // Time selector dropdown states inside modal
  const [startTimeSelect, setStartTimeSelect] = useState('14:00');
  const [endTimeSelect, setEndTimeSelect] = useState('16:00');

  const [deletingActivity, setDeletingActivity] = useState<{ activity: ActivityItem; dayIndex: number } | null>(null);

  const [isEditingDayTheme, setIsEditingDayTheme] = useState(false);
  const [dayThemeForm, setDayThemeForm] = useState<{
    themeTitle: string;
    dayDescription: string;
    weatherForecast: string;
    todayOutfitTip: string;
  }>({
    themeTitle: '',
    dayDescription: '',
    weatherForecast: '',
    todayOutfitTip: ''
  });

  const rawCurrentDay = itinerary[selectedDayIndex] || itinerary[0];
  const currentDay = rawCurrentDay ? {
    ...rawCurrentDay,
    activities: sortActivitiesChronologically(rawCurrentDay.activities || [])
  } : null;
  const daySummary = currentDay ? getDayLockSummary(currentDay, effectiveTime) : null;
  
  // Time lock is enforced for girlfriend, for guests, or for boyfriend when NOT explicitly force-unlocked (i.e. testing simulator mode)
  const isLockEnforced = isGirlfriend || role === 'guest' || !boyfriendForceUnlockAll;
  const isCurrentDayLocked = isLockEnforced && (daySummary?.isEntireDayLocked || false);

  const getCategoryBadge = (category: ActivityCategory) => {
    switch (category) {
      case 'birthday_surprise':
        return {
          icon: <Gift className="w-3.5 h-3.5" />,
          label: '🎂 生日特別驚喜',
          bg: 'bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border-[var(--romantic-border,#BAE6FD)]'
        };
      case 'dining':
        return {
          icon: <Utensils className="w-3.5 h-3.5" />,
          label: '🍽️ 浪漫大餐',
          bg: 'bg-[var(--romantic-gold-light,#FEF3C7)] text-[var(--romantic-gold,#F59E0B)] border-[var(--romantic-border,#BAE6FD)]'
        };
      case 'sightseeing':
        return {
          icon: <Sparkles className="w-3.5 h-3.5" />,
          label: '🌸 浪漫景點',
          bg: 'bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border-[var(--romantic-border,#BAE6FD)]'
        };
      case 'cafe':
        return {
          icon: <Coffee className="w-3.5 h-3.5" />,
          label: '☕ 甜點咖啡',
          bg: 'bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border-[var(--romantic-border,#BAE6FD)]'
        };
      case 'hotel':
        return {
          icon: <Hotel className="w-3.5 h-3.5" />,
          label: '🏨 質感住宿',
          bg: 'bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border-[var(--romantic-border,#BAE6FD)]'
        };
      case 'photo_spot':
        return {
          icon: <Camera className="w-3.5 h-3.5" />,
          label: '📸 拍照打卡',
          bg: 'bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border-[var(--romantic-border,#BAE6FD)]'
        };
      case 'shopping':
        return {
          icon: <ShoppingBag className="w-3.5 h-3.5" />,
          label: '🛍️ 逛街手作',
          bg: 'bg-[var(--romantic-gold-light,#FEF3C7)] text-[var(--romantic-gold,#F59E0B)] border-[var(--romantic-border,#BAE6FD)]'
        };
      case 'transit':
        return {
          icon: <Car className="w-3.5 h-3.5" />,
          label: '🚗 交通接駁',
          bg: 'bg-slate-50 text-[var(--romantic-muted,#64748B)] border-[var(--romantic-border,#E2E8F0)]'
        };
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5" />,
          label: '✨ 行程活動',
          bg: 'bg-slate-50 text-[var(--romantic-muted,#64748B)] border-[var(--romantic-border,#E2E8F0)]'
        };
    }
  };

  const handleOpenAddActivity = () => {
    const newAct: ActivityItem = {
      id: 'act_' + Date.now(),
      time: '14:00 - 16:00',
      title: '',
      category: 'sightseeing',
      location: '',
      description: '',
      outfitTip: '',
      notes: '',
      isSecretSurprise: false,
    };
    setStartTimeSelect('14:00');
    setEndTimeSelect('16:00');
    setEditingItem({
      dayIndex: selectedDayIndex,
      activity: newAct,
      isNew: true
    });
    setIsEditingActivity(true);
  };

  const handlePasswordUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUnlockModalAct) return;

    const input = unlockPasswordInput.trim();
    const targetCode = (passwordUnlockModalAct.surpriseUnlockCode || secretModePassword || '0520').trim();

    if (input === targetCode || input === '0520' || input === '1017' || input === secretModePassword) {
      setUnlockSuccess('🎉 通關密語正確！浪漫驚喜已正式解鎖揭曉！');
      setUnlockError('');
      setUnlockedActivityIds(prev => [...prev, passwordUnlockModalAct.id]);

      if (onSyncSecretSurprise) {
        onSyncSecretSurprise(
          { ...passwordUnlockModalAct, isSecretSurprise: true },
          itinerary[selectedDayIndex]?.dayNumber || 1,
          false
        );
      }

      setTimeout(() => {
        setPasswordUnlockModalAct(null);
        setUnlockPasswordInput('');
        setUnlockSuccess('');
      }, 1000);
    } else {
      setUnlockError('密碼不太對喔！試試妳的生日 (1017) 或愛意密語 (0520) 吧 💕');
    }
  };

  const handleOpenEditActivity = (act: ActivityItem) => {
    const timeParts = act.time.split(/[-~–]/).map(t => t.trim());
    if (timeParts.length >= 2) {
      if (TIME_OPTIONS.includes(timeParts[0])) setStartTimeSelect(timeParts[0]);
      if (TIME_OPTIONS.includes(timeParts[1])) setEndTimeSelect(timeParts[1]);
    }

    setEditingItem({
      dayIndex: selectedDayIndex,
      activity: { ...act },
      isNew: false
    });
    setIsEditingActivity(true);
  };

  const handleSaveActivity = () => {
    if (!editingItem) return;
    if (!editingItem.activity.title.trim()) {
      alert('請填寫活動名稱');
      return;
    }

    const updated = [...itinerary];
    const targetDay = { ...updated[editingItem.dayIndex] };
    let currentActs = [...targetDay.activities];

    if (editingItem.isNew) {
      currentActs.push(editingItem.activity);
    } else {
      const idx = currentActs.findIndex(a => a.id === editingItem.activity.id);
      if (idx !== -1) {
        currentActs[idx] = editingItem.activity;
      }
    }

    currentActs = sortActivitiesChronologically(currentActs);
    targetDay.activities = currentActs;
    updated[editingItem.dayIndex] = targetDay;
    onUpdateItinerary(updated);

    if (onSyncSecretSurprise) {
      onSyncSecretSurprise(editingItem.activity, targetDay.dayNumber, false);
    }

    setIsEditingActivity(false);
    setEditingItem(null);
  };

  const handleSortDayActivities = () => {
    if (!currentDay) return;
    const updated = [...itinerary];
    const targetDay = { ...updated[selectedDayIndex] };
    targetDay.activities = sortActivitiesChronologically(targetDay.activities);
    updated[selectedDayIndex] = targetDay;
    onUpdateItinerary(updated);
  };

  const handleDeleteActivity = (act: ActivityItem, dayIndex: number = selectedDayIndex) => {
    setDeletingActivity({ activity: act, dayIndex });
  };

  const confirmDeleteActivity = () => {
    if (!deletingActivity) return;
    const targetDayIndex = deletingActivity.dayIndex;
    const actId = deletingActivity.activity.id;

    const updated = [...itinerary];
    const targetDay = { ...updated[targetDayIndex] };
    const deletedAct = targetDay.activities.find(a => a.id === actId);
    targetDay.activities = targetDay.activities.filter(a => a.id !== actId);
    updated[targetDayIndex] = targetDay;
    onUpdateItinerary(updated);

    if (deletedAct && onSyncSecretSurprise) {
      onSyncSecretSurprise(deletedAct, targetDay.dayNumber, true);
    }

    setDeletingActivity(null);
    if (isEditingActivity && editingItem?.activity.id === actId) {
      setIsEditingActivity(false);
      setEditingItem(null);
    }
  };

  const handleMoveActivity = (index: number, direction: 'up' | 'down') => {
    const updated = [...itinerary];
    const targetDay = { ...updated[selectedDayIndex] };
    const acts = [...targetDay.activities];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= acts.length) return;

    const temp = acts[index];
    acts[index] = acts[targetIndex];
    acts[targetIndex] = temp;

    targetDay.activities = acts;
    updated[selectedDayIndex] = targetDay;
    onUpdateItinerary(updated);
  };

  const handleOpenEditDayTheme = () => {
    if (!currentDay) return;
    setDayThemeForm({
      themeTitle: currentDay.themeTitle,
      dayDescription: currentDay.dayDescription || '',
      weatherForecast: currentDay.weatherForecast || '',
      todayOutfitTip: currentDay.todayOutfitTip || ''
    });
    setIsEditingDayTheme(true);
  };

  const handleSaveDayTheme = () => {
    const updated = [...itinerary];
    const targetDay = { ...updated[selectedDayIndex] };
    targetDay.themeTitle = dayThemeForm.themeTitle;
    targetDay.dayDescription = dayThemeForm.dayDescription;
    targetDay.weatherForecast = dayThemeForm.weatherForecast;
    targetDay.todayOutfitTip = dayThemeForm.todayOutfitTip;

    updated[selectedDayIndex] = targetDay;
    onUpdateItinerary(updated);
    setIsEditingDayTheme(false);
  };

  const handleTimePresetClick = (presetTime: string) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      activity: { ...editingItem.activity, time: presetTime }
    });
    const parts = presetTime.split(/[-~–]/).map(t => t.trim());
    if (parts.length >= 2) {
      if (TIME_OPTIONS.includes(parts[0])) setStartTimeSelect(parts[0]);
      if (TIME_OPTIONS.includes(parts[1])) setEndTimeSelect(parts[1]);
    }
  };

  const handleTimeDropdownChange = (start: string, end: string) => {
    setStartTimeSelect(start);
    setEndTimeSelect(end);
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        activity: {
          ...editingItem.activity,
          time: `${start} - ${end}`
        }
      });
    }
  };

  return (
    <div className="space-y-6 text-[var(--romantic-ink,#0F172A)]">
      
      {/* Top Day Navigation Tabs & Status Bar */}
      <div className="bg-gradient-to-r from-[#F8FAFC] via-[#F0F9FF]/60 to-[#FFFDF7] rounded-3xl p-4 sm:p-5 border border-[var(--romantic-border,#BAE6FD)] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
            {/* Day selection tabs with elegant dock container */}
            <div className="flex items-center space-x-1.5 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 shadow-inner overflow-x-auto no-scrollbar">
              {itinerary.map((day, idx) => {
                const isSelected = selectedDayIndex === idx;
                const summary = getDayLockSummary(day, effectiveTime);
                const isDayLocked = isLockEnforced && summary.isEntireDayLocked;

                return (
                  <button
                    key={day.dayNumber}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? isDayLocked
                          ? 'bg-slate-800 text-white font-bold shadow-sm'
                          : 'btn-romantic-primary font-bold shadow-sm'
                        : isDayLocked
                          ? 'bg-slate-100 text-slate-500 hover:bg-slate-200/80 border border-slate-200 shadow-2xs'
                          : 'bg-white/90 hover:bg-white text-slate-700 hover:text-[var(--romantic-rose,#0284C7)] border border-slate-200/60 shadow-2xs'
                    }`}
                    title={isDayLocked ? `Day ${day.dayNumber} 尚未開放（預計 ${summary.formattedEarliestUnlockTime} 解鎖）` : `查看 Day ${day.dayNumber} 行程`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Day {day.dayNumber}</span>
                    <span className="text-[11px] opacity-80 font-mono">({day.date.slice(5)})</span>
                    {isDayLocked ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-[var(--romantic-gold-light,#FEF3C7)] text-[var(--romantic-gold,#F59E0B)] border border-[var(--romantic-border,#BAE6FD)] text-[10px] font-bold flex items-center space-x-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        <span>尚未開放</span>
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center space-x-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        <span>已開放</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Current role badge */}
            <div className="flex items-center space-x-2 shrink-0">
              {isBoyfriend ? (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[var(--romantic-gold-light,#FEF3C7)] text-[var(--romantic-gold,#F59E0B)] text-xs font-semibold border border-[var(--romantic-border,#BAE6FD)]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--romantic-gold,#F59E0B)]" />
                  <span>👑 蔡寶行程管理權限</span>
                </div>
              ) : isGirlfriend ? (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] text-xs font-semibold border border-[var(--romantic-border,#BAE6FD)]">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)]" />
                  <span>💖 晴寶專屬壽星行程</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-[var(--romantic-muted,#64748B)] text-xs font-semibold border border-[var(--romantic-border,#E2E8F0)]">
                  <Lock className="w-3.5 h-3.5 text-[var(--romantic-gold,#F59E0B)]" />
                  <span>👤 訪客唯讀預覽</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Day Header Card - Locked vs Unlocked */}
        {currentDay && isCurrentDayLocked ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--romantic-border,#BAE6FD)] shadow-sm relative overflow-hidden">
            {/* Subtle glow background */}
            <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-[var(--romantic-gold-light,#FEF3C7)]/60 pointer-events-none blur-2xl" />
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 relative z-10">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono border border-slate-200">
                    DAY {currentDay.dayNumber}
                  </span>
                  <span className="text-xs font-semibold text-[var(--romantic-muted,#64748B)] flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)]" />
                    <span>{currentDay.date}</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--romantic-gold-light,#FEF3C7)] text-[var(--romantic-gold,#F59E0B)] border border-[var(--romantic-border,#BAE6FD)] text-xs font-bold flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-[var(--romantic-gold,#F59E0B)]" />
                    <span>尚未開放 · 敬請期待</span>
                  </span>
                </div>

                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--romantic-ink,#0F172A)] flex items-center space-x-2">
                    <span>🔒 Day {currentDay.dayNumber} 尚未開放 · 敬請期待</span>
                  </h2>
                  <p className="text-[var(--romantic-muted,#64748B)] text-sm mt-2 max-w-2xl leading-relaxed">
                    「🤫 晴寶小仙女請稍候！蔡寶為妳用心策劃的每日主題、穿搭提醒與時間軸行程，將在<strong>當日第一個活動開始前 1 小時</strong>準時為妳解鎖揭開，保留滿滿的期待與儀式感 ✨」
                  </p>
                </div>

                {daySummary?.formattedEarliestUnlockTime && (
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[var(--romantic-rose-light,#F0F9FF)] border border-[var(--romantic-border,#BAE6FD)] text-xs font-semibold text-[var(--romantic-rose-deep,#0369A1)]">
                    <Clock className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)] shrink-0" />
                    <span>
                      預計解鎖時間：<strong>{daySummary.formattedEarliestUnlockTime}</strong> (首個行程前 1 小時自動解鎖揭曉)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-medium">
                  <Shirt className="w-3.5 h-3.5 text-slate-400" />
                  <span>穿搭天氣：解鎖時揭曉</span>
                </div>

                {canEdit && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setBoyfriendForceUnlockAll(true)}
                      className="px-3 py-1.5 rounded-xl bg-[var(--romantic-gold-light,#FEF3C7)] hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                      title="切換至全解鎖模式，直接檢視與編輯完整主題文案"
                    >
                      <Unlock className="w-3.5 h-3.5 text-amber-700" />
                      <span>全解鎖檢視</span>
                    </button>
                    <button
                      onClick={handleOpenEditDayTheme}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                      title="直接編輯此日主題標題與行程簡介文案"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                      <span>✏️ 編輯行程簡介</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : currentDay ? (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[var(--romantic-border,#BAE6FD)] shadow-sm relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full btn-romantic-primary text-white text-xs font-bold font-mono">
                    DAY {currentDay.dayNumber}
                  </span>
                  <span className="text-xs font-medium text-[var(--romantic-rose,#0284C7)] flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{currentDay.date}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>✨ 已解鎖</span>
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--romantic-ink,#0F172A)]">
                  {currentDay.themeTitle}
                </h2>
                {currentDay.dayDescription && (
                  <p className="text-[var(--romantic-muted,#64748B)] text-sm mt-1.5 max-w-2xl leading-relaxed">
                    {currentDay.dayDescription}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {currentDay.weatherForecast && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-[var(--romantic-border,#BAE6FD)] text-[var(--romantic-gold,#F59E0B)] text-xs font-medium shadow-2xs">
                    <CloudSun className="w-4 h-4 text-[var(--romantic-gold,#F59E0B)]" />
                    <span>{currentDay.weatherForecast}</span>
                  </div>
                )}

                {currentDay.todayOutfitTip && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[var(--romantic-rose-light,#F0F9FF)] border border-[var(--romantic-border,#BAE6FD)] text-[var(--romantic-rose,#0284C7)] text-xs font-medium shadow-2xs">
                    <Shirt className="w-4 h-4 text-[var(--romantic-rose,#0284C7)]" />
                    <span>{currentDay.todayOutfitTip}</span>
                  </div>
                )}

                {canEdit && (
                  <button
                    onClick={handleOpenEditDayTheme}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-ink,#0F172A)] hover:text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] text-xs flex items-center space-x-1.5 shadow-2xs cursor-pointer transition-colors font-semibold"
                    title="編輯此日主題與當日簡介、穿搭天氣"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)]" />
                    <span>✏️ 編輯行程簡介與主題</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Notice Banner if this Day is currently locked */}
        {isCurrentDayLocked && currentDay && (
          <div className="bg-[var(--romantic-gold-light,#FEF3C7)] rounded-2xl p-5 border border-[var(--romantic-border,#BAE6FD)] shadow-sm animate-in fade-in">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[var(--romantic-gold,#F59E0B)] text-white flex items-center justify-center shrink-0 shadow-md">
                <Lock className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-serif font-bold text-[var(--romantic-gold,#F59E0B)] text-base">
                    🔒 Day {currentDay.dayNumber} ({currentDay.date}) 專屬驚喜行程保密中
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[var(--romantic-gold,#F59E0B)] text-xs font-bold border border-[var(--romantic-border,#BAE6FD)]">
                    活動前 1 小時揭曉
                  </span>
                </div>
                <p className="text-xs text-[var(--romantic-ink,#0F172A)] mt-1 leading-relaxed">
                  「🤫 晴寶小仙女請稍候！{currentDay.date} 專屬行程將在每個活動開始前 1 小時準時為妳解鎖揭開，保留滿滿的期待與儀式感 ✨」
                </p>
                {daySummary?.formattedEarliestUnlockTime && (
                  <p className="text-[11px] font-semibold text-[var(--romantic-rose,#0284C7)] mt-2 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)]" />
                    <span>首個行程預計於 <strong>{daySummary.formattedEarliestUnlockTime}</strong> 自動解鎖揭曉！</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Activities Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-semibold text-[var(--romantic-ink,#0F172A)]">
            <Clock className="w-4 h-4 text-[var(--romantic-rose,#0284C7)]" />
            <span>當日行程時間軸 ({currentDay?.activities.length || 0} 個項目)</span>
          </div>

          {canEdit && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSortDayActivities}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-muted,#64748B)] text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer border border-[var(--romantic-border,#E2E8F0)]"
                title="依照行程時間先後順序自動排列"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[var(--romantic-muted,#64748B)]" />
                <span>依時間排序</span>
              </button>
              <button
                onClick={handleOpenAddActivity}
                className="px-3.5 py-1.5 rounded-xl btn-romantic-primary text-white text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增行程項目</span>
              </button>
            </div>
          )}
        </div>

        {(!currentDay?.activities || currentDay.activities.length === 0) ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-[var(--romantic-border,#BAE6FD)] text-[var(--romantic-muted,#64748B)]">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-[var(--romantic-rose,#0284C7)]/60" />
            <p className="text-sm">這一天還沒有安排行程，為她規劃浪漫景點吧！</p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--romantic-border,#BAE6FD)]">
            {currentDay.activities.map((act, index) => {
              const badge = getCategoryBadge(act.category);
              const lockStatus = getActivityLockStatus(currentDay.date, act.time, effectiveTime);
              
              // Unlocked if time reached (1 hour prior or at start time) OR manually unlocked
              const isTimeUnlocked = lockStatus.isUnlocked;
              const isManuallyUnlocked = unlockedActivityIds.includes(act.id) || 
                Boolean(surprises?.find(s => (s.activityId === act.id || s.id === `surp-act-${act.id}`) && s.isUnlocked));

              const isActivityRevealed = !isLockEnforced || isTimeUnlocked || isManuallyUnlocked;

              // Timeline lock card is shown only if lock is enforced AND not yet revealed
              const isTimeLocked = isLockEnforced && !isActivityRevealed;

              // Secret surprise masking is active only if lock is enforced AND not yet revealed
              const isHiddenSurprise = act.isSecretSurprise && isLockEnforced && !isActivityRevealed;

              if (isTimeLocked) {
                // RENDER LOCKED MYSTERY CARD FOR GIRLFRIEND
                return (
                  <div
                    key={act.id}
                    className="relative bg-slate-50 rounded-2xl p-5 sm:p-6 border border-[var(--romantic-border,#BAE6FD)] shadow-sm transition-all"
                  >
                    {/* Timeline Dot (Locked) */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-6 w-5 h-5 rounded-full bg-white border-4 border-[var(--romantic-gold,#F59E0B)] shadow-xs flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--romantic-gold,#F59E0B)]" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Time Badge */}
                        <div className="flex items-center space-x-1 font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-[var(--romantic-border,#BAE6FD)] text-[var(--romantic-muted,#64748B)] shadow-2xs">
                          <Clock className="w-3 h-3 text-[var(--romantic-muted,#64748B)]" />
                          <span>{act.time}</span>
                        </div>

                        {/* Lock status pill */}
                        <span className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-0.8 rounded-full bg-[var(--romantic-gold,#F59E0B)] text-white shadow-2xs">
                          <Lock className="w-3 h-3" />
                          <span>活動前 1 小時自動解鎖</span>
                        </span>

                        {/* Secret surprise indicator (without leaking category) */}
                        {act.isSecretSurprise && (
                          <div className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] shadow-2xs">
                            <Gift className="w-3.5 h-3.5" />
                            <span>🎁 秘密驚喜</span>
                          </div>
                        )}

                        {/* Boyfriend Only Admin Hint: Shows category to boyfriend only so he knows, but strictly hidden from girlfriend */}
                        {isBoyfriend && (
                          <div className="flex items-center space-x-1 text-[11px] font-medium px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200" title="此為蔡寶管理員專屬標籤提示，晴寶視角完全封存不顯示">
                            <span>👑 原標籤：{badge.label}（晴寶端已隱藏）</span>
                          </div>
                        )}
                      </div>

                      {/* Mystery locked content */}
                      <div className="p-4 rounded-2xl bg-white border border-[var(--romantic-border,#BAE6FD)] shadow-2xs">
                        <div className="flex items-center space-x-2 text-[var(--romantic-rose,#0284C7)] font-bold text-base font-serif">
                          <Sparkles className="w-4 h-4 text-[var(--romantic-gold,#F59E0B)] animate-spin" />
                          <span>{act.isSecretSurprise ? '🎁 晴寶專屬神秘驚喜 · 浪漫封存中' : '🔒 晴寶專屬神秘行程 · 驚喜封存中'}</span>
                        </div>
                        <p className="text-xs text-[var(--romantic-muted,#64748B)] mt-1.5 leading-relaxed">
                          {act.isSecretSurprise && act.surpriseHint ? (
                            <span>「🤫 蔡寶用心策劃的驚喜時光！線索提示：<strong>{act.surpriseHint}</strong>。此項目將在 <strong>{lockStatus.formattedUnlockTime}</strong> (活動開始前 1 小時) 自動揭曉內容與地點喔 ✨」</span>
                          ) : (
                            <span>「🤫 蔡寶用心策劃的驚喜時光！請好好享受現在，此項目將在 <strong>{lockStatus.formattedUnlockTime}</strong> (活動開始前 1 小時) 自動揭曉內容與地點喔 ✨」</span>
                          )}
                        </p>
                        <div className="mt-2.5 flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center space-x-2 text-[11px] text-[var(--romantic-gold,#F59E0B)] bg-[var(--romantic-gold-light,#FEF3C7)] px-2.5 py-1 rounded-lg border border-[var(--romantic-border,#BAE6FD)] inline-flex">
                            <Hourglass className="w-3 h-3 text-[var(--romantic-gold,#F59E0B)]" />
                            <span>倒數約 {lockStatus.minutesUntilUnlock} 分鐘後解鎖揭曉</span>
                          </div>

                          {act.isSecretSurprise && (
                            <button
                              onClick={() => {
                                setPasswordUnlockModalAct(act);
                                setUnlockError('');
                                setUnlockSuccess('');
                                setUnlockPasswordInput('');
                              }}
                              className="inline-flex items-center space-x-1.5 text-xs text-[var(--romantic-rose,#0284C7)] hover:text-white bg-[var(--romantic-rose-light,#F0F9FF)] hover:bg-[var(--romantic-rose,#0284C7)] px-3 py-1 rounded-xl border border-[var(--romantic-border,#BAE6FD)] font-semibold transition-all cursor-pointer shadow-2xs"
                              title="如果已經到現場，可輸入密碼提前揭曉"
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span>提前揭曉密語</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // RENDER UNLOCKED ACTIVITY CARD
              return (
                <div
                  key={act.id}
                  className="relative bg-white rounded-2xl p-5 sm:p-6 border border-[var(--romantic-border,#BAE6FD)] hover:border-[var(--romantic-rose,#0284C7)] shadow-sm hover:shadow-md transition-all group"
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-6 w-5 h-5 rounded-full bg-white border-4 border-[var(--romantic-rose,#0284C7)] shadow-xs flex items-center justify-center" />

                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    
                    {/* Left: Time, Category & Content */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Time Badge */}
                        <div className="flex items-center space-x-1 font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-ink,#0F172A)] border border-[var(--romantic-border,#BAE6FD)]">
                          <Clock className="w-3 h-3 text-[var(--romantic-rose,#0284C7)]" />
                          <span>{act.time}</span>
                        </div>

                        {/* Category Badge */}
                        <div className={`flex items-center space-x-1 text-xs font-medium px-2.5 py-1 rounded-lg border ${badge.bg}`}>
                          {badge.icon}
                          <span>{badge.label}</span>
                        </div>

                        {/* Secret Surprise Badge */}
                        {act.isSecretSurprise && (
                          <span className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                            <span>{isBoyfriend ? '🎁 驚喜行程（已到時公開）' : '✨ 浪漫驚喜 · 時間已到正式揭曉！'}</span>
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      {isHiddenSurprise ? (
                        <div className="p-4 rounded-xl bg-[var(--romantic-rose-light,#F0F9FF)] border border-[var(--romantic-border,#BAE6FD)]">
                          <div className="flex items-center space-x-2 text-[var(--romantic-rose,#0284C7)] font-bold text-base">
                            <Sparkles className="w-4 h-4" />
                            <span>🎁 專屬晴寶的神秘驚喜行程</span>
                          </div>
                          <p className="text-xs text-[var(--romantic-rose,#0284C7)] mt-1 italic">
                            「{act.surpriseHint || '神秘行程，等妳親自揭曉 💕'}」
                          </p>
                          <p className="text-[11px] text-[var(--romantic-muted,#64748B)] mt-2">
                            * 抵達現場時由男友親自為妳解鎖揭曉！
                          </p>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--romantic-ink,#0F172A)]">
                            {act.title}
                          </h3>

                          {act.description && (
                            <p className="text-[var(--romantic-muted,#64748B)] text-sm mt-1 leading-relaxed">
                              {act.description}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Location & Navigation */}
                      {!isHiddenSurprise && act.location && (
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[var(--romantic-muted,#64748B)]">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)]" />
                            <span className="font-medium text-[var(--romantic-ink,#0F172A)]">{act.location}</span>
                          </div>
                          
                          {/* Google Maps link */}
                          <a
                            href={act.locationUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[var(--romantic-rose-light,#F0F9FF)] hover:opacity-80 text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Google 導航</span>
                          </a>
                        </div>
                      )}

                      {/* Outfit Tips & Notes */}
                      {!isHiddenSurprise && (
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          {act.outfitTip && (
                            <div className="inline-flex items-center space-x-1.5 text-xs text-[var(--romantic-rose,#0284C7)] bg-[var(--romantic-rose-light,#F0F9FF)] px-2.5 py-1 rounded-lg border border-[var(--romantic-border,#BAE6FD)]">
                              <Shirt className="w-3 h-3 text-[var(--romantic-rose,#0284C7)]" />
                              <span>穿搭建議：{act.outfitTip}</span>
                            </div>
                          )}

                          {act.notes && (
                            <div className="inline-flex items-center space-x-1.5 text-xs text-[var(--romantic-muted,#64748B)] bg-slate-50 px-2.5 py-1 rounded-lg border border-[var(--romantic-border,#E2E8F0)]">
                              <span>📝 備註：{act.notes}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Admin Action Buttons (For Authorized Editors) */}
                    {canEdit && (
                      <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleMoveActivity(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-ink,#0F172A)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          title="上移"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveActivity(index, 'down')}
                          disabled={index === currentDay.activities.length - 1}
                          className="p-1.5 rounded-lg text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-ink,#0F172A)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          title="下移"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditActivity(act)}
                          className="p-1.5 rounded-lg text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-rose,#0284C7)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] transition-colors cursor-pointer"
                          title="編輯行程"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(act)}
                          className="p-1.5 rounded-lg text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-rose,#0284C7)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] transition-colors cursor-pointer"
                          title="刪除此行程"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Activity Modal */}
      {isEditingActivity && editingItem && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[var(--romantic-border,#BAE6FD)] max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 sm:px-7 py-4 border-b border-[var(--romantic-border,#BAE6FD)] flex items-center justify-between shrink-0 bg-white">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--romantic-ink,#0F172A)]">
                {editingItem.isNew ? '✨ 新增行程項目' : '✏️ 編輯行程項目'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditingActivity(false);
                  setEditingItem(null);
                }}
                className="text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-ink,#0F172A)] p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-4 text-xs flex-1">
              
              {/* Time selector with Presets & Dropdown */}
              <div className="p-3.5 rounded-2xl bg-[var(--romantic-rose-light,#F0F9FF)] border border-[var(--romantic-border,#BAE6FD)] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)]">
                    ⏰ 活動時間設定
                  </label>
                  <span className="text-[11px] text-[var(--romantic-rose,#0284C7)] font-mono font-bold">
                    當前：{editingItem.activity.time}
                  </span>
                </div>

                {/* Dropdown Selectors */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-[var(--romantic-muted,#64748B)] block mb-1">開始時間</span>
                    <select
                      value={startTimeSelect}
                      onChange={(e) => handleTimeDropdownChange(e.target.value, endTimeSelect)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] font-mono font-semibold text-xs focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                    >
                      {TIME_OPTIONS.map(t => (
                        <option key={`start-${t}`} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--romantic-muted,#64748B)] block mb-1">結束時間</span>
                    <select
                      value={endTimeSelect}
                      onChange={(e) => handleTimeDropdownChange(startTimeSelect, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] font-mono font-semibold text-xs focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                    >
                      {TIME_OPTIONS.map(t => (
                        <option key={`end-${t}`} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fast Presets */}
                <div>
                  <div className="text-[11px] font-semibold text-[var(--romantic-muted,#64748B)] mb-1.5">
                    快速時段範本點選：
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {TIME_PRESETS.map((p) => (
                      <button
                        key={p.time}
                        type="button"
                        onClick={() => handleTimePresetClick(p.time)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                          editingItem.activity.time === p.time
                            ? 'btn-romantic-primary text-white border-transparent font-bold'
                            : 'bg-white text-[var(--romantic-muted,#64748B)] border-[var(--romantic-border,#BAE6FD)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] hover:text-[var(--romantic-rose,#0284C7)]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct Text Override */}
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--romantic-muted,#64748B)] mb-1">
                    手動輸入/微調時間文字
                  </label>
                  <input
                    type="text"
                    value={editingItem.activity.time}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      activity: { ...editingItem.activity, time: e.target.value }
                    })}
                    placeholder="例如：14:00 - 15:30"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-xs font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  分類標籤
                </label>
                <select
                  value={editingItem.activity.category}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    activity: { ...editingItem.activity, category: e.target.value as ActivityCategory }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                >
                  <option value="sightseeing">🌸 浪漫景點</option>
                  <option value="birthday_surprise">🎂 生日特別驚喜</option>
                  <option value="dining">🍽️ 浪漫大餐</option>
                  <option value="cafe">☕ 甜點咖啡</option>
                  <option value="hotel">🏨 質感住宿</option>
                  <option value="photo_spot">📸 拍照打卡</option>
                  <option value="shopping">🛍️ 逛街手作</option>
                  <option value="transit">🚗 交通接駁</option>
                  <option value="relax">💆‍♀️ 放鬆SPA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  活動名稱 *
                </label>
                <input
                  type="text"
                  value={editingItem.activity.title}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    activity: { ...editingItem.activity, title: e.target.value }
                  })}
                  placeholder="例如：奇美博物館 浪漫常設展與夕陽草地散步"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                    地點位置
                  </label>
                  <input
                    type="text"
                    value={editingItem.activity.location || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      activity: { ...editingItem.activity, location: e.target.value }
                    })}
                    placeholder="例如：台南市中西區永華路一段32號"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                    Google Maps 連結 (選填)
                  </label>
                  <input
                    type="text"
                    value={editingItem.activity.locationUrl || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      activity: { ...editingItem.activity, locationUrl: e.target.value }
                    })}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  詳細說明 / 浪漫亮點
                </label>
                <textarea
                  value={editingItem.activity.description || ''}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    activity: { ...editingItem.activity, description: e.target.value }
                  })}
                  rows={3}
                  placeholder="說明這段行程的浪漫安排與體驗..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                    穿搭小建議 (給女友的貼心提示)
                  </label>
                  <input
                    type="text"
                    value={editingItem.activity.outfitTip || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      activity: { ...editingItem.activity, outfitTip: e.target.value }
                    })}
                    placeholder="例如：優雅氣質洋裝、好走的平底鞋"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                    備註 / 訂位代號
                  </label>
                  <input
                    type="text"
                    value={editingItem.activity.notes || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      activity: { ...editingItem.activity, notes: e.target.value }
                    })}
                    placeholder="已預約靠窗席 #TYO-88"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                  />
                </div>
              </div>

              {/* Secret Surprise Toggle */}
              <div className="p-3.5 rounded-2xl bg-[var(--romantic-rose-light,#F0F9FF)] border border-[var(--romantic-border,#BAE6FD)]">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.activity.isSecretSurprise || false}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      activity: { ...editingItem.activity, isSecretSurprise: e.target.checked }
                    })}
                    className="w-4 h-4 text-[var(--romantic-rose,#0284C7)] rounded-sm focus:ring-[var(--romantic-rose,#0284C7)] cursor-pointer"
                  />
                  <span className="font-semibold text-[var(--romantic-rose,#0284C7)] text-xs">
                    🎁 設定為「神秘驚喜行程」（在女友預覽模式下隱藏標題與地點）
                  </span>
                </label>
                {editingItem.activity.isSecretSurprise && (
                  <div className="mt-2 pl-6">
                    <label className="block text-[11px] text-[var(--romantic-rose,#0284C7)] font-medium mb-1">
                      給女友看的神秘線索提示 (Hint)
                    </label>
                    <input
                      type="text"
                      value={editingItem.activity.surpriseHint || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        activity: { ...editingItem.activity, surpriseHint: e.target.value }
                      })}
                      placeholder="例如：在浪漫的氛圍中為妳唱生日歌 💕"
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-5 sm:px-7 py-4 border-t border-[var(--romantic-border,#BAE6FD)] flex items-center justify-between shrink-0 bg-white">
              {!editingItem.isNew ? (
                <button
                  type="button"
                  onClick={() => handleDeleteActivity(editingItem.activity, editingItem.dayIndex)}
                  className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>刪除此行程</span>
                </button>
              ) : <div />}

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingActivity(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-xl text-[var(--romantic-muted,#64748B)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-xs font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveActivity}
                  className="px-5 py-2 rounded-xl btn-romantic-primary text-white text-xs font-medium cursor-pointer shadow-xs"
                >
                  儲存行程
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Day Theme Modal */}
      {isEditingDayTheme && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[var(--romantic-border,#BAE6FD)] max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 sm:px-7 py-4 border-b border-[var(--romantic-border,#BAE6FD)] flex items-center justify-between shrink-0 bg-white">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--romantic-ink,#0F172A)]">
                ✏️ 編輯 Day {currentDay?.dayNumber} 主題與當日行程簡介
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingDayTheme(false)}
                className="text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-ink,#0F172A)] p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-5 sm:p-7 overflow-y-auto space-y-4 text-xs flex-1">
              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  當日主題標題
                </label>
                <input
                  type="text"
                  value={dayThemeForm.themeTitle}
                  onChange={(e) => setDayThemeForm({ ...dayThemeForm, themeTitle: e.target.value })}
                  placeholder="例如：煙波沈浸日 · 密醫特診"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  當日簡介 (Description)
                </label>
                <textarea
                  value={dayThemeForm.dayDescription}
                  onChange={(e) => setDayThemeForm({ ...dayThemeForm, dayDescription: e.target.value })}
                  rows={3}
                  placeholder="說明當天的精采主題與心動亮點..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  天氣預報小卡
                </label>
                <input
                  type="text"
                  value={dayThemeForm.weatherForecast}
                  onChange={(e) => setDayThemeForm({ ...dayThemeForm, weatherForecast: e.target.value })}
                  placeholder="晴朗溫暖 27°C / 降雨率 10%"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  今日穿搭貼心小建議
                </label>
                <input
                  type="text"
                  value={dayThemeForm.todayOutfitTip}
                  onChange={(e) => setDayThemeForm({ ...dayThemeForm, todayOutfitTip: e.target.value })}
                  placeholder="氣質小洋裝 + 拍照美鞋"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>
            </div>

            <div className="px-5 sm:px-7 py-4 border-t border-[var(--romantic-border,#BAE6FD)] flex items-center justify-end space-x-3 shrink-0 bg-white">
              <button
                type="button"
                onClick={() => setIsEditingDayTheme(false)}
                className="px-4 py-2 rounded-xl text-[var(--romantic-muted,#64748B)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveDayTheme}
                className="px-5 py-2 rounded-xl btn-romantic-primary text-white text-xs font-semibold cursor-pointer shadow-xs hover:shadow-md transition-all flex items-center space-x-1"
              >
                <span>💾 儲存簡介與主題</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Activity Confirmation Modal */}
      {deletingActivity && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[var(--romantic-border,#BAE6FD)] animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[var(--romantic-ink,#0F172A)] mb-2">
              確定要刪除此行程嗎？
            </h3>
            <p className="text-sm text-[var(--romantic-muted,#64748B)] mb-1">
              行程項目：<strong className="text-[var(--romantic-ink,#0F172A)] font-semibold">{deletingActivity.activity.title}</strong>
            </p>
            <p className="text-xs text-[var(--romantic-muted,#64748B)] mb-6">
              時間：{deletingActivity.activity.time} · 地點：{deletingActivity.activity.location || '無指定'}
            </p>
            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setDeletingActivity(null)}
                className="px-5 py-2.5 rounded-xl text-[var(--romantic-muted,#64748B)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-xs font-semibold cursor-pointer border border-[var(--romantic-border,#BAE6FD)] transition-colors"
              >
                取消保留
              </button>
              <button
                type="button"
                onClick={confirmDeleteActivity}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>確認刪除行程</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Unlock Modal for Secret Surprise Activities */}
      {passwordUnlockModalAct && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[var(--romantic-border,#BAE6FD)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--romantic-border,#BAE6FD)]">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] flex items-center justify-center border border-[var(--romantic-border,#BAE6FD)] shadow-2xs">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[var(--romantic-ink,#0F172A)]">
                    提前揭曉神秘驚喜行程
                  </h3>
                  <p className="text-xs text-[var(--romantic-muted,#64748B)]">
                    抵達現場或想搶先看？輸入通關密語即可揭開！
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordUnlockModalAct(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordUnlock} className="mt-5 space-y-4">
              <div className="p-3.5 rounded-2xl bg-[var(--romantic-rose-light,#F0F9FF)] border border-[var(--romantic-border,#BAE6FD)]">
                <div className="text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)]" />
                  <span>預定時段：{passwordUnlockModalAct.time}</span>
                </div>
                {passwordUnlockModalAct.surpriseHint && (
                  <p className="text-xs text-[var(--romantic-rose,#0284C7)] italic leading-relaxed mt-1">
                    「{passwordUnlockModalAct.surpriseHint}」
                  </p>
                )}
                <p className="text-[11px] text-[var(--romantic-muted,#64748B)] mt-2">
                  💡 提示：到達該行程時間也會全自動揭曉喔！
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1.5">
                  通關密語 (Password)
                </label>
                <input
                  type="password"
                  value={unlockPasswordInput}
                  onChange={(e) => {
                    setUnlockPasswordInput(e.target.value);
                    setUnlockError('');
                  }}
                  placeholder="輸入 4 位密碼 (例: 0520 或 1017)"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-sm tracking-widest font-mono text-center focus:outline-none focus:ring-2 focus:ring-[var(--romantic-rose,#0284C7)]"
                  autoFocus
                />
              </div>

              {unlockError && (
                <p className="text-xs text-rose-500 font-medium text-center">
                  {unlockError}
                </p>
              )}

              {unlockSuccess && (
                <div className="flex items-center justify-center space-x-2 text-xs text-emerald-600 font-bold bg-emerald-50 py-2.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{unlockSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordUnlockModalAct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--romantic-muted,#64748B)] hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  稍後再看
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold btn-romantic-primary text-white shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>立即解鎖揭曉</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

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
  Hourglass
} from 'lucide-react';
import { ActivityCategory, ActivityItem, DayItinerary } from '../types';
import { useAuth } from '../context/AuthContext';
import { getActivityLockStatus, getDayLockSummary } from '../utils/timeLock';

interface ItineraryViewProps {
  itinerary: DayItinerary[];
  onUpdateItinerary: (newItinerary: DayItinerary[]) => void;
  secretModePassword?: string;
  onSyncSecretSurprise?: (activity: ActivityItem, dayNumber: number, isDeleted?: boolean) => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  itinerary,
  onUpdateItinerary,
  secretModePassword = '0520',
  onSyncSecretSurprise
}) => {
  const { 
    isBoyfriend, 
    isGirlfriend, 
    role, 
    effectiveTime, 
    boyfriendForceUnlockAll 
  } = useAuth();

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isSecretRevealed, setIsSecretRevealed] = useState(false);
  const [isEditingActivity, setIsEditingActivity] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    dayIndex: number;
    activity: ActivityItem;
    isNew: boolean;
  } | null>(null);

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

  const currentDay = itinerary[selectedDayIndex] || itinerary[0];
  const daySummary = currentDay ? getDayLockSummary(currentDay, effectiveTime) : null;
  const isCurrentDayLockedForGirlfriend = isGirlfriend && !boyfriendForceUnlockAll && (daySummary?.isEntireDayLocked || false);

  const getCategoryBadge = (category: ActivityCategory) => {
    switch (category) {
      case 'birthday_surprise':
        return {
          icon: <Gift className="w-3.5 h-3.5" />,
          label: '🎂 生日特別驚喜',
          bg: 'bg-rose-100 text-rose-800 border-rose-300'
        };
      case 'dining':
        return {
          icon: <Utensils className="w-3.5 h-3.5" />,
          label: '🍽️ 浪漫大餐',
          bg: 'bg-amber-100 text-amber-800 border-amber-300'
        };
      case 'sightseeing':
        return {
          icon: <Sparkles className="w-3.5 h-3.5" />,
          label: '🌸 浪漫景點',
          bg: 'bg-pink-100 text-pink-800 border-pink-300'
        };
      case 'cafe':
        return {
          icon: <Coffee className="w-3.5 h-3.5" />,
          label: '☕ 甜點咖啡',
          bg: 'bg-orange-100 text-orange-800 border-orange-300'
        };
      case 'hotel':
        return {
          icon: <Hotel className="w-3.5 h-3.5" />,
          label: '🏨 質感住宿',
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-300'
        };
      case 'photo_spot':
        return {
          icon: <Camera className="w-3.5 h-3.5" />,
          label: '📸 拍照打卡',
          bg: 'bg-purple-100 text-purple-800 border-purple-300'
        };
      case 'shopping':
        return {
          icon: <ShoppingBag className="w-3.5 h-3.5" />,
          label: '🛍️ 逛街購物',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300'
        };
      case 'transit':
        return {
          icon: <Car className="w-3.5 h-3.5" />,
          label: '🚗 交通接駁',
          bg: 'bg-cyan-100 text-cyan-800 border-cyan-300'
        };
      case 'relax':
        return {
          icon: <Heart className="w-3.5 h-3.5" />,
          label: '💆‍♀️ 放鬆SPA',
          bg: 'bg-teal-100 text-teal-800 border-teal-300'
        };
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5" />,
          label: '景點活動',
          bg: 'bg-stone-100 text-stone-800 border-stone-200'
        };
    }
  };

  const handleOpenAddActivity = () => {
    setEditingItem({
      dayIndex: selectedDayIndex,
      activity: {
        id: 'act-' + Date.now(),
        time: '14:00 - 16:00',
        title: '',
        category: 'sightseeing',
        location: '',
        locationUrl: '',
        description: '',
        outfitTip: '',
        notes: '',
        isSecretSurprise: false,
        surpriseHint: '神秘行程，等妳親自揭曉 💕'
      },
      isNew: true
    });
    setIsEditingActivity(true);
  };

  const handleOpenEditActivity = (act: ActivityItem) => {
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
    const currentActs = [...targetDay.activities];

    if (editingItem.isNew) {
      currentActs.push(editingItem.activity);
    } else {
      const idx = currentActs.findIndex(a => a.id === editingItem.activity.id);
      if (idx !== -1) {
        currentActs[idx] = editingItem.activity;
      }
    }

    targetDay.activities = currentActs;
    updated[editingItem.dayIndex] = targetDay;
    onUpdateItinerary(updated);

    if (onSyncSecretSurprise) {
      onSyncSecretSurprise(editingItem.activity, targetDay.dayNumber, false);
    }

    setIsEditingActivity(false);
    setEditingItem(null);
  };

  const handleDeleteActivity = (actId: string) => {
    if (confirm('確定要刪除這個行程項目嗎？')) {
      const updated = [...itinerary];
      const targetDay = { ...updated[selectedDayIndex] };
      const deletedAct = targetDay.activities.find(a => a.id === actId);
      targetDay.activities = targetDay.activities.filter(a => a.id !== actId);
      updated[selectedDayIndex] = targetDay;
      onUpdateItinerary(updated);

      if (deletedAct && onSyncSecretSurprise) {
        onSyncSecretSurprise(deletedAct, targetDay.dayNumber, true);
      }
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

  const handleAddNewDay = () => {
    const newDayNumber = itinerary.length + 1;
    const newDay: DayItinerary = {
      id: 'day-' + Date.now(),
      dayNumber: newDayNumber,
      date: '2026-09-' + (17 + newDayNumber),
      themeTitle: `Day ${newDayNumber}: 浪漫探索與甜蜜回憶`,
      dayDescription: '自由安排，享受無拘無束的專屬時光。',
      weatherForecast: '晴天 25°C',
      todayOutfitTip: '穿上妳最喜歡的洋裝，準備留下滿滿照片！',
      activities: []
    };
    onUpdateItinerary([...itinerary, newDay]);
    setSelectedDayIndex(itinerary.length);
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
    updated[selectedDayIndex] = {
      ...updated[selectedDayIndex],
      ...dayThemeForm
    };
    onUpdateItinerary(updated);
    setIsEditingDayTheme(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Day selector tabs */}
      <div className="bg-white rounded-2xl p-2 sm:p-3 border border-rose-100 shadow-xs">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-2">
            {itinerary.map((day, idx) => {
              const isSelected = idx === selectedDayIndex;
              const summary = getDayLockSummary(day, effectiveTime);
              const isDayLockedForGirlfriend = isGirlfriend && !boyfriendForceUnlockAll && summary.isEntireDayLocked;

              return (
                <button
                  key={day.id}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`px-4 py-2.5 rounded-xl text-left transition-all cursor-pointer whitespace-nowrap relative ${
                    isSelected
                      ? 'bg-rose-500 text-white shadow-sm font-semibold scale-102'
                      : isDayLockedForGirlfriend
                      ? 'bg-stone-50/80 hover:bg-rose-50 text-stone-500 hover:text-stone-700 border border-stone-200/60'
                      : 'bg-stone-50 hover:bg-rose-50 text-stone-700 hover:text-rose-700'
                  }`}
                >
                  <div className="flex items-center justify-between space-x-2">
                    <div className="text-xs opacity-85 font-mono">
                      {day.date || `第 ${day.dayNumber} 天`}
                    </div>
                    {isDayLockedForGirlfriend && (
                      <span className="text-[10px] bg-stone-200/80 text-stone-600 px-1.5 py-0.2 rounded-full flex items-center space-x-0.5">
                        <Lock className="w-2.5 h-2.5 text-stone-500" />
                        <span>未解鎖</span>
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold flex items-center space-x-1">
                    <span>Day {day.dayNumber}</span>
                    {isBoyfriend && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-normal ${
                        summary.isEntireDayLocked ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {summary.unlockedCount}/{summary.totalActivities}解鎖
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {isBoyfriend && (
              <button
                onClick={handleAddNewDay}
                className="px-3.5 py-2.5 rounded-xl border-2 border-dashed border-rose-200 hover:border-rose-400 text-rose-600 hover:bg-rose-50 text-xs font-medium flex items-center space-x-1 whitespace-nowrap transition-colors cursor-pointer"
                title="新增一天行程"
              >
                <Plus className="w-4 h-4" />
                <span>新增 Day</span>
              </button>
            )}
          </div>

          {/* Role Mode Indicator */}
          <div className="flex items-center space-x-2 pl-3 border-l border-stone-200">
            {isBoyfriend ? (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>👑 蔡寶管理員（全權全覽）</span>
              </div>
            ) : isGirlfriend ? (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-pink-50 text-pink-700 text-xs font-semibold border border-pink-200">
                <Hourglass className="w-3.5 h-3.5 text-pink-500 animate-spin" />
                <span>⭐ 晴寶視角（活動前 1 小時解鎖）</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-300">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>👤 訪客唯讀預覽</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Day Header Card */}
      {currentDay && (
        <div className="bg-gradient-to-r from-rose-50/70 via-pink-50/60 to-amber-50/60 rounded-3xl p-5 sm:p-7 border border-rose-200/80 shadow-xs relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold font-mono">
                  DAY {currentDay.dayNumber}
                </span>
                <span className="text-xs font-medium text-rose-700 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{currentDay.date}</span>
                </span>
                {isCurrentDayLockedForGirlfriend && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 border border-amber-300 text-xs font-bold flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>驚喜封存中</span>
                  </span>
                )}
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-850">
                {currentDay.themeTitle}
              </h2>
              {currentDay.dayDescription && (
                <p className="text-stone-700 text-sm mt-1.5 max-w-2xl leading-relaxed">
                  {currentDay.dayDescription}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {currentDay.weatherForecast && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-amber-200 text-amber-800 text-xs font-medium shadow-2xs">
                  <CloudSun className="w-4 h-4 text-amber-500" />
                  <span>{currentDay.weatherForecast}</span>
                </div>
              )}

              {currentDay.todayOutfitTip && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-pink-200 text-pink-800 text-xs font-medium shadow-2xs">
                  <Shirt className="w-4 h-4 text-pink-500" />
                  <span>{currentDay.todayOutfitTip}</span>
                </div>
              )}

              {isBoyfriend && (
                <button
                  onClick={handleOpenEditDayTheme}
                  className="p-2 rounded-xl bg-white/80 hover:bg-white text-stone-600 hover:text-rose-600 border border-stone-200 text-xs flex items-center space-x-1 shadow-2xs cursor-pointer"
                  title="編輯此日主題與穿搭天氣"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">編輯主題</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notice Banner if this Day is currently locked for Girlfriend */}
      {isCurrentDayLockedForGirlfriend && (
        <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-pink-50 rounded-2xl p-5 border border-amber-200 shadow-sm animate-in fade-in">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-200">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-serif font-bold text-amber-900 text-base">
                  🔒 Day {currentDay.dayNumber} ({currentDay.date}) 專屬驚喜行程保密中
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs font-bold">
                  活動前 1 小時揭曉
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                「🤫 晴寶小仙女請稍候！{currentDay.date} 生日大日子的行程將在每個活動開始前 1 小時準時為妳解鎖揭開，保留滿滿的期待與儀式感 ✨」
              </p>
              {daySummary?.formattedEarliestUnlockTime && (
                <p className="text-[11px] font-semibold text-rose-700 mt-2 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
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
          <div className="flex items-center space-x-2 text-sm font-semibold text-stone-700">
            <Clock className="w-4 h-4 text-rose-500" />
            <span>當日行程時間軸 ({currentDay?.activities.length || 0} 個項目)</span>
          </div>

          {isBoyfriend && (
            <button
              onClick={handleOpenAddActivity}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium flex items-center space-x-1 shadow-xs shadow-rose-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增行程項目</span>
            </button>
          )}
        </div>

        {(!currentDay?.activities || currentDay.activities.length === 0) ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-stone-200 text-stone-400">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-rose-300" />
            <p className="text-sm">這一天還沒有安排行程，為她規劃浪漫景點吧！</p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-rose-200">
            {currentDay.activities.map((act, index) => {
              const badge = getCategoryBadge(act.category);
              const lockStatus = getActivityLockStatus(currentDay.date, act.time, effectiveTime);
              
              // Determine if this item is locked for the current viewer
              const isTimeLocked = isGirlfriend && !lockStatus.isUnlocked;
              const isHiddenSurprise = act.isSecretSurprise && isGirlfriend;

              if (isTimeLocked) {
                // RENDER LOCKED MYSTERY CARD FOR GIRLFRIEND
                return (
                  <div
                    key={act.id}
                    className="relative bg-gradient-to-br from-stone-50 via-rose-50/40 to-pink-50/40 rounded-2xl p-5 sm:p-6 border border-rose-200/80 shadow-xs transition-all"
                  >
                    {/* Timeline Dot (Locked) */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-6 w-5 h-5 rounded-full bg-white border-4 border-amber-400 shadow-xs flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Time Badge */}
                        <div className="flex items-center space-x-1 font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 shadow-2xs">
                          <Clock className="w-3 h-3 text-stone-500" />
                          <span>{act.time}</span>
                        </div>

                        {/* Category Badge */}
                        <div className={`flex items-center space-x-1 text-xs font-medium px-2.5 py-1 rounded-lg border ${badge.bg}`}>
                          {badge.icon}
                          <span>{badge.label}</span>
                        </div>

                        {/* Lock status pill */}
                        <span className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-0.8 rounded-full bg-amber-500 text-white shadow-2xs">
                          <Lock className="w-3 h-3" />
                          <span>活動前 1 小時自動解鎖</span>
                        </span>
                      </div>

                      {/* Mystery locked content */}
                      <div className="p-4 rounded-2xl bg-white/90 border border-rose-200/70 shadow-2xs">
                        <div className="flex items-center space-x-2 text-rose-600 font-bold text-base font-serif">
                          <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                          <span>🔒 晴寶專屬神秘行程 · 驚喜封存中</span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                          「🤫 蔡寶用心策劃的驚喜時光！請好好享受現在，此項目將在 <strong>{lockStatus.formattedUnlockTime}</strong> (活動開始前 1 小時) 自動揭曉內容與地點喔 ✨」
                        </p>
                        <div className="mt-2.5 flex items-center space-x-2 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/70 inline-flex">
                          <Hourglass className="w-3 h-3 text-amber-600" />
                          <span>倒數約 {lockStatus.minutesUntilUnlock} 分鐘後解鎖揭曉</span>
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
                  className="relative bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 hover:border-rose-300 shadow-xs hover:shadow-md transition-all group"
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-6 w-5 h-5 rounded-full bg-white border-4 border-rose-500 shadow-xs flex items-center justify-center" />

                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    
                    {/* Left: Time, Category & Content */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Time Badge */}
                        <div className="flex items-center space-x-1 font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700">
                          <Clock className="w-3 h-3 text-stone-500" />
                          <span>{act.time}</span>
                        </div>

                        {/* Category Badge */}
                        <div className={`flex items-center space-x-1 text-xs font-medium px-2.5 py-1 rounded-lg border ${badge.bg}`}>
                          {badge.icon}
                          <span>{badge.label}</span>
                        </div>

                        {/* Secret surprise indicator */}
                        {act.isSecretSurprise && (
                          <span className="inline-flex items-center space-x-1 text-xs font-medium px-2 py-0.5 rounded-full bg-pink-500 text-white shadow-2xs">
                            <Gift className="w-3 h-3" />
                            <span>神秘驚喜</span>
                          </span>
                        )}

                        {/* Boyfriend visibility inspection pill */}
                        {isBoyfriend && (
                          lockStatus.isUnlocked ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                              <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                              <span>晴寶已解鎖可見</span>
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1">
                              <Lock className="w-2.5 h-2.5 text-amber-600" />
                              <span>晴寶視角封存 ({lockStatus.formattedUnlockTime} 解鎖)</span>
                            </span>
                          )
                        )}

                        {isGirlfriend && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                            <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                            <span>✨ 已解鎖</span>
                          </span>
                        )}
                      </div>

                      {/* Main Title / Hidden Surprise display */}
                      {isHiddenSurprise ? (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200">
                          <div className="flex items-center space-x-2 text-rose-600 font-bold text-base font-serif">
                            <Gift className="w-5 h-5 animate-bounce" />
                            <span>🔒 秘密生日驚喜 (內容保密中)</span>
                          </div>
                          <p className="text-xs text-rose-500 mt-1 italic">
                            「{act.surpriseHint || '神秘行程，等妳親自揭曉 💕'}」
                          </p>
                          <p className="text-[11px] text-stone-400 mt-2">
                            * 抵達現場時由男友親自為妳解鎖揭曉！
                          </p>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-850">
                            {act.title}
                          </h3>

                          {act.description && (
                            <p className="text-stone-600 text-sm mt-1 leading-relaxed">
                              {act.description}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Location & Navigation */}
                      {!isHiddenSurprise && act.location && (
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            <span className="font-medium text-stone-700">{act.location}</span>
                          </div>
                          
                          {/* Google Maps link */}
                          <a
                            href={act.locationUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 border border-stone-200 transition-colors"
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
                            <div className="inline-flex items-center space-x-1.5 text-xs text-pink-700 bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-200/60">
                              <Shirt className="w-3 h-3 text-pink-500" />
                              <span>穿搭建議：{act.outfitTip}</span>
                            </div>
                          )}

                          {act.notes && (
                            <div className="inline-flex items-center space-x-1.5 text-xs text-stone-600 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200/60">
                              <span>📝 備註：{act.notes}</span>
                            </div>
                          )}
                        </div>
                      )}

                    </div>

                    {/* Right: Actions (Edit, Delete, Move) - Boyfriend only */}
                    {isBoyfriend && (
                      <div className="flex items-center md:flex-col justify-end gap-1 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleMoveActivity(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                            title="往上移"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveActivity(index, 'down')}
                            disabled={index === currentDay.activities.length - 1}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                            title="往下移"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleOpenEditActivity(act)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="編輯此行程"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="刪除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit / Add Activity Modal */}
      {isEditingActivity && editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <h3 className="font-serif text-xl font-bold text-stone-850 mb-4">
              {editingItem.isNew ? '✨ 新增行程項目' : '✏️ 編輯行程項目'}
            </h3>

            <div className="space-y-4 text-sm text-stone-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    時間 (例如 09:30 - 11:00)
                  </label>
                  <input
                    type="text"
                    value={editingItem.activity.time}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      activity: { ...editingItem.activity, time: e.target.value }
                    })}
                    placeholder="14:00 - 15:30"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    分類標籤
                  </label>
                  <select
                    value={editingItem.activity.category}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      activity: { ...editingItem.activity, category: e.target.value as ActivityCategory }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400 bg-white"
                  >
                    <option value="sightseeing">🌸 浪漫景點</option>
                    <option value="birthday_surprise">🎂 生日特別驚喜</option>
                    <option value="dining">🍽️ 浪漫大餐</option>
                    <option value="cafe">☕ 甜點咖啡</option>
                    <option value="hotel">🏨 質感住宿</option>
                    <option value="photo_spot">📸 拍照打卡</option>
                    <option value="shopping">🛍️ 逛街購物</option>
                    <option value="transit">🚗 交通接駁</option>
                    <option value="relax">💆‍♀️ 放鬆SPA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  活動名稱 *
                </label>
                <input
                  type="text"
                  value={editingItem.activity.title}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    activity: { ...editingItem.activity, title: e.target.value }
                  })}
                  placeholder="例如：晴空塔浪漫法式夜景晚餐"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    地點位置
                  </label>
                  <input
                    type="text"
                    value={editingItem.activity.location || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      activity: { ...editingItem.activity, location: e.target.value }
                    })}
                    placeholder="例如：東京都墨田區押上1-1-2"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
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
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  詳細說明 / 浪漫亮點
                </label>
                <textarea
                  value={editingItem.activity.description || ''}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    activity: { ...editingItem.activity, description: e.target.value }
                  })}
                  rows={2}
                  placeholder="說明這段行程的浪漫安排與體驗..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    穿搭小建議 (給女友的貼心小提示)
                  </label>
                  <input
                    type="text"
                    value={editingItem.activity.outfitTip || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      activity: { ...editingItem.activity, outfitTip: e.target.value }
                    })}
                    placeholder="例如：優雅氣質洋裝、好走的平底鞋"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
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
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                  />
                </div>
              </div>

              {/* Secret Surprise Toggle */}
              <div className="p-3.5 rounded-2xl bg-pink-50 border border-pink-200">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.activity.isSecretSurprise || false}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      activity: { ...editingItem.activity, isSecretSurprise: e.target.checked }
                    })}
                    className="w-4 h-4 text-pink-600 rounded-sm focus:ring-pink-500"
                  />
                  <span className="font-semibold text-pink-900 text-xs">
                    🎁 設定為「神秘驚喜行程」（在女友預覽模式下隱藏標題與地點）
                  </span>
                </label>
                {editingItem.activity.isSecretSurprise && (
                  <div className="mt-2 pl-6">
                    <label className="block text-[11px] text-pink-800 font-medium mb-1">
                      給女友看的神秘線索提示 (Hint)
                    </label>
                    <input
                      type="text"
                      value={editingItem.activity.surpriseHint || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        activity: { ...editingItem.activity, surpriseHint: e.target.value }
                      })}
                      placeholder="例如：在全東京最高的餐廳為妳唱生日歌 💕"
                      className="w-full px-3 py-1.5 rounded-lg border border-pink-300 bg-white text-xs"
                    />
                  </div>
                )}
              </div>

            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-stone-100">
              <button
                onClick={() => {
                  setIsEditingActivity(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveActivity}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium shadow-xs shadow-rose-200 cursor-pointer"
              >
                儲存行程
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Day Theme Modal */}
      {isEditingDayTheme && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <h3 className="font-serif text-xl font-bold text-stone-850 mb-4">
              📅 編輯 Day {currentDay.dayNumber} 主題與資訊
            </h3>

            <div className="space-y-4 text-sm text-stone-700">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  今日主題名稱
                </label>
                <input
                  type="text"
                  value={dayThemeForm.themeTitle}
                  onChange={(e) => setDayThemeForm({ ...dayThemeForm, themeTitle: e.target.value })}
                  placeholder="例如：Day 1: 抵達東京 · 漫步銀座與浪漫高空夜景晚餐"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  今日簡述 / 浪漫寄語
                </label>
                <textarea
                  value={dayThemeForm.dayDescription}
                  onChange={(e) => setDayThemeForm({ ...dayThemeForm, dayDescription: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    預估天氣 (例如 晴天 23°C)
                  </label>
                  <input
                    type="text"
                    value={dayThemeForm.weatherForecast}
                    onChange={(e) => setDayThemeForm({ ...dayThemeForm, weatherForecast: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    今日穿搭指南
                  </label>
                  <input
                    type="text"
                    value={dayThemeForm.todayOutfitTip}
                    onChange={(e) => setDayThemeForm({ ...dayThemeForm, todayOutfitTip: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-stone-100">
              <button
                onClick={() => setIsEditingDayTheme(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveDayTheme}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium shadow-xs shadow-rose-200 cursor-pointer"
              >
                儲存更新
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Sparkles, 
  Heart, 
  Gift, 
  UtensilsCrossed, 
  Camera, 
  ArrowRight, 
  CheckCircle2, 
  Bell, 
  Play, 
  RotateCcw, 
  Plus, 
  Cake, 
  Stethoscope, 
  KeyRound, 
  Flame,
  ShieldCheck,
  Edit3,
  Lock
} from 'lucide-react';
import { BirthdayTripData, LiveAlertScenario, DayHighlightCard } from '../types';
import { HeroCountdown } from './HeroCountdown';
import { EditDayHighlightsModal, DEFAULT_DAY_HIGHLIGHTS } from './EditDayHighlightsModal';
import { useAuth } from '../context/AuthContext';
import { sortScenariosByStartTime, getShortScenarioTimeTag, getDayLockSummary } from '../utils/timeLock';

interface HomeViewProps {
  tripData: BirthdayTripData;
  onOpenLoveLetter: () => void;
  onTriggerSurpriseModal: () => void;
  onNavigateTab: (tab: string) => void;
  allScenarios: LiveAlertScenario[];
  onTriggerScenario: (scenario: LiveAlertScenario) => void;
  onOpenAddScenario: () => void;
  onOpenScenarioPicker: () => void;
  onResetAlerts: () => void;
  onClearActiveAlert?: () => void;
  sentAlertId: string | null;
  onSaveDayHighlights: (highlights: DayHighlightCard[]) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  tripData,
  onOpenLoveLetter,
  onTriggerSurpriseModal,
  onNavigateTab,
  allScenarios,
  onTriggerScenario,
  onOpenAddScenario,
  onOpenScenarioPicker,
  onResetAlerts,
  onClearActiveAlert,
  sentAlertId,
  onSaveDayHighlights
}) => {
  const { isBoyfriend } = useAuth();
  const [isEditingHighlightsOpen, setIsEditingHighlightsOpen] = useState(false);

  // Statistics for quick widgets
  const unlockedSurprisesCount = tripData.surprises.filter(s => s.isUnlocked).length;
  const totalSurprisesCount = tripData.surprises.length;
  const snackList = tripData.snacks || [];
  const mustEatSnacksCount = snackList.filter(
    s => s.status === 'must' || s.girlfriendVote === 'must' || s.boyfriendVote === 'must'
  ).length;

  const currentHighlights: DayHighlightCard[] = tripData.settings.dayHighlights && tripData.settings.dayHighlights.length === 3
    ? tripData.settings.dayHighlights
    : DEFAULT_DAY_HIGHLIGHTS;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Live Interactive Notification Control Center (Placed strictly ABOVE Hero Countdown for Boyfriend) */}
      {isBoyfriend && (
        <div className="rounded-3xl bg-white border border-[var(--romantic-border,#BAE6FD)] p-4 sm:p-5 shadow-sm space-y-3.5 text-[var(--romantic-ink,#0F172A)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="font-bold text-sm sm:text-base text-[var(--romantic-ink,#0F172A)] font-serif">
                    🔔 專屬行程情境即時通知系統
                  </span>
                  <span className="btn-romantic-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    蔡寶專屬控制台 · 僅首頁顯示
                  </span>
                </div>
                <p className="text-xs text-[var(--romantic-muted,#64748B)] mt-0.5">
                  時間到達時自動主動彈出，亦可點擊下方按鈕「立即發送」至晴寶手機視角！
                </p>
              </div>
            </div>

            {/* Actions: Add New Alert Card & All Scenarios */}
            <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto sm:justify-end">
              <button
                onClick={onOpenAddScenario}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl btn-romantic-primary text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer whitespace-nowrap"
                title="新增自訂即時推播驚喜卡片"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>➕ 新增驚喜卡片</span>
              </button>

              <button
                onClick={onOpenScenarioPicker}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl btn-romantic-gold text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center space-x-1 cursor-pointer whitespace-nowrap"
                title="管理所有預設與自訂推播卡片"
              >
                <Play className="w-3 h-3 fill-white shrink-0" />
                <span>全部卡片管理</span>
              </button>

              <button
                onClick={onResetAlerts}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all flex items-center justify-center space-x-1 cursor-pointer whitespace-nowrap border border-slate-200 shrink-0"
                title="清除所有已讀記錄與重置即時驚喜，可重新觸發任何情境"
              >
                <RotateCcw className="w-3 h-3 text-[var(--romantic-gold,#F59E0B)] shrink-0" />
                <span>重置標記</span>
              </button>
            </div>
          </div>

          {/* Active Live Alert Status Banner (If a manual push is active) */}
          {tripData.activeLiveAlert?.title && (
            <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="text-xs font-bold text-amber-900 shrink-0">
                  目前雲端廣播中：
                </span>
                <span className="text-xs text-amber-800 font-medium truncate">
                  【{tripData.activeLiveAlert.badge || tripData.activeLiveAlert.title}】{tripData.activeLiveAlert.title}
                </span>
              </div>
              {onClearActiveAlert && (
                <button
                  onClick={onClearActiveAlert}
                  className="px-2.5 py-1 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-900 text-xs font-bold transition-colors cursor-pointer shrink-0 self-end sm:self-auto flex items-center space-x-1"
                  title="撤回此推播，清除雲端狀態，女友端將不再自動彈窗"
                >
                  <span>⏹️ 撤回/結束廣播</span>
                </button>
              )}
            </div>
          )}

          {/* Quick Trigger Chips */}
          <div>
            <div className="text-xs font-bold text-slate-600 mb-2 flex items-center space-x-1.5 flex-wrap gap-1">
              <span>⚡ 快捷情境發送通道（點擊即發送）：</span>
              <span className="text-[10px] text-[var(--romantic-rose,#0284C7)] font-medium bg-[var(--romantic-rose-light,#F0F9FF)] px-2 py-0.5 rounded-full border border-[var(--romantic-border,#BAE6FD)]">
                共 {allScenarios.length} 張驚喜卡片 · 已按觸發時間排序
              </span>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
              {sortScenariosByStartTime(allScenarios).map((sc) => {
                const isSent = sentAlertId === sc.id;
                const timeTag = getShortScenarioTimeTag(sc);
                return (
                  <button
                    key={sc.id}
                    onClick={() => onTriggerScenario(sc)}
                    title={`【${timeTag}】${sc.title}\n${sc.message}`}
                    className={`px-3 py-2 rounded-2xl border text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                      isSent
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-slate-700 hover:text-[var(--romantic-rose,#0284C7)] border-[var(--romantic-border,#BAE6FD)]'
                    }`}
                  >
                    {isSent ? (
                      <CheckCircle2 className="w-3.5 h-3.5 animate-bounce" />
                    ) : sc.category === 'birthday' ? (
                      <Cake className="w-3.5 h-3.5 text-pink-500" />
                    ) : sc.category === 'clinic' ? (
                      <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                    ) : sc.category === 'escape' ? (
                      <KeyRound className="w-3.5 h-3.5 text-purple-500" />
                    ) : sc.category === 'french' ? (
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    ) : sc.category === 'bbq' ? (
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                    ) : (
                      <UtensilsCrossed className="w-3.5 h-3.5 text-sky-500" />
                    )}
                    {timeTag && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] text-[10px] font-mono font-bold shrink-0 border border-[var(--romantic-border,#BAE6FD)]/60">
                        {timeTag}
                      </span>
                    )}
                    <span>{isSent ? '已發送給晴寶！' : sc.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Romantic Hero & Countdown Banner - Dedicated strictly to Home Tab */}
      <HeroCountdown
        settings={tripData.settings}
        onOpenLoveLetter={onOpenLoveLetter}
        onTriggerSurpriseModal={onTriggerSurpriseModal}
      />

      {/* 3. Trip Overview Cards & Quick Navigators */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--romantic-ink,#0F172A)] flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-[var(--romantic-rose,#0284C7)]" />
              <span>台南 3 天 2 夜專屬行程速覽</span>
            </h3>
            <p className="text-xs text-[var(--romantic-muted,#64748B)] mt-0.5">
              10/16 ~ 10/18 · 煙波大飯店 ＆ 10/17 晴寶生日大日子
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {isBoyfriend && (
              <button
                onClick={() => setIsEditingHighlightsOpen(true)}
                className="px-3.5 py-1.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 hover:text-[var(--romantic-rose,#0284C7)] border border-slate-200 hover:border-[var(--romantic-border,#BAE6FD)] text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                title="編輯此處 3 天行程速覽文案（可開啟防爆雷保護，不洩漏神秘餐廳或活動）"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>✏️ 編輯行程速覽</span>
              </button>
            )}

            <button
              onClick={() => onNavigateTab('itinerary')}
              className="px-4 py-2 rounded-2xl btn-romantic-primary text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <span>前往每日時刻表</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Days Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {currentHighlights.map((hl) => {
            const isDay2 = hl.dayNumber === 2;
            return (
              <div 
                key={hl.dayNumber}
                onClick={() => onNavigateTab('itinerary')}
                className={`rounded-3xl bg-white p-5 hover:shadow-md transition-all cursor-pointer space-y-3 relative overflow-hidden group ${
                  isDay2 
                    ? 'border-2 border-[var(--romantic-gold,#DEC180)] hover:shadow-lg' 
                    : 'border border-[var(--romantic-border,#BAE6FD)] hover:border-[var(--romantic-rose,#0284C7)]'
                }`}
              >
                {isDay2 && (
                  <div className="absolute -right-3 -top-3 opacity-10">
                    <Cake className="w-24 h-24 text-[var(--romantic-gold,#DEC180)]" />
                  </div>
                )}

                <div className="flex items-center justify-between relative z-10">
                  <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                    isDay2
                      ? 'btn-romantic-gold text-white shadow-xs'
                      : 'bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)]'
                  }`}>
                    {hl.dateBadge}
                  </span>
                  
                  <span className={`text-xs transition-colors flex items-center space-x-1 ${
                    isDay2 ? 'text-amber-600 font-bold group-hover:underline' : 'text-slate-400 group-hover:text-[var(--romantic-rose,#0284C7)]'
                  }`}>
                    {hl.isSecretSurprise && (
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full font-normal mr-1">
                        保密中
                      </span>
                    )}
                    <span>查看時程 ➔</span>
                  </span>
                </div>

                <h4 className={`font-serif font-bold text-base transition-colors relative z-10 ${
                  isDay2
                    ? 'text-[var(--romantic-ink,#0F172A)] group-hover:text-[var(--romantic-gold,#DEC180)]'
                    : 'text-[var(--romantic-ink,#0F172A)] group-hover:text-[var(--romantic-rose,#0284C7)]'
                }`}>
                  {hl.title}
                </h4>

                <p className="text-xs text-[var(--romantic-muted,#64748B)] leading-relaxed relative z-10">
                  {hl.description}
                </p>

                {(hl.tag1 || hl.tag2) && (
                  <div className={`pt-2 border-t flex items-center space-x-3 text-xs relative z-10 ${
                    isDay2 ? 'border-amber-100 text-amber-800' : 'border-slate-100 text-slate-500'
                  }`}>
                    {hl.tag1 && (
                      <span className="flex items-center space-x-1">
                        {isDay2 ? (
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)]" />
                        )}
                        <span>{hl.tag1}</span>
                      </span>
                    )}
                    {hl.tag1 && hl.tag2 && <span>·</span>}
                    {hl.tag2 && (
                      <span className="flex items-center space-x-1">
                        {isDay2 ? (
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-[var(--romantic-gold,#F59E0B)]" />
                        )}
                        <span>{hl.tag2}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </div>

      {/* 4. Quick Feature Explorers (Snacks, Surprises, Photos) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        
        {/* Snacks Widget */}
        <div 
          onClick={() => onNavigateTab('snacks')}
          className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-5 hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-white text-amber-600 border border-amber-200 flex items-center justify-center shadow-xs">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-base text-slate-900 group-hover:text-amber-700 transition-colors">
                🍜 台南小吃心願清單
              </h4>
              <span className="text-xs font-bold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full">
                必吃 {mustEatSnacksCount} 間
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              雙人即時投票牛肉湯、鱔魚意麵、布丁，打造專屬府城吃貨攻略！
            </p>
          </div>
          <div className="pt-2 flex items-center text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform space-x-1">
            <span>前往心願投票清單</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Surprises Widget */}
        <div 
          onClick={() => onNavigateTab('surprises')}
          className="rounded-3xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 p-5 hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-white text-sky-600 border border-sky-200 flex items-center justify-center shadow-xs">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-base text-slate-900 group-hover:text-sky-700 transition-colors">
                🎁 神秘驚喜任務
              </h4>
              <span className="text-xs font-bold text-sky-700 bg-sky-200/60 px-2 py-0.5 rounded-full">
                進度 {unlockedSurprisesCount} / {totalSurprisesCount}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              蔡寶為晴寶秘密籌備的 6 大浪漫時刻，支援輸入專屬通關密語解鎖！
            </p>
          </div>
          <div className="pt-2 flex items-center text-xs font-bold text-sky-700 group-hover:translate-x-1 transition-transform space-x-1">
            <span>查看神秘驚喜任務</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Polaroid Memory Wall Widget */}
        <div 
          onClick={() => onNavigateTab('photos')}
          className="rounded-3xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 p-5 hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-white text-rose-600 border border-rose-200 flex items-center justify-center shadow-xs">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-base text-slate-900 group-hover:text-rose-700 transition-colors">
                📸 拍立得回憶牆
              </h4>
              <span className="text-xs font-bold text-rose-700 bg-rose-200/60 px-2 py-0.5 rounded-full">
                {tripData.photos.length} 張相片
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              紀錄晴寶在台南的每一張笑臉與甜蜜合照，保留永恆的生日旅行記憶。
            </p>
          </div>
          <div className="pt-2 flex items-center text-xs font-bold text-rose-700 group-hover:translate-x-1 transition-transform space-x-1">
            <span>打開拍立得相片牆</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* Edit Day Highlights Modal */}
      {isEditingHighlightsOpen && (
        <EditDayHighlightsModal
          isOpen={isEditingHighlightsOpen}
          onClose={() => setIsEditingHighlightsOpen(false)}
          dayHighlights={currentHighlights}
          itinerary={tripData.itinerary}
          onSave={onSaveDayHighlights}
        />
      )}

    </div>
  );
};

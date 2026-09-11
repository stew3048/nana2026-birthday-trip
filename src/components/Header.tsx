import React, { useState } from 'react';
import { 
  Heart, 
  Music, 
  Share2, 
  Download, 
  Upload, 
  Sparkles, 
  Calendar, 
  Settings, 
  Globe, 
  Printer, 
  Gift, 
  Check, 
  FolderSync,
  Bell,
  UtensilsCrossed,
  Cloud,
  Star,
  ClipboardList,
  Palette
} from 'lucide-react';
import { BirthdayTripData } from '../types';
import { exportTripToJson, generateShareableUrl, getPresetByName, syncTripToCloud } from '../utils/storage';
import { romanticMusic } from '../utils/audio';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface HeaderProps {
  tripData: BirthdayTripData;
  onUpdateTripData: (newData: BirthdayTripData) => void;
  onOpenLoveLetter: () => void;
  onOpenSettings: () => void;
  onOpenNetlifyGuide: () => void;
  onOpenPrintGuide: () => void;
  onTriggerSurpriseModal: () => void;
  onOpenLiveAlerts: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  tripData,
  onUpdateTripData,
  onOpenLoveLetter,
  onOpenSettings,
  onOpenNetlifyGuide,
  onOpenPrintGuide,
  onTriggerSurpriseModal,
  onOpenLiveAlerts,
  activeTab,
  setActiveTab,
}) => {
  const { isBoyfriend, requireAuthOrPrompt } = useAuth();
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudSyncSuccess, setCloudSyncSuccess] = useState(false);

  const toggleMusic = () => {
    const playing = romanticMusic.toggle();
    setIsPlayingMusic(playing);
  };

  const handleShare = () => {
    const url = generateShareableUrl(tripData);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedShare(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.1 }
      });
      setTimeout(() => setCopiedShare(false), 3000);
    });
  };

  const handleCloudSync = async () => {
    if (!requireAuthOrPrompt('手動同步至 Firebase 雲端資料庫')) {
      return;
    }
    setIsCloudSyncing(true);
    const success = await syncTripToCloud(tripData);
    setIsCloudSyncing(false);
    if (success) {
      setCloudSyncSuccess(true);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.1 } });
      setTimeout(() => setCloudSyncSuccess(false), 3000);
    } else {
      alert('雲端同步失敗，請檢查網路連線或登入身分');
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string) as BirthdayTripData;
        if (parsed.settings && parsed.itinerary) {
          onUpdateTripData(parsed);
          alert('🎉 成功匯入行程資料！');
        } else {
          alert('⚠️ 檔案格式不符合行程手冊規格');
        }
      } catch (err) {
        alert('⚠️ 讀取檔案失敗，請確認是有效的 JSON 檔');
      }
    };
    reader.readAsText(file);
  };

  const switchPreset = (presetName: 'tainan' | 'tokyo') => {
    if (confirm('切換範本將會載入行程資料，確定要載入嗎？')) {
      const newPreset = getPresetByName(presetName);
      onUpdateTripData(newPreset);
      setShowPresetMenu(false);
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.2 } });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--romantic-card-warm,#F8FAFC)]/95 backdrop-blur-md border-b border-[var(--romantic-border,#BAE6FD)] shadow-xs text-[var(--romantic-ink,#0F172A)] transition-colors duration-300">
      {/* Click outside backdrop for admin menu */}
      {showPresetMenu && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setShowPresetMenu(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-40">
        <div className="flex items-center justify-between min-h-[3.75rem] sm:h-20 py-2 sm:py-0 gap-2">
          
          {/* Logo & Main Title: ⭐ 晴寶 2026 生日 */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 mr-1 sm:mr-2">
            <button
              id="header-romantic-logo-btn"
              onClick={onTriggerSurpriseModal}
              className="flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-2xl btn-romantic-primary text-white shadow-md hover:scale-105 transition-transform cursor-pointer shrink-0 border border-white/40"
              title="點擊播放慶生驚喜"
            >
              <Star className="w-4 h-4 sm:w-6 sm:h-6 fill-white animate-pulse" />
            </button>
            <div className="min-w-0 truncate">
              <div className="flex items-center space-x-2">
                <div className="font-serif font-bold tracking-tight text-[var(--romantic-ink,#0F172A)] leading-tight min-w-0 truncate">
                  <div className="text-sm sm:text-base md:text-lg flex items-center space-x-1 truncate">
                    <span className="truncate">⭐ {tripData.settings.girlfriendName || '晴寶'} 2026 生日</span>
                  </div>
                  <div className="text-[11px] sm:text-xs text-[var(--romantic-rose,#0284C7)] font-medium truncate">
                    專屬台南煙波浪漫之旅
                  </div>
                </div>
                <div className="hidden md:inline-flex flex-col items-center px-2 py-0.5 rounded-xl text-[10px] font-bold bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#E0F2FE)] leading-tight shrink-0">
                  <span>🎂 10/16~10/18</span>
                  <span>生日假期</span>
                </div>
              </div>
              <p className="text-[11px] text-[var(--romantic-muted,#64748B)] hidden lg:block mt-0.5 truncate">
                📍 台南 Tainan · 由 {tripData.settings.boyfriendName || '蔡寶'} 專屬精心策劃
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            {/* Live Alerts Trigger - Only for Boyfriend (Admin) */}
            {isBoyfriend && (
              <button
                id="header-live-alerts-btn"
                onClick={onOpenLiveAlerts}
                className="flex items-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#FFFBF0] hover:bg-[#FDF4DC] text-[#8C6A28] border border-[#E8DFC8] text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
                title="查看與模擬 18:00 晚餐 / 23:00 密醫看診等互動情境通知"
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A059] animate-bounce" />
                <span className="hidden sm:inline">情境通知</span>
                <span className="px-1 py-0.2 bg-[#F5E8CE] text-[#8C6A28] text-[9px] rounded-full font-extrabold border border-[#E3D1AC]">
                  發送
                </span>
              </button>
            )}

            {/* Surprise Presentation Button */}
            <button
              id="header-surprise-mode-btn"
              onClick={onTriggerSurpriseModal}
              className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full btn-romantic-primary text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Gift className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">驚喜揭曉</span>
              <span className="xs:hidden sm:hidden">驚喜</span>
            </button>

            {/* Music Toggle - Available to everyone */}
            <button
              id="header-music-btn"
              onClick={toggleMusic}
              className={`p-1.5 sm:px-2.5 sm:py-2 rounded-xl text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer border ${
                isPlayingMusic 
                  ? 'bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border-[var(--romantic-border,#BAE6FD)]' 
                  : 'bg-white text-[var(--romantic-muted,#64748B)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] hover:text-[var(--romantic-rose,#0284C7)] border-[#E2E8F0]'
              }`}
              title={isPlayingMusic ? '暫停浪漫背景音樂' : '播放浪漫背景音樂'}
            >
              <Music className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isPlayingMusic ? 'animate-spin text-[var(--romantic-rose,#0284C7)]' : 'text-slate-400'}`} />
              <span className="hidden md:inline">{isPlayingMusic ? '音樂中' : '浪漫音樂'}</span>
            </button>

            {/* Boyfriend-Only Admin Tools: Compact Tool Menu */}
            {isBoyfriend && (
              <>
                {/* Cloud Sync Button */}
                <button
                  id="header-cloud-sync-btn"
                  onClick={handleCloudSync}
                  disabled={isCloudSyncing}
                  className={`p-1.5 sm:px-2.5 sm:py-2 rounded-xl text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer border ${
                    cloudSyncSuccess
                      ? 'bg-[#F2F6F3] text-[#4A6E53] border-[#C8DEC9]'
                      : 'bg-white text-[var(--romantic-muted,#64748B)] border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                  title="同步全部行程至 Firebase 雲端資料庫"
                >
                  <Cloud className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                  <span className="hidden lg:inline">{cloudSyncSuccess ? '已同步' : '雲端同步'}</span>
                </button>

                {/* Share / Copy Link */}
                <button
                  id="header-share-btn"
                  onClick={handleShare}
                  className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-white hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-rose,#0284C7)] border border-[#E2E8F0] text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                  title="複製專屬分享連結給晴寶"
                >
                  {copiedShare ? (
                    <>
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4A6E53]" />
                      <span className="hidden xl:inline text-[#4A6E53] font-medium">已複製！</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden xl:inline">分享</span>
                    </>
                  )}
                </button>

                {/* More Admin Options Dropdown */}
                <div className="relative">
                  <button
                    id="header-admin-more-btn"
                    onClick={() => setShowPresetMenu(!showPresetMenu)}
                    className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-white hover:bg-slate-50 text-[var(--romantic-muted,#64748B)] border border-[#E2E8F0] text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                    title="管理員更多工具 (範本、列印、備份、設定)"
                  >
                    <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline">工具</span>
                  </button>

                  {showPresetMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        👑 管理員更多功能
                      </div>

                      <button
                        onClick={() => { onOpenSettings(); setShowPresetMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-[var(--romantic-rose-light,#F0F9FF)] hover:text-[var(--romantic-rose,#0284C7)] flex items-center space-x-2 transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>基本資料與權限設定</span>
                      </button>

                      <button
                        onClick={() => { onOpenPrintGuide(); setShowPresetMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-[var(--romantic-rose-light,#F0F9FF)] hover:text-[var(--romantic-rose,#0284C7)] flex items-center space-x-2 transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-slate-400" />
                        <span>列印手冊 / 另存 PDF</span>
                      </button>

                      <button
                        onClick={() => { onOpenNetlifyGuide(); setShowPresetMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 flex items-center space-x-2 transition-colors cursor-pointer"
                      >
                        <Globe className="w-4 h-4 text-amber-500" />
                        <span>Netlify 免費上架教學</span>
                      </button>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => { exportTripToJson(tripData); setShowPresetMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-slate-400" />
                        <span>匯出備份 (JSON)</span>
                      </button>

                      <label className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4 text-slate-400" />
                        <span>匯入備份 (JSON)</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={(e) => { handleImportJson(e); setShowPresetMenu(false); }}
                          className="hidden"
                        />
                      </label>

                      <div className="border-t border-slate-100 my-1"></div>

                      <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        行程範本切換
                      </div>
                      <button
                        onClick={() => switchPreset('tainan')}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-800 hover:bg-sky-50 flex items-center space-x-2 transition-colors cursor-pointer"
                      >
                        <span>🌊</span>
                        <div>
                          <div className="font-bold text-sky-700">晴寶專屬台南煙波 3日遊</div>
                          <div className="text-xs text-slate-500">10/16~10/18 密醫看診·皮革手作·奇美VR·燒肉</div>
                        </div>
                      </button>
                      <button
                        onClick={() => switchPreset('tokyo')}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-800 hover:bg-sky-50 flex items-center space-x-2 transition-colors cursor-pointer"
                      >
                        <span>🌸</span>
                        <div>
                          <div className="font-medium text-slate-700">東京富士山 5日遊</div>
                          <div className="text-xs text-slate-500">迪士尼·溫泉Villa·晴空塔夜景</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar text-sm font-medium border-t border-[#E2E8F0]">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'home'
                ? 'btn-romantic-primary font-bold shadow-xs'
                : 'text-slate-600 hover:bg-[var(--romantic-rose-light,#F0F9FF)] hover:text-[var(--romantic-rose,#0284C7)] border border-transparent hover:border-[var(--romantic-border,#BAE6FD)]'
            }`}
          >
            <span>🏠 首頁</span>
          </button>

          <button
            onClick={() => setActiveTab('itinerary')}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'itinerary'
                ? 'btn-romantic-primary font-bold shadow-xs'
                : 'text-slate-600 hover:bg-[var(--romantic-rose-light,#F0F9FF)] hover:text-[var(--romantic-rose,#0284C7)] border border-transparent hover:border-[var(--romantic-border,#BAE6FD)]'
            }`}
          >
            <span>🗺️ 每日時刻表</span>
          </button>

          <button
            onClick={() => setActiveTab('snacks')}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'snacks'
                ? 'btn-romantic-primary font-bold shadow-xs'
                : 'text-slate-600 hover:bg-[var(--romantic-rose-light,#F0F9FF)] hover:text-[var(--romantic-rose,#0284C7)] border border-transparent hover:border-[var(--romantic-border,#BAE6FD)]'
            }`}
          >
            <span>🍜 台南小吃心願清單</span>
          </button>

          <button
            onClick={() => setActiveTab('surprises')}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'surprises'
                ? 'btn-romantic-primary font-bold shadow-xs'
                : 'text-slate-600 hover:bg-[var(--romantic-rose-light,#F0F9FF)] hover:text-[var(--romantic-rose,#0284C7)] border border-transparent hover:border-[var(--romantic-border,#BAE6FD)]'
            }`}
          >
            <span>🎁 神秘驚喜任務</span>
            <span className={`px-1.5 py-0.2 text-xs rounded-full font-bold ${
              activeTab === 'surprises' 
                ? 'bg-white text-[var(--romantic-rose,#0284C7)]' 
                : 'bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)]'
            }`}>
              {tripData.surprises.length}
            </span>
          </button>

          {/* 📋 訂位管理 - Only visible to boyfriend (蔡寶) */}
          {isBoyfriend && (
            <button
              onClick={() => setActiveTab('dining')}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'dining'
                  ? 'btn-romantic-primary font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-[var(--romantic-rose-light,#F0F9FF)] hover:text-[var(--romantic-rose,#0284C7)] border border-transparent hover:border-[var(--romantic-border,#BAE6FD)]'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 opacity-80" />
              <span>📋 訂位管理</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                activeTab === 'dining' 
                  ? 'bg-white text-[var(--romantic-rose,#0284C7)]' 
                  : 'bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)]'
              }`}>
                保密
              </span>
            </button>
          )}

          {/* 🧳 旅行準備清單 */}
          <button
            onClick={() => setActiveTab('packing')}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'packing'
                ? 'btn-romantic-primary font-bold shadow-xs'
                : 'text-slate-600 hover:bg-[var(--romantic-rose-light,#F0F9FF)] hover:text-[var(--romantic-rose,#0284C7)] border border-transparent hover:border-[var(--romantic-border,#BAE6FD)]'
            }`}
          >
            🧳 旅行準備清單
          </button>

          {/* 💰 花費記帳 - Only visible to boyfriend */}
          {isBoyfriend && (
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'budget'
                  ? 'btn-romantic-primary font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-[var(--romantic-rose-light,#F0F9FF)] hover:text-[var(--romantic-rose,#0284C7)] border border-transparent hover:border-[var(--romantic-border,#BAE6FD)]'
              }`}
            >
              <span>💰 花費記帳</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                activeTab === 'budget' 
                  ? 'bg-white text-[var(--romantic-rose,#0284C7)]' 
                  : 'bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)]'
              }`}>
                保密
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('photos')}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'photos'
                ? 'btn-romantic-primary font-bold shadow-xs'
                : 'text-slate-600 hover:bg-[var(--romantic-rose-light,#F0F9FF)] hover:text-[var(--romantic-rose,#0284C7)] border border-transparent hover:border-[var(--romantic-border,#BAE6FD)]'
            }`}
          >
            📸 拍立得回憶牆
          </button>

          {/* 🎨 風格試衣間 Theme Studio Tab */}
          <button
            onClick={() => setActiveTab('themes')}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'themes'
                ? 'btn-romantic-primary font-bold shadow-xs'
                : 'text-slate-600 hover:bg-[var(--romantic-rose-light,#F0F9FF)] hover:text-[var(--romantic-rose,#0284C7)] border border-transparent hover:border-[var(--romantic-border,#BAE6FD)]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>🎨 風格試衣間</span>
          </button>

          <button
            onClick={onOpenLoveLetter}
            className="px-3.5 py-1.5 rounded-full whitespace-nowrap text-[var(--romantic-rose,#0284C7)] bg-[var(--romantic-rose-light,#F0F9FF)] hover:bg-sky-100 border border-[var(--romantic-border,#BAE6FD)] transition-all cursor-pointer font-bold flex items-center space-x-1 shadow-xs"
          >
            <span>💌 給晴寶的生日手寫信</span>
          </button>
        </div>
      </div>
    </header>
  );
};

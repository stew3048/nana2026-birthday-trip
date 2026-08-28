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
  ClipboardList
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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Main Title */}
          <div className="flex items-center space-x-3">
            <button
              id="header-romantic-logo-btn"
              onClick={onTriggerSurpriseModal}
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-pink-500 text-white shadow-md shadow-rose-200 hover:scale-105 transition-transform cursor-pointer"
              title="點擊播放慶生驚喜"
            >
              <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-white animate-pulse" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <div className="font-serif font-bold tracking-tight text-stone-900 leading-tight">
                  <div className="text-base sm:text-lg">⭐ 晴寶 2026 生日</div>
                  <div className="text-sm sm:text-base text-rose-600">專屬台南之旅</div>
                </div>
                <div className="hidden sm:inline-flex flex-col items-center px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200 leading-tight">
                  <span>🎂 10/16~10/18</span>
                  <span>生日假期</span>
                </div>
              </div>
              <p className="text-xs text-stone-600 hidden sm:block mt-0.5">
                📍 台南 Tainan · 由 {tripData.settings.boyfriendName || '蔡寶'} 專屬精心策劃
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Live Alerts Trigger - Only for Boyfriend (Admin) */}
            {isBoyfriend && (
              <button
                id="header-live-alerts-btn"
                onClick={onOpenLiveAlerts}
                className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
                title="查看與模擬 18:00 晚餐 / 23:00 密醫看診等互動情境通知"
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 animate-bounce" />
                <span className="hidden md:inline">即時情境通知</span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[10px] rounded-full font-extrabold">
                  發送
                </span>
              </button>
            )}

            {/* Surprise Presentation Button */}
            <button
              id="header-surprise-mode-btn"
              onClick={onTriggerSurpriseModal}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs sm:text-sm font-medium shadow-xs shadow-rose-200 hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>驚喜揭曉</span>
            </button>

            {/* Music Toggle - Available to everyone */}
            <button
              id="header-music-btn"
              onClick={toggleMusic}
              className={`p-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-colors cursor-pointer ${
                isPlayingMusic 
                  ? 'bg-rose-100 text-rose-700 border border-rose-300' 
                  : 'bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-600'
              }`}
              title={isPlayingMusic ? '暫停浪漫背景音樂' : '播放浪漫背景音樂'}
            >
              <Music className={`w-4 h-4 ${isPlayingMusic ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isPlayingMusic ? '音樂中' : '浪漫音樂'}</span>
            </button>

            {/* Boyfriend-Only Admin Tools: Compact Tool Menu to prevent overflow */}
            {isBoyfriend && (
              <>
                {/* Cloud Sync Button */}
                <button
                  id="header-cloud-sync-btn"
                  onClick={handleCloudSync}
                  disabled={isCloudSyncing}
                  className={`p-1.5 sm:px-2.5 sm:py-2 rounded-xl text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer ${
                    cloudSyncSuccess
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                  title="同步全部行程至 Firebase 雲端資料庫"
                >
                  <Cloud className={`w-4 h-4 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                  <span className="hidden lg:inline">{cloudSyncSuccess ? '已同步' : '雲端同步'}</span>
                </button>

                {/* Share / Copy Link */}
                <button
                  id="header-share-btn"
                  onClick={handleShare}
                  className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-600 text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                  title="複製專屬分享連結給晴寶"
                >
                  {copiedShare ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="hidden xl:inline text-emerald-600 font-medium">已複製！</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span className="hidden xl:inline">分享</span>
                    </>
                  )}
                </button>

                {/* More Admin Options Dropdown (Netlify, Presets, Print, Backup, Settings) */}
                <div className="relative">
                  <button
                    id="header-admin-more-btn"
                    onClick={() => setShowPresetMenu(!showPresetMenu)}
                    className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                    title="管理員更多工具 (範本、列印、備份、設定)"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden md:inline">工具</span>
                  </button>

                  {showPresetMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-1 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                        👑 管理員更多功能
                      </div>

                      <button
                        onClick={() => { onOpenSettings(); setShowPresetMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-rose-50 flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4 text-stone-500" />
                        <span>基本資料與權限設定</span>
                      </button>

                      <button
                        onClick={() => { onOpenPrintGuide(); setShowPresetMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-rose-50 flex items-center space-x-2"
                      >
                        <Printer className="w-4 h-4 text-stone-500" />
                        <span>列印手冊 / 另存 PDF</span>
                      </button>

                      <button
                        onClick={() => { onOpenNetlifyGuide(); setShowPresetMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-cyan-50 flex items-center space-x-2"
                      >
                        <Globe className="w-4 h-4 text-cyan-600" />
                        <span>Netlify 免費上架教學</span>
                      </button>

                      <div className="border-t border-stone-100 my-1"></div>

                      <button
                        onClick={() => { exportTripToJson(tripData); setShowPresetMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4 text-stone-500" />
                        <span>匯出備份 (JSON)</span>
                      </button>

                      <label className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center space-x-2 cursor-pointer">
                        <Upload className="w-4 h-4 text-stone-500" />
                        <span>匯入備份 (JSON)</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={(e) => { handleImportJson(e); setShowPresetMenu(false); }}
                          className="hidden"
                        />
                      </label>

                      <div className="border-t border-stone-100 my-1"></div>

                      <div className="px-3 py-1 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                        行程範本切換
                      </div>
                      <button
                        onClick={() => switchPreset('tainan')}
                        className="w-full text-left px-4 py-2.5 text-sm text-stone-800 hover:bg-rose-50 flex items-center space-x-2"
                      >
                        <span>💖</span>
                        <div>
                          <div className="font-bold text-rose-600">晴寶專屬台南煙波 3日遊</div>
                          <div className="text-xs text-stone-500">10/16~10/18 密醫看診·皮革手作·奇美VR·燒肉</div>
                        </div>
                      </button>
                      <button
                        onClick={() => switchPreset('tokyo')}
                        className="w-full text-left px-4 py-2.5 text-sm text-stone-800 hover:bg-rose-50 flex items-center space-x-2"
                      >
                        <span>🌸</span>
                        <div>
                          <div className="font-medium">東京富士山 5日遊</div>
                          <div className="text-xs text-stone-500">迪士尼·溫泉Villa·晴空塔夜景</div>
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
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar text-sm font-medium border-t border-stone-100">
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'itinerary'
                ? 'bg-rose-500 text-white shadow-xs font-semibold'
                : 'text-stone-600 hover:bg-rose-50 hover:text-rose-600'
            }`}
          >
            🗺️ 每日時刻表
          </button>

          <button
            onClick={() => setActiveTab('snacks')}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'snacks'
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'text-stone-700 bg-amber-50/80 hover:bg-amber-100 hover:text-amber-900 border border-amber-200'
            }`}
          >
            <span>🍜 晴寶小吃心願選單</span>
            <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-bold">
              Firebase實時
            </span>
          </button>

          <button
            onClick={() => setActiveTab('surprises')}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
              activeTab === 'surprises'
                ? 'bg-rose-500 text-white shadow-xs font-semibold'
                : 'text-stone-600 hover:bg-rose-50 hover:text-rose-600'
            }`}
          >
            <span>🎁 神秘驚喜任務</span>
            <span className="px-1.5 py-0.2 bg-pink-100 text-pink-700 text-xs rounded-full font-bold">
              {tripData.surprises.length}
            </span>
          </button>

          {/* 📋 訂位管理 - Only visible to boyfriend (蔡寶) */}
          {isBoyfriend && (
            <button
              onClick={() => setActiveTab('dining')}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'dining'
                  ? 'bg-rose-500 text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 text-rose-400" />
              <span>📋 訂位管理</span>
              <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-full font-semibold">
                保密
              </span>
            </button>
          )}

          {/* 🧳 旅行準備清單 */}
          <button
            onClick={() => setActiveTab('packing')}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'packing'
                ? 'bg-rose-500 text-white shadow-xs font-semibold'
                : 'text-stone-600 hover:bg-rose-50 hover:text-rose-600'
            }`}
          >
            🧳 旅行準備清單
          </button>

          {/* 💰 蔡寶全包花費記帳 - Only visible to boyfriend */}
          {isBoyfriend && (
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
                activeTab === 'budget'
                  ? 'bg-rose-500 text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              <span>💰 蔡寶全包花費記帳</span>
              <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-full font-semibold">
                保密
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('photos')}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'photos'
                ? 'bg-rose-500 text-white shadow-xs font-semibold'
                : 'text-stone-600 hover:bg-rose-50 hover:text-rose-600'
            }`}
          >
            📸 拍立得回憶牆
          </button>

          <button
            onClick={onOpenLoveLetter}
            className="px-3.5 py-1.5 rounded-full whitespace-nowrap text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 transition-all cursor-pointer font-bold flex items-center space-x-1"
          >
            <span>💌 給晴寶的生日手寫信</span>
          </button>
        </div>
      </div>
    </header>
  );
};

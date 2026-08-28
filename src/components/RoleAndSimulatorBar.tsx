import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  User, 
  LogIn, 
  LogOut, 
  Lock, 
  Unlock, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Play, 
  RotateCcw,
  Sliders,
  Star,
  Heart,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TIME_SIMULATOR_PRESETS } from '../utils/timeLock';

interface RoleAndSimulatorBarProps {
  boyfriendName?: string;
  girlfriendName?: string;
  onOpenSettings?: () => void;
  onOpenDbInspector?: () => void;
}

export const RoleAndSimulatorBar: React.FC<RoleAndSimulatorBarProps> = ({
  boyfriendName = '蔡寶',
  girlfriendName = '晴寶',
  onOpenSettings,
  onOpenDbInspector
}) => {
  const { 
    user, 
    userEmail, 
    role, 
    isBoyfriend, 
    isGirlfriend, 
    isActualBoyfriend,
    login, 
    logout, 
    setRole, 
    simulatedTime, 
    effectiveTime, 
    setSimulatedTime,
    boyfriendForceUnlockAll,
    setBoyfriendForceUnlockAll
  } = useAuth();

  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } catch (e: any) {
      alert('Google 登入失敗：' + (e.message || '請確認網路或登入權限'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const currentPreset = TIME_SIMULATOR_PRESETS.find(p => p.iso === simulatedTime) || (simulatedTime ? {
    id: 'custom',
    label: `模擬時間: ${new Date(simulatedTime).toLocaleDateString()} ${new Date(simulatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    badge: '自訂',
    iso: simulatedTime
  } : TIME_SIMULATOR_PRESETS[0]);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedEffectiveTime = `${effectiveTime.getFullYear()}/${pad(effectiveTime.getMonth() + 1)}/${pad(effectiveTime.getDate())} ${pad(effectiveTime.getHours())}:${pad(effectiveTime.getMinutes())}`;

  return (
    <div className="bg-stone-900 text-stone-100 text-xs py-2 px-3 sm:px-6 shadow-inner border-b border-stone-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        
        {/* Left: Role Switcher & Google Sign-In status */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          {/* Identity Badge */}
          {isBoyfriend ? (
            <div className="flex items-center space-x-1.5 bg-amber-950/80 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-600/60 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>👑 {boyfriendName}（全權管理員）</span>
            </div>
          ) : isGirlfriend ? (
            <div className="flex items-center space-x-1.5 bg-pink-950/80 text-pink-300 px-2.5 py-1 rounded-lg border border-pink-500/50 font-bold">
              <Star className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
              <span>⭐ {girlfriendName}（壽星驚喜視角）</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-700 text-stone-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping mr-0.5" />
              <span className="font-semibold text-amber-200">👤 訪客唯讀模式（未登入）</span>
            </div>
          )}

          {/* Quick Toggle Role Button (Only available for Actual Boyfriend) */}
          {isActualBoyfriend && (
            <button
              onClick={() => setRole(role === 'boyfriend' ? 'girlfriend' : 'boyfriend')}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors cursor-pointer flex items-center space-x-1"
              title="一鍵切換視角：切換至晴寶視角以體驗「活動前 1 小時自動解鎖」的神秘感"
            >
              <Sliders className="w-3 h-3 text-rose-400" />
              <span>切換為 {role === 'boyfriend' ? `⭐ ${girlfriendName} 視角` : `👑 ${boyfriendName} 視角`}</span>
            </button>
          )}

          {/* Google Auth Button */}
          {user ? (
            <div className="flex items-center space-x-1.5 bg-stone-800/80 px-2 py-0.5 rounded-lg border border-stone-700 text-[11px]">
              <span className="text-stone-300 font-mono truncate max-w-[120px] sm:max-w-[180px]">{user.email}</span>
              <button
                onClick={logout}
                className="text-rose-400 hover:text-rose-300 ml-1 p-0.5 cursor-pointer"
                title="登出 Google 帳號"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5 animate-pulse"
              title="使用 Google 登入以識別身份（蔡寶或晴寶）"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isLoggingIn ? '登入驗證中...' : '✨ 點此 Google 登入'}</span>
            </button>
          )}

          {/* Quick RBAC Settings Button (Boyfriend only) */}
          {isBoyfriend && onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              title="設定管理員/女友 Gmail 帳號與角色綁定"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Firestore Cloud DB Inspector Button (Boyfriend only) */}
          {isBoyfriend && onOpenDbInspector && (
            <button
              onClick={onOpenDbInspector}
              className="p-1 rounded-lg bg-stone-800 hover:bg-amber-950/60 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center space-x-1 text-[11px] px-1.5"
              title="檢視 Firebase Firestore 雲端資料庫資料與連結"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono">DB</span>
            </button>
          )}
        </div>

        {/* Right: Time Travel Simulator */}
        <div className="flex items-center space-x-2 relative">
          <div className="hidden md:flex items-center space-x-1 text-stone-400 text-[11px]">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>當前判定時間: <strong className="text-amber-300 font-mono">{formattedEffectiveTime}</strong></span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowTimeMenu(!showTimeMenu)}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 border transition-all cursor-pointer ${
                simulatedTime 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30' 
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
              title="時光模擬器：測試活動前 1 小時解鎖效果"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>時光模擬器</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 text-[10px]">
                {currentPreset.badge}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {/* Time Presets Dropdown */}
            {showTimeMenu && (
              <div className="absolute right-0 mt-1.5 w-80 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-xs block">🕒 行程前 1 小時解鎖時光機</span>
                    <span className="text-[10px] text-stone-400">選擇時間預覽晴寶在不同時刻看見的解鎖畫面</span>
                  </div>
                  {simulatedTime && (
                    <button
                      onClick={() => {
                        setSimulatedTime(null);
                        setShowTimeMenu(false);
                      }}
                      className="text-[10px] text-rose-400 hover:underline flex items-center space-x-0.5"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>重設</span>
                    </button>
                  )}
                </div>

                <div className="py-1 max-h-72 overflow-y-auto space-y-1">
                  {TIME_SIMULATOR_PRESETS.map((p) => {
                    const isSelected = p.iso === simulatedTime;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSimulatedTime(p.iso);
                          setShowTimeMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/25 text-amber-200 font-bold border border-amber-500/40'
                            : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                        }`}
                      >
                        <div className="truncate mr-2">
                          <div>{p.label}</div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 shrink-0">
                          {p.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

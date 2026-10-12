import React, { useState, useMemo } from 'react';
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
  Database,
  Palette,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { TIME_SIMULATOR_PRESETS, buildPresetsFromItinerary, TimePreset } from '../utils/timeLock';
import { APP_THEMES } from '../utils/themes';

interface RoleAndSimulatorBarProps {
  boyfriendName?: string;
  girlfriendName?: string;
  onOpenSettings?: () => void;
  onOpenDbInspector?: () => void;
  onOpenThemeStudio?: () => void;
  onSelectTimePreset?: (preset: TimePreset) => void;
  onResetAlerts?: () => void;
  itinerary?: any[];
}

export const RoleAndSimulatorBar: React.FC<RoleAndSimulatorBarProps> = ({
  boyfriendName = '蔡寶',
  girlfriendName = '晴寶',
  onOpenSettings,
  onOpenDbInspector,
  onOpenThemeStudio,
  onSelectTimePreset,
  onResetAlerts,
  itinerary
}) => {
  const { 
    user, 
    userEmail, 
    role, 
    isBoyfriend, 
    isGirlfriend, 
    isActualBoyfriend,
    isActualGirlfriend,
    canToggleRole,
    login, 
    logout, 
    setRole, 
    simulatedTime, 
    effectiveTime, 
    setSimulatedTime,
    boyfriendForceUnlockAll,
    setBoyfriendForceUnlockAll,
  } = useAuth();

  const { theme, setTheme, themeConfig } = useTheme();

  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const presets = useMemo(() => buildPresetsFromItinerary(itinerary), [itinerary]);

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

  const currentPreset = simulatedTime 
    ? (presets.find(p => p.iso === simulatedTime) || {
        id: 'custom',
        label: `模擬時間: ${new Date(simulatedTime).toLocaleDateString()} ${new Date(simulatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        badge: '自訂',
        iso: simulatedTime
      })
    : presets[0];

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedEffectiveTime = `${effectiveTime.getFullYear()}/${pad(effectiveTime.getMonth() + 1)}/${pad(effectiveTime.getDate())} ${pad(effectiveTime.getHours())}:${pad(effectiveTime.getMinutes())}`;

  return (
    <div className={`bg-[var(--romantic-card-warm,#FFFFFF)] text-[var(--romantic-ink,#0F172A)] text-xs py-2.5 px-3 sm:px-6 border-b border-[var(--romantic-border,#BAE6FD)] shadow-xs transition-colors duration-300 relative ${showTimeMenu || showThemeMenu ? 'z-50' : 'z-30'}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 relative">
        
        {/* Left: Role Switcher & Google Sign-In status */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
          
          {/* Identity Badge */}
          {isBoyfriend ? (
            <div className="flex items-center space-x-1.5 bg-[var(--romantic-gold-light,#FEF3C7)] text-[var(--romantic-gold,#F59E0B)] px-2.5 py-1.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] font-bold shadow-xs whitespace-nowrap text-[11px] sm:text-xs shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--romantic-gold,#F59E0B)] shrink-0" />
              <span>👑 {boyfriendName}（管理員視角）</span>
            </div>
          ) : isGirlfriend ? (
            <div className="flex items-center space-x-1.5 bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose-deep,#0369A1)] px-2.5 py-1.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] font-bold shadow-xs whitespace-nowrap text-[11px] sm:text-xs shrink-0">
              <Star className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)] fill-[var(--romantic-rose,#0284C7)] shrink-0" />
              <span>⭐ {girlfriendName}（{isActualGirlfriend ? '壽星專屬視角' : '壽星體驗視角'}）</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] text-[var(--romantic-muted,#64748B)] whitespace-nowrap text-[11px] sm:text-xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-[var(--romantic-gold,#F59E0B)] animate-ping mr-0.5 shrink-0" />
              <span className="font-semibold text-[var(--romantic-ink,#0F172A)]">👤 訪客唯讀</span>
            </div>
          )}

          {/* Quick Toggle Role Button: STRICTLY for actual boyfriend (stew3048@gmail.com) only */}
          {canToggleRole && (
            <button
              onClick={() => setRole(role === 'boyfriend' ? 'girlfriend' : 'boyfriend')}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-ink,#0F172A)] border border-[var(--romantic-border,#BAE6FD)] hover:border-[var(--romantic-rose,#0284C7)] transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs whitespace-nowrap text-[11px] sm:text-xs shrink-0"
              title="一鍵切換視角：管理員可切換至晴寶視角以體驗「活動前 1 小時自動解鎖」的神秘感與彈窗"
            >
              <Sliders className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)] shrink-0" />
              <span className="font-medium">
                {role === 'boyfriend' ? `換為 ⭐ ${girlfriendName} 視角` : `換為 👑 ${boyfriendName} 視角`}
              </span>
            </button>
          )}

          {/* Quick Theme Switcher Pill in Top Bar */}
          <div className="relative">
            <button
              onClick={() => {
                setShowThemeMenu(!showThemeMenu);
                setShowTimeMenu(false);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-ink,#0F172A)] border border-[var(--romantic-border,#BAE6FD)] hover:border-[var(--romantic-rose,#0284C7)] transition-all cursor-pointer flex items-center space-x-1 shadow-xs whitespace-nowrap text-[11px] sm:text-xs shrink-0"
              title="即時切換主題風格 (蔚藍海風、愛琴海藍、櫻花粉、法式復古等)"
            >
              <Palette className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)] shrink-0" />
              <span className="font-medium">{themeConfig.shortName}</span>
              <span className="text-xs">{themeConfig.emoji}</span>
              <ChevronDown className="w-3 h-3 text-[var(--romantic-muted,#64748B)] shrink-0" />
            </button>

            {showThemeMenu && (
              <>
                <div 
                  className="fixed inset-0 z-[55] bg-black/20 backdrop-blur-xs"
                  onClick={() => setShowThemeMenu(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-72 bg-white border-2 border-[var(--romantic-border,#BAE6FD)] rounded-2xl shadow-2xl p-2 z-[60] animate-in fade-in zoom-in-95 max-h-96 overflow-y-auto text-left">
                  <div className="px-3 py-1.5 border-b border-[var(--romantic-border,#BAE6FD)] flex items-center justify-between sticky top-0 bg-white z-10">
                    <span className="font-bold text-[var(--romantic-ink,#0F172A)] text-xs">🎨 挑選手冊風格</span>
                    {isBoyfriend && onOpenThemeStudio && (
                      <button
                        onClick={() => {
                          setShowThemeMenu(false);
                          onOpenThemeStudio();
                        }}
                        className="text-[10px] text-[var(--romantic-rose,#0284C7)] hover:underline cursor-pointer font-bold"
                      >
                        試衣間大圖預覽 ➔
                      </button>
                    )}
                  </div>

                  <div className="py-1 space-y-1">
                    {APP_THEMES.map((t) => {
                      const isSelected = t.id === theme;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setTheme(t.id);
                            setShowThemeMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose-deep,#0369A1)] font-bold border border-[var(--romantic-border,#BAE6FD)]'
                              : 'text-[var(--romantic-ink,#0F172A)] hover:bg-[var(--romantic-rose-light,#F0F9FF)]'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-base">{t.emoji}</span>
                            <div>
                              <div className="font-medium text-[var(--romantic-ink,#0F172A)]">{t.shortName}</div>
                              <div className="text-[10px] text-[var(--romantic-muted,#64748B)]">{t.category}</div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[var(--romantic-rose,#0284C7)]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Google Auth Button */}
          {user ? (
            <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] text-[11px] whitespace-nowrap shrink-0 shadow-xs">
              <span className="text-[var(--romantic-ink,#0F172A)] font-mono truncate max-w-[100px] sm:max-w-[160px]">{user.email}</span>
              <button
                onClick={logout}
                className="text-[var(--romantic-rose,#0284C7)] hover:text-red-500 p-0.5 cursor-pointer ml-1"
                title="登出 Google 帳號"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="px-2.5 py-1.5 rounded-xl btn-romantic-primary text-white font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-1 whitespace-nowrap text-[11px] sm:text-xs shrink-0"
              title="使用 Google 登入以識別身份（蔡寶或晴寶）"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isLoggingIn ? '驗證中...' : 'Google 登入'}</span>
            </button>
          )}

          {/* Quick RBAC Settings Button (Boyfriend only) */}
          {isBoyfriend && onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-xl bg-white hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-ink,#0F172A)] border border-[var(--romantic-border,#BAE6FD)] transition-colors cursor-pointer shrink-0 shadow-xs"
              title="設定管理員/女友 Gmail 帳號與角色綁定"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Firestore Cloud DB Inspector Button (Boyfriend only) */}
          {isBoyfriend && onOpenDbInspector && (
            <button
              onClick={onOpenDbInspector}
              className="p-1.5 rounded-xl bg-white hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-gold,#F59E0B)] hover:text-[var(--romantic-ink,#0F172A)] border border-[var(--romantic-border,#BAE6FD)] transition-colors cursor-pointer flex items-center space-x-1 text-[11px] px-2 shrink-0 shadow-xs"
              title="檢視 Firebase Firestore 雲端資料庫資料與連結"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono font-bold">DB</span>
            </button>
          )}
        </div>

        {/* Right: Time Travel Simulator (ONLY visible in Boyfriend / Organizer view for Rehearsal & Testing) */}
        {isBoyfriend && (
          <div className="flex items-center justify-between sm:justify-end gap-2 relative pt-1 md:pt-0 border-t md:border-t-0 border-[var(--romantic-border,#BAE6FD)]/40">
            <div className="flex items-center space-x-1 text-[var(--romantic-muted,#64748B)] text-[11px] whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-[var(--romantic-gold,#F59E0B)] shrink-0" />
              <span>時間: <strong className="text-[var(--romantic-ink,#0F172A)] font-mono">{formattedEffectiveTime}</strong></span>
            </div>

            {/* Time Simulator Button & Dropdown (Strictly hidden for Girlfriend) */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setBoyfriendForceUnlockAll(!boyfriendForceUnlockAll)}
                className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 border transition-all cursor-pointer whitespace-nowrap shadow-xs shrink-0 ${
                  boyfriendForceUnlockAll
                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                    : 'bg-white text-slate-700 border-[var(--romantic-border,#BAE6FD)] hover:bg-[var(--romantic-rose-light,#F0F9FF)]'
                }`}
                title={
                  boyfriendForceUnlockAll
                    ? '目前狀態：👑 管理員全解鎖（可檢視並編輯所有未開放行程與主題）。點此切換為時光模擬鎖定模式'
                    : '目前狀態：🔒 時光鎖定體驗模式（依時光模擬器判定是否解鎖）。點此切換為管理員全解鎖'
                }
              >
                {boyfriendForceUnlockAll ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="hidden sm:inline">👑 全解鎖</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-[var(--romantic-gold,#F59E0B)] shrink-0" />
                    <span className="hidden sm:inline">🔒 鎖定模擬中</span>
                  </>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowTimeMenu(!showTimeMenu);
                    setShowThemeMenu(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition-all cursor-pointer whitespace-nowrap shadow-xs shrink-0 ${
                    simulatedTime 
                      ? 'bg-[var(--romantic-gold-light,#FEF3C7)] text-[var(--romantic-gold,#F59E0B)] border-[var(--romantic-border,#BAE6FD)] hover:brightness-95' 
                      : 'bg-white text-[var(--romantic-ink,#0F172A)] border-[var(--romantic-border,#BAE6FD)] hover:bg-[var(--romantic-rose-light,#F0F9FF)]'
                  }`}
                  title="時光模擬器：測試活動前 1 小時解鎖效果與即時發送驚喜通知給晴寶"
                >
                  <Clock className="w-3.5 h-3.5 text-[var(--romantic-gold,#F59E0B)] shrink-0" />
                  <span>時光模擬器</span>
                  <span className="px-1.5 py-0.2 rounded bg-[var(--romantic-gold-light,#FEF3C7)] text-[var(--romantic-gold,#F59E0B)] text-[10px] border border-[var(--romantic-border,#BAE6FD)]">
                    {currentPreset.badge}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[var(--romantic-muted,#64748B)] shrink-0" />
                </button>

              {/* Time Presets Dropdown */}
              {showTimeMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-[55] bg-black/20 backdrop-blur-xs"
                    onClick={() => setShowTimeMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border-2 border-[var(--romantic-border,#BAE6FD)] rounded-2xl shadow-2xl p-2 z-[60] animate-in fade-in zoom-in-95 max-h-[75vh] sm:max-h-[85vh] overflow-y-auto text-left">
                    <div className="px-3 py-2 border-b border-[var(--romantic-border,#BAE6FD)] flex items-center justify-between sticky top-0 bg-white z-10">
                      <div>
                        <span className="font-bold text-[var(--romantic-ink,#0F172A)] text-xs block">🕒 行程解鎖與驚喜時光機</span>
                        <span className="text-[10px] text-[var(--romantic-muted,#64748B)]">點選即可切換判定時間，並可自動發送驚喜通知</span>
                      </div>
                      <button
                        onClick={() => {
                          if (onResetAlerts) {
                            onResetAlerts();
                          } else {
                            sessionStorage.removeItem('qingbao_dismissed_alerts');
                            localStorage.removeItem('qingbao_dismissed_alerts');
                            sessionStorage.removeItem('qingbao_unlocked_surprises');
                          }
                          setShowTimeMenu(false);
                        }}
                        className="text-[10px] text-[var(--romantic-gold,#F59E0B)] hover:underline flex items-center space-x-0.5 cursor-pointer font-bold shrink-0 ml-2"
                        title="清除已讀標記，重新測試驚喜與通知彈窗"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>重置已讀</span>
                      </button>
                    </div>

                    {/* Prominent Reset to Realtime Button */}
                    <div className="p-1.5 border-b border-[var(--romantic-border,#BAE6FD)]/60">
                      <button
                        onClick={() => {
                          if (onSelectTimePreset) {
                            onSelectTimePreset(presets[0]);
                          } else {
                            setSimulatedTime(null);
                          }
                          setShowTimeMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer border ${
                          !simulatedTime
                            ? 'bg-emerald-50 text-emerald-800 font-bold border-emerald-300 shadow-xs'
                            : 'bg-slate-50 hover:bg-emerald-50 text-[var(--romantic-ink,#0F172A)] border-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-base">⏰</span>
                          <div>
                            <div className="font-bold">恢復系統真實時間</div>
                            <div className="text-[10px] text-[var(--romantic-muted,#64748B)]">依據當前裝置實際日期時間判定</div>
                          </div>
                        </div>
                        {!simulatedTime && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                            使用中
                          </span>
                        )}
                      </button>
                    </div>

                    <div className="py-1 space-y-1">
                      <div className="px-3 pt-1 text-[10px] font-bold text-[var(--romantic-muted,#64748B)] uppercase tracking-wider">
                        📅 3日行程重要時刻情境快速測試：
                      </div>
                      {(() => {
                        let lastGroup = '';
                        return presets.filter(p => p.iso !== null).map((p) => {
                          const isSelected = p.iso === simulatedTime;
                          const hasNewGroup = p.group && p.group !== lastGroup;
                          if (hasNewGroup) {
                            lastGroup = p.group || '';
                          }
                          return (
                            <React.Fragment key={p.id}>
                              {hasNewGroup && (
                                <div className="px-3 pt-2.5 pb-1 text-[11px] font-bold text-[var(--romantic-ink,#0F172A)] border-t border-[var(--romantic-border,#BAE6FD)]/40 mt-1.5 first:border-t-0 first:mt-0 flex items-center justify-between">
                                  <span>{p.group}</span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  if (onSelectTimePreset) {
                                    onSelectTimePreset(p);
                                  } else {
                                    setSimulatedTime(p.iso);
                                  }
                                  setShowTimeMenu(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose-deep,#0369A1)] font-bold border border-[var(--romantic-border,#BAE6FD)]'
                                    : 'text-[var(--romantic-ink,#0F172A)] hover:bg-[var(--romantic-rose-light,#F0F9FF)]'
                                }`}
                              >
                                <div className="truncate mr-2">
                                  <div>{p.label}</div>
                                </div>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 border ${
                                  isSelected
                                    ? 'bg-[var(--romantic-rose,#0284C7)] text-white border-transparent font-bold'
                                    : 'bg-slate-100 text-[var(--romantic-muted,#64748B)] border-[var(--romantic-border,#BAE6FD)]'
                                }`}>
                                  {p.badge}
                                </span>
                              </button>
                            </React.Fragment>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

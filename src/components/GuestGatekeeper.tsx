import React, { useState } from 'react';
import { 
  Lock, 
  LogIn, 
  ShieldCheck, 
  ShieldAlert,
  Heart, 
  Crown, 
  Sparkles, 
  Calendar, 
  MapPin, 
  AlertTriangle,
  LogOut,
  Cake,
  Star,
  Gift,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BirthdayTripData } from '../types';

interface GuestGatekeeperProps {
  tripData: BirthdayTripData;
}

export const GuestGatekeeper: React.FC<GuestGatekeeperProps> = ({ tripData }) => {
  const { 
    user, 
    userEmail, 
    login, 
    logout, 
    switchAccount,
    loginWithPasscode,
    defaultBoyfriendEmail, 
    defaultGirlfriendEmail,
    isUnauthorized 
  } = useAuth();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<{ title: string; detail: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState<'boyfriend' | 'girlfriend'>('girlfriend');
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  const boyfriendEmail = (tripData?.settings?.boyfriendEmail || defaultBoyfriendEmail || 'stew3048@gmail.com').trim().toLowerCase();
  const girlfriendEmail = (tripData?.settings?.girlfriendEmail || defaultGirlfriendEmail || 'sng828388@gmail.com').trim().toLowerCase();

  const currentEmailLower = userEmail?.trim().toLowerCase() || '';
  const isUnauthorizedLoggedIn = isUnauthorized || (!!user && !!userEmail && 
    currentEmailLower !== boyfriendEmail && 
    currentEmailLower !== 'stew3048@gmail.com' &&
    currentEmailLower !== girlfriendEmail && 
    currentEmailLower !== 'sng828388@gmail.com');

  const parseAuthError = (err: any) => {
    const code = err?.code || '';
    const msg = err?.message || '';

    if (code === 'auth/popup-closed-by-user' || msg.includes('popup-closed-by-user')) {
      return {
        title: 'Google 登入視窗已關閉或被手機阻擋',
        detail: '手機 Safari / LINE / 瀏覽器攔截了 Google 彈出視窗。請使用下方「專屬生日通關密碼」或點選「一鍵快速進入」，即可 1 秒直通開啟手冊！'
      };
    }
    if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
      return {
        title: '網域登入提示',
        detail: '若使用第三方網域，您可直接使用下方「專屬生日通關密碼」快速解鎖進入！'
      };
    }
    if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
      return {
        title: '瀏覽器已阻擋彈出視窗',
        detail: '因手機安全防護攔截了彈出視窗，請改用下方「專屬生日通關密碼」輸入 1017 即可直接進入。'
      };
    }
    return {
      title: 'Google 登入未完成',
      detail: msg || '請稍後再試，或使用下方生日通關密碼解鎖。'
    };
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setLoginError(null);
      await login();
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(parseAuthError(err));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);
    const pinToTest = passcode.trim() || '1017';
    const result = loginWithPasscode(selectedRole, pinToTest);
    if (!result.success) {
      setPasscodeError(result.error || '通行密碼錯誤（提示：晴寶生日四位數字 1017）');
    }
  };

  const handleQuickUnlock = (role: 'boyfriend' | 'girlfriend') => {
    setPasscodeError(null);
    loginWithPasscode(role, '1017');
  };

  const handleSwitchAccount = async () => {
    try {
      setIsLoggingIn(true);
      setLoginError(null);
      if (switchAccount) {
        await switchAccount();
      } else {
        await logout();
        await login();
      }
    } catch (err: any) {
      console.error('Switch account error:', err);
      setLoginError(parseAuthError(err));
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Case 1: Unauthorized user logged in -> Display dedicated Access Denied screen!
  if (isUnauthorizedLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#2C221E] flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-[#EBDDCF] selection:text-[#4A3B32] relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-rose-100/60 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-amber-100/60 rounded-full blur-3xl" />
        </div>

        {/* Access Denied Card */}
        <div className="relative max-w-md w-full bg-[#FFFFFF] rounded-3xl p-7 sm:p-9 shadow-[0_16px_50px_-10px_rgba(92,64,51,0.12)] border border-[#E8DFC8] flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Forbidden Icon Emblem */}
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#DC2626] via-[#B91C1C] to-[#991B1B] p-0.5 shadow-[0_8px_24px_-4px_rgba(220,38,38,0.35)]">
              <div className="w-full h-full bg-[#FAF7F2] rounded-[22px] flex items-center justify-center border border-[#FCA5A5]">
                <ShieldAlert className="w-10 h-10 text-[#DC2626] animate-pulse" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#DC2626] text-white flex items-center justify-center shadow-md border-2 border-white text-xs font-bold">
              ✕
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
              <Lock className="w-3.5 h-3.5 text-rose-600" />
              <span>存取受限 · 私人專屬手冊</span>
            </div>

            <h1 className="font-serif text-2xl font-bold text-[#2C221E] tracking-tight">
              抱歉，您沒有此手冊的存取權限
            </h1>
            <p className="text-xs text-[#7A695E] leading-relaxed">
              此 App 為蔡寶為晴寶打造的專屬私人生日行程手冊，包含神秘驚喜、相簿、手寫信與全站內容，未在授權名單內的帳號無法存取。
            </p>
          </div>

          {/* Current Logged-in Account Box */}
          <div className="w-full p-4 rounded-2xl bg-[#FFFBF0] border border-[#F0DFB8] text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#8C6A28] flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>目前登入的 Google 帳號</span>
              </span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                未授權
              </span>
            </div>
            <div className="font-mono text-xs text-[#2C221E] font-semibold bg-white p-2.5 rounded-xl border border-[#E8DFC8] break-all">
              {userEmail}
            </div>
          </div>

          {/* Birthday Passcode Quick Unlock Fallback */}
          <div className="w-full p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DFC8] text-left space-y-2.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#4A3B32]">
              <KeyRound className="w-4 h-4 text-[#BA5444]" />
              <span>若您是本人，可直接使用生日通關碼進入：</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickUnlock('girlfriend')}
                className="py-2.5 px-3 rounded-xl bg-[#FCF5F3] hover:bg-[#F9ECE8] text-[#9E4738] font-bold text-xs border border-[#ECD2CA] transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-[#BA5444] text-[#BA5444]" />
                <span>⭐ 晴寶直接進入</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickUnlock('boyfriend')}
                className="py-2.5 px-3 rounded-xl bg-[#FFFBF0] hover:bg-[#FFF4D9] text-[#8C6A28] font-bold text-xs border border-[#E3D1AC] transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>👑 蔡寶直接進入</span>
              </button>
            </div>
          </div>

          {loginError && (
            <div className="w-full p-3 rounded-xl bg-[#FDF2F0] text-rose-700 text-xs border border-rose-200 text-left space-y-1">
              <div className="font-bold flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{loginError.title}</span>
              </div>
              <p className="text-[11px] text-[#7A4036] leading-relaxed">{loginError.detail}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full space-y-2 pt-1">
            <button
              onClick={handleSwitchAccount}
              disabled={isLoggingIn}
              className="w-full py-3 px-5 rounded-2xl btn-romantic-primary font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 cursor-pointer shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${isLoggingIn ? 'animate-spin' : ''}`} />
              <span>{isLoggingIn ? '切換中...' : '切換其他 Google 帳號登入'}</span>
            </button>

            <button
              onClick={logout}
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EAE1] text-[#7A695E] hover:text-[#2C221E] font-medium text-xs border border-[#E8DFC8] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>登出此 Google 帳號</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Case 2: Visitor not logged in -> Dedicated Gatekeeper Login Landing Page
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C221E] flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-[#EBDDCF] selection:text-[#4A3B32] relative overflow-hidden">
      
      {/* Delicate Vintage Decorative Background Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-[#F5EAE0]/70 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-[#EBDDCF]/60 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45rem] h-[45rem] bg-[#FCFAF7]/40 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Main Vintage Romantic Card Container */}
      <div className="relative max-w-lg w-full bg-[#FFFFFF] rounded-3xl p-6 sm:p-9 shadow-[0_12px_40px_-8px_rgba(92,64,51,0.08)] border border-[#E8DFC8] ring-1 ring-[#FAF2E6] flex flex-col items-center text-center space-y-5">
        
        {/* Vintage Wax Seal & Cake Emblem */}
        <div className="relative">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[#BA5444] via-[#A8493A] to-[#8C372A] p-0.5 shadow-[0_8px_20px_-4px_rgba(186,84,68,0.4)]">
            <div className="w-full h-full bg-[#FAF7F2] rounded-[22px] flex items-center justify-center border border-[#EBD6CE]">
              <Cake className="w-9 h-9 sm:w-10 sm:h-10 text-[#BA5444] animate-pulse" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#BA5444] text-[#FAF7F2] flex items-center justify-center shadow-md border-2 border-white">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title & Romantic Vintage Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-[#FAF2EB] text-[#BA5444] text-xs font-semibold border border-[#ECD9CE]">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>私密專屬生日驚喜手冊</span>
            <Star className="w-3 h-3 fill-[#C5A059] text-[#C5A059]" />
          </div>
          
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C221E] tracking-tight leading-tight">
            晴寶 ❤️ 2026 生日之旅
          </h1>
          <p className="text-xs sm:text-sm text-[#7A695E] max-w-sm mx-auto leading-relaxed">
            台南 3 天 2 夜 · 專屬驚喜策劃與浪漫手帳
          </p>

          <div className="flex items-center justify-center space-x-2 text-[11px] text-[#A68F80] pt-0.5">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-[#BA5444]" />
              <span>10/16 ~ 10/18</span>
            </span>
            <span>·</span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-[#C5A059]" />
              <span>台南 Tainan</span>
            </span>
            <span>·</span>
            <span className="flex items-center space-x-1">
              <Gift className="w-3 h-3 text-[#BA5444]" />
              <span>煙波大飯店</span>
            </span>
          </div>
        </div>

        {/* Privacy Lock Banner */}
        <div className="w-full p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E8DFC8] text-left space-y-2 shadow-xs">
          <div className="flex items-center space-x-1.5 text-[#9E4738] font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-[#BA5444] shrink-0" />
            <span>全站隱私保護 · 未登入無法瀏覽</span>
          </div>
          <p className="text-[#665345] text-[11px] sm:text-xs leading-relaxed">
            為守護蔡寶精心準備的生日驚喜時程、拍立得相簿與手寫信，本手冊全站上鎖，請驗證專屬身分後進入瀏覽。
          </p>
        </div>

        {/* Error Notice Card */}
        {loginError && (
          <div className="w-full p-3.5 rounded-2xl bg-[#FDF2F0] text-[#9E4738] text-xs border border-[#F5CEC7] text-left space-y-1.5 animate-in fade-in">
            <div className="flex items-center space-x-1.5 font-bold text-[#8B2E24]">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>{loginError.title}</span>
            </div>
            <p className="text-[#6B4036] leading-relaxed text-[11px]">
              {loginError.detail}
            </p>
          </div>
        )}

        {/* Section 1: Google Account One-Click Login */}
        <div className="w-full space-y-2.5">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full py-3.5 px-6 rounded-2xl btn-romantic-primary font-bold text-sm sm:text-base flex items-center justify-center space-x-3 cursor-pointer shadow-md hover:shadow-lg transition-all"
          >
            {isLoggingIn ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Google 登入驗證中...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#FFFFFF"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#FFFFFF"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FFFFFF"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#FFFFFF"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>使用 Google 帳號登入解鎖</span>
              </>
            )}
          </button>
        </div>

        {/* Divider with romantic styling */}
        <div className="w-full flex items-center space-x-3 my-1">
          <div className="flex-1 h-px bg-[#E8DFC8]" />
          <span className="text-[11px] font-medium text-[#A68F80] px-2 flex items-center space-x-1">
            <KeyRound className="w-3 h-3 text-[#BA5444]" />
            <span>或使用生日通關碼登入（手機免彈窗）</span>
          </span>
          <div className="flex-1 h-px bg-[#E8DFC8]" />
        </div>

        {/* Section 2: Birthday Passcode Login Form */}
        <div className="w-full p-4 rounded-2xl bg-[#FCFAF7] border border-[#ECD9CE] text-left space-y-3.5 shadow-xs">
          
          {/* Identity Tab Selection */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-[#6B4E3D]">
              請選擇您的登入身分：
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('girlfriend')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer border ${
                  selectedRole === 'girlfriend'
                    ? 'bg-[#BA5444] text-white border-[#BA5444] shadow-xs'
                    : 'bg-white text-[#7A695E] border-[#E8DFC8] hover:bg-[#FAF6F0]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${selectedRole === 'girlfriend' ? 'fill-white text-white' : 'text-[#BA5444]'}`} />
                <span>⭐ 晴寶 (壽星女主角)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('boyfriend')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer border ${
                  selectedRole === 'boyfriend'
                    ? 'bg-[#C5A059] text-white border-[#C5A059] shadow-xs'
                    : 'bg-white text-[#7A695E] border-[#E8DFC8] hover:bg-[#FAF6F0]'
                }`}
              >
                <Crown className={`w-3.5 h-3.5 ${selectedRole === 'boyfriend' ? 'text-white' : 'text-[#C5A059]'}`} />
                <span>👑 蔡寶 (策劃管理員)</span>
              </button>
            </div>
          </div>

          {/* Passcode input and Submit */}
          <form onSubmit={handlePasscodeSubmit} className="space-y-2.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#6B4E3D] flex items-center space-x-1">
                  <span>輸入晴寶生日通關碼 (4碼)：</span>
                </label>
                <span className="text-[10px] text-[#A68F80]">預設通關碼：1017</span>
              </div>
              <div className="flex space-x-2">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setPasscodeError(null);
                  }}
                  placeholder="輸入 1017 解鎖"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E8DFC8] bg-white text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#BA5444]/30 focus:border-[#BA5444]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#2C221E] hover:bg-[#43352F] text-[#FAF7F2] font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-colors shadow-xs shrink-0"
                >
                  <span>驗證進入</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {passcodeError && (
              <p className="text-[11px] font-bold text-[#DC2626] text-left pt-0.5">
                {passcodeError}
              </p>
            )}

            {/* Quick 1-Click Access Buttons */}
            <div className="pt-2 border-t border-[#F0E6D8] space-y-1.5">
              <span className="text-[10px] text-[#8C7A6E] block font-medium">
                手機瀏覽快速通關（免輸入直接進入）：
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickUnlock('girlfriend')}
                  className="py-2 px-2.5 rounded-xl bg-[#FCF5F3] hover:bg-[#F9ECE8] text-[#9E4738] font-bold text-[11px] border border-[#ECD2CA] transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-2xs"
                >
                  <Heart className="w-3 h-3 fill-[#BA5444] text-[#BA5444]" />
                  <span>晴寶一鍵進入</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickUnlock('boyfriend')}
                  className="py-2 px-2.5 rounded-xl bg-[#FFFBF0] hover:bg-[#FFF4D9] text-[#8C6A28] font-bold text-[11px] border border-[#E3D1AC] transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-2xs"
                >
                  <Crown className="w-3 h-3 text-[#C5A059]" />
                  <span>蔡寶一鍵進入</span>
                </button>
              </div>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};

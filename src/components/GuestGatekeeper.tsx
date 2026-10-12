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
  RefreshCw
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
    defaultBoyfriendEmail, 
    defaultGirlfriendEmail,
    isUnauthorized 
  } = useAuth();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const boyfriendEmail = (tripData?.settings?.boyfriendEmail || defaultBoyfriendEmail || 'stew3048@gmail.com').trim().toLowerCase();
  const girlfriendEmail = (tripData?.settings?.girlfriendEmail || defaultGirlfriendEmail || 'sng828388@gmail.com').trim().toLowerCase();

  const currentEmailLower = userEmail?.trim().toLowerCase() || '';
  const isUnauthorizedLoggedIn = isUnauthorized || (!!user && !!userEmail && 
    currentEmailLower !== boyfriendEmail && 
    currentEmailLower !== 'stew3048@gmail.com' &&
    currentEmailLower !== girlfriendEmail && 
    currentEmailLower !== 'sng828388@gmail.com');

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setLoginError(null);
      await login();
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(err?.message || '登入失敗或已取消，請稍後再試');
    } finally {
      setIsLoggingIn(false);
    }
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
      setLoginError(err?.message || '切換帳號失敗，請重新整理頁面再試');
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

          {/* Authorized Whitelist Notice without revealing raw emails */}
          <div className="w-full p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DFC8] text-left space-y-2.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#4A3B32]">
              <ShieldCheck className="w-4 h-4 text-[#BA5444]" />
              <span>系統受隱私保護，僅限專屬指定身分登入存取：</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E8DFC8]">
                <div className="flex items-center space-x-2">
                  <Crown className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span className="font-semibold text-[#2C221E]">👑 蔡寶（策劃人專屬通道）</span>
                </div>
                <span className="text-[11px] text-[#8C6A28] font-medium bg-[#FFFBF0] px-2.5 py-0.5 rounded-md border border-[#E3D1AC]">
                  已綁定專屬帳號
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#ECD9CE]">
                <div className="flex items-center space-x-2">
                  <Heart className="w-3.5 h-3.5 text-[#BA5444] fill-[#BA5444]" />
                  <span className="font-semibold text-[#2C221E]">⭐ 晴寶（壽星女主角通道）</span>
                </div>
                <span className="text-[11px] text-[#9E4738] font-medium bg-[#FCF5F3] px-2.5 py-0.5 rounded-md border border-[#ECD2CA]">
                  已綁定專屬帳號
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#8A796E] leading-relaxed pt-1">
              💡 若您是蔡寶或晴寶本人，請點擊下方按鈕切換至平常使用的專屬 Google 帳號。
            </p>
          </div>

          {loginError && (
            <div className="w-full p-3 rounded-xl bg-[#FDF2F0] text-rose-700 text-xs border border-rose-200 text-left">
              {loginError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full space-y-2.5 pt-1">
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

  // Case 2: Visitor not logged in -> Display standard Gatekeeper landing page
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C221E] flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-[#EBDDCF] selection:text-[#4A3B32] relative overflow-hidden">
      
      {/* Delicate Vintage Decorative Background Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-[#F5EAE0]/70 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-[#EBDDCF]/60 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45rem] h-[45rem] bg-[#FCFAF7]/40 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Main Vintage Romantic Card Container */}
      <div className="relative max-w-lg w-full bg-[#FFFFFF] rounded-3xl p-7 sm:p-10 shadow-[0_12px_40px_-8px_rgba(92,64,51,0.08)] border border-[#E8DFC8] ring-1 ring-[#FAF2E6] flex flex-col items-center text-center space-y-6">
        
        {/* Vintage Wax Seal & Cake Emblem */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#BA5444] via-[#A8493A] to-[#8C372A] p-0.5 shadow-[0_8px_20px_-4px_rgba(186,84,68,0.4)]">
            <div className="w-full h-full bg-[#FAF7F2] rounded-[22px] flex items-center justify-center border border-[#EBD6CE]">
              <Cake className="w-10 h-10 text-[#BA5444] animate-pulse" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#BA5444] text-[#FAF7F2] flex items-center justify-center shadow-md border-2 border-white">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title & Romantic Vintage Subtitle */}
        <div className="space-y-2.5">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-[#FAF2EB] text-[#BA5444] text-xs font-semibold border border-[#ECD9CE]">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>私密專屬生日驚喜 App</span>
            <Star className="w-3 h-3 fill-[#C5A059] text-[#C5A059]" />
          </div>
          
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C221E] tracking-tight leading-tight">
            晴寶 ❤️ 2026 生日之旅
          </h1>
          <p className="text-xs sm:text-sm text-[#7A695E] max-w-sm mx-auto leading-relaxed">
            台南 3 天 2 夜 · 專屬驚喜策劃與浪漫手帳
          </p>

          <div className="flex items-center justify-center space-x-2 text-[11px] text-[#A68F80] pt-1">
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

        {/* Privacy & Security Card */}
        <div className="w-full p-4 sm:p-4.5 rounded-2xl bg-[#FAF6F0] border border-[#E8DFC8] text-left space-y-3 shadow-xs">
          <div className="flex items-center space-x-2 text-[#9E4738] font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-[#BA5444] shrink-0" />
            <span>全站隱私加密保護</span>
          </div>
          <p className="text-[#665345] text-xs leading-relaxed">
            為保護生日驚喜行程、拍立得相簿、小吃投票與預備清單，全站所有內容皆已上鎖。請使用已綁定的 Google 帳號登入解鎖。
          </p>

          <div className="pt-2 border-t border-[#E3D7C5] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#4A3B32]">
              <div className="flex items-center space-x-1.5">
                <Crown className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="font-semibold text-[#2C221E]">👑 蔡寶（管理員專屬通道）</span>
              </div>
              <span className="text-[10px] text-[#8C6A28] bg-[#FFFFFF] px-2 py-0.5 rounded-md border border-[#E3D1AC] font-medium">
                已綁定專屬帳號
              </span>
            </div>

            <div className="flex items-center justify-between text-[#4A3B32]">
              <div className="flex items-center space-x-1.5">
                <Heart className="w-3.5 h-3.5 text-[#BA5444] fill-[#BA5444]" />
                <span className="font-semibold text-[#2C221E]">⭐ 晴寶（壽星女主角專屬通道）</span>
              </div>
              <span className="text-[10px] text-[#9E4738] bg-[#FFFFFF] px-2 py-0.5 rounded-md border border-[#ECD2CA] font-medium">
                已綁定專屬帳號
              </span>
            </div>
          </div>
        </div>

        {loginError && (
          <div className="w-full p-3 rounded-xl bg-[#FDF2F0] text-[#9E4738] text-xs border border-[#F5CEC7] text-left">
            {loginError}
          </div>
        )}

        {/* Primary Action Button */}
        <div className="w-full space-y-3 pt-1">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full py-3.5 px-6 rounded-2xl btn-romantic-primary font-bold text-sm sm:text-base flex items-center justify-center space-x-3 cursor-pointer"
          >
            {isLoggingIn ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Google 登入驗證中...</span>
              </>
            ) : (
              <>
                {/* Google G SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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

          <p className="text-[11px] text-[#968375]">
            登入後將自動為您開啟專屬旅行手冊
          </p>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Lock, 
  LogIn, 
  ShieldCheck, 
  Heart, 
  Crown, 
  Sparkles, 
  Calendar, 
  MapPin, 
  AlertTriangle,
  LogOut,
  Cake
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
    defaultBoyfriendEmail, 
    defaultGirlfriendEmail 
  } = useAuth();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const boyfriendEmail = tripData.settings.boyfriendEmail || defaultBoyfriendEmail || 'stew3048@gmail.com';
  const girlfriendEmail = tripData.settings.girlfriendEmail || defaultGirlfriendEmail || 'sng828388@gmail.com';

  const isUnauthorizedLoggedIn = user && userEmail && 
    userEmail.toLowerCase() !== boyfriendEmail.toLowerCase() && 
    userEmail.toLowerCase() !== girlfriendEmail.toLowerCase();

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

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D241E] flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-[#EBDDCF] selection:text-[#4A3B32]">
      
      {/* Background ambient elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#F5EBE1]/60 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#EBDDCF]/60 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-lg w-full bg-[#FCFBF9]/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-[#E8DFC8] flex flex-col items-center text-center space-y-6">
        
        {/* Animated Badge Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#9E4738] to-[#C99E74] p-0.5 shadow-lg shadow-[#D8C7B5]/50">
            <div className="w-full h-full bg-[#FAF8F5] rounded-[22px] flex items-center justify-center text-[#9E4738]">
              <Cake className="w-10 h-10 text-[#9E4738] animate-bounce" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#9E4738] text-white flex items-center justify-center shadow-md">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title & Romantic Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#F5ECE2] text-[#8B4836] text-xs font-semibold border border-[#E3D3C1]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>私密專屬生日驚喜 App</span>
          </div>
          
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D241E] leading-tight">
            晴寶 ❤️ 2026生日之旅
          </h1>
          <p className="text-xs sm:text-sm text-[#735E52] max-w-sm mx-auto leading-relaxed">
            台南 3 天 2 夜 · 專屬驚喜策劃與行程備忘
          </p>
        </div>

        {/* Unauthorized user logged in notice */}
        {isUnauthorizedLoggedIn ? (
          <div className="w-full p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-3">
            <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>目前帳號未在授權名單中</span>
            </div>
            <p className="text-stone-600 text-xs leading-relaxed">
              您目前登入的 Google 帳號為 <strong className="font-mono text-stone-800">{userEmail}</strong>。此 App 為私人專屬系統，僅授權 <strong>蔡寶</strong> 與 <strong>晴寶</strong> 訪問。
            </p>
            <button
              onClick={logout}
              className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-medium text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>切換其他 Google 帳號</span>
            </button>
          </div>
        ) : (
          /* Privacy & Security Explanation */
          <div className="w-full p-4 rounded-2xl bg-rose-50/60 border border-rose-100 text-left space-y-3">
            <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
              <span>全站隱私加密保護</span>
            </div>
            <p className="text-stone-600 text-xs leading-relaxed">
              為保護生日驚喜行程、拍立得相簿、小吃投票與預備清單，全站所有內容皆已上鎖。請使用已綁定的 Google 帳號登入解鎖。
            </p>

            <div className="pt-2 border-t border-rose-200/50 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-stone-700">
                <div className="flex items-center space-x-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-semibold text-stone-900">👑 蔡寶（管理員專屬通道）</span>
                </div>
                <span className="text-[11px] text-amber-800 bg-white px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                  已設定專屬 Google 授權
                </span>
              </div>

              <div className="flex items-center justify-between text-stone-700">
                <div className="flex items-center space-x-1.5">
                  <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                  <span className="font-semibold text-stone-900">⭐ 晴寶（壽星女主角專屬通道）</span>
                </div>
                <span className="text-[11px] text-pink-800 bg-white px-2 py-0.5 rounded-md border border-pink-200 font-medium">
                  已設定專屬 Google 授權
                </span>
              </div>
            </div>
          </div>
        )}

        {loginError && (
          <div className="w-full p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 text-left">
            {loginError}
          </div>
        )}

        {/* Primary Action Button */}
        {!isUnauthorizedLoggedIn && (
          <div className="w-full space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:via-pink-600 hover:to-amber-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-200 hover:shadow-rose-300 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 cursor-pointer"
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

            <p className="text-[11px] text-stone-400">
              登入後將自動根據您的身份載入專屬視角（蔡寶全權管理 / 晴寶驚喜解鎖）
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

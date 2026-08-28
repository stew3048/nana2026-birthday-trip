import React, { useState } from 'react';
import { 
  Lock, 
  LogIn, 
  X, 
  ShieldAlert, 
  CheckCircle, 
  Heart, 
  Crown, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface GuestLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionReason?: string;
}

export const GuestLoginModal: React.FC<GuestLoginModalProps> = ({
  isOpen,
  onClose,
  actionReason
}) => {
  const { login, defaultBoyfriendEmail, defaultGirlfriendEmail } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setErrorMsg(null);
      await login();
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err?.message || 'Google 登入失敗或已取消，請再試一次');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-rose-100 flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              需要 Google 登入驗證身分
            </h3>
            <p className="text-xs text-stone-500">
              {actionReason ? `執行「${actionReason}」前請先登入` : '訪客模式僅供唯讀瀏覽'}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3.5 mb-6 text-xs text-stone-600">
          <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-100 flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-rose-900 block mb-0.5">
                🔒 雲端資料庫防護安全機制
              </span>
              訪客未登入無法編輯行程或更動資料庫。本系統僅授權以下兩位專屬帳號進行寫入與同步：
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-amber-950">👑 蔡寶（管理員）</span>
              </div>
              <span className="font-mono text-[11px] text-amber-800 bg-white px-2 py-0.5 rounded-md border border-amber-200">
                {defaultBoyfriendEmail || 'stew3048@gmail.com'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-pink-50 border border-pink-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                <span className="font-bold text-pink-950">⭐ 晴寶（壽星女主角）</span>
              </div>
              <span className="font-mono text-[11px] text-pink-800 bg-white px-2 py-0.5 rounded-md border border-pink-200">
                {defaultGirlfriendEmail || 'sng828388@gmail.com'}
              </span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold text-sm shadow-md shadow-rose-200 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogIn className={`w-4 h-4 ${isLoggingIn ? 'animate-spin' : ''}`} />
            <span>{isLoggingIn ? '登入驗證中...' : '使用 Google 帳號登入'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium text-xs transition-colors cursor-pointer"
          >
            繼續以訪客唯讀瀏覽
          </button>
        </div>

      </div>
    </div>
  );
};

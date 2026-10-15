import React, { useState } from 'react';
import { 
  Lock, 
  LogIn, 
  X, 
  ShieldAlert, 
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
  const { login } = useAuth();
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
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('登入流程已取消或視窗被關閉，請再試一次。');
      } else {
        setErrorMsg(err?.message || 'Google 登入失敗，請確認網路或稍後再試。');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2C221E]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-[0_16px_50px_-10px_rgba(92,64,51,0.2)] border border-[#E8DFC8] flex flex-col relative animate-in fade-in zoom-in-95 duration-200 text-[#2C221E]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#9C8B7F] hover:text-[#2C221E] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF2EB] text-[#BA5444] border border-[#ECD9CE] flex items-center justify-center shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2C221E]">
              需要 Google 登入驗證身分
            </h3>
            <p className="text-xs text-[#7A695E]">
              {actionReason ? `執行「${actionReason}」前請先登入` : '訪客模式僅供唯讀瀏覽'}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3.5 mb-6 text-xs text-[#665345]">
          <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E8DFC8] flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-[#BA5444] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-[#9E4738] block mb-0.5">
                🔒 雲端資料庫防護安全機制
              </span>
              訪客未登入無法編輯行程或更動資料庫。本系統僅授權以下兩位專屬帳號進行寫入與同步：
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-[#FFFBF0] border border-[#E8DFC8] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-[#C5A059]" />
                <span className="font-bold text-[#2C221E]">👑 蔡寶（管理員）</span>
              </div>
              <span className="text-[11px] text-[#8C6A28] bg-white px-2.5 py-0.5 rounded-md border border-[#E3D1AC] font-medium">
                已綁定專屬帳號
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FCF5F3] border border-[#ECD9CE] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-[#BA5444] fill-[#BA5444]" />
                <span className="font-bold text-[#2C221E]">⭐ 晴寶（壽星女主角）</span>
              </div>
              <span className="text-[11px] text-[#9E4738] bg-white px-2.5 py-0.5 rounded-md border border-[#ECD2CA] font-medium">
                已綁定專屬帳號
              </span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#FDF2F0] text-[#9E4738] text-xs border border-[#F5CEC7] flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
            <span className="leading-relaxed font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full py-3 rounded-2xl btn-romantic-primary font-bold text-sm flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
          >
            <LogIn className={`w-4 h-4 ${isLoggingIn ? 'animate-spin' : ''}`} />
            <span>{isLoggingIn ? '登入驗證中...' : '使用 Google 帳號登入'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3EDE4] text-[#7A695E] font-medium text-xs border border-[#E8DFC8] transition-colors cursor-pointer"
          >
            繼續以訪客唯讀瀏覽
          </button>
        </div>

      </div>
    </div>
  );
};

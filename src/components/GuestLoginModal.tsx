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
  const { login, loginRedirect } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
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
      const msg = err?.message || '';
      const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '您的 Netlify 網域';

      if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        setErrorMsg(`網域未授權 (${currentDomain})：請至 Firebase Console 將此網域加入「Authorized domains」即可正常登入！`);
      } else if (code === 'auth/popup-closed-by-user' || msg.includes('popup-closed-by-user')) {
        setErrorMsg(`登入視窗已關閉或被阻擋。若在 Netlify 上，請確認已將網域 (${currentDomain}) 加入 Firebase「已授權網域」，或點擊下方改用跳轉登入。`);
      } else {
        setErrorMsg(msg || 'Google 登入失敗或已取消，請再試一次');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleRedirect = async () => {
    try {
      setIsRedirecting(true);
      setErrorMsg(null);
      await loginRedirect();
    } catch (err: any) {
      console.error('Login redirect error:', err);
      setErrorMsg(err?.message || '跳轉登入失敗');
      setIsRedirecting(false);
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
          <div className="mb-4 p-3.5 rounded-2xl bg-[#FDF2F0] text-[#9E4738] text-xs border border-[#F5CEC7] space-y-2">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626] mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMsg}</div>
            </div>
            <button
              type="button"
              onClick={handleGoogleRedirect}
              disabled={isRedirecting}
              className="w-full py-2.5 px-3 rounded-xl bg-[#8B2E24] hover:bg-[#72231A] text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
            >
              {isRedirecting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>正在跳轉至 Google...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>立即改用「免彈窗全頁跳轉登入」</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn || isRedirecting}
            className="w-full py-3 rounded-2xl btn-romantic-primary font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
          >
            <LogIn className={`w-4 h-4 ${isLoggingIn ? 'animate-spin' : ''}`} />
            <span>{isLoggingIn ? '視窗登入驗證中...' : '使用 Google 帳號快速登入 (彈出視窗)'}</span>
          </button>

          <button
            type="button"
            onClick={handleGoogleRedirect}
            disabled={isLoggingIn || isRedirecting}
            className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-[var(--romantic-rose-deep,#0369A1)] font-bold text-xs border border-[var(--romantic-border,#BAE6FD)] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
          >
            {isRedirecting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>全頁導向 Google 中...</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>📱 免彈窗跳轉登入（手機 / LINE / Safari / Netlify 推薦）</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3EDE4] text-[#7A695E] font-medium text-xs border border-[#E8DFC8] transition-colors cursor-pointer"
          >
            繼續以訪客唯讀瀏覽
          </button>
        </div>

      </div>
    </div>
  );
};

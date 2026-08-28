import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Heart, 
  UtensilsCrossed, 
  Stethoscope, 
  Cake, 
  Sparkles, 
  KeyRound, 
  Flame, 
  Volume2, 
  X,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { romanticMusic } from '../utils/audio';

export interface LiveAlertScenario {
  id: string;
  triggerTime: string;
  timeLabel: string;
  title: string;
  message: string;
  secondaryHint: string;
  category: 'dinner' | 'clinic' | 'birthday' | 'escape' | 'bbq';
  badge: string;
}

export const ALERT_SCENARIOS: LiveAlertScenario[] = [
  {
    id: 'alert-1800-dinner',
    triggerTime: '2026-10-16 18:00',
    timeLabel: '10/16 (五) 18:00',
    title: '🍽️ 晚餐時間到囉！浪漫約會即刻啟動',
    message: '請晴寶準備好最棒的心情，換上自在輕便的美麗裝扮，與蔡寶一起享用煙波大飯店 1F 隱糧義式餐酒館的浪漫精緻晚餐！',
    secondaryHint: '主廚特製窯烤披薩 ＆ 爐烤牛排已備妥，請帶著最甜的笑容準時就座 🍝✨',
    category: 'dinner',
    badge: '18:00 專屬晚餐提醒'
  },
  {
    id: 'alert-2300-clinic',
    triggerTime: '2026-10-16 23:00',
    timeLabel: '10/16 (五) 23:00',
    title: '🩺💊 洗完澡了～進入「密醫看診時間」！',
    message: '呼叫晴寶病患！蔡醫師已準備好專屬放鬆推拿精油與特等身心靈舒壓療程。今晚蔡醫師為您提供一對一 VIP 溫柔看診服務～',
    secondaryHint: '診斷結果：晴寶今日過度可愛，需蔡寶整晚深情陪伴與肩頸推拿 💖',
    category: 'clinic',
    badge: '23:00 深夜情趣甜蜜特診'
  },
  {
    id: 'alert-1017-birthday',
    triggerTime: '2026-10-17 00:00',
    timeLabel: '10/17 (六) 00:00',
    title: '🎂 10/17 晴寶生日大日子到來！生日快樂！',
    message: '全宇宙最可愛的小仙女晴寶，祝妳生日快樂！願妳新的一歲健康平安、所有願望都在蔡寶的守護下燦爛實現！',
    secondaryHint: '今天一整天妳是專屬女王，準備好迎接滿滿的驚喜與寵愛了嗎？ 🎉💖',
    category: 'birthday',
    badge: '10/17 壽星大日子'
  },
  {
    id: 'alert-escape-room',
    triggerTime: '2026-10-17 15:00',
    timeLabel: '10/17 (六) 15:00',
    title: '🗝️ 密室逃脫特務出動！考驗兩人默契的時刻',
    message: '請特務晴寶與蔡寶就位！腦力激盪與尋找隱藏線索，蔡寶已充當專屬護花使者與智囊團，一起漂亮通關！',
    secondaryHint: '通關密碼提示：蔡寶最愛晴寶 💕',
    category: 'escape',
    badge: '15:00 默契挑戰'
  },
  {
    id: 'alert-bbq-time',
    triggerTime: '2026-10-18 18:00',
    timeLabel: '10/18 (日) 18:00',
    title: '🥩🔥 蔡寶私心敲碗已久的頂級燒肉盛宴！',
    message: '慶祝晴寶生日假期大成功！今晚大口吃極上 A5 和牛與厚切牛舌，滋滋作響的炭火香氣，為台南之旅畫下最美味的驚嘆號！',
    secondaryHint: '肉汁爆漿預警！蔡寶專屬桌邊烤肉師上線 🥩✨',
    category: 'bbq',
    badge: '18:00 蔡寶私心燒肉'
  }
];

interface LiveAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: LiveAlertScenario | null;
  girlfriendName?: string;
  boyfriendName?: string;
}

export const LiveAlertModal: React.FC<LiveAlertModalProps> = ({
  isOpen,
  onClose,
  scenario,
  girlfriendName = '晴寶',
  boyfriendName = '蔡寶'
}) => {
  useEffect(() => {
    if (isOpen && scenario) {
      // Trigger confetti
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.3 }
      });
      // Play a short chime tone using Web Audio
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } catch (e) {
        // audio context fallback
      }
    }
  }, [isOpen, scenario]);

  if (!isOpen || !scenario) return null;

  const getIcon = () => {
    switch (scenario.category) {
      case 'dinner':
        return <UtensilsCrossed className="w-10 h-10 text-rose-500" />;
      case 'clinic':
        return <Stethoscope className="w-10 h-10 text-pink-500 animate-pulse" />;
      case 'birthday':
        return <Cake className="w-10 h-10 text-amber-500 animate-bounce" />;
      case 'escape':
        return <KeyRound className="w-10 h-10 text-indigo-500" />;
      case 'bbq':
        return <Flame className="w-10 h-10 text-orange-500 animate-pulse" />;
      default:
        return <Bell className="w-10 h-10 text-rose-500" />;
    }
  };

  const getHeaderBg = () => {
    switch (scenario.category) {
      case 'dinner':
        return 'from-rose-500 via-pink-500 to-amber-500';
      case 'clinic':
        return 'from-pink-500 via-rose-500 to-purple-600';
      case 'birthday':
        return 'from-amber-400 via-rose-500 to-pink-500';
      case 'escape':
        return 'from-indigo-600 via-purple-600 to-pink-500';
      case 'bbq':
        return 'from-orange-500 via-red-500 to-amber-600';
      default:
        return 'from-rose-500 to-pink-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-rose-100 animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className={`p-6 bg-gradient-to-r ${getHeaderBg()} text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/25 backdrop-blur-md text-xs font-bold tracking-wide uppercase mb-3 border border-white/30">
            <Bell className="w-3.5 h-3.5 animate-bounce" />
            <span>{scenario.badge}</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg">
              {getIcon()}
            </div>
            <div>
              <span className="text-xs text-rose-100 font-semibold block">{scenario.timeLabel}</span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif leading-snug">
                {scenario.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 text-stone-800 text-sm sm:text-base leading-relaxed">
            {scenario.message}
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-900 leading-normal">
              {scenario.secondaryHint}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1.5 text-xs text-rose-500 font-medium">
              <Heart className="w-4 h-4 fill-rose-500 animate-pulse" />
              <span>蔡寶的專屬貼心即時提醒</span>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm shadow-md shadow-rose-200 transition-all cursor-pointer"
            >
              我知道了，出發享受！💖
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

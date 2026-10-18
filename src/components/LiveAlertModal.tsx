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
import { LiveAlertScenario } from '../types';

export type { LiveAlertScenario };

export const ALERT_SCENARIOS: LiveAlertScenario[] = [
  {
    id: 'alert-1800-dinner',
    triggerTime: '2026-10-16 18:00',
    timeLabel: '10/16 (五) 18:00',
    title: '🍽️ 煙波大飯店 18:00 浪漫晚餐即時提醒 ＆ 隱糧浪漫晚餐',
    message: '請晴寶準備好最棒的心情，換上自在輕便的美麗裝扮，與蔡寶一起享用煙波大飯店 1F 隱糧義式餐酒館的浪漫精緻晚餐！',
    secondaryHint: '主廚特製窯烤披薩 ＆ 熟成牛排已備妥，請帶著最甜的笑容準時就座 🍝✨',
    category: 'dinner',
    badge: '18:00 專屬晚餐提醒',
    linkedSurpriseId: 'surp-1'
  },
  {
    id: 'alert-2030-spa',
    triggerTime: '2026-10-16 20:30',
    timeLabel: '10/16 (五) 20:30',
    title: '🧖‍♀️ 煙波男女三溫暖水療放鬆 · 暖呼呼舒壓享受',
    message: '享受煙波著名的冷熱水療池、蒸氣室與烤箱，洗淨一週的工作疲倦，全身舒暢暖呼呼！',
    secondaryHint: '飯店設施開放至 22:30，三溫暖設施男女分開，純放鬆享受 💖',
    category: 'sparkles',
    badge: '20:30 三溫暖水療',
    linkedSurpriseId: 'surp-spa'
  },
  {
    id: 'alert-2300-clinic',
    triggerTime: '2026-10-16 23:00',
    timeLabel: '10/16 (五) 23:00',
    title: '🩺 深夜 23:00 密醫看診時間 · 蔡醫師專屬身心靈放鬆推拿',
    message: '呼叫晴寶病患！蔡醫師已準備好專屬放鬆推拿精油與特等身心靈舒壓療程。今晚蔡醫師為您提供一對一 VIP 溫柔看診服務～',
    secondaryHint: '診斷結果：晴寶今日過度可愛，需蔡寶整晚深情陪伴與肩頸推拿 💖',
    category: 'clinic',
    badge: '23:00 深夜情趣甜蜜特診',
    linkedSurpriseId: 'surp-2'
  },
  {
    id: 'alert-escape-room',
    triggerTime: '2026-10-17 15:00',
    timeLabel: '10/17 (六) 15:00',
    title: '🗝️ 密室逃脫通關特務挑戰 · 默契大考驗',
    message: '請特務晴寶與蔡寶就位！腦力激盪與尋找隱藏線索，蔡寶已充當專屬護花使者與智囊團，一起漂亮通關！',
    secondaryHint: '通關密碼提示：蔡寶最愛晴寶 💕',
    category: 'escape',
    badge: '15:00 默契挑戰',
    linkedSurpriseId: 'surp-4'
  },
  {
    id: 'alert-french-dinner',
    triggerTime: '2026-10-17 18:00',
    timeLabel: '10/17 (六) 18:00',
    title: '🕯️🎂 晴寶生日專屬浪漫晚餐 · 主廚客製手繪寫字盤驚喜',
    message: '全場燭光灑落，主廚為壽星晴寶精心料理浪漫慶生饗宴！壓軸將端上寫著「Happy Birthday 晴寶 💕」的手繪慶生甜點盤與蠟燭～',
    secondaryHint: '蔡寶為晴寶點亮生日燭光，許下三個最美好的願望 🥂🎂✨',
    category: 'dinner',
    badge: '18:00 生日慶生大餐',
    linkedSurpriseId: 'surp-5'
  }
];

interface LiveAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcknowledgeScenario: (scenarioId: string) => void;
  scenario: LiveAlertScenario | null;
  girlfriendName?: string;
  boyfriendName?: string;
  dueScenarios?: LiveAlertScenario[];
  onSelectScenario?: (scenario: LiveAlertScenario) => void;
}

export const LiveAlertModal: React.FC<LiveAlertModalProps> = ({
  isOpen,
  onClose,
  onAcknowledgeScenario,
  scenario,
  girlfriendName = '晴寶',
  boyfriendName = '蔡寶',
  dueScenarios = [],
  onSelectScenario
}) => {
  const [activeTabScenario, setActiveTabScenario] = useState<LiveAlertScenario | null>(scenario);

  // Sync when incoming scenario changes or if active tab is no longer in dueScenarios
  useEffect(() => {
    if (scenario) {
      setActiveTabScenario(scenario);
    }
  }, [scenario]);

  useEffect(() => {
    if (activeTabScenario && dueScenarios.length > 0) {
      const stillExists = dueScenarios.some(s => s.id === activeTabScenario.id);
      if (!stillExists) {
        setActiveTabScenario(dueScenarios[dueScenarios.length - 1]);
      }
    }
  }, [dueScenarios, activeTabScenario]);

  const current = (activeTabScenario && dueScenarios.some(s => s.id === activeTabScenario.id))
    ? activeTabScenario
    : (dueScenarios.length > 0 ? dueScenarios[dueScenarios.length - 1] : scenario);

  useEffect(() => {
    if (isOpen && current) {
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.3 },
          colors: ['#0284c7', '#38bdf8', '#fbbf24', '#f43f5e']
        });
      } catch (e) {}

      // Auto-cleanup confetti canvas after 2.5 seconds so no particles/canvas ever get stuck!
      const timer = setTimeout(() => {
        try {
          confetti.reset();
        } catch (e) {}
      }, 2500);

      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
          }
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          const now = ctx.currentTime || 0;
          osc.frequency.setValueAtTime(587.33, now);
          osc.frequency.setValueAtTime(880, now + 0.2);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.setValueAtTime(0.001, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
          setTimeout(() => {
            try { ctx.close(); } catch (err) {}
          }, 800);
        }
      } catch (e) {}

      return () => {
        clearTimeout(timer);
        try {
          confetti.reset();
        } catch (e) {}
      };
    }
  }, [isOpen, current?.id]);

  if (!isOpen || !current) return null;

  const handleClose = () => {
    try {
      confetti.reset();
    } catch (e) {}
    onClose();
  };

  const currentIndex = dueScenarios.findIndex(s => s.id === current.id);
  const totalCount = dueScenarios.length;

  const handleAcknowledge = () => {
    if (!current) return;
    const dismissedId = current.id;

    // Call parent to dismiss current scenario
    onAcknowledgeScenario(dismissedId);

    // Also dismiss any currently queued scenarios so they don't repeatedly chain-pop
    if (dueScenarios && dueScenarios.length > 0) {
      dueScenarios.forEach(s => {
        onAcknowledgeScenario(s.id);
      });
    }

    try {
      confetti.reset();
    } catch (e) {}
    
    // Close modal directly to prevent annoying repeated popups
    onClose();
  };

  const getIcon = () => {
    switch (current?.category) {
      case 'dinner':
        return <UtensilsCrossed className="w-8 h-8 text-[var(--romantic-rose,#0284C7)]" />;
      case 'clinic':
        return <Stethoscope className="w-8 h-8 text-[var(--romantic-rose,#0284C7)] animate-pulse" />;
      case 'birthday':
        return <Cake className="w-8 h-8 text-[var(--romantic-gold,#C5A059)] animate-bounce" />;
      case 'escape':
        return <KeyRound className="w-8 h-8 text-[var(--romantic-gold,#C5A059)]" />;
      case 'french':
      case 'sparkles':
        return <Sparkles className="w-8 h-8 text-[var(--romantic-gold,#C5A059)] animate-pulse" />;
      case 'bbq':
        return <Flame className="w-8 h-8 text-[var(--romantic-rose,#0284C7)] animate-pulse" />;
      default:
        return <Bell className="w-8 h-8 text-[var(--romantic-rose,#0284C7)]" />;
    }
  };

  const handleNext = () => {
    if (currentIndex < totalCount - 1) {
      const nextScen = dueScenarios[currentIndex + 1];
      setActiveTabScenario(nextScen);
      if (onSelectScenario) onSelectScenario(nextScen);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevScen = dueScenarios[currentIndex - 1];
      setActiveTabScenario(prevScen);
      if (onSelectScenario) onSelectScenario(prevScen);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in cursor-pointer"
      onClick={handleClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-[var(--romantic-border,#BAE6FD)] animate-in zoom-in-95 duration-200 text-[var(--romantic-ink,#0F172A)] flex flex-col max-h-[92vh] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 btn-romantic-primary text-white relative border-b border-white/20 shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            title="暫時關閉（稍後可從驚喜柱列再次開啟）"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-between pr-8 mb-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur-md text-xs font-bold tracking-wide uppercase border border-white/30">
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span>{current.badge}</span>
            </div>

            {totalCount > 1 && (
              <span className="text-xs font-bold text-white/90 bg-black/20 px-2.5 py-0.5 rounded-full border border-white/20">
                📬 未讀驚喜 {currentIndex >= 0 ? currentIndex + 1 : 1} / {totalCount}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white border border-white/40 flex items-center justify-center shadow-lg shrink-0">
              {getIcon()}
            </div>
            <div className="min-w-0">
              <span className="text-xs text-white/90 font-semibold block">{current.timeLabel}</span>
              <h3 className="text-lg sm:text-2xl font-bold font-serif leading-snug text-white truncate">
                {current.title}
              </h3>
            </div>
          </div>

          {/* Queue Tab Buttons if multiple unread alerts exist */}
          {dueScenarios.length > 1 && (
            <div className="flex items-center space-x-1.5 mt-3 pt-2.5 border-t border-white/20 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] text-white/80 shrink-0 font-medium mr-1">未讀柱列:</span>
              {dueScenarios.map((s, idx) => {
                const isActive = s.id === current.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveTabScenario(s);
                      if (onSelectScenario) onSelectScenario(s);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-white text-[var(--romantic-rose-deep,#0369A1)] shadow-xs scale-105'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    #{idx + 1} {s.timeLabel.split(' ')[1] || s.timeLabel}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          <div className="p-4 rounded-2xl bg-[var(--romantic-card-warm,#F8FAFC)] border border-[var(--romantic-border,#BAE6FD)] text-[var(--romantic-ink,#0F172A)] text-sm sm:text-base leading-relaxed font-serif">
            {current.message}
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--romantic-rose-light,#F0F9FF)] border border-[var(--romantic-border,#BAE6FD)] flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-[var(--romantic-rose,#0284C7)] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-[var(--romantic-rose,#0284C7)] font-medium leading-normal">
              {current.secondaryHint}
            </p>
          </div>

          {/* Navigation and Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center space-x-1.5 text-xs text-[var(--romantic-rose,#0284C7)] font-medium">
              <Heart className="w-4 h-4 fill-[var(--romantic-rose,#0284C7)] animate-pulse shrink-0" />
              <span>{boyfriendName} 的專屬貼心即時提醒</span>
            </div>

            <div className="flex items-center gap-2 justify-end">
              {/* Optional Preview buttons */}
              {totalCount > 1 && currentIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[var(--romantic-ink,#0F172A)] text-xs font-bold transition-all cursor-pointer"
                  title="預覽上一則未讀驚喜"
                >
                  ⬅️ 上一則
                </button>
              )}
              {totalCount > 1 && currentIndex < totalCount - 1 && (
                <button
                  onClick={handleNext}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[var(--romantic-ink,#0F172A)] text-xs font-bold transition-all cursor-pointer"
                  title="預覽下一則未讀驚喜"
                >
                  下一則 ➔
                </button>
              )}

              {/* Primary Acknowledge Button: Dismisses current & closes modal */}
              <button
                onClick={handleAcknowledge}
                className="px-4 sm:px-5 py-2.5 rounded-xl btn-romantic-primary text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1 hover:scale-[1.02]"
                title="確認閱讀，關閉當前驚喜"
              >
                <span>我知道了，出發享受！💖</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

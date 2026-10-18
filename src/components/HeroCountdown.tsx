import React, { useEffect, useState } from 'react';
import { Sparkles, Star, MapPin, Calendar, Flame, PartyPopper, Gift } from 'lucide-react';
import { TripSettings } from '../types';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

interface HeroCountdownProps {
  settings: TripSettings;
  onOpenLoveLetter: () => void;
  onTriggerSurpriseModal: () => void;
  onOpenSettings?: () => void;
}

export const HeroCountdown: React.FC<HeroCountdownProps> = ({
  settings,
  onOpenLoveLetter,
  onTriggerSurpriseModal,
  onOpenSettings
}) => {
  const { effectiveTime } = useAuth();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(settings.startDate).getTime();
      const now = effectiveTime.getTime();
      const diff = start - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isPast: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [settings.startDate, effectiveTime]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        try {
          confetti.reset();
        } catch (e) {}
      }, 2500);
    } catch (e) {}
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#241C18] text-white shadow-[0_12px_40px_-8px_rgba(92,64,51,0.15)] border border-[#E8DFC8]/20 mb-8">
      {/* Background Image with warm romantic overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={settings.coverImageUrl || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80'}
          alt="Trip Cover"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-40 transform scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1310] via-[#241C18]/70 to-[#4A201A]/50" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 sm:py-14 text-center">
        
        {/* Sweet badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#BA5444]/30 backdrop-blur-md border border-[#EBD6CE]/30 text-[#F5ECE6] text-xs sm:text-sm font-medium mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059] animate-spin" />
          <span>特別為 {settings.girlfriendName || '晴寶'} 打造的生日專屬旅程</span>
          <Star className="w-3.5 h-3.5 text-[#C5A059] fill-[#C5A059] animate-pulse" />
        </div>

        {/* Main Hero Title */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 leading-tight flex flex-col items-center">
          <span>{settings.tripTitle || `${settings.girlfriendName || '晴寶'} 2026 生日`}</span>
          <span className="text-[#F5D5CE] text-2xl sm:text-4xl lg:text-5xl mt-1">
            {settings.destination ? `專屬${settings.destination}之旅` : '專屬台南之旅'}
          </span>
        </h1>

        {/* Destination and Date Subtitle */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[#EBDDCF] text-sm sm:text-base mb-6">
          <div className="flex items-center space-x-1.5 bg-[#1F1714]/60 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/10">
            <MapPin className="w-4 h-4 text-[#C5A059]" />
            <span>目的地：{settings.destination || '台南'}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-[#1F1714]/60 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/10">
            <Calendar className="w-4 h-4 text-[#BA5444]" />
            <span>啟程日期：{settings.startDate} ~ {settings.endDate}</span>
          </div>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/20 text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1"
              title="編輯旅行標題、目的地與基本設定"
            >
              <span>⚙️ 編輯旅程設定</span>
            </button>
          )}
        </div>

        {/* Live Countdown Box */}
        <div className="max-w-2xl mx-auto bg-[#1F1714]/70 backdrop-blur-md border border-[#E8DFC8]/20 rounded-2xl p-5 sm:p-6 mb-8 shadow-2xl">
          <div className="text-xs uppercase tracking-widest text-[#EBDDCF] font-semibold mb-3 flex items-center justify-center space-x-1.5">
            <Flame className="w-4 h-4 text-[#BA5444] animate-bounce" />
            <span>{timeLeft.isPast ? '🎉 浪漫旅程進行中 / 享受甜蜜每一刻' : '生日旅行浪漫倒數中'}</span>
          </div>

          {timeLeft.isPast ? (
            <div className="text-2xl sm:text-3xl font-serif text-[#F5D5CE] font-bold py-2">
              今天是專屬於妳的幸福日子，放鬆享受吧！🎂✨
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
              <div className="bg-[#140E0B]/60 rounded-xl p-2.5 sm:p-3.5 border border-white/10 shadow-inner">
                <div className="text-2xl sm:text-4xl font-bold font-mono text-white tracking-tight">
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs text-[#DEC180] mt-1 font-medium">天 (Days)</div>
              </div>
              <div className="bg-[#140E0B]/60 rounded-xl p-2.5 sm:p-3.5 border border-white/10 shadow-inner">
                <div className="text-2xl sm:text-4xl font-bold font-mono text-white tracking-tight">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs text-[#DEC180] mt-1 font-medium">時 (Hours)</div>
              </div>
              <div className="bg-[#140E0B]/60 rounded-xl p-2.5 sm:p-3.5 border border-white/10 shadow-inner">
                <div className="text-2xl sm:text-4xl font-bold font-mono text-white tracking-tight">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs text-[#DEC180] mt-1 font-medium">分 (Mins)</div>
              </div>
              <div className="bg-[#140E0B]/60 rounded-xl p-2.5 sm:p-3.5 border border-white/10 shadow-inner">
                <div className="text-2xl sm:text-4xl font-bold font-mono text-[#F5A394] tracking-tight animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs text-[#F5A394] mt-1 font-medium">秒 (Secs)</div>
              </div>
            </div>
          )}
        </div>

        {/* Custom notes or sweet quote */}
        {settings.customNotes && (
          <p className="max-w-2xl mx-auto font-serif italic text-[#F5ECE6]/90 text-sm sm:text-base leading-relaxed mb-6">
            「{settings.customNotes}」
          </p>
        )}

        {/* Interactive Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onTriggerSurpriseModal}
            className="px-5 py-2.5 rounded-full btn-romantic-primary text-white font-medium text-sm sm:text-base shadow-lg flex items-center space-x-2 transition-all hover:scale-105 cursor-pointer"
          >
            <Gift className="w-4 h-4" />
            <span>開啟生日驚喜儀式</span>
          </button>

          <button
            onClick={onOpenLoveLetter}
            className="px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-medium text-sm sm:text-base flex items-center space-x-2 transition-all cursor-pointer shadow-xs"
          >
            <span>💌 閱讀給妳的手寫信</span>
          </button>

          <button
            onClick={triggerConfetti}
            className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#F5D5CE] text-sm flex items-center space-x-1.5 transition-all cursor-pointer border border-white/15"
            title="施放浪漫彩帶慶祝"
          >
            <PartyPopper className="w-4 h-4 text-[#DEC180]" />
            <span>放彩帶 🎉</span>
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Heart, Sparkles, X, Gift, Music, Volume2, ArrowRight } from 'lucide-react';
import { LoveLetter, TripSettings } from '../types';
import { romanticMusic } from '../utils/audio';
import confetti from 'canvas-confetti';

interface SurpriseRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  loveLetter: LoveLetter;
  settings: TripSettings;
  onExploreItinerary: () => void;
}

export const SurpriseRevealModal: React.FC<SurpriseRevealModalProps> = ({
  isOpen,
  onClose,
  loveLetter,
  settings,
  onExploreItinerary,
}) => {
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  if (!isOpen) return null;

  const handleOpenEnvelope = () => {
    setIsEnvelopeOpened(true);
    romanticMusic.start();
    setIsPlayingMusic(true);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ba5444', '#c5a059', '#e8dfc8', '#8c372a']
    });

    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#ba5444', '#c5a059', '#e8dfc8', '#4a3b32', '#dec180']
      });
    }, 400);
  };

  const handleCloseAll = () => {
    setIsEnvelopeOpened(false);
    onClose();
  };

  const handleGoToItinerary = () => {
    handleCloseAll();
    onExploreItinerary();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[var(--romantic-card-warm,#F8FAFC)] rounded-3xl shadow-2xl border-2 border-[var(--romantic-border,#BAE6FD)] p-6 sm:p-10 text-[var(--romantic-ink,#0F172A)] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Close button */}
        <button
          onClick={handleCloseAll}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[var(--romantic-muted,#64748B)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isEnvelopeOpened ? (
          /* Envelope Closed State */
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full btn-romantic-primary text-white flex items-center justify-center shadow-lg border-2 border-white/40 animate-bounce">
              <Gift className="w-10 h-10 text-white" />
            </div>

            <div className="inline-block px-3 py-1 bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] text-xs font-semibold rounded-full uppercase tracking-wider mb-2 border border-[var(--romantic-border,#BAE6FD)]">
              🎂 Happy Birthday Surprise
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--romantic-ink,#0F172A)] mb-3">
              To {settings.girlfriendName || '最親愛的晴寶'} 💕
            </h2>

            <p className="text-[var(--romantic-muted,#64748B)] text-sm sm:text-base max-w-md mx-auto mb-8 font-serif">
              這是一份由蔡寶親自打造的私密生日驚喜禮物，點擊下方封蠟信封，揭開屬於我們的浪漫旅程！
            </p>

            {/* Interactive Wax Sealed Envelope */}
            <div
              onClick={handleOpenEnvelope}
              className="relative max-w-sm mx-auto bg-white hover:bg-[var(--romantic-rose-light,#F0F9FF)] border-2 border-[var(--romantic-border,#BAE6FD)] rounded-2xl p-8 cursor-pointer shadow-md hover:shadow-xl transition-all group transform hover:-translate-y-1"
            >
              <div className="text-xs text-[var(--romantic-rose,#0284C7)] font-medium mb-2 tracking-widest uppercase">
                SECRET INVITATION
              </div>
              <div className="font-serif text-xl font-bold text-[var(--romantic-ink,#0F172A)] mb-4">
                {settings.tripTitle || '台南慶生放鬆之旅'}
              </div>

              {/* Wax Seal */}
              <div className="w-14 h-14 mx-auto rounded-full btn-romantic-primary text-white flex items-center justify-center shadow-md border-2 border-white/40 transition-colors">
                <Heart className="w-7 h-7 fill-white group-hover:scale-110 transition-transform" />
              </div>

              <div className="text-xs text-[var(--romantic-rose,#0284C7)] font-semibold mt-4">
                ✨ 點擊拆開信封 ✨
              </div>
            </div>
          </div>
        ) : (
          /* Opened Letter & Surprise State */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Celebration Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-1 px-3 py-1 bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] rounded-full text-xs font-semibold mb-2 border border-[var(--romantic-border,#BAE6FD)]">
                <Sparkles className="w-3.5 h-3.5 text-[var(--romantic-gold,#F59E0B)]" />
                <span>Happy Birthday To My Queen</span>
                <Sparkles className="w-3.5 h-3.5 text-[var(--romantic-gold,#F59E0B)]" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--romantic-ink,#0F172A)]">
                {loveLetter.title || '給妳的專屬生日告白'}
              </h2>
            </div>

            {/* Handwritten Paper Style */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[var(--romantic-border,#BAE6FD)] shadow-inner font-serif text-[var(--romantic-ink,#0F172A)] leading-relaxed text-base sm:text-lg space-y-4 mb-6">
              <p className="font-bold text-[var(--romantic-rose,#0284C7)]">
                {loveLetter.openingText || `親愛的 ${settings.girlfriendName}：`}
              </p>

              {loveLetter.bodyParagraphs.map((para, idx) => (
                <p key={idx} className="text-[var(--romantic-ink,#0F172A)] leading-loose text-sm sm:text-base indent-4">
                  {para}
                </p>
              ))}

              <div className="pt-4 border-t border-[var(--romantic-border,#BAE6FD)] flex items-center justify-between text-sm sm:text-base">
                <span className="italic text-[var(--romantic-rose,#0284C7)] font-medium">
                  {loveLetter.closingText}
                </span>
                <span className="font-semibold text-[var(--romantic-ink,#0F172A)]">
                  {loveLetter.signature || '愛妳的蔡寶'} 💌
                </span>
              </div>
            </div>

            {/* Destination Highlight Pill */}
            <div className="bg-[var(--romantic-rose-light,#F0F9FF)] rounded-2xl p-4 mb-6 flex items-center justify-between border border-[var(--romantic-border,#BAE6FD)]">
              <div>
                <div className="text-xs text-[var(--romantic-rose,#0284C7)] font-medium">生日浪漫目的地</div>
                <div className="text-lg font-bold text-[var(--romantic-ink,#0F172A)] font-serif">
                  📍 {settings.destination}
                </div>
                <div className="text-xs text-[var(--romantic-muted,#64748B)] mt-0.5">
                  📅 {settings.startDate} ~ {settings.endDate}
                </div>
              </div>
              <div className="text-3xl">🚄</div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                onClick={() => {
                  const playing = romanticMusic.toggle();
                  setIsPlayingMusic(playing);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-ink,#0F172A)] text-xs sm:text-sm font-medium border border-[var(--romantic-border,#BAE6FD)] flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
              >
                <Music className="w-4 h-4 text-[var(--romantic-rose,#0284C7)]" />
                <span>{isPlayingMusic ? '暫停旋律' : '播放背景音樂'}</span>
              </button>

              <button
                onClick={handleGoToItinerary}
                className="w-full sm:w-auto px-6 py-3 rounded-xl btn-romantic-primary text-white font-medium text-sm sm:text-base shadow-lg flex items-center justify-center space-x-2 transition-all hover:scale-102 cursor-pointer"
              >
                <span>開啟專屬我們的生日行程</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

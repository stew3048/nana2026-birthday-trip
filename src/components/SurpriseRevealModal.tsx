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
    // Play romantic music automatically if not already
    romanticMusic.start();
    setIsPlayingMusic(true);

    // Multi-stage confetti celebration
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#f43f5e', '#fb7185', '#fda4af', '#fef08a', '#f472b6']
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-rose-50/95 to-amber-50/95 rounded-3xl shadow-2xl border border-rose-200/80 p-6 sm:p-10 text-stone-800 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Close button */}
        <button
          onClick={handleCloseAll}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-200/60 hover:bg-stone-300 text-stone-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isEnvelopeOpened ? (
          /* Envelope Closed State */
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-tr from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-300 animate-bounce">
              <Gift className="w-10 h-10 text-white" />
            </div>

            <div className="inline-block px-3 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
              🎂 Happy Birthday Surprise
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-850 mb-3">
              To {settings.girlfriendName || '最親愛的妳'} 💕
            </h2>

            <p className="text-stone-700 text-sm sm:text-base max-w-md mx-auto mb-8">
              這是一份專門為妳打造的生日驚喜禮物，點擊下方信封，揭開屬於我們的浪漫旅程！
            </p>

            {/* Interactive Wax Sealed Envelope */}
            <div
              onClick={handleOpenEnvelope}
              className="relative max-w-sm mx-auto bg-rose-100 hover:bg-rose-200/80 border-2 border-rose-300 rounded-2xl p-8 cursor-pointer shadow-md hover:shadow-xl transition-all group transform hover:-translate-y-1"
            >
              <div className="text-xs text-rose-500 font-medium mb-2 tracking-widest uppercase">
                SECRET INVITATION
              </div>
              <div className="font-serif text-xl font-bold text-stone-800 mb-4">
                {settings.tripTitle || '專屬妳的生日浪漫之旅'}
              </div>

              {/* Wax Seal */}
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-600 group-hover:bg-rose-500 text-white flex items-center justify-center shadow-md border-2 border-rose-400">
                <Heart className="w-7 h-7 fill-white group-hover:scale-110 transition-transform" />
              </div>

              <div className="text-xs text-rose-600 font-semibold mt-4">
                ✨ 點擊拆開信封 ✨
              </div>
            </div>
          </div>
        ) : (
          /* Opened Letter & Surprise State */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Celebration Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-1 px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>Happy Birthday To My Queen</span>
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {loveLetter.title || '給妳的專屬生日告白'}
              </h2>
            </div>

            {/* Handwritten Paper Style */}
            <div className="bg-white/90 rounded-2xl p-6 sm:p-8 border border-rose-200/70 shadow-inner font-serif text-stone-800 leading-relaxed text-base sm:text-lg space-y-4 mb-6">
              <p className="font-bold text-rose-700">
                {loveLetter.openingText || `親愛的 ${settings.girlfriendName}：`}
              </p>

              {loveLetter.bodyParagraphs.map((para, idx) => (
                <p key={idx} className="text-stone-700 leading-loose text-sm sm:text-base indent-4">
                  {para}
                </p>
              ))}

              <div className="pt-4 border-t border-rose-100 flex items-center justify-between text-sm sm:text-base">
                <span className="italic text-rose-600 font-medium">
                  {loveLetter.closingText}
                </span>
                <span className="font-semibold text-stone-800">
                  {loveLetter.authorName} 💌
                </span>
              </div>
            </div>

            {/* Destination Highlight Pill */}
            <div className="bg-rose-100/70 rounded-2xl p-4 mb-6 flex items-center justify-between border border-rose-200">
              <div>
                <div className="text-xs text-rose-700 font-medium">生日浪漫目的地</div>
                <div className="text-lg font-bold text-stone-900 font-serif">
                  📍 {settings.destination}
                </div>
                <div className="text-xs text-stone-700 mt-0.5">
                  📅 {settings.startDate} ~ {settings.endDate}
                </div>
              </div>
              <div className="text-3xl">✈️</div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                onClick={() => {
                  const playing = romanticMusic.toggle();
                  setIsPlayingMusic(playing);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-medium flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Music className="w-4 h-4" />
                <span>{isPlayingMusic ? '暫停旋律' : '播放背景音樂'}</span>
              </button>

              <button
                onClick={handleGoToItinerary}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-sm sm:text-base shadow-lg shadow-rose-200 flex items-center justify-center space-x-2 transition-all hover:scale-102 cursor-pointer"
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

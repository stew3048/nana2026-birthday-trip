import React from 'react';
import { Printer, X, Download, Heart, MapPin, Clock, Calendar, CheckSquare } from 'lucide-react';
import { BirthdayTripData } from '../types';

interface PrintGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripData: BirthdayTripData;
}

export const PrintGuideModal: React.FC<PrintGuideModalProps> = ({
  isOpen,
  onClose,
  tripData
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[var(--romantic-border,#BAE6FD)] p-6 sm:p-10 text-[var(--romantic-ink,#0F172A)] max-h-[90vh] overflow-y-auto">
        
        {/* Floating Action Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between pb-4 mb-6 border-b border-[var(--romantic-border,#BAE6FD)] bg-white/95 backdrop-blur-xs">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-[var(--romantic-rose,#0284C7)]" />
            <span className="font-serif text-lg font-bold text-[var(--romantic-ink,#0F172A)]">
              浪漫旅遊手冊預覽 & 列印 (PDF)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl btn-romantic-primary text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>列印 / 另存為 PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--romantic-card-warm,#F8FAFC)] text-[var(--romantic-muted,#64748B)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div className="printable-area space-y-8 font-sans text-[var(--romantic-ink,#0F172A)] p-4">
          
          {/* Cover Header */}
          <div className="text-center py-6 border-b-2 border-[var(--romantic-border,#BAE6FD)] space-y-2">
            <div className="inline-block px-3 py-1 bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] rounded-full text-xs font-bold uppercase tracking-wider border border-[var(--romantic-border,#BAE6FD)]">
              🎂 BIRTHDAY TRIP GUIDEBOOK
            </div>
            <h1 className="font-serif text-3xl font-bold text-[var(--romantic-ink,#0F172A)]">
              {tripData.settings.tripTitle}
            </h1>
            <p className="text-sm text-[var(--romantic-muted,#64748B)]">
              專屬於 <strong>{tripData.settings.girlfriendName}</strong> · 目的地：{tripData.settings.destination}
            </p>
            <p className="text-xs text-[var(--romantic-rose,#0284C7)] font-mono">
              日期：{tripData.settings.startDate} ~ {tripData.settings.endDate}
            </p>
          </div>

          {/* Daily Itinerary */}
          <div className="space-y-6">
            <h2 className="font-serif text-xl font-bold text-[var(--romantic-rose,#0284C7)] border-l-4 border-[var(--romantic-rose,#0284C7)] pl-3">
              📅 每日行程時間軸
            </h2>

            {tripData.itinerary.map((day) => (
              <div key={day.id} className="border border-[var(--romantic-border,#BAE6FD)] rounded-2xl p-4 space-y-3 bg-[var(--romantic-card-warm,#F8FAFC)]">
                <div className="flex items-center justify-between border-b border-[var(--romantic-border,#BAE6FD)] pb-2">
                  <div>
                    <span className="font-bold text-sm text-[var(--romantic-rose,#0284C7)] mr-2">DAY {day.dayNumber}</span>
                    <span className="font-serif font-bold text-[var(--romantic-ink,#0F172A)]">{day.themeTitle}</span>
                  </div>
                  <span className="text-xs font-mono text-[var(--romantic-muted,#64748B)]">{day.date}</span>
                </div>

                {day.todayOutfitTip && (
                  <div className="text-xs text-[var(--romantic-rose,#0284C7)] bg-[var(--romantic-rose-light,#F0F9FF)] p-2 rounded-lg border border-[var(--romantic-border,#BAE6FD)]">
                    👗 穿搭指南：{day.todayOutfitTip}
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  {day.activities.map((act) => (
                    <div key={act.id} className="flex items-start space-x-3 py-1.5 border-b border-[var(--romantic-border,#BAE6FD)]/60 last:border-0">
                      <span className="font-mono font-bold text-[var(--romantic-ink,#0F172A)] w-24 shrink-0">{act.time}</span>
                      <div className="flex-1">
                        <div className="font-bold text-[var(--romantic-ink,#0F172A)]">{act.title}</div>
                        {act.location && <div className="text-[var(--romantic-muted,#64748B)]">📍 {act.location}</div>}
                        {act.notes && <div className="text-[var(--romantic-rose,#0284C7)] italic mt-0.5">📝 {act.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Dining Reservations */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-[var(--romantic-rose,#0284C7)] border-l-4 border-[var(--romantic-rose,#0284C7)] pl-3">
              🍽️ 精選餐廳與訂位備忘
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {tripData.dining.map((din) => (
                <div key={din.id} className="border border-[var(--romantic-border,#BAE6FD)] rounded-xl p-3 bg-white">
                  <div className="font-bold text-[var(--romantic-ink,#0F172A)] text-sm mb-1">{din.name}</div>
                  <div className="text-[var(--romantic-muted,#64748B)]">時間：{din.dateTime || '未定'}</div>
                  <div className="text-[var(--romantic-muted,#64748B)]">地點：{din.location}</div>
                  {din.bookingCode && <div className="text-[var(--romantic-rose,#0284C7)] font-mono">訂位代號：{din.bookingCode}</div>}
                  {din.specialRequest && <div className="text-[var(--romantic-rose,#0284C7)] bg-[var(--romantic-rose-light,#F0F9FF)] p-1.5 rounded-sm mt-1 border border-[var(--romantic-border,#BAE6FD)]">備註：{din.specialRequest}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Important Packing Items */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-[var(--romantic-rose,#0284C7)] border-l-4 border-[var(--romantic-rose,#0284C7)] pl-3">
              🧳 重點行李清單
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {tripData.packingList.map((item) => (
                <div key={item.id} className="flex items-center space-x-2 py-1">
                  <span className="text-[var(--romantic-rose,#0284C7)]">□</span>
                  <span className={item.isSweetheartSpecial ? 'font-bold text-[var(--romantic-rose,#0284C7)]' : 'text-[var(--romantic-muted,#64748B)]'}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sweet Closing */}
          <div className="text-center py-4 border-t border-[var(--romantic-border,#BAE6FD)] text-xs text-[var(--romantic-muted,#64748B)] font-serif">
            祝世界上最可愛的女孩 生日快樂 💕 願我們留下最甜蜜的回憶！
          </div>

        </div>

      </div>
    </div>
  );
};

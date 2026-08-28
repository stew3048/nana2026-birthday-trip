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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-10 text-stone-850 max-h-[90vh] overflow-y-auto">
        
        {/* Floating Action Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between pb-4 mb-6 border-b border-stone-200 bg-white/95 backdrop-blur-xs">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-rose-500" />
            <span className="font-serif text-lg font-bold text-stone-900">
              浪漫旅遊手冊預覽 & 列印 (PDF)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs shadow-rose-200 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>列印 / 另存為 PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div className="printable-area space-y-8 font-sans text-stone-800 p-4">
          
          {/* Cover Header */}
          <div className="text-center py-6 border-b-2 border-rose-200 space-y-2">
            <div className="inline-block px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold uppercase tracking-wider">
              🎂 BIRTHDAY TRIP GUIDEBOOK
            </div>
            <h1 className="font-serif text-3xl font-bold text-stone-900">
              {tripData.settings.tripTitle}
            </h1>
            <p className="text-sm text-stone-600">
              專屬於 <strong>{tripData.settings.girlfriendName}</strong> · 目的地：{tripData.settings.destination}
            </p>
            <p className="text-xs text-rose-600 font-mono">
              日期：{tripData.settings.startDate} ~ {tripData.settings.endDate}
            </p>
          </div>

          {/* Daily Itinerary */}
          <div className="space-y-6">
            <h2 className="font-serif text-xl font-bold text-rose-800 border-l-4 border-rose-500 pl-3">
              📅 每日行程時間軸
            </h2>

            {tripData.itinerary.map((day) => (
              <div key={day.id} className="border border-stone-200 rounded-2xl p-4 space-y-3 bg-stone-50/50">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <div>
                    <span className="font-bold text-sm text-rose-700 mr-2">DAY {day.dayNumber}</span>
                    <span className="font-serif font-bold text-stone-850">{day.themeTitle}</span>
                  </div>
                  <span className="text-xs font-mono text-stone-500">{day.date}</span>
                </div>

                {day.todayOutfitTip && (
                  <div className="text-xs text-pink-700 bg-pink-50 p-2 rounded-lg">
                    👗 穿搭指南：{day.todayOutfitTip}
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  {day.activities.map((act) => (
                    <div key={act.id} className="flex items-start space-x-3 py-1.5 border-b border-stone-100 last:border-0">
                      <span className="font-mono font-bold text-stone-700 w-24 shrink-0">{act.time}</span>
                      <div className="flex-1">
                        <div className="font-bold text-stone-850">{act.title}</div>
                        {act.location && <div className="text-stone-500">📍 {act.location}</div>}
                        {act.notes && <div className="text-rose-600 italic mt-0.5">📝 {act.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Dining Reservations */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-rose-800 border-l-4 border-rose-500 pl-3">
              🍽️ 精選餐廳與訂位備忘
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {tripData.dining.map((din) => (
                <div key={din.id} className="border border-stone-200 rounded-xl p-3 bg-white">
                  <div className="font-bold text-stone-850 text-sm mb-1">{din.name}</div>
                  <div className="text-stone-600">時間：{din.dateTime || '未定'}</div>
                  <div className="text-stone-600">地點：{din.location}</div>
                  {din.bookingCode && <div className="text-rose-600 font-mono">訂位代號：{din.bookingCode}</div>}
                  {din.specialRequest && <div className="text-amber-700 bg-amber-50 p-1.5 rounded-sm mt-1">備註：{din.specialRequest}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Important Packing Items */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-rose-800 border-l-4 border-rose-500 pl-3">
              🧳 重點行李清單
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {tripData.packingList.map((item) => (
                <div key={item.id} className="flex items-center space-x-2 py-1">
                  <span className="text-rose-500">□</span>
                  <span className={item.isSweetheartSpecial ? 'font-bold text-rose-700' : 'text-stone-700'}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sweet Closing */}
          <div className="text-center py-4 border-t border-rose-200 text-xs text-stone-400">
            祝世界上最可愛的女孩 生日快樂 💕 願我們留下最甜蜜的回憶！
          </div>

        </div>

      </div>
    </div>
  );
};

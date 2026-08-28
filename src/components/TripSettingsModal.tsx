import React, { useState } from 'react';
import { Settings, X, Image, MapPin, Calendar, Heart, Lock, Sparkles } from 'lucide-react';
import { TripSettings } from '../types';

interface TripSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TripSettings;
  onUpdateSettings: (newSettings: TripSettings) => void;
}

export const TripSettingsModal: React.FC<TripSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  const [formData, setFormData] = useState<TripSettings>({ ...settings });

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tripTitle.trim()) {
      alert('請填寫旅程名稱');
      return;
    }
    onUpdateSettings(formData);
    onClose();
  };

  const coverPresets = [
    { label: '🌸 日本東京櫻花', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80' },
    { label: '🗻 富士山景觀', url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1600&q=80' },
    { label: '🌊 海邊海景度假', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80' },
    { label: '🏙️ 城市微醺高空夜景', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80' },
    { label: '🍁 京都古都浪漫漫遊', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
        
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <Settings className="w-5 h-5" />
            </span>
            <h3 className="font-serif text-xl font-bold text-stone-850">
              ⚙️ 生日旅行基本設定
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-sm text-stone-700">
          
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              旅行標題 *
            </label>
            <input
              type="text"
              value={formData.tripTitle}
              onChange={(e) => setFormData({ ...formData, tripTitle: e.target.value })}
              placeholder="🌸 專屬於寶貝的浪漫生日之旅"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-rose-400 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                女友姓名 / 愛稱
              </label>
              <input
                type="text"
                value={formData.girlfriendName}
                onChange={(e) => setFormData({ ...formData, girlfriendName: e.target.value })}
                placeholder="例如：寶貝 💖"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-rose-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                男友姓名 / 稱呼
              </label>
              <input
                type="text"
                value={formData.boyfriendName}
                onChange={(e) => setFormData({ ...formData, boyfriendName: e.target.value })}
                placeholder="例如：專屬暖男 🙋‍♂️"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-rose-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              目的地
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="例如：日本東京 & 河口湖富士山"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-rose-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                啟程日期 (倒數計時基準)
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-rose-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                結束日期
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-rose-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              封面大圖網址
            </label>
            <input
              type="text"
              value={formData.coverImageUrl}
              onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-rose-400 text-xs"
            />
            {/* Quick cover presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {coverPresets.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData({ ...formData, coverImageUrl: preset.url })}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-[11px] text-stone-600 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              甜蜜寄語 (顯示於首頁)
            </label>
            <textarea
              value={formData.customNotes || ''}
              onChange={(e) => setFormData({ ...formData, customNotes: e.target.value })}
              rows={2}
              placeholder="親愛的，這趟旅行所有細節我都安排好了..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-rose-400 font-serif"
            />
          </div>

          {/* Role and Permissions (Gmail binding) */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>👑 Google 帳號與角色權限設定 (RBAC)</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              當使用 Google 登入時，系統會比對下方填寫的信箱自動分配身分：
            </p>

            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-amber-950 mb-1">
                  👑 蔡寶（管理員/男友）Google Gmail 信箱
                </label>
                <input
                  type="email"
                  value={formData.boyfriendEmail || ''}
                  onChange={(e) => setFormData({ ...formData, boyfriendEmail: e.target.value })}
                  placeholder="例如：stew3048@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-300 focus:outline-amber-500 font-mono text-xs"
                />
                <span className="text-[11px] text-amber-700 mt-0.5 block">
                  👉 此信箱登入時擁有全權管理權限，可看全部行程、訂位管理與花費記帳。
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-950 mb-1">
                  ⭐ 晴寶（女友/壽星）Google Gmail 信箱（選填）
                </label>
                <input
                  type="email"
                  value={formData.girlfriendEmail || ''}
                  onChange={(e) => setFormData({ ...formData, girlfriendEmail: e.target.value })}
                  placeholder="例如：qingbao@gmail.com (若未登入或非男友信箱，預設即為晴寶視角)"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 focus:outline-rose-400 font-mono text-xs"
                />
                <span className="text-[11px] text-rose-600 mt-0.5 block">
                  👉 晴寶打開網頁（即便未登入，或用其 Gmail 登入），皆會自動進入「活動前 1 小時解鎖」的浪漫驚喜視角！
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                解鎖驚喜預設密碼
              </label>
              <input
                type="text"
                value={formData.secretModePassword || '0520'}
                onChange={(e) => setFormData({ ...formData, secretModePassword: e.target.value })}
                placeholder="0520"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-rose-400 font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-medium cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs shadow-rose-200 cursor-pointer"
            >
              儲存設定
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

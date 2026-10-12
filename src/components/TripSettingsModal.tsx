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
    { label: '🏛️ 奇美博物館', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80' },
    { label: '🏨 煙波大飯店', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80' },
    { label: '🍷 浪漫餐酒館', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80' },
    { label: '🌳 漁光島日落', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80' },
  ];

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[var(--romantic-border,#BAE6FD)] animate-in fade-in zoom-in-95 text-[var(--romantic-ink,#0F172A)] max-h-[92vh] flex flex-col my-auto overflow-hidden">
        
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-[var(--romantic-border,#BAE6FD)] shrink-0 bg-white">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)]">
              <Settings className="w-5 h-5" />
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--romantic-ink,#0F172A)]">
              ⚙️ 生日旅行基本設定
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-ink,#0F172A)] hover:bg-[var(--romantic-card-warm,#F8FAFC)] transition-colors cursor-pointer text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 sm:p-7 overflow-y-auto space-y-4 text-sm text-[var(--romantic-ink,#0F172A)] flex-1">
          
          <div>
            <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
              旅行標題 *
            </label>
            <input
              type="text"
              value={formData.tripTitle}
              onChange={(e) => setFormData({ ...formData, tripTitle: e.target.value })}
              placeholder="🌸 專屬於晴寶的浪漫生日之旅"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] focus:outline-[var(--romantic-rose,#0284C7)] font-medium bg-[var(--romantic-card-warm,#F8FAFC)] text-[var(--romantic-ink,#0F172A)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                女友姓名 / 愛稱
              </label>
              <input
                type="text"
                value={formData.girlfriendName}
                onChange={(e) => setFormData({ ...formData, girlfriendName: e.target.value })}
                placeholder="例如：晴寶 💖"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] focus:outline-[var(--romantic-rose,#0284C7)] bg-[var(--romantic-card-warm,#F8FAFC)] text-[var(--romantic-ink,#0F172A)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                男友姓名 / 稱呼
              </label>
              <input
                type="text"
                value={formData.boyfriendName}
                onChange={(e) => setFormData({ ...formData, boyfriendName: e.target.value })}
                placeholder="例如：蔡寶 🙋‍♂️"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] focus:outline-[var(--romantic-rose,#0284C7)] bg-[var(--romantic-card-warm,#F8FAFC)] text-[var(--romantic-ink,#0F172A)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
              目的地
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="例如：台南煙波大飯店 ＆ 浪漫府城輕旅行"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] focus:outline-[var(--romantic-rose,#0284C7)] bg-[var(--romantic-card-warm,#F8FAFC)] text-[var(--romantic-ink,#0F172A)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                啟程日期 (倒數計時基準)
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] focus:outline-[var(--romantic-rose,#0284C7)] font-mono bg-[var(--romantic-card-warm,#F8FAFC)] text-[var(--romantic-ink,#0F172A)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                結束日期
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] focus:outline-[var(--romantic-rose,#0284C7)] font-mono bg-[var(--romantic-card-warm,#F8FAFC)] text-[var(--romantic-ink,#0F172A)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
              封面大圖網址
            </label>
            <input
              type="text"
              value={formData.coverImageUrl}
              onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] focus:outline-[var(--romantic-rose,#0284C7)] text-xs bg-[var(--romantic-card-warm,#F8FAFC)] text-[var(--romantic-ink,#0F172A)]"
            />
            {/* Quick cover presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {coverPresets.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData({ ...formData, coverImageUrl: preset.url })}
                  className="px-2.5 py-1 rounded-lg bg-[var(--romantic-card-warm,#F8FAFC)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] hover:text-[var(--romantic-rose,#0284C7)] text-[11px] text-[var(--romantic-muted,#64748B)] border border-[var(--romantic-border,#BAE6FD)] transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
              甜蜜寄語 (顯示於首頁)
            </label>
            <textarea
              value={formData.customNotes || ''}
              onChange={(e) => setFormData({ ...formData, customNotes: e.target.value })}
              rows={2}
              placeholder="親愛的晴寶，這趟台南慶生放鬆之旅所有細節蔡寶都安排好了..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] focus:outline-[var(--romantic-rose,#0284C7)] font-serif bg-[var(--romantic-card-warm,#F8FAFC)] text-[var(--romantic-ink,#0F172A)]"
            />
          </div>

          {/* Role and Permissions (Gmail binding) */}
          <div className="p-4 rounded-2xl bg-[var(--romantic-rose-light,#F0F9FF)] border border-[var(--romantic-border,#BAE6FD)] space-y-3">
            <div className="flex items-center space-x-2 text-[var(--romantic-rose,#0284C7)] font-bold text-xs">
              <Lock className="w-4 h-4 text-[var(--romantic-rose,#0284C7)]" />
              <span>👑 Google 帳號與角色權限設定 (RBAC)</span>
            </div>
            <p className="text-xs text-[var(--romantic-muted,#64748B)] leading-relaxed">
              當使用 Google 登入時，系統會比對下方填寫的信箱自動分配身分：
            </p>

            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  👑 蔡寶（管理員/男友）Google Gmail 信箱
                </label>
                <input
                  type="email"
                  value={formData.boyfriendEmail || ''}
                  onChange={(e) => setFormData({ ...formData, boyfriendEmail: e.target.value })}
                  placeholder="例如：boyfriend@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[var(--romantic-border,#BAE6FD)] focus:outline-[var(--romantic-rose,#0284C7)] font-mono text-xs text-[var(--romantic-ink,#0F172A)]"
                />
                <span className="text-[11px] text-[var(--romantic-muted,#64748B)] mt-0.5 block">
                  👉 此信箱登入時擁有全權管理權限，可看全部行程、訂位管理與花費記帳。
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-rose,#0284C7)] mb-1">
                  ⭐ 晴寶（女友/壽星）Google Gmail 信箱（選填）
                </label>
                <input
                  type="email"
                  value={formData.girlfriendEmail || ''}
                  onChange={(e) => setFormData({ ...formData, girlfriendEmail: e.target.value })}
                  placeholder="例如：qingbao@gmail.com (若未登入或非男友信箱，預設即為晴寶視角)"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[var(--romantic-border,#BAE6FD)] focus:outline-[var(--romantic-rose,#0284C7)] font-mono text-xs text-[var(--romantic-ink,#0F172A)]"
                />
                <span className="text-[11px] text-[var(--romantic-rose,#0284C7)] mt-0.5 block">
                  👉 晴寶打開網頁（即便未登入，或用其 Gmail 登入），皆會自動進入「活動前 1 小時解鎖」的浪漫驚喜視角！
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                解鎖驚喜預設密碼
              </label>
              <input
                type="text"
                value={formData.secretModePassword || '0520'}
                onChange={(e) => setFormData({ ...formData, secretModePassword: e.target.value })}
                placeholder="0520"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] focus:outline-[var(--romantic-rose,#0284C7)] font-mono font-bold bg-[var(--romantic-card-warm,#F8FAFC)] text-[var(--romantic-ink,#0F172A)]"
              />
            </div>
          </div>

          </div>

          <div className="flex items-center justify-end space-x-3 px-5 sm:px-7 py-4 border-t border-[var(--romantic-border,#BAE6FD)] shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-[var(--romantic-muted,#64748B)] hover:bg-[var(--romantic-card-warm,#F8FAFC)] text-xs font-medium cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl btn-romantic-primary text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              儲存設定
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

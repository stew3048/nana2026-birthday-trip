import React, { useState } from 'react';
import { 
  Utensils, 
  Plus, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Bookmark, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Cake, 
  Sparkles 
} from 'lucide-react';
import { DiningItem } from '../types';

interface DiningTrackerProps {
  diningList: DiningItem[];
  onUpdateDining: (newList: DiningItem[]) => void;
}

export const DiningTracker: React.FC<DiningTrackerProps> = ({
  diningList,
  onUpdateDining
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<DiningItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<DiningItem | null>(null);

  const filteredList = diningList.filter(item => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const getStatusBadge = (status: DiningItem['status']) => {
    switch (status) {
      case 'confirmed':
        return {
          label: '已訂位確認',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          style: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'to_book':
        return {
          label: '待搶位/預約',
          icon: <Clock className="w-3.5 h-3.5 text-[var(--romantic-gold,#F59E0B)]" />,
          style: 'bg-[var(--romantic-gold-light,#FEF3C7)] text-[var(--romantic-gold,#F59E0B)] border-[var(--romantic-border,#BAE6FD)]'
        };
      case 'waitlist':
        return {
          label: '候補排隊中',
          icon: <AlertCircle className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)]" />,
          style: 'bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border-[var(--romantic-border,#BAE6FD)]'
        };
      case 'wishlist':
        return {
          label: '口袋備選名單',
          icon: <Bookmark className="w-3.5 h-3.5 text-[var(--romantic-muted,#64748B)]" />,
          style: 'bg-slate-50 text-[var(--romantic-muted,#64748B)] border-[var(--romantic-border,#BAE6FD)]'
        };
    }
  };

  const handleOpenAdd = () => {
    setEditingItem({
      id: 'din-' + Date.now(),
      name: '',
      category: 'restaurant',
      status: 'confirmed',
      dateTime: '2026-10-17 18:00',
      location: '',
      locationUrl: '',
      bookingCode: '',
      specialRequest: '晴寶生日慶祝，需蛋糕寫字盤',
      mustEatDishes: '',
      notes: ''
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (item: DiningItem) => {
    setEditingItem({ ...item });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editingItem || !editingItem.name.trim()) {
      alert('請填寫餐廳名稱');
      return;
    }

    const exists = diningList.some(d => d.id === editingItem.id);
    let updated: DiningItem[];
    if (exists) {
      updated = diningList.map(d => d.id === editingItem.id ? editingItem : d);
    } else {
      updated = [...diningList, editingItem];
    }
    onUpdateDining(updated);
    setIsEditing(false);
    setEditingItem(null);
  };

  const handleDelete = (item: DiningItem) => {
    setDeletingItem(item);
  };

  const confirmDeleteDining = () => {
    if (!deletingItem) return;
    onUpdateDining(diningList.filter(d => d.id !== deletingItem.id));
    setDeletingItem(null);
    if (isEditing && editingItem?.id === deletingItem.id) {
      setIsEditing(false);
      setEditingItem(null);
    }
  };

  return (
    <div className="space-y-6 text-[var(--romantic-ink,#0F172A)]">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-[var(--romantic-border,#BAE6FD)] shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)]">
              <Utensils className="w-5 h-5" />
            </span>
            <h2 className="font-serif text-2xl font-bold text-[var(--romantic-ink,#0F172A)]">
              🍽️ 浪漫美饌 & 慶生訂位管理
            </h2>
          </div>
          <p className="text-[var(--romantic-muted,#64748B)] text-xs sm:text-sm mt-1">
            記錄所有為她預訂的景觀餐廳、下午茶咖啡廳與生日蛋糕備註。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-[var(--romantic-rose-light,#F0F9FF)] p-1 rounded-2xl text-xs font-medium border border-[var(--romantic-border,#BAE6FD)]">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === 'all' ? 'btn-romantic-primary font-bold shadow-xs' : 'text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-rose,#0284C7)]'
              }`}
            >
              全部 ({diningList.length})
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300' : 'text-[var(--romantic-muted,#64748B)] hover:text-emerald-700'
              }`}
            >
              已訂位 ({diningList.filter(d => d.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilterStatus('to_book')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === 'to_book' ? 'bg-[var(--romantic-gold-light,#FEF3C7)] text-[var(--romantic-gold,#F59E0B)] font-bold border border-[var(--romantic-border,#BAE6FD)]' : 'text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-gold,#F59E0B)]'
              }`}
            >
              待預約 ({diningList.filter(d => d.status === 'to_book').length})
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-2xl btn-romantic-primary text-white font-medium text-xs sm:text-sm shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>新增訂位記錄</span>
          </button>
        </div>
      </div>

      {/* Dining Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredList.map((item) => {
          const badge = getStatusBadge(item.status);

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-[var(--romantic-border,#BAE6FD)] shadow-sm hover:shadow-md transition-all space-y-4 relative"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.style}`}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>

                    {item.bookingCode && (
                      <span className="text-xs font-mono font-bold bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-ink,#0F172A)] px-2 py-0.5 rounded-md border border-[var(--romantic-border,#BAE6FD)]">
                        訂位代號: {item.bookingCode}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[var(--romantic-ink,#0F172A)] pt-1">
                    {item.name}
                  </h3>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-rose,#0284C7)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] transition-colors cursor-pointer"
                    title="編輯"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1.5 rounded-lg text-[var(--romantic-muted,#64748B)] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="刪除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Time & Location */}
              <div className="space-y-1.5 text-xs text-[var(--romantic-muted,#64748B)] pt-1">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)]" />
                  <span className="font-semibold text-[var(--romantic-ink,#0F172A)]">{item.dateTime}</span>
                </div>
                {item.location && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-[var(--romantic-gold,#F59E0B)]" />
                      <span>{item.location}</span>
                    </div>
                    {item.locationUrl && (
                      <a
                        href={item.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--romantic-rose,#0284C7)] hover:underline flex items-center space-x-1"
                      >
                        <span>地圖</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Birthday Special Request */}
              {item.specialRequest && (
                <div className="p-3 rounded-2xl bg-[var(--romantic-gold-light,#FEF3C7)] border border-[var(--romantic-border,#BAE6FD)] text-xs text-[var(--romantic-gold,#F59E0B)] space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <Cake className="w-3.5 h-3.5 text-[var(--romantic-gold,#F59E0B)]" />
                    <span>生日特別備註 / 驚喜需求：</span>
                  </div>
                  <p className="pl-5 leading-relaxed text-[var(--romantic-ink,#0F172A)]">{item.specialRequest}</p>
                </div>
              )}

              {/* Must Eat Dishes */}
              {item.mustEatDishes && (
                <div className="text-xs text-[var(--romantic-ink,#0F172A)]">
                  <span className="font-bold text-[var(--romantic-rose,#0284C7)]">推薦必點：</span>
                  <span className="text-[var(--romantic-muted,#64748B)] ml-1">{item.mustEatDishes}</span>
                </div>
              )}

              {/* Notes */}
              {item.notes && (
                <p className="text-xs text-[var(--romantic-muted,#64748B)] italic border-t border-[var(--romantic-border,#BAE6FD)] pt-2">
                  備註：{item.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit / Add Dining Modal */}
      {isEditing && editingItem && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[var(--romantic-border,#BAE6FD)] max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 sm:px-7 py-4 border-b border-[var(--romantic-border,#BAE6FD)] flex items-center justify-between shrink-0 bg-white">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--romantic-ink,#0F172A)]">
                🍽️ 編輯訂位記錄
              </h3>
              <button
                type="button"
                onClick={() => { setIsEditing(false); setEditingItem(null); }}
                className="text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-ink,#0F172A)] text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 sm:p-7 overflow-y-auto space-y-4 text-xs text-[var(--romantic-ink,#0F172A)] flex-1">
              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  餐廳/咖啡廳名稱 *
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="例如：煙波早堂、碳佐麻里 精品燒肉"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                    預訂狀態
                  </label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as DiningItem['status'] })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                  >
                    <option value="confirmed">已訂位確認</option>
                    <option value="to_book">待搶位/預約</option>
                    <option value="waitlist">候補排隊中</option>
                    <option value="wishlist">口袋備選名單</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                    訂位代號 (選填)
                  </label>
                  <input
                    type="text"
                    value={editingItem.bookingCode || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, bookingCode: e.target.value })}
                    placeholder="#RES-20261017"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  用餐日期與時間
                </label>
                <input
                  type="text"
                  value={editingItem.dateTime}
                  onChange={(e) => setEditingItem({ ...editingItem, dateTime: e.target.value })}
                  placeholder="例如：2026-10-17 18:00"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                    餐廳地址 / 位置
                  </label>
                  <input
                    type="text"
                    value={editingItem.location || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                    placeholder="台南市中西區..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                    Google Maps 網址
                  </label>
                  <input
                    type="text"
                    value={editingItem.locationUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, locationUrl: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  生日特別需求 / 慶生備註
                </label>
                <textarea
                  rows={2}
                  value={editingItem.specialRequest || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, specialRequest: e.target.value })}
                  placeholder="例如：壽星慶生甜點畫盤、靠窗安靜位..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  必點推薦菜色
                </label>
                <input
                  type="text"
                  value={editingItem.mustEatDishes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, mustEatDishes: e.target.value })}
                  placeholder="例如：和牛拼盤、招牌布丁"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>
            </div>

            <div className="px-5 sm:px-7 py-4 border-t border-[var(--romantic-border,#BAE6FD)] flex items-center justify-end space-x-3 shrink-0 bg-white">
              <button
                type="button"
                onClick={() => { setIsEditing(false); setEditingItem(null); }}
                className="px-4 py-2 rounded-xl text-[var(--romantic-muted,#64748B)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl btn-romantic-primary text-white text-xs font-medium cursor-pointer shadow-xs"
              >
                儲存訂位
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[var(--romantic-border,#BAE6FD)] text-center animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[var(--romantic-ink,#0F172A)] mb-2">
              確定要刪除此訂位記錄嗎？
            </h3>
            <p className="text-sm text-[var(--romantic-muted,#64748B)] mb-1">
              餐廳名稱：<strong className="text-[var(--romantic-ink,#0F172A)] font-semibold">{deletingItem.name}</strong>
            </p>
            <p className="text-xs text-[var(--romantic-muted,#64748B)] mb-6">
              時間：{deletingItem.dateTime} · 狀態：{getStatusBadge(deletingItem.status).label}
            </p>
            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-5 py-2.5 rounded-xl text-[var(--romantic-muted,#64748B)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-xs font-semibold cursor-pointer border border-[var(--romantic-border,#BAE6FD)]"
              >
                取消保留
              </button>
              <button
                type="button"
                onClick={confirmDeleteDining}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>確認刪除訂位</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

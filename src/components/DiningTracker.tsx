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
          icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
          style: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'waitlist':
        return {
          label: '候補排隊中',
          icon: <AlertCircle className="w-3.5 h-3.5 text-orange-600" />,
          style: 'bg-orange-50 text-orange-700 border-orange-200'
        };
      case 'wishlist':
        return {
          label: '口袋備選名單',
          icon: <Bookmark className="w-3.5 h-3.5 text-stone-600" />,
          style: 'bg-stone-100 text-stone-700 border-stone-200'
        };
    }
  };

  const handleOpenAdd = () => {
    setEditingItem({
      id: 'din-' + Date.now(),
      name: '',
      category: 'restaurant',
      status: 'confirmed',
      dateTime: '2026-09-18 19:00',
      location: '',
      locationUrl: '',
      bookingCode: '',
      specialRequest: '女友生日慶祝，需蛋糕寫字盤',
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

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除這家餐廳嗎？')) {
      onUpdateDining(diningList.filter(d => d.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-rose-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Utensils className="w-5 h-5" />
            </span>
            <h2 className="font-serif text-2xl font-bold text-stone-850">
              🍽️ 浪漫美饌 & 慶生訂位管理
            </h2>
          </div>
          <p className="text-stone-700 text-xs sm:text-sm mt-1">
            記錄所有為她預訂的景觀餐廳、下午茶咖啡廳與生日蛋糕備註。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterStatus === 'all' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600'
              }`}
            >
              全部 ({diningList.length})
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterStatus === 'confirmed' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-stone-600'
              }`}
            >
              已訂位 ({diningList.filter(d => d.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilterStatus('to_book')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterStatus === 'to_book' ? 'bg-white text-amber-700 shadow-2xs font-semibold' : 'text-stone-600'
              }`}
            >
              待預約
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium flex items-center space-x-1 shadow-xs shadow-rose-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>新增餐廳</span>
          </button>
        </div>
      </div>

      {/* Grid of Dining Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredList.map((item) => {
          const statusBadge = getStatusBadge(item.status);

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-stone-200 hover:border-amber-300 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center space-x-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusBadge.style}`}>
                      {statusBadge.icon}
                      <span>{statusBadge.label}</span>
                    </span>

                    {item.bookingCode && (
                      <span className="text-xs font-mono px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md">
                        代號: #{item.bookingCode}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-xl font-bold text-stone-850">
                    {item.name}
                  </h3>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Time & Location */}
              <div className="space-y-1.5 text-xs text-stone-600">
                {item.dateTime && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    <span className="font-medium text-stone-800">{item.dateTime}</span>
                  </div>
                )}

                {item.location && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>{item.location}</span>
                    </div>

                    <a
                      href={item.locationUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-rose-600 hover:underline"
                    >
                      <span>地圖</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Birthday Special Request */}
              {item.specialRequest && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-800 flex items-start space-x-2">
                  <Cake className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">生日特別備註：</span>
                    <span>{item.specialRequest}</span>
                  </div>
                </div>
              )}

              {/* Must-eat dishes or Notes */}
              {(item.mustEatDishes || item.notes) && (
                <div className="text-xs text-stone-500 space-y-1 pt-1 border-t border-stone-100">
                  {item.mustEatDishes && (
                    <div>✨ 推薦必吃：<span className="text-stone-700 font-medium">{item.mustEatDishes}</span></div>
                  )}
                  {item.notes && (
                    <div>📝 注意事項：<span>{item.notes}</span></div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit / Add Dining Modal */}
      {isEditing && editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <h3 className="font-serif text-xl font-bold text-stone-850 mb-4">
              🍽️ 規劃浪漫餐廳 / 訂位資訊
            </h3>

            <div className="space-y-4 text-sm text-stone-700">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  餐廳名稱 *
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="例如：Sky Restaurant 634 晴空塔景觀餐廳"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    訂位狀態
                  </label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as DiningItem['status'] })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400 bg-white"
                  >
                    <option value="confirmed">已訂位確認</option>
                    <option value="to_book">待搶位/預約</option>
                    <option value="waitlist">候補排隊中</option>
                    <option value="wishlist">口袋名單</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    預訂日期與時間
                  </label>
                  <input
                    type="text"
                    value={editingItem.dateTime || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, dateTime: e.target.value })}
                    placeholder="2026-09-18 19:00"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    地點
                  </label>
                  <input
                    type="text"
                    value={editingItem.location || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                    placeholder="東京都墨田區晴空塔"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    訂位代號 / 編號
                  </label>
                  <input
                    type="text"
                    value={editingItem.bookingCode || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, bookingCode: e.target.value })}
                    placeholder="#TYO-9918"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  🎂 生日特別備註 (蛋糕/寫字盤/靠窗席)
                </label>
                <input
                  type="text"
                  value={editingItem.specialRequest || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, specialRequest: e.target.value })}
                  placeholder="已備註女友生日需寫字盤 + 靠窗夜景席"
                  className="w-full px-3 py-2 rounded-xl border border-rose-200 focus:outline-rose-400 bg-rose-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  必吃招牌菜色
                </label>
                <input
                  type="text"
                  value={editingItem.mustEatDishes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, mustEatDishes: e.target.value })}
                  placeholder="法式黑毛和牛、草莓千層派"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-stone-100">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium shadow-xs shadow-rose-200 cursor-pointer"
              >
                儲存餐廳
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

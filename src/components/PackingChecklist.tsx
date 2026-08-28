import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Camera, 
  Shirt, 
  Sparkle,
  CheckCircle2,
  Lock,
  LogIn
} from 'lucide-react';
import { PackingItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface PackingChecklistProps {
  packingList: PackingItem[];
  onUpdatePacking: (newList: PackingItem[]) => void;
}

export const PackingChecklist: React.FC<PackingChecklistProps> = ({
  packingList,
  onUpdatePacking
}) => {
  const { isAuthorizedEditor, requireAuthOrPrompt, isGuest, login } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<PackingItem['category']>('sweetheart_care');
  const [newItemIsSweetheart, setNewItemIsSweetheart] = useState(true);
  const [newItemNote, setNewItemNote] = useState('');

  const totalItems = packingList.length;
  const checkedItems = packingList.filter(item => item.isChecked).length;
  const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  const categories = [
    { id: 'all', label: '全部清單', icon: '📋' },
    { id: 'sweetheart_care', label: '💖 暖男為女友貼心準備', icon: '💖' },
    { id: 'documents', label: '🛂 護照與證件機票', icon: '🛂' },
    { id: 'outfits', label: '👗 仙氣穿搭與鞋包', icon: '👗' },
    { id: 'electronics', label: '🔌 3C充電與相機', icon: '🔌' },
    { id: 'cosmetics', label: '💄 彩妝保養與面膜', icon: '💄' },
    { id: 'essentials', label: '🧳 兩人日常備品', icon: '🧳' },
  ];

  const filteredItems = packingList.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const toggleCheck = (id: string) => {
    if (!requireAuthOrPrompt('打勾行李準備進度')) {
      return;
    }
    const updated = packingList.map(item =>
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    );
    onUpdatePacking(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuthOrPrompt('新增行李清單項目')) {
      return;
    }
    if (!newItemName.trim()) return;

    const newItem: PackingItem = {
      id: 'pack-' + Date.now(),
      name: newItemName.trim(),
      category: newItemCategory,
      isChecked: false,
      isSweetheartSpecial: newItemIsSweetheart,
      note: newItemNote.trim() || undefined
    };

    onUpdatePacking([newItem, ...packingList]);
    setNewItemName('');
    setNewItemNote('');
  };

  const handleDeleteItem = (id: string) => {
    if (!requireAuthOrPrompt('刪除行李清單項目')) {
      return;
    }
    onUpdatePacking(packingList.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      
      {/* Guest Notice Banner */}
      {isGuest && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5 text-amber-900">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>訪客唯讀狀態：</strong>若您是 <strong>晴寶</strong> 或 <strong>蔡寶</strong>，請登入以打勾同步進度至雲端資料庫。
            </span>
          </div>
          <button
            onClick={() => login()}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-xs flex items-center space-x-1 whitespace-nowrap cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Google 登入</span>
          </button>
        </div>
      )}

      {/* Header & Progress Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-pink-100 text-pink-700">
                <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />
              </span>
              <h2 className="font-serif text-2xl font-bold text-stone-850">
                🧳 行李清單 & 暖男貼心準備備忘錄
              </h2>
            </div>
            <p className="text-stone-700 text-xs sm:text-sm mt-1">
              特別規劃了「為她貼心準備」專區，不漏掉任何讓她感到幸福的小細節。
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:w-64">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-800 mb-1.5">
              <span>準備完成進度</span>
              <span>{checkedItems} / {totalItems} ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2.5 bg-rose-200/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Category Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-rose-500 text-white shadow-xs font-semibold'
                  : 'bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add New Item Input */}
      <form onSubmit={handleAddItem} className="bg-white rounded-2xl p-4 border border-rose-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="➕ 新增行李備品或貼心小物（例如：補妝隨身鏡、保暖圍巾）"
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-rose-400"
        />

        <input
          type="text"
          value={newItemNote}
          onChange={(e) => setNewItemNote(e.target.value)}
          placeholder="備註小語 (選填)"
          className="sm:w-48 px-3 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-rose-400"
        />

        <select
          value={newItemCategory}
          onChange={(e) => setNewItemCategory(e.target.value as PackingItem['category'])}
          className="px-3 py-2.5 rounded-xl border border-stone-200 text-xs bg-white focus:outline-rose-400"
        >
          <option value="sweetheart_care">💖 暖男貼心準備</option>
          <option value="documents">🛂 護照證件機票</option>
          <option value="outfits">👗 仙氣穿搭服飾</option>
          <option value="electronics">🔌 3C充電相機</option>
          <option value="cosmetics">💄 美妝彩妝保養</option>
          <option value="essentials">🧳 兩人日常必備</option>
        </select>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs shadow-rose-200 whitespace-nowrap cursor-pointer"
        >
          加入清單
        </button>
      </form>

      {/* List of Checklist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleCheck(item.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
              item.isChecked
                ? 'bg-stone-50 border-stone-200 opacity-70'
                : item.isSweetheartSpecial
                  ? 'bg-rose-50/50 hover:bg-rose-50 border-pink-200 shadow-2xs'
                  : 'bg-white hover:bg-stone-50 border-stone-200 shadow-2xs'
            }`}
          >
            <div className="flex items-start space-x-3 flex-1">
              <div className="mt-0.5 text-rose-600">
                {item.isChecked ? (
                  <CheckSquare className="w-5 h-5 text-rose-500 fill-rose-100" />
                ) : (
                  <Square className="w-5 h-5 text-stone-400" />
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${item.isChecked ? 'line-through text-stone-400' : 'text-stone-850'}`}>
                    {item.name}
                  </span>

                  {item.isSweetheartSpecial && (
                    <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold">
                      💖 為她準備
                    </span>
                  )}
                </div>

                {item.note && (
                  <p className="text-xs text-stone-700 mt-1">
                    💡 {item.note}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteItem(item.id);
              }}
              className="p-1 text-stone-300 hover:text-rose-600 transition-colors"
              title="刪除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

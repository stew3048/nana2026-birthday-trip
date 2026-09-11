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
  const [newItemCategory, setNewItemCategory] = useState<PackingItem['category']>('essentials');
  const [newItemIsSweetheart, setNewItemIsSweetheart] = useState(false);
  const [newItemNote, setNewItemNote] = useState('');

  const totalItems = packingList.length;
  const checkedItems = packingList.filter(item => item.isChecked).length;
  const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  const categories = [
    { id: 'all', label: '全部清單', icon: '📋' },
    { id: 'sweetheart_care', label: '💖 暖男為女友貼心準備', icon: '💖' },
    { id: 'essentials', label: '🧳 兩人日常備品', icon: '🧳' },
    { id: 'documents', label: '🛂 護照與證件機票', icon: '🛂' },
    { id: 'outfits', label: '👗 仙氣穿搭與鞋包', icon: '👗' },
    { id: 'electronics', label: '🔌 3C充電與相機', icon: '🔌' },
    { id: 'cosmetics', label: '💄 彩妝保養與面膜', icon: '💄' },
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

  const handleCategoryChange = (cat: PackingItem['category']) => {
    setNewItemCategory(cat);
    if (cat === 'sweetheart_care') {
      setNewItemIsSweetheart(true);
    } else {
      setNewItemIsSweetheart(false);
    }
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
      isSweetheartSpecial: newItemIsSweetheart || newItemCategory === 'sweetheart_care',
      note: newItemNote.trim() || undefined
    };

    onUpdatePacking([newItem, ...packingList]);
    setNewItemName('');
    setNewItemNote('');
    setNewItemIsSweetheart(false);
  };

  const handleDeleteItem = (id: string) => {
    if (!requireAuthOrPrompt('刪除行李清單項目')) {
      return;
    }
    onUpdatePacking(packingList.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6 text-[var(--romantic-ink,#0F172A)]">
      
      {/* Guest Notice Banner */}
      {isGuest && (
        <div className="bg-[var(--romantic-gold-light,#FEF3C7)] border border-[var(--romantic-border,#BAE6FD)] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5 text-[var(--romantic-gold,#F59E0B)]">
            <Lock className="w-4 h-4 text-[var(--romantic-gold,#F59E0B)] shrink-0" />
            <span>
              <strong>訪客唯讀狀態：</strong>若您是 <strong>晴寶</strong> 或 <strong>蔡寶</strong>，請登入以打勾同步進度至雲端資料庫。
            </span>
          </div>
          <button
            onClick={() => login()}
            className="px-3.5 py-1.5 rounded-xl btn-romantic-gold text-white font-bold transition-all shadow-xs flex items-center space-x-1 whitespace-nowrap cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Google 登入</span>
          </button>
        </div>
      )}

      {/* Header & Progress Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--romantic-border,#BAE6FD)] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)]">
                <Heart className="w-5 h-5 fill-[var(--romantic-rose,#0284C7)] text-[var(--romantic-rose,#0284C7)]" />
              </span>
              <h2 className="font-serif text-2xl font-bold text-[var(--romantic-ink,#0F172A)]">
                🧳 行李清單 & 暖男貼心準備備忘錄
              </h2>
            </div>
            <p className="text-[var(--romantic-muted,#64748B)] text-xs sm:text-sm mt-1">
              特別規劃了「為她貼心準備」專區，不漏掉任何讓她感到幸福的小細節。
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="bg-[var(--romantic-card-warm,#F8FAFC)] border border-[var(--romantic-border,#BAE6FD)] rounded-2xl p-4 sm:w-64">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--romantic-rose,#0284C7)] mb-1.5">
              <span>準備完成進度</span>
              <span>{checkedItems} / {totalItems} ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--romantic-rose-deep,#0369A1)] to-[var(--romantic-rose,#0284C7)] transition-all duration-500 rounded-full"
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
                  ? 'btn-romantic-primary font-semibold shadow-xs'
                  : 'bg-slate-50 hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)]'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add New Item Input */}
      <form onSubmit={handleAddItem} className="bg-white rounded-2xl p-4 border border-[var(--romantic-border,#BAE6FD)] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="➕ 新增行李備品（例如：保暖外套、隱形眼鏡藥水）"
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
          />

          <input
            type="text"
            value={newItemNote}
            onChange={(e) => setNewItemNote(e.target.value)}
            placeholder="備註小語 (選填)"
            className="sm:w-48 px-3 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-xs font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
          />

          <select
            value={newItemCategory}
            onChange={(e) => handleCategoryChange(e.target.value as PackingItem['category'])}
            className="px-3 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] text-xs bg-white text-[var(--romantic-ink,#0F172A)] font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
          >
            <option value="essentials">🧳 兩人日常必備</option>
            <option value="sweetheart_care">💖 暖男貼心準備</option>
            <option value="documents">🛂 護照證件機票</option>
            <option value="outfits">👗 仙氣穿搭服飾</option>
            <option value="electronics">🔌 3C充電相機</option>
            <option value="cosmetics">💄 美妝彩妝保養</option>
          </select>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl btn-romantic-primary text-white text-xs font-semibold shadow-xs whitespace-nowrap cursor-pointer"
          >
            加入清單
          </button>
        </div>

        {/* Explicit Sweetheart Checkbox */}
        <div className="flex items-center space-x-2 pt-1 border-t border-[var(--romantic-border,#BAE6FD)]">
          <label className="flex items-center space-x-2 text-xs text-[var(--romantic-muted,#64748B)] font-medium cursor-pointer hover:text-[var(--romantic-rose,#0284C7)] select-none">
            <input
              type="checkbox"
              checked={newItemIsSweetheart}
              onChange={(e) => setNewItemIsSweetheart(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--romantic-rose,#0284C7)] focus:ring-[var(--romantic-rose,#0284C7)] cursor-pointer"
            />
            <span className="flex items-center space-x-1">
              <span>💖 標註為「暖男為她貼心準備」專屬小物</span>
              <span className="text-[10px] text-[var(--romantic-muted,#64748B)]/80">（若未勾選則為普通共用備品）</span>
            </span>
          </label>
        </div>
      </form>

      {/* List of Checklist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleCheck(item.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
              item.isChecked
                ? 'bg-slate-50 border-slate-200 opacity-60'
                : item.isSweetheartSpecial
                  ? 'bg-[var(--romantic-rose-light,#F0F9FF)] hover:bg-[var(--romantic-card-warm,#F8FAFC)] border-[var(--romantic-border,#BAE6FD)] shadow-xs'
                  : 'bg-white hover:bg-[var(--romantic-card-warm,#F8FAFC)] border-[var(--romantic-border,#BAE6FD)] shadow-xs'
            }`}
          >
            <div className="flex items-start space-x-3 flex-1">
              <div className="mt-0.5 text-[var(--romantic-rose,#0284C7)]">
                {item.isChecked ? (
                  <CheckSquare className="w-5 h-5 text-[var(--romantic-rose,#0284C7)] fill-[var(--romantic-rose-light,#F0F9FF)]" />
                ) : (
                  <Square className="w-5 h-5 text-[var(--romantic-muted,#64748B)]" />
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${item.isChecked ? 'line-through text-[var(--romantic-muted,#64748B)]' : 'text-[var(--romantic-ink,#0F172A)]'}`}>
                    {item.name}
                  </span>

                  {item.isSweetheartSpecial && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] text-[10px] font-bold">
                      💖 為她準備
                    </span>
                  )}
                </div>

                {item.note && (
                  <p className="text-xs text-[var(--romantic-muted,#64748B)] mt-1">
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
              className="p-1 text-[var(--romantic-muted,#64748B)] hover:text-red-500 transition-colors cursor-pointer"
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

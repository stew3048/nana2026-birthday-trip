import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  PieChart, 
  CreditCard, 
  Sparkles, 
  Heart, 
  Plane, 
  Hotel, 
  Utensils, 
  Ticket, 
  Gift, 
  ShoppingBag, 
  Layers 
} from 'lucide-react';
import { ExpenseItem } from '../types';

interface BudgetTrackerProps {
  expenses: ExpenseItem[];
  onUpdateExpenses: (newExpenses: ExpenseItem[]) => void;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  expenses,
  onUpdateExpenses
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newExpense, setNewExpense] = useState<ExpenseItem>({
    id: '',
    title: '',
    category: 'food',
    amount: 1000,
    currency: 'TWD',
    date: '2026-10-17',
    isPaidByBoyfriend: true,
    notes: ''
  });

  const totalAmount = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const boyfriendPaidAmount = expenses
    .filter(i => i.isPaidByBoyfriend)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const getCategoryIcon = (category: ExpenseItem['category']) => {
    switch (category) {
      case 'flight_transit':
        return <Plane className="w-4 h-4 text-[var(--romantic-gold,#F59E0B)]" />;
      case 'hotel':
        return <Hotel className="w-4 h-4 text-[var(--romantic-rose,#0284C7)]" />;
      case 'food':
        return <Utensils className="w-4 h-4 text-[var(--romantic-rose-deep,#0369A1)]" />;
      case 'tickets':
        return <Ticket className="w-4 h-4 text-[var(--romantic-rose,#0284C7)]" />;
      case 'gifts':
        return <Gift className="w-4 h-4 text-[var(--romantic-gold,#F59E0B)]" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      default:
        return <Layers className="w-4 h-4 text-[var(--romantic-muted,#64748B)]" />;
    }
  };

  const getCategoryLabel = (category: ExpenseItem['category']) => {
    switch (category) {
      case 'flight_transit': return '✈️ 機票交通';
      case 'hotel': return '🏨 住宿飯店';
      case 'food': return '🍽️ 浪漫餐飲';
      case 'tickets': return '🎟️ 門票體驗';
      case 'gifts': return '🎁 驚喜禮物';
      case 'shopping': return '🛍️ 購物紀念';
      default: return '📦 其他支出';
    }
  };

  const handleOpenAdd = () => {
    setNewExpense({
      id: 'exp-' + Date.now(),
      title: '',
      category: 'food',
      amount: 2000,
      currency: 'TWD',
      date: new Date().toISOString().split('T')[0],
      isPaidByBoyfriend: true,
      notes: ''
    });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title.trim()) {
      alert('請填寫支出名稱');
      return;
    }
    onUpdateExpenses([newExpense, ...expenses]);
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    onUpdateExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6 text-[var(--romantic-ink,#0F172A)]">
      
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="btn-romantic-primary text-white rounded-3xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-between opacity-90 text-xs font-semibold mb-2">
            <span>總預算與累計開銷</span>
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            ${totalAmount.toLocaleString()} <span className="text-xs font-sans font-normal opacity-85">TWD</span>
          </div>
          <p className="text-xs text-white/80 mt-2">
            共記錄 {expenses.length} 筆慶生旅行花費
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[var(--romantic-border,#BAE6FD)] shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--romantic-rose,#0284C7)] mb-2">
            <span>💖 男友霸氣全包承諾</span>
            <Heart className="w-4 h-4 text-[var(--romantic-rose,#0284C7)] fill-[var(--romantic-rose,#0284C7)]" />
          </div>
          <div className="font-serif text-3xl sm:text-4xl font-bold text-[var(--romantic-ink,#0F172A)]">
            ${boyfriendPaidAmount.toLocaleString()} <span className="text-xs font-sans font-normal text-[var(--romantic-muted,#64748B)]">TWD</span>
          </div>
          <p className="text-xs text-[var(--romantic-muted,#64748B)] mt-2">
            女友只要負責開心拍美照，一切由男友買單！
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[var(--romantic-border,#BAE6FD)] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--romantic-muted,#64748B)] mb-1">
            <span>快捷操作</span>
            <Sparkles className="w-4 h-4 text-[var(--romantic-gold,#F59E0B)]" />
          </div>
          <p className="text-xs text-[var(--romantic-muted,#64748B)] mb-3">
            隨時記錄高鐵、煙波住宿、慶生晚餐與伴手禮支出。
          </p>
          <button
            onClick={handleOpenAdd}
            className="w-full py-2.5 rounded-xl btn-romantic-primary text-white text-xs font-semibold shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>記下一筆支出</span>
          </button>
        </div>

      </div>

      {/* Expenses Table / List */}
      <div className="bg-white rounded-3xl p-6 border border-[var(--romantic-border,#BAE6FD)] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold text-[var(--romantic-ink,#0F172A)]">
            記帳明細列表
          </h3>
          <span className="text-xs text-[var(--romantic-muted,#64748B)]">
            依新增順序排列
          </span>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 text-center text-[var(--romantic-muted,#64748B)] text-xs">
            目前還沒有記帳紀錄，點擊右上角新增第一筆花費吧！
          </div>
        ) : (
          <div className="divide-y divide-[var(--romantic-border,#BAE6FD)]">
            {expenses.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--romantic-card-warm,#F8FAFC)] px-2 rounded-2xl transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-2xl bg-[var(--romantic-card-warm,#F8FAFC)] border border-[var(--romantic-border,#BAE6FD)] mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-[var(--romantic-ink,#0F172A)]">
                        {item.title}
                      </h4>
                      {item.isPaidByBoyfriend && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] text-[10px] font-bold">
                          💖 男友買單
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--romantic-muted,#64748B)] mt-0.5 flex items-center space-x-2">
                      <span>{getCategoryLabel(item.category)}</span>
                      <span>·</span>
                      <span>{item.date}</span>
                      {item.notes && (
                        <>
                          <span>·</span>
                          <span className="italic text-[var(--romantic-muted,#64748B)]">{item.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 pl-12 sm:pl-0">
                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-[var(--romantic-ink,#0F172A)]">
                      ${Number(item.amount).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[var(--romantic-muted,#64748B)] font-mono">
                      {item.currency}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-[var(--romantic-muted,#64748B)] hover:text-red-500 transition-colors cursor-pointer"
                    title="刪除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <form onSubmit={handleSave} className="bg-white rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl border border-[var(--romantic-border,#BAE6FD)] animate-in fade-in duration-150 space-y-4 text-xs text-[var(--romantic-ink,#0F172A)] max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--romantic-border,#BAE6FD)]">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--romantic-ink,#0F172A)]">
                💰 新增支出紀錄
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-ink,#0F172A)] text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                支出項目名稱 *
              </label>
              <input
                type="text"
                value={newExpense.title}
                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                placeholder="例如：煙波浪漫晚餐、和牛燒肉"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  金額 (數字) *
                </label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] font-mono font-bold text-sm focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  類別
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as ExpenseItem['category'] })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                >
                  <option value="flight_transit">✈️ 高鐵交通</option>
                  <option value="hotel">🏨 煙波飯店</option>
                  <option value="food">🍽️ 浪漫餐飲</option>
                  <option value="tickets">🎟️ 門票體驗</option>
                  <option value="gifts">🎁 驚喜禮物</option>
                  <option value="shopping">🛍️ 府城伴手禮</option>
                  <option value="other">📦 其他支出</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  日期
                </label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  幣別
                </label>
                <select
                  value={newExpense.currency}
                  onChange={(e) => setNewExpense({ ...newExpense, currency: e.target.value as ExpenseItem['currency'] })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                >
                  <option value="TWD">TWD 新台幣</option>
                  <option value="JPY">JPY 日圓</option>
                  <option value="USD">USD 美元</option>
                  <option value="EUR">EUR 歐元</option>
                  <option value="KRW">KRW 韓元</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                備註
              </label>
              <input
                type="text"
                value={newExpense.notes || ''}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                placeholder="含服務費、蔡寶全額已付清"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--romantic-rose-light,#F0F9FF)] border border-[var(--romantic-border,#BAE6FD)]">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newExpense.isPaidByBoyfriend}
                  onChange={(e) => setNewExpense({ ...newExpense, isPaidByBoyfriend: e.target.checked })}
                  className="w-4 h-4 text-[var(--romantic-rose,#0284C7)] rounded-sm focus:ring-[var(--romantic-rose,#0284C7)]"
                />
                <span className="font-semibold text-[var(--romantic-rose-deep,#0369A1)] text-xs">
                  💖 由男友全包買單 (寵愛無價)
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-[var(--romantic-muted,#64748B)] hover:bg-[var(--romantic-card-warm,#F8FAFC)] text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl btn-romantic-primary text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                新增紀錄
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

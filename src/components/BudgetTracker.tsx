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
    date: '2026-09-18',
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
        return <Plane className="w-4 h-4 text-cyan-600" />;
      case 'hotel':
        return <Hotel className="w-4 h-4 text-indigo-600" />;
      case 'food':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'tickets':
        return <Ticket className="w-4 h-4 text-purple-600" />;
      case 'gifts':
        return <Gift className="w-4 h-4 text-pink-600" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      default:
        return <Layers className="w-4 h-4 text-stone-600" />;
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
    <div className="space-y-6">
      
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-3xl p-6 shadow-md shadow-rose-200">
          <div className="flex items-center justify-between opacity-85 text-xs font-semibold mb-2">
            <span>總預算與累計開銷</span>
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            ${totalAmount.toLocaleString()} <span className="text-xs font-sans font-normal opacity-85">TWD</span>
          </div>
          <p className="text-xs text-rose-100 mt-2">
            共記錄 {expenses.length} 筆慶生旅行花費
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-pink-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-pink-700 mb-2">
            <span>💖 男友霸氣全包承諾</span>
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
          </div>
          <div className="font-serif text-3xl sm:text-4xl font-bold text-stone-850">
            ${boyfriendPaidAmount.toLocaleString()} <span className="text-xs font-sans font-normal text-stone-400">TWD</span>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            女友只要負責開心拍美照，一切由男友買單！
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 mb-1">
            <span>快捷操作</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xs text-stone-600 mb-3">
            隨時記錄機票、飯店、米其林晚餐與生日禮物支出。
          </p>
          <button
            onClick={handleOpenAdd}
            className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>記下一筆支出</span>
          </button>
        </div>

      </div>

      {/* Expenses Table / List */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold text-stone-850">
            記帳明細列表
          </h3>
          <span className="text-xs text-stone-400">
            依新增順序排列
          </span>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-xs">
            目前還沒有記帳紀錄，點擊右上角新增第一筆花費吧！
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {expenses.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/80 px-2 rounded-2xl transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-2xl bg-stone-100 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-stone-850">
                        {item.title}
                      </h4>
                      {item.isPaidByBoyfriend && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold">
                          💖 男友買單
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5 flex items-center space-x-2">
                      <span>{getCategoryLabel(item.category)}</span>
                      <span>·</span>
                      <span>{item.date}</span>
                      {item.notes && (
                        <>
                          <span>·</span>
                          <span className="italic">{item.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 pl-12 sm:pl-0">
                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-stone-900">
                      ${Number(item.amount).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-stone-400 font-mono">
                      {item.currency}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-stone-300 hover:text-rose-600 transition-colors"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 space-y-4">
            <h3 className="font-serif text-xl font-bold text-stone-850">
              💰 新增支出紀錄
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                支出項目名稱 *
              </label>
              <input
                type="text"
                value={newExpense.title}
                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                placeholder="例如：晴空塔浪漫景觀晚餐"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400 font-medium"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  金額 (數字)
                </label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  類別
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as ExpenseItem['category'] })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400 bg-white"
                >
                  <option value="flight_transit">✈️ 機票交通</option>
                  <option value="hotel">🏨 住宿飯店</option>
                  <option value="food">🍽️ 浪漫餐飲</option>
                  <option value="tickets">🎟️ 門票體驗</option>
                  <option value="gifts">🎁 驚喜禮物</option>
                  <option value="shopping">🛍️ 購物紀念</option>
                  <option value="other">📦 其他支出</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  日期
                </label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  幣別
                </label>
                <select
                  value={newExpense.currency}
                  onChange={(e) => setNewExpense({ ...newExpense, currency: e.target.value as ExpenseItem['currency'] })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400 bg-white"
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
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                備註
              </label>
              <input
                type="text"
                value={newExpense.notes || ''}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                placeholder="含服務費、全額已付清"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400 text-xs"
              />
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newExpense.isPaidByBoyfriend}
                  onChange={(e) => setNewExpense({ ...newExpense, isPaidByBoyfriend: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded-sm focus:ring-rose-500"
                />
                <span className="font-semibold text-rose-900 text-xs">
                  💖 由男友全包買單 (寵愛無價)
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs shadow-rose-200 cursor-pointer"
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

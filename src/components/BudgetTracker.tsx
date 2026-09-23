import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Edit3,
  CreditCard, 
  Sparkles, 
  Heart, 
  Plane, 
  Hotel, 
  Utensils, 
  Ticket, 
  Gift, 
  ShoppingBag, 
  Layers,
  X,
  Check,
  Calendar
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    setEditingExpense({
      id: 'exp-' + Date.now(),
      title: '',
      category: 'food',
      amount: 1000,
      currency: 'TWD',
      date: '2026-10-17',
      isPaidByBoyfriend: true,
      notes: ''
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ExpenseItem) => {
    setEditingExpense({ ...item });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !editingExpense.title.trim()) {
      alert('請填寫支出項目名稱');
      return;
    }

    if (isEditMode) {
      onUpdateExpenses(expenses.map(e => e.id === editingExpense.id ? editingExpense : e));
    } else {
      onUpdateExpenses([editingExpense, ...expenses]);
    }

    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleDelete = (id: string) => {
    onUpdateExpenses(expenses.filter(e => e.id !== id));
    setDeletingId(null);
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

        <div className="bg-white rounded-3xl p-6 border border-[var(--romantic-border,#BAE6FD)] shadow-xs">
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

        <div className="bg-white rounded-3xl p-6 border border-[var(--romantic-border,#BAE6FD)] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--romantic-muted,#64748B)] mb-1">
              <span>快捷操作</span>
              <Sparkles className="w-4 h-4 text-[var(--romantic-gold,#F59E0B)]" />
            </div>
            <p className="text-xs text-[var(--romantic-muted,#64748B)] mb-3">
              隨時記錄高鐵、煙波住宿、慶生晚餐與伴手禮支出。
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="w-full py-2.5 rounded-xl btn-romantic-primary text-white text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>記下一筆支出</span>
          </button>
        </div>

      </div>

      {/* Expenses Table / List */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[var(--romantic-border,#BAE6FD)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--romantic-ink,#0F172A)]">
              記帳明細列表
            </h3>
            <p className="text-xs text-[var(--romantic-muted,#64748B)] mt-0.5">
              點擊鉛筆圖示即可隨時編輯修改項目名稱、金額、日期或備註
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-3 py-1.5 rounded-xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose-deep,#0369A1)] border border-[var(--romantic-border,#BAE6FD)] text-xs font-bold flex items-center space-x-1 hover:bg-sky-100 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增</span>
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="p-10 text-center text-[var(--romantic-muted,#64748B)] text-xs space-y-2">
            <p className="text-2xl">🧾</p>
            <p className="font-medium">目前還沒有記帳紀錄，點擊右上角新增第一筆花費吧！</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--romantic-border,#BAE6FD)]">
            {expenses.map((item) => (
              <div
                key={item.id}
                className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--romantic-rose-light,#F0F9FF)]/40 px-2.5 sm:px-3 rounded-2xl transition-colors group"
              >
                <div className="flex items-start space-x-3 min-w-0">
                  <div className="p-2.5 rounded-2xl bg-white border border-[var(--romantic-border,#BAE6FD)] mt-0.5 shrink-0 shadow-2xs">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-1.5">
                      <h4 className="text-sm font-bold text-[var(--romantic-ink,#0F172A)] break-words">
                        {item.title}
                      </h4>
                      {item.isPaidByBoyfriend && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] text-[10px] font-bold shrink-0">
                          💖 男友買單
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--romantic-muted,#64748B)] mt-1 flex items-center flex-wrap gap-1.5">
                      <span className="font-medium text-slate-600">{getCategoryLabel(item.category)}</span>
                      <span>·</span>
                      <span className="font-mono">{item.date}</span>
                      {item.notes && (
                        <>
                          <span>·</span>
                          <span className="italic text-[var(--romantic-muted,#64748B)] truncate max-w-[200px] sm:max-w-xs">{item.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 pl-12 sm:pl-0 shrink-0">
                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-[var(--romantic-ink,#0F172A)]">
                      ${Number(item.amount).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[var(--romantic-muted,#64748B)] font-mono">
                      {item.currency}
                    </div>
                  </div>

                  {/* Action buttons: Edit & Delete */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-xl text-slate-500 hover:text-[var(--romantic-rose,#0284C7)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] transition-colors cursor-pointer"
                      title="編輯此筆支出"
                      aria-label="編輯支出"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="刪除此筆支出"
                      aria-label="刪除支出"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && editingExpense && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[var(--romantic-border,#BAE6FD)] max-h-[90vh] sm:max-h-[88vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[var(--romantic-ink,#0F172A)]">
            
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-[var(--romantic-border,#BAE6FD)] flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] flex items-center justify-center text-base shadow-2xs">
                  {isEditMode ? '✏️' : '💰'}
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[var(--romantic-ink,#0F172A)]">
                    {isEditMode ? '編輯花費支出紀錄' : '新增花費支出紀錄'}
                  </h3>
                  <p className="text-[11px] text-[var(--romantic-muted,#64748B)]">
                    {isEditMode ? '修改品項名稱、金額、日期或付款備註' : '記錄旅途中的各項開銷與霸氣買單紀錄'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setEditingExpense(null); }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="關閉"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="expense-form" onSubmit={handleSave} className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-4 text-xs text-[var(--romantic-ink,#0F172A)]">
              
              <div>
                <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1">
                  支出項目名稱 *
                </label>
                <input
                  type="text"
                  required
                  value={editingExpense.title}
                  onChange={(e) => setEditingExpense({ ...editingExpense, title: e.target.value })}
                  placeholder="例如：煙波浪漫晚餐、和牛燒肉、高鐵車票"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1">
                    金額 (數字) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm font-bold">$</span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={1}
                      value={editingExpense.amount}
                      onChange={(e) => setEditingExpense({ ...editingExpense, amount: Number(e.target.value) })}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] font-mono font-bold text-sm focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1">
                    類別
                  </label>
                  <select
                    value={editingExpense.category}
                    onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value as ExpenseItem['category'] })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
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

              {/* Date selection with quick presets */}
              <div>
                <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1">
                  日期
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="date"
                    value={editingExpense.date}
                    onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                  />
                  <select
                    value={editingExpense.currency}
                    onChange={(e) => setEditingExpense({ ...editingExpense, currency: e.target.value as ExpenseItem['currency'] })}
                    className="w-28 px-2 py-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-xs font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)]"
                  >
                    <option value="TWD">TWD 台幣</option>
                    <option value="JPY">JPY 日圓</option>
                    <option value="USD">USD 美元</option>
                    <option value="EUR">EUR 歐元</option>
                    <option value="KRW">KRW 韓元</option>
                  </select>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-[var(--romantic-muted,#64748B)]">行程快捷：</span>
                  {[
                    { label: 'Day 1 (10/16)', date: '2026-10-16' },
                    { label: 'Day 2 (10/17)', date: '2026-10-17' },
                    { label: 'Day 3 (10/18)', date: '2026-10-18' }
                  ].map(d => (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => setEditingExpense({ ...editingExpense, date: d.date })}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                        editingExpense.date === d.date
                          ? 'bg-sky-100 text-sky-800 border-sky-300 font-bold'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1">
                  備註說明 (選填)
                </label>
                <input
                  type="text"
                  value={editingExpense.notes || ''}
                  onChange={(e) => setEditingExpense({ ...editingExpense, notes: e.target.value })}
                  placeholder="例如：含10%服務費、蔡寶全額已付清、預先刷卡"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--romantic-rose-light,#F0F9FF)] border border-[var(--romantic-border,#BAE6FD)]">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingExpense.isPaidByBoyfriend}
                    onChange={(e) => setEditingExpense({ ...editingExpense, isPaidByBoyfriend: e.target.checked })}
                    className="w-4 h-4 text-[var(--romantic-rose,#0284C7)] rounded-sm focus:ring-[var(--romantic-rose,#0284C7)]"
                  />
                  <span className="font-bold text-[var(--romantic-rose-deep,#0369A1)] text-xs">
                    💖 由男友全包買單 (寵愛無價，列入男友付款統計)
                  </span>
                </label>
              </div>

            </form>

            {/* Modal Sticky Footer */}
            <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-[var(--romantic-border,#BAE6FD)] flex items-center justify-end space-x-3 shrink-0">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setEditingExpense(null); }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                form="expense-form"
                className="px-5 py-2 rounded-xl btn-romantic-primary text-white text-xs font-bold cursor-pointer shadow-md flex items-center space-x-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>{isEditMode ? '儲存修改' : '新增紀錄'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

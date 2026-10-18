import React, { useState, useEffect, useRef } from 'react';
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
  Calendar,
  RefreshCw,
  Upload,
  Download,
  ShieldCheck,
  AlertCircle,
  FileText
} from 'lucide-react';
import { ExpenseItem } from '../types';
import { scanAndRecoverUserExpenses, filterOutMockExpenses, isMockExpense } from '../utils/storage';

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

  // Recovery & Backup states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [restoreMessage, setRestoreMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check if any mock items are currently in the list
  const mockCount = expenses.filter(isMockExpense).length;

  // Auto-scan on initial mount if list is currently empty
  useEffect(() => {
    if (expenses.length === 0) {
      const res = scanAndRecoverUserExpenses();
      if (res.found && res.recoveredExpenses.length > 0) {
        onUpdateExpenses(res.recoveredExpenses);
        setRestoreMessage({
          type: 'success',
          text: `🎉 系統已自動從本機歷程備份 (${res.sourceKey || '緩存'}) 為您找回 ${res.recoveredExpenses.length} 筆真實花費紀錄！`
        });
      }
    }
  }, []);

  const handleScanAndRecover = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = scanAndRecoverUserExpenses();
      setIsScanning(false);
      if (res.found && res.recoveredExpenses.length > 0) {
        onUpdateExpenses(res.recoveredExpenses);
        setRestoreMessage({
          type: 'success',
          text: `🎉 成功從本機備份 (${res.sourceKey || '歷史紀錄'}) 復原了 ${res.recoveredExpenses.length} 筆您先前記錄的花費！`
        });
      } else {
        setRestoreMessage({
          type: 'info',
          text: '已完成深度掃描：目前瀏覽器暫存中未搜尋到未備份的舊記帳資料。已確認移除所有非您真實支出的虛擬範本。您可直接點擊「記下一筆支出」新增，或使用 JSON 檔案匯入。'
        });
      }
    }, 300);
  };

  const handlePurgeMockExpenses = () => {
    const cleaned = filterOutMockExpenses(expenses);
    onUpdateExpenses(cleaned);
    setRestoreMessage({
      type: 'success',
      text: `🧹 已為您清除所有非真實的示範虛擬開銷（共 ${mockCount} 筆）！`
    });
  };

  const handleExportExpenses = () => {
    try {
      const dataStr = JSON.stringify(expenses, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `慶生行程花費記帳備份_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('匯出失敗，請手動複製記帳清單');
    }
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) {
      alert('請輸入或貼上 JSON 格式的記帳資料');
      return;
    }
    try {
      const parsed = JSON.parse(importJsonText);
      let list: any[] = [];
      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (parsed && Array.isArray(parsed.expenses)) {
        list = parsed.expenses;
      } else {
        alert('無效的記帳格式，需為包含花費項目的陣列或物件');
        return;
      }

      const validItems: ExpenseItem[] = list
        .filter(i => i && typeof i === 'object' && i.title)
        .map((i, idx) => ({
          id: i.id || `imported-${Date.now()}-${idx}`,
          title: String(i.title).trim(),
          amount: Number(i.amount) || 0,
          category: i.category || 'other',
          date: i.date || '2026-10-17',
          currency: i.currency || 'TWD',
          isPaidByBoyfriend: typeof i.isPaidByBoyfriend === 'boolean' ? i.isPaidByBoyfriend : true,
          notes: i.notes || ''
        }));

      const cleanItems = filterOutMockExpenses(validItems);
      onUpdateExpenses(cleanItems);
      setIsImportModalOpen(false);
      setImportJsonText('');
      setRestoreMessage({
        type: 'success',
        text: `🎉 成功匯入並還原 ${cleanItems.length} 筆記帳紀錄！`
      });
    } catch (err: any) {
      alert('JSON 解析失敗，請確認格式是否正確：' + err.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportJsonText(content);
      }
    };
    reader.readAsText(file);
  };

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
      
      {/* Restore & Feedback Message */}
      {restoreMessage && (
        <div className={`p-4 rounded-2xl flex items-start justify-between gap-3 text-xs border animate-in fade-in duration-200 ${
          restoreMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : restoreMessage.type === 'error'
            ? 'bg-rose-50 text-rose-900 border-rose-200'
            : 'bg-sky-50 text-sky-900 border-sky-200'
        }`}>
          <div className="flex items-start space-x-2 min-w-0">
            {restoreMessage.type === 'success' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
            )}
            <span className="leading-relaxed">{restoreMessage.text}</span>
          </div>
          <button
            onClick={() => setRestoreMessage(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-500 cursor-pointer shrink-0"
            aria-label="關閉訊息"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mock template cleanup notice if any mock item is present */}
      {mockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              偵測到目前清單中含有 <strong>{mockCount}</strong> 筆系統自動產生的示範虛擬開銷（非您真實花費）。
            </span>
          </div>
          <button
            onClick={handlePurgeMockExpenses}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            🧹 一鍵清除示範虛擬開銷
          </button>
        </div>
      )}

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--romantic-ink,#0F172A)]">
              記帳明細列表
            </h3>
            <p className="text-xs text-[var(--romantic-muted,#64748B)] mt-0.5">
              點擊鉛筆圖示即可隨時編輯修改項目名稱、金額、日期或備註
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleScanAndRecover}
              disabled={isScanning}
              title="深度掃描瀏覽器歷程備份，嘗試還原您先前輸入的花費"
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">掃描還原</span>
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              title="匯入 JSON 格式的記帳資料備份檔"
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">匯入</span>
            </button>
            {expenses.length > 0 && (
              <button
                onClick={handleExportExpenses}
                title="下載備份花費記帳 JSON 檔案"
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">備份</span>
              </button>
            )}
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose-deep,#0369A1)] border border-[var(--romantic-border,#BAE6FD)] text-xs font-bold flex items-center space-x-1 hover:bg-sky-100 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增</span>
            </button>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 sm:p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] flex items-center justify-center text-2xl mx-auto shadow-2xs">
              🧾
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="font-bold text-sm text-[var(--romantic-ink,#0F172A)]">
                花費記帳已還原為乾淨清單
              </h4>
              <p className="text-xs text-[var(--romantic-muted,#64748B)] leading-relaxed">
                先前系統更新時誤帶入的 8 筆預設範本（如煙波住宿9600、碳佐麻里4600等非您真正的開銷）已全數從雲端與本地清除。
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                onClick={handleScanAndRecover}
                disabled={isScanning}
                className="px-3.5 py-2 rounded-xl bg-[var(--romantic-rose,#0284C7)] hover:bg-[var(--romantic-rose-deep,#0369A1)] text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? '正在掃描暫存...' : '🔍 掃描還原瀏覽器歷史花費'}</span>
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[var(--romantic-ink,#0F172A)] border border-[var(--romantic-border,#BAE6FD)] font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>📥 匯入 JSON 備份檔</span>
              </button>
              <button
                onClick={handleOpenAdd}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>➕ 記下第一筆真實花費</span>
              </button>
            </div>
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

      {/* Import JSON Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[var(--romantic-border,#BAE6FD)] max-h-[90vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[var(--romantic-ink,#0F172A)]">
            <div className="px-5 sm:px-6 py-4 border-b border-[var(--romantic-border,#BAE6FD)] flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] flex items-center justify-center text-base shadow-2xs">
                  📥
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[var(--romantic-ink,#0F172A)]">
                    匯入記帳備份資料
                  </h3>
                  <p className="text-[11px] text-[var(--romantic-muted,#64748B)]">
                    貼上 JSON 或選擇檔案還原先前儲存的花費
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsImportModalOpen(false); setImportJsonText(''); }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="關閉"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--romantic-ink,#0F172A)]">
                  貼上 JSON 內容或選擇檔案：
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-[var(--romantic-rose,#0284C7)] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>選擇本機 .json 檔</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[&#10;  {&#10;    "title": "高鐵票",&#10;    "amount": 1350,&#10;    "category": "flight_transit",&#10;    "date": "2026-10-16",&#10;    "isPaidByBoyfriend": true&#10;  }&#10;]'
                rows={8}
                className="w-full p-3 font-mono text-xs rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-slate-50 focus:bg-white focus:outline-none focus:border-[var(--romantic-rose,#0284C7)]"
              />

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsImportModalOpen(false); setImportJsonText(''); }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl btn-romantic-primary text-white text-xs font-bold cursor-pointer shadow-md"
                >
                  確認匯入還原
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

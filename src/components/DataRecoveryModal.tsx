import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  RefreshCw, 
  Upload, 
  Download, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  Utensils, 
  CreditCard, 
  CheckSquare, 
  FileText,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { BirthdayTripData, ExpenseItem, DiningItem, PackingItem } from '../types';
import { scanAndRecoverAllTripData, filterOutMockExpenses, exportTripToJson } from '../utils/storage';

interface DataRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripData: BirthdayTripData;
  onRestoreData: (updates: {
    expenses?: ExpenseItem[];
    dining?: DiningItem[];
    packingList?: PackingItem[];
  }) => void;
}

export const DataRecoveryModal: React.FC<DataRecoveryModalProps> = ({
  isOpen,
  onClose,
  tripData,
  onRestoreData
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(() => scanAndRecoverAllTripData());
  const [importJsonText, setImportJsonText] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'scan' | 'import' | 'export'>('scan');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScanResult(scanAndRecoverAllTripData());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRescan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = scanAndRecoverAllTripData();
      setScanResult(res);
      setIsScanning(false);
      if (res.hasData) {
        setToastMessage(`🎉 掃描完成！從本機暫存中找到了先前的自訂資料！`);
      } else {
        setToastMessage(`已完成全域掃描：目前本機暫存未發現其他備份。您可使用 JSON 備份檔匯入。`);
      }
      setTimeout(() => setToastMessage(null), 4000);
    }, 400);
  };

  const handleRestoreAll = () => {
    const updates: {
      expenses?: ExpenseItem[];
      dining?: DiningItem[];
      packingList?: PackingItem[];
    } = {};

    if (scanResult.recoveredExpenses.length > 0) updates.expenses = scanResult.recoveredExpenses;
    if (scanResult.recoveredDining.length > 0) updates.dining = scanResult.recoveredDining;
    if (scanResult.recoveredPackingList.length > 0) updates.packingList = scanResult.recoveredPackingList;

    onRestoreData(updates);
    setToastMessage(`✅ 已成功為您還原所有找到的資料！`);
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 1200);
  };

  const handleRestoreSection = (section: 'expenses' | 'dining' | 'packingList') => {
    if (section === 'expenses' && scanResult.recoveredExpenses.length > 0) {
      onRestoreData({ expenses: scanResult.recoveredExpenses });
      setToastMessage(`✅ 已還原 ${scanResult.recoveredExpenses.length} 筆花費記帳！`);
    } else if (section === 'dining' && scanResult.recoveredDining.length > 0) {
      onRestoreData({ dining: scanResult.recoveredDining });
      setToastMessage(`✅ 已還原 ${scanResult.recoveredDining.length} 筆訂位資訊！`);
    } else if (section === 'packingList' && scanResult.recoveredPackingList.length > 0) {
      onRestoreData({ packingList: scanResult.recoveredPackingList });
      setToastMessage(`✅ 已還原 ${scanResult.recoveredPackingList.length} 筆行李清單！`);
    }
    setTimeout(() => setToastMessage(null), 3500);
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

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) {
      alert('請輸入或貼上 JSON 備份檔內容');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);
      const updates: {
        expenses?: ExpenseItem[];
        dining?: DiningItem[];
        packingList?: PackingItem[];
      } = {};

      let count = 0;

      // Handle full trip data object
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        if (Array.isArray(parsed.expenses) && parsed.expenses.length > 0) {
          updates.expenses = filterOutMockExpenses(parsed.expenses);
          count += updates.expenses.length;
        }
        if (Array.isArray(parsed.dining) && parsed.dining.length > 0) {
          updates.dining = parsed.dining;
          count += updates.dining.length;
        }
        if (Array.isArray(parsed.packingList) && parsed.packingList.length > 0) {
          updates.packingList = parsed.packingList;
          count += updates.packingList.length;
        }
      } else if (Array.isArray(parsed)) {
        // If it's a direct array, infer from first item structure
        const first = parsed[0];
        if (first && typeof first === 'object') {
          if ('amount' in first) {
            updates.expenses = filterOutMockExpenses(parsed);
            count = updates.expenses.length;
          } else if ('mustEatDishes' in first || 'bookingCode' in first || 'status' in first) {
            updates.dining = parsed;
            count = updates.dining.length;
          } else if ('isChecked' in first || 'isSweetheartSpecial' in first) {
            updates.packingList = parsed;
            count = updates.packingList.length;
          } else {
            alert('無法辨識此陣列的項目類別，請確認是否為記帳、訂位或行李清單');
            return;
          }
        }
      }

      if (count === 0 && !updates.expenses && !updates.dining && !updates.packingList) {
        alert('未在貼上的內容中找到記帳、訂位或行李準備清單資料');
        return;
      }

      onRestoreData(updates);
      setToastMessage(`🎉 成功匯入並還原資料！共恢復 ${count} 筆項目！`);
      setImportJsonText('');
      setTimeout(() => {
        setToastMessage(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      alert('JSON 格式錯誤，請檢查內容是否完整：' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[var(--romantic-border,#BAE6FD)] max-h-[92vh] flex flex-col my-auto overflow-hidden text-[var(--romantic-ink,#0F172A)] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[var(--romantic-border,#BAE6FD)] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] flex items-center justify-center text-xl shadow-2xs">
              🛠️
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[var(--romantic-ink,#0F172A)]">
                旅程資料還原與備份中心
              </h3>
              <p className="text-[11px] text-[var(--romantic-muted,#64748B)]">
                搜救與復原花費記帳、訂位管理與行李清單自訂內容
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="關閉"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast / Notification */}
        {toastMessage && (
          <div className="mx-5 mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-100 flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setActiveSubTab('scan')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'scan'
                ? 'border-[var(--romantic-rose,#0284C7)] text-[var(--romantic-rose-deep,#0369A1)]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            🔍 本機歷程深層搜救
          </button>
          <button
            onClick={() => setActiveSubTab('import')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'import'
                ? 'border-[var(--romantic-rose,#0284C7)] text-[var(--romantic-rose-deep,#0369A1)]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            📥 匯入 JSON 備份
          </button>
          <button
            onClick={() => setActiveSubTab('export')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'export'
                ? 'border-[var(--romantic-rose,#0284C7)] text-[var(--romantic-rose-deep,#0369A1)]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            📤 下載旅程備份檔
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          
          {activeSubTab === 'scan' && (
            <div className="space-y-4">
              
              {/* Important security & status announcement */}
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 text-sky-950 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-xs text-sky-900">
                  <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>🔒 Firebase 雲端保護保證</span>
                </div>
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  系統已全面停用背景自動同步。在您主動點擊「還原」或「儲存」之前，<strong>絕不會自動改動您的 Firebase 任何資料</strong>。
                </p>
              </div>

              {/* Scan summary box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <span>本機瀏覽器緩存搜救結果</span>
                    {scanResult.sourceKey && (
                      <span className="text-[10px] font-mono font-normal text-slate-500">
                        (來自: {scanResult.sourceKey})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleRescan}
                    disabled={isScanning}
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center space-x-1 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>{isScanning ? '掃描中...' : '重新掃描'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  
                  {/* Expenses */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold flex items-center space-x-1">
                        <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                        <span>花費記帳</span>
                      </span>
                      <span className="font-bold font-mono text-slate-800">
                        {scanResult.recoveredExpenses.length} 筆
                      </span>
                    </div>
                    {scanResult.recoveredExpenses.length > 0 ? (
                      <button
                        onClick={() => handleRestoreSection('expenses')}
                        className="w-full mt-1.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] transition-colors cursor-pointer"
                      >
                        單獨還原記帳
                      </button>
                    ) : (
                      <div className="text-[10px] text-slate-400 pt-1">未發現歷史項目</div>
                    )}
                  </div>

                  {/* Dining */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold flex items-center space-x-1">
                        <Utensils className="w-3.5 h-3.5 text-sky-500" />
                        <span>訂位資訊</span>
                      </span>
                      <span className="font-bold font-mono text-slate-800">
                        {scanResult.recoveredDining.length} 筆
                      </span>
                    </div>
                    {scanResult.recoveredDining.length > 0 ? (
                      <button
                        onClick={() => handleRestoreSection('dining')}
                        className="w-full mt-1.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                      >
                        單獨還原訂位
                      </button>
                    ) : (
                      <div className="text-[10px] text-slate-400 pt-1">未發現歷史項目</div>
                    )}
                  </div>

                  {/* Packing */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold flex items-center space-x-1">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                        <span>行李清單</span>
                      </span>
                      <span className="font-bold font-mono text-slate-800">
                        {scanResult.recoveredPackingList.length} 筆
                      </span>
                    </div>
                    {scanResult.recoveredPackingList.length > 0 ? (
                      <button
                        onClick={() => handleRestoreSection('packingList')}
                        className="w-full mt-1.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                      >
                        單獨還原行李
                      </button>
                    ) : (
                      <div className="text-[10px] text-slate-400 pt-1">未發現歷史項目</div>
                    )}
                  </div>

                </div>

                {scanResult.hasData ? (
                  <div className="pt-2">
                    <button
                      onClick={handleRestoreAll}
                      className="w-full py-2.5 rounded-xl btn-romantic-primary text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md cursor-pointer hover:shadow-lg transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>一鍵全數還原搜救到的資料</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white border border-dashed border-slate-200 text-center text-slate-500 space-y-1">
                    <p className="font-bold">目前瀏覽器中未發現更多歷史草稿快照</p>
                    <p className="text-[11px] text-slate-400">
                      若您先前有下載過 JSON 備份檔，請切換至上方【📥 匯入 JSON 備份】進行還原。
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {activeSubTab === 'import' && (
            <form onSubmit={handleImportSubmit} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">
                  貼上備份 JSON 或選擇檔案：
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-[var(--romantic-rose,#0284C7)] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>選取 .json 檔案</span>
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
                placeholder='可貼上您先前導出的 JSON 檔案內容，支援完整的旅行檔案或單獨的花費、訂位、行李清單陣列...'
                rows={9}
                className="w-full p-3 font-mono text-xs rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-slate-50 focus:bg-white focus:outline-none focus:border-[var(--romantic-rose,#0284C7)]"
              />

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl btn-romantic-primary text-white font-bold text-xs shadow-md cursor-pointer hover:shadow-lg transition-all flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>確認匯入還原</span>
                </button>
              </div>
            </form>
          )}

          {activeSubTab === 'export' && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-800 text-sm">
                即時備份當前全部旅程資料
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                將當前所有的每日行程、花費記帳、訂位餐廳、行李清單、拍立得回憶與情書設定完整打包為一個安全的 JSON 檔案下載至您的電腦或手機，永遠不怕資料遺失。
              </p>
              <div className="pt-2">
                <button
                  onClick={() => exportTripToJson(tripData)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>立即下載完整旅程備份檔 (.json)</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-[var(--romantic-border,#BAE6FD)] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400">
            蔡寶與晴寶專屬慶生手冊 · 資料安全防護
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer transition-colors"
          >
            關閉
          </button>
        </div>

      </div>
    </div>
  );
};

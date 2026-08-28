import React, { useState } from 'react';
import { 
  Database, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  RefreshCw, 
  ShieldCheck, 
  Cloud, 
  FileJson, 
  ListOrdered,
  Sparkles
} from 'lucide-react';
import { BirthdayTripData } from '../types';
import { syncTripToCloud, fetchTripFromCloud } from '../utils/storage';

interface FirebaseDataInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripData: BirthdayTripData;
  onTripDataUpdated: (data: BirthdayTripData) => void;
}

export const FirebaseDataInspectorModal: React.FC<FirebaseDataInspectorModalProps> = ({
  isOpen,
  onClose,
  tripData,
  onTripDataUpdated,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'json' | 'packing'>('info');

  if (!isOpen) return null;

  const projectId = 'molten-bot-2zp2g';
  const databaseId = 'ai-studio-trip-74d62d6d-e5de-4e2d-89b3-01ad0d0f7315';
  const collectionPath = 'trips/qingbao_tainan_2026';
  const snacksCollectionPath = 'tainan_snacks_votes';
  const consoleUrl = `https://console.firebase.google.com/project/${projectId}/firestore/databases/${databaseId}/data`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(consoleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualUpload = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('正在上傳最新數據至 Firestore 雲端...');
    const success = await syncTripToCloud(tripData);
    setIsSyncing(false);
    if (success) {
      setSyncStatusMsg('✅ 成功寫入 Firestore 資料庫！');
    } else {
      setSyncStatusMsg('❌ 上傳失敗，請確認網路連線');
    }
    setTimeout(() => setSyncStatusMsg(null), 4000);
  };

  const handleManualFetch = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('正在從 Firestore 雲端拉取最新數據...');
    const data = await fetchTripFromCloud();
    setIsSyncing(false);
    if (data) {
      onTripDataUpdated(data);
      setSyncStatusMsg('✅ 成功同步最新雲端行程與準備清單！');
    } else {
      setSyncStatusMsg('ℹ️ 雲端尚無新資料或拉取失敗');
    }
    setTimeout(() => setSyncStatusMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center space-x-2">
                <span>Firebase Firestore 雲端資料庫管理</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  Live Cloud
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                即時儲存行程、行李清單打勾狀態、小吃投票與預算
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center space-x-2 pt-4 pb-2 border-b border-stone-100 text-xs">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'info' ? 'bg-amber-500 text-white font-semibold' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>資料庫位置 & 連結</span>
          </button>
          <button
            onClick={() => setActiveTab('packing')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'packing' ? 'bg-amber-500 text-white font-semibold' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>行李清單同步狀態 ({tripData.packingList.filter(i => i.isChecked).length}/{tripData.packingList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'json' ? 'bg-amber-500 text-white font-semibold' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>即時 JSON 原始數據</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          
          {activeTab === 'info' && (
            <div className="space-y-4">
              
              {/* Cloud Database Info Box */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
                <div className="font-semibold text-amber-950 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Firestore 資料庫配置詳情</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-700">
                  <div className="p-2.5 rounded-xl bg-white border border-amber-200/60 font-mono">
                    <span className="text-stone-400 block text-[10px]">專案 ID (Project ID)</span>
                    <span className="font-bold text-amber-900">{projectId}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-amber-200/60 font-mono">
                    <span className="text-stone-400 block text-[10px]">資料庫 ID (Database ID)</span>
                    <span className="font-bold text-amber-900 truncate block" title={databaseId}>
                      {databaseId}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-amber-200/60 font-mono">
                  <span className="text-stone-400 block text-[10px]">主行程與行李儲存路徑 (Document Path)</span>
                  <span className="font-bold text-rose-700">{collectionPath}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-amber-200/60 font-mono">
                  <span className="text-stone-400 block text-[10px]">台南小吃即時投票集合 (Snacks Collection)</span>
                  <span className="font-bold text-amber-800">{snacksCollectionPath}</span>
                </div>
              </div>

              {/* Firebase Console Direct Link */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="font-semibold text-stone-800 flex items-center justify-between">
                  <span>🌐 如何在 Firebase Console 後台檢視 Data？</span>
                </div>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  您可以直接點擊下方按鈕前往 Google Firebase Console，即可在線上圖形化介面檢視、搜尋與管理全部 Firestore Documents 與 Fields：
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={consoleUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors"
                  >
                    <span>開啟 Firebase Console 檢視資料</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={handleCopyUrl}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '已複製後台網址' : '複製後台連結'}</span>
                  </button>
                </div>
              </div>

              {/* Manual Cloud Sync Actions */}
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/70 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-rose-950">雲端即時同步控制</div>
                  <div className="text-stone-500 text-[11px]">任何一方打勾或修改時，系統皆會自動同步雲端</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleManualFetch}
                    disabled={isSyncing}
                    className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 font-semibold transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>立即拉取最新</span>
                  </button>
                  <button
                    onClick={handleManualUpload}
                    disabled={isSyncing}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <Cloud className="w-3 h-3" />
                    <span>立即上傳覆寫</span>
                  </button>
                </div>
              </div>

              {syncStatusMsg && (
                <div className="p-3 rounded-xl bg-amber-100 text-amber-900 font-medium text-center">
                  {syncStatusMsg}
                </div>
              )}

            </div>
          )}

          {activeTab === 'packing' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <span className="font-semibold text-stone-700">
                  當前行李清單即時打勾狀態（晴寶與蔡寶共同維護）
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                  已完成 {tripData.packingList.filter(i => i.isChecked).length} / {tripData.packingList.length}
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                {tripData.packingList.map((item) => (
                  <div 
                    key={item.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      item.isChecked ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-stone-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={item.isChecked ? 'text-emerald-600 font-bold' : 'text-stone-400'}>
                        {item.isChecked ? '✅' : '⬜'}
                      </span>
                      <span className={item.isChecked ? 'line-through text-stone-400 font-medium' : 'text-stone-800 font-medium'}>
                        {item.name}
                      </span>
                      {item.isSweetheartSpecial && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-pink-100 text-pink-700">
                          💖 為她準備
                        </span>
                      )}
                    </div>
                    {item.note && (
                      <span className="text-[11px] text-stone-500">{item.note}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-stone-500">
                <span>Firestore Document Snapshot:</span>
                <span>大小: ~{(JSON.stringify(tripData).length / 1024).toFixed(1)} KB</span>
              </div>
              <pre className="p-3 bg-stone-900 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-96 leading-relaxed">
                {JSON.stringify(tripData, null, 2)}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold transition-colors cursor-pointer"
          >
            關閉
          </button>
        </div>

      </div>
    </div>
  );
};

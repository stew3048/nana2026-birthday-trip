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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[var(--romantic-border,#BAE6FD)] max-h-[90vh] flex flex-col text-[var(--romantic-ink,#0F172A)]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--romantic-border,#BAE6FD)]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[var(--romantic-ink,#0F172A)] flex items-center space-x-2">
                <span>Firebase Firestore 雲端資料庫管理</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  Live Cloud
                </span>
              </h3>
              <p className="text-xs text-[var(--romantic-muted,#64748B)]">
                即時儲存行程、行李清單打勾狀態、小吃投票與預算
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-ink,#0F172A)] hover:bg-[var(--romantic-card-warm,#F8FAFC)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center space-x-2 pt-4 pb-2 border-b border-[var(--romantic-border,#BAE6FD)] text-xs">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'info' ? 'btn-romantic-primary text-white font-semibold' : 'text-[var(--romantic-muted,#64748B)] hover:bg-[var(--romantic-card-warm,#F8FAFC)]'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>資料庫位置 & 連結</span>
          </button>
          <button
            onClick={() => setActiveTab('packing')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'packing' ? 'btn-romantic-primary text-white font-semibold' : 'text-[var(--romantic-muted,#64748B)] hover:bg-[var(--romantic-card-warm,#F8FAFC)]'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>行李清單同步狀態 ({tripData.packingList.filter(i => i.isChecked).length}/{tripData.packingList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'json' ? 'btn-romantic-primary text-white font-semibold' : 'text-[var(--romantic-muted,#64748B)] hover:bg-[var(--romantic-card-warm,#F8FAFC)]'
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
              <div className="p-4 rounded-2xl bg-[var(--romantic-rose-light,#F0F9FF)] border border-[var(--romantic-border,#BAE6FD)] space-y-2.5">
                <div className="font-semibold text-[var(--romantic-rose,#0284C7)] flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-[var(--romantic-rose,#0284C7)]" />
                  <span>Firestore 資料庫配置詳情</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[var(--romantic-ink,#0F172A)]">
                  <div className="p-2.5 rounded-xl bg-white border border-[var(--romantic-border,#BAE6FD)] font-mono">
                    <span className="text-[var(--romantic-muted,#64748B)] block text-[10px]">專案 ID (Project ID)</span>
                    <span className="font-bold text-[var(--romantic-rose,#0284C7)]">{projectId}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[var(--romantic-border,#BAE6FD)] font-mono">
                    <span className="text-[var(--romantic-muted,#64748B)] block text-[10px]">資料庫 ID (Database ID)</span>
                    <span className="font-bold text-[var(--romantic-rose,#0284C7)] truncate block" title={databaseId}>
                      {databaseId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Console Link & Actions */}
              <div className="p-4 rounded-2xl bg-[var(--romantic-card-warm,#F8FAFC)] border border-[var(--romantic-border,#BAE6FD)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--romantic-ink,#0F172A)]">Firebase 控制台直達網址：</span>
                  <button
                    onClick={handleCopyUrl}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[var(--romantic-border,#BAE6FD)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-rose,#0284C7)] text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '已複製！' : '複製網址'}</span>
                  </button>
                </div>
                <div className="p-2 bg-white rounded-xl border border-[var(--romantic-border,#BAE6FD)] font-mono text-[11px] text-[var(--romantic-muted,#64748B)] break-all select-all">
                  {consoleUrl}
                </div>
                <a
                  href={consoleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl btn-romantic-primary text-white font-semibold flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <span>開啟 Firebase 控制台</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Manual Trigger Sync */}
              <div className="p-4 rounded-2xl bg-white border border-[var(--romantic-border,#BAE6FD)] space-y-2">
                <span className="font-semibold text-[var(--romantic-ink,#0F172A)] block">手動數據同步操作：</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleManualUpload}
                    disabled={isSyncing}
                    className="flex-1 py-2 rounded-xl btn-romantic-primary text-white font-medium flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>上傳至雲端</span>
                  </button>
                  <button
                    onClick={handleManualFetch}
                    disabled={isSyncing}
                    className="flex-1 py-2 rounded-xl bg-[var(--romantic-card-warm,#F8FAFC)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] font-medium flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>從雲端拉取</span>
                  </button>
                </div>
                {syncStatusMsg && (
                  <p className="text-[11px] font-semibold text-[var(--romantic-rose,#0284C7)] text-center pt-1 animate-pulse">
                    {syncStatusMsg}
                  </p>
                )}
              </div>

            </div>
          )}

          {activeTab === 'packing' && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--romantic-muted,#64748B)] mb-2">
                即時比對目前行李清單準備進度，所有打勾動作皆會自動同步寫入 Firestore：
              </p>
              <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                {tripData.packingList.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      item.isChecked
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-[var(--romantic-card-warm,#F8FAFC)] border-[var(--romantic-border,#BAE6FD)] text-[var(--romantic-muted,#64748B)]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs">{item.isChecked ? '✅' : '⬜'}</span>
                      <span className="font-medium">{item.name}</span>
                      {item.isSweetheartSpecial && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] text-[9px] font-bold border border-[var(--romantic-border,#BAE6FD)]">
                          晴寶專屬
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-[var(--romantic-muted,#64748B)]">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-2">
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-2xl font-mono text-[10px] overflow-x-auto max-h-[350px]">
                {JSON.stringify(tripData, null, 2)}
              </pre>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

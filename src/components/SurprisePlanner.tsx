import React, { useState } from 'react';
import { Gift, Lock, Unlock, Plus, Trash2, Edit3, Sparkles, Heart, CheckCircle2, Key, ShieldCheck, Clock } from 'lucide-react';
import { SurpriseItem } from '../types';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { getSurpriseLockStatus } from '../utils/timeLock';

interface SurprisePlannerProps {
  surprises: SurpriseItem[];
  onUpdateSurprises: (newSurprises: SurpriseItem[]) => void;
  secretModePassword?: string;
}

export const SurprisePlanner: React.FC<SurprisePlannerProps> = ({
  surprises,
  onUpdateSurprises,
  secretModePassword = '0520'
}) => {
  const { isBoyfriend, isGirlfriend, effectiveTime, boyfriendForceUnlockAll } = useAuth();
  const [unlockModalItem, setUnlockModalItem] = useState<SurpriseItem | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingSurprise, setEditingSurprise] = useState<SurpriseItem | null>(null);

  const handleOpenUnlockModal = (item: SurpriseItem) => {
    setUnlockModalItem(item);
    setInputCode('');
    setErrorMessage('');
  };

  const handleVerifyCode = () => {
    if (!unlockModalItem) return;
    const correctCode = unlockModalItem.unlockCode || secretModePassword || '0520';

    if (inputCode.trim().toUpperCase() === correctCode.toUpperCase() || inputCode.trim() === '0520') {
      // Success unlock!
      const updated = surprises.map(s => 
        s.id === unlockModalItem.id ? { ...s, isUnlocked: true } : s
      );
      onUpdateSurprises(updated);
      setUnlockModalItem(null);

      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f43f5e', '#fb7185', '#fda4af', '#fef08a']
      });
    } else {
      setErrorMessage('密碼不正確哦，再想想看甜蜜密碼吧 💕 (提示: 試試 0520 或解鎖碼)');
    }
  };

  const handleToggleLockDirect = (id: string) => {
    const updated = surprises.map(s => 
      s.id === id ? { ...s, isUnlocked: !s.isUnlocked } : s
    );
    onUpdateSurprises(updated);
  };

  const handleOpenAdd = () => {
    setEditingSurprise({
      id: 'surp-' + Date.now(),
      title: '',
      timing: 'Day 2 晚上',
      location: '客房內 / 餐廳',
      description: '',
      isUnlocked: false,
      unlockCode: '0520',
      hint: '神秘浪漫時刻，等妳揭曉 💕',
      category: 'gift'
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (item: SurpriseItem) => {
    setEditingSurprise({ ...item });
    setIsEditing(true);
  };

  const handleSaveSurprise = () => {
    if (!editingSurprise) return;
    if (!editingSurprise.title.trim()) {
      alert('請填寫驚喜名稱');
      return;
    }

    const exists = surprises.some(s => s.id === editingSurprise.id);
    let updated: SurpriseItem[];
    if (exists) {
      updated = surprises.map(s => s.id === editingSurprise.id ? editingSurprise : s);
    } else {
      updated = [...surprises, editingSurprise];
    }
    onUpdateSurprises(updated);
    setIsEditing(false);
    setEditingSurprise(null);
  };

  const handleDeleteSurprise = (id: string) => {
    if (confirm('確定要刪除這個驚喜任務嗎？')) {
      onUpdateSurprises(surprises.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-8 -translate-y-4">
          <Gift className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Secret Birthday Quests</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold mb-2">
            🎁 專屬晴寶的神秘驚喜任務
          </h2>
          <p className="text-rose-100 text-sm leading-relaxed mb-6">
            {isBoyfriend 
              ? '👑 男友管理模式：這裡記錄為晴寶秘密安排的各項驚喜環節。各個驚喜將於特定時間或透過專屬密碼向晴寶揭曉！'
              : '✨ 晴寶專屬盲盒：蔡寶為妳精心準備了一連串神秘驚喜，將於特定時刻準時為妳解鎖揭開浪漫謎底！'}
          </p>

          {isBoyfriend && (
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-xl bg-white text-rose-600 hover:bg-rose-50 font-semibold text-xs sm:text-sm shadow-md flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>新增神秘驚喜</span>
            </button>
          )}
        </div>
      </div>

      {/* Surprises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {surprises.map((item) => {
          const lockStatus = getSurpriseLockStatus(item.timing, item.isUnlocked, effectiveTime);
          const isItemUnlocked = boyfriendForceUnlockAll || isBoyfriend || lockStatus.isUnlocked;
          const isRevealedForGirlfriend = item.isUnlocked || lockStatus.isUnlocked;

          return (
            <div
              key={item.id}
              className={`rounded-3xl p-6 border transition-all ${
                isRevealedForGirlfriend
                  ? 'bg-white border-rose-200 shadow-md'
                  : 'bg-gradient-to-br from-stone-900 to-stone-850 text-white border-stone-700 shadow-xl'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`p-2.5 rounded-2xl ${
                    isRevealedForGirlfriend 
                      ? 'bg-rose-100 text-rose-600' 
                      : 'bg-stone-800 text-rose-400 border border-stone-700'
                  }`}>
                    <Gift className="w-5 h-5" />
                  </span>
                  <div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isRevealedForGirlfriend
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-pink-900/60 text-pink-300 border border-pink-700/50'
                    }`}>
                      {isRevealedForGirlfriend ? '✨ 已揭曉驚喜' : '🔒 神秘封存中'}
                    </span>
                    <div className={`text-xs mt-0.5 ${isRevealedForGirlfriend ? 'text-stone-700' : 'text-stone-300'}`}>
                      ⏰ {item.timing} · 📍 {item.location}
                    </div>
                  </div>
                </div>

                {/* Boyfriend Controls */}
                {isBoyfriend && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleToggleLockDirect(item.id)}
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        item.isUnlocked
                          ? 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                      }`}
                      title={item.isUnlocked ? '重新上鎖' : '免密碼直接解鎖'}
                    >
                      {item.isUnlocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        item.isUnlocked
                          ? 'text-stone-400 hover:text-rose-600 hover:bg-stone-100'
                          : 'text-stone-400 hover:text-rose-400 hover:bg-stone-800'
                      }`}
                      title="編輯驚喜"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSurprise(item.id)}
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        item.isUnlocked
                          ? 'text-stone-400 hover:text-rose-600 hover:bg-stone-100'
                          : 'text-stone-400 hover:text-rose-400 hover:bg-stone-800'
                      }`}
                      title="刪除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Content Display */}
              {(isRevealedForGirlfriend || isBoyfriend) ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-serif text-xl font-bold ${isRevealedForGirlfriend ? 'text-stone-850' : 'text-stone-100'}`}>
                      {item.title}
                    </h3>
                    {!isRevealedForGirlfriend && isBoyfriend && (
                      <span className="text-[11px] text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full">
                        👑 晴寶視角封存中 (解鎖時間: {lockStatus.formattedUnlockTime})
                      </span>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${isRevealedForGirlfriend ? 'text-stone-700' : 'text-stone-300'}`}>
                    {item.description}
                  </p>
                  <div className={`p-3 rounded-xl border text-xs flex items-center space-x-1.5 ${
                    isRevealedForGirlfriend 
                      ? 'bg-rose-50 border-rose-100 text-rose-700' 
                      : 'bg-stone-800/80 border-stone-700 text-pink-300'
                  }`}>
                    <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>線索提示：{item.hint}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-200">
                      🔒 神秘驚喜任務 #{item.id.slice(-3)}
                    </h3>
                    <p className="text-pink-300 text-sm italic mt-1.5 leading-relaxed">
                      「{item.hint || '浪漫驚喜準備中，等待專屬時刻由蔡寶為妳揭曉！'}」
                    </p>
                    <div className="text-[11px] text-stone-400 mt-2 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-pink-400" />
                      <span>預計解鎖：{lockStatus.formattedUnlockTime}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleOpenUnlockModal(item)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs sm:text-sm shadow-md shadow-rose-900/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <Key className="w-4 h-4" />
                      <span>輸入通關密語解鎖驚喜</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unlock Password Modal */}
      {unlockModalItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-200 text-center animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Key className="w-7 h-7" />
            </div>

            <h3 className="font-serif text-xl font-bold text-stone-850 mb-1">
              解鎖神秘生日驚喜
            </h3>
            <p className="text-stone-500 text-xs mb-4">
              線索提示：「{unlockModalItem.hint}」
            </p>

            <div className="space-y-3 mb-6">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="輸入甜蜜密碼 (如: 0520 或紀念日)"
                className="w-full px-4 py-3 rounded-2xl border-2 border-rose-200 text-center font-mono text-lg font-bold text-rose-600 focus:outline-rose-400 focus:border-rose-400 tracking-widest uppercase"
                autoFocus
              />
              {errorMessage && (
                <div className="text-xs text-rose-600 font-medium">
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setUnlockModalItem(null)}
                className="flex-1 py-2.5 rounded-xl text-stone-500 hover:bg-stone-100 text-xs font-medium cursor-pointer"
              >
                稍後再解
              </button>
              <button
                onClick={handleVerifyCode}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-200 cursor-pointer"
              >
                確認解鎖 ✨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Surprise Modal */}
      {isEditing && editingSurprise && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <h3 className="font-serif text-xl font-bold text-stone-850 mb-4">
              🎁 規劃神秘生日驚喜
            </h3>

            <div className="space-y-4 text-sm text-stone-700">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  驚喜名稱 (解鎖後顯示) *
                </label>
                <input
                  type="text"
                  value={editingSurprise.title}
                  onChange={(e) => setEditingSurprise({ ...editingSurprise, title: e.target.value })}
                  placeholder="例如：河口湖溫泉旅館：管家手作草莓蛋糕 & 星空告白"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    預定時機 (例如 Day 2 晚上)
                  </label>
                  <input
                    type="text"
                    value={editingSurprise.timing}
                    onChange={(e) => setEditingSurprise({ ...editingSurprise, timing: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    地點
                  </label>
                  <input
                    type="text"
                    value={editingSurprise.location}
                    onChange={(e) => setEditingSurprise({ ...editingSurprise, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  給女友看的神秘線索提示 (未解鎖時顯示)
                </label>
                <input
                  type="text"
                  value={editingSurprise.hint}
                  onChange={(e) => setEditingSurprise({ ...editingSurprise, hint: e.target.value })}
                  placeholder="例如：藏在男友行李箱深處的秘密寶物 🎁"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  詳細內容與執行劇本 (解鎖後顯示)
                </label>
                <textarea
                  value={editingSurprise.description}
                  onChange={(e) => setEditingSurprise({ ...editingSurprise, description: e.target.value })}
                  rows={3}
                  placeholder="詳細說明驚喜的進行方式、送出禮物的時機與祝福..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  解鎖密碼 (預設: 0520)
                </label>
                <input
                  type="text"
                  value={editingSurprise.unlockCode || '0520'}
                  onChange={(e) => setEditingSurprise({ ...editingSurprise, unlockCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-rose-400 font-mono font-bold"
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
                onClick={handleSaveSurprise}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium shadow-xs shadow-rose-200 cursor-pointer"
              >
                儲存驚喜
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

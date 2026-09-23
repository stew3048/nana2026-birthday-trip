import React, { useState } from 'react';
import { Gift, Lock, Unlock, Plus, Trash2, Edit3, Sparkles, Heart, CheckCircle2, Key, ShieldCheck, Clock, RotateCcw, Bell, Calendar, X, Check } from 'lucide-react';
import { SurpriseItem } from '../types';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { getSurpriseLockStatus, sortSurprisesByStartTime } from '../utils/timeLock';

interface SurprisePlannerProps {
  surprises: SurpriseItem[];
  onUpdateSurprises: (newSurprises: SurpriseItem[]) => void;
  secretModePassword?: string;
  onCreateAlertCard?: (surprise: SurpriseItem) => void;
}

export const SurprisePlanner: React.FC<SurprisePlannerProps> = ({
  surprises,
  onUpdateSurprises,
  secretModePassword = '0520',
  onCreateAlertCard
}) => {
  const { isBoyfriend, isGirlfriend, effectiveTime, boyfriendForceUnlockAll } = useAuth();
  const [sessionUnlockedIds, setSessionUnlockedIds] = useState<string[]>([]);
  const [unlockModalItem, setUnlockModalItem] = useState<SurpriseItem | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingSurprise, setEditingSurprise] = useState<SurpriseItem | null>(null);
  const [deletingSurprise, setDeletingSurprise] = useState<SurpriseItem | null>(null);

  const handleResetSurpriseStates = () => {
    setSessionUnlockedIds([]);
    try {
      sessionStorage.removeItem('qingbao_unlocked_surprises');
      sessionStorage.removeItem('qingbao_dismissed_alerts');
      localStorage.removeItem('qingbao_dismissed_alerts');
    } catch (e) {}

    const updated = surprises.map(s => ({ ...s, isUnlocked: false }));
    onUpdateSurprises(updated);
    alert('✨ 已重置所有驚喜為「秘密封存」狀態！可重新進行解鎖與提醒測試。');
  };

  const handleOpenUnlockModal = (item: SurpriseItem) => {
    setUnlockModalItem(item);
    setInputCode('');
    setErrorMessage('');
  };

  const handleVerifyCode = () => {
    if (!unlockModalItem) return;
    const correctCode = unlockModalItem.unlockCode || secretModePassword || '0520';

    if (inputCode.trim().toUpperCase() === correctCode.toUpperCase() || inputCode.trim() === '0520' || inputCode.trim() === '1017' || inputCode.trim() === 'LOVE') {
      setSessionUnlockedIds(prev => [...prev, unlockModalItem.id]);
      const updated = surprises.map(s => 
        s.id === unlockModalItem.id ? { ...s, isUnlocked: true } : s
      );
      onUpdateSurprises(updated);
      setUnlockModalItem(null);

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#ba5444', '#c5a059', '#e8dfc8', '#4a3b32']
        });
        setTimeout(() => {
          try {
            confetti.reset();
          } catch (e) {}
        }, 2500);
      } catch (e) {}
    } else {
      setErrorMessage('密碼不正確哦，再想想看甜蜜密碼吧 💕 (提示: 試試 0520 或 1017)');
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
      timing: 'Day 2 18:00 (10/17)',
      date: '2026-10-17',
      time: '18:00',
      dayNumber: 2,
      location: '煙波客房 / 浪漫餐廳',
      description: '',
      isUnlocked: false,
      unlockCode: '0520',
      hint: '神秘浪漫時刻，等妳親自揭曉 💕',
      category: 'gift'
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (item: SurpriseItem) => {
    let date = item.date;
    let time = item.time;
    if (!date) {
      if (item.dayNumber === 1 || (item.timing && (item.timing.includes('Day 1') || item.timing.includes('10/16')))) {
        date = '2026-10-16';
      } else if (item.dayNumber === 3 || (item.timing && (item.timing.includes('Day 3') || item.timing.includes('10/18')))) {
        date = '2026-10-18';
      } else {
        date = '2026-10-17';
      }
    }
    if (!time) {
      const match = (item.timing || '').match(/(\d{1,2}:\d{2})/);
      time = match ? match[1] : '18:00';
    }
    setEditingSurprise({
      ...item,
      date,
      time,
      dayNumber: item.dayNumber || (date === '2026-10-16' ? 1 : date === '2026-10-18' ? 3 : 2)
    });
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
    onUpdateSurprises(sortSurprisesByStartTime(updated));
    setIsEditing(false);
    setEditingSurprise(null);
  };

  const handleDeleteSurprise = (item: SurpriseItem) => {
    setDeletingSurprise(item);
  };

  const confirmDeleteSurprise = () => {
    if (!deletingSurprise) return;
    onUpdateSurprises(surprises.filter(s => s.id !== deletingSurprise.id));
    setDeletingSurprise(null);
    if (isEditing && editingSurprise?.id === deletingSurprise.id) {
      setIsEditing(false);
      setEditingSurprise(null);
    }
  };

  return (
    <div className="space-y-6 text-[#2C221E]">
      
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-[var(--romantic-rose,#0284C7)] via-[var(--romantic-rose-hover,#0369A1)] to-[var(--romantic-rose,#0284C7)] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-8 -translate-y-4">
          <Gift className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Secret Birthday Quests</span>
            <span className="opacity-60">·</span>
            <Clock className="w-3 h-3 text-amber-200" />
            <span>按開始時間排序</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold mb-2 text-white">
            🎁 專屬晴寶的神秘驚喜任務
          </h2>
          <p className="text-white/90 text-sm leading-relaxed mb-6">
            {isBoyfriend 
              ? '👑 男友管理模式：這裡記錄為晴寶秘密安排的各項驚喜環節。各個驚喜將於特定時間或透過專屬密碼向晴寶揭曉！'
              : '✨ 晴寶專屬盲盒：蔡寶為妳精心準備了一連串神秘驚喜，將於特定時刻準時為妳解鎖揭開浪漫謎底！'}
          </p>

          {isBoyfriend && (
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <button
                onClick={handleOpenAdd}
                className="px-5 py-2.5 rounded-xl bg-white text-[var(--romantic-rose,#0284C7)] hover:bg-white/90 font-semibold text-xs sm:text-sm shadow-md flex items-center space-x-2 transition-all cursor-pointer border border-white/20"
              >
                <Plus className="w-4 h-4" />
                <span>新增神秘驚喜</span>
              </button>

              <button
                onClick={handleResetSurpriseStates}
                className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center space-x-2 transition-all cursor-pointer border border-white/30 backdrop-blur-xs"
                title="重新鎖定所有驚喜與清除已讀快取，方便重新測試"
              >
                <RotateCcw className="w-4 h-4" />
                <span>重置驚喜鎖定</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Surprises Grid (Strictly sorted by start time) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sortSurprisesByStartTime(surprises).map((item) => {
          const lockStatus = getSurpriseLockStatus(item.timing, effectiveTime, false);
          const isUnlockedBySession = sessionUnlockedIds.includes(item.id);
          const isRevealedForGirlfriend = boyfriendForceUnlockAll || lockStatus.isUnlocked || isUnlockedBySession;

          return (
            <div
              key={item.id}
              className={`rounded-3xl p-6 border transition-all ${
                isRevealedForGirlfriend
                  ? 'bg-white border-[var(--romantic-border,#BAE6FD)] shadow-sm text-[var(--romantic-ink,#0F172A)]'
                  : 'bg-slate-900 text-slate-100 border-slate-700 shadow-xl'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`p-2.5 rounded-2xl ${
                    isRevealedForGirlfriend 
                      ? 'bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)]' 
                      : 'bg-slate-800 text-[var(--romantic-rose,#0284C7)] border border-slate-700'
                  }`}>
                    <Gift className="w-5 h-5" />
                  </span>
                  <div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isRevealedForGirlfriend
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {isRevealedForGirlfriend ? '✨ 已揭曉驚喜' : '🔒 神秘封存中'}
                    </span>
                    <div className={`text-xs mt-0.5 ${isRevealedForGirlfriend ? 'text-[var(--romantic-muted,#64748B)]' : 'text-slate-400'}`}>
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
                          ? 'text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-ink,#0F172A)] hover:bg-[var(--romantic-rose-light,#F0F9FF)]'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title={item.isUnlocked ? '重新上鎖' : '免密碼直接解鎖'}
                    >
                      {item.isUnlocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                    {onCreateAlertCard && (
                      <button
                        onClick={() => onCreateAlertCard(item)}
                        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center space-x-1 ${
                          item.isUnlocked
                            ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                            : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800'
                        }`}
                        title="轉為專屬即時驚喜推播卡片"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px] font-medium">轉為推播卡片</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        item.isUnlocked
                          ? 'text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-rose,#0284C7)] hover:bg-[var(--romantic-rose-light,#F0F9FF)]'
                          : 'text-slate-400 hover:text-[var(--romantic-rose,#0284C7)] hover:bg-slate-800'
                      }`}
                      title="編輯驚喜"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSurprise(item)}
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        item.isUnlocked
                          ? 'text-[var(--romantic-muted,#64748B)] hover:text-rose-600 hover:bg-rose-50'
                          : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
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
                    <h3 className={`font-serif text-xl font-bold ${isRevealedForGirlfriend ? 'text-[var(--romantic-ink,#0F172A)]' : 'text-white'}`}>
                      {item.title}
                    </h3>
                    {!isRevealedForGirlfriend && isBoyfriend && (
                      <span className="text-[11px] text-amber-300 bg-amber-950 border border-amber-800 px-2 py-0.5 rounded-full">
                        👑 晴寶視角封存中 (解鎖時間: {lockStatus.formattedUnlockTime})
                      </span>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${isRevealedForGirlfriend ? 'text-[var(--romantic-muted,#64748B)]' : 'text-slate-300'}`}>
                    {item.description}
                  </p>
                  <div className={`p-3 rounded-xl border text-xs flex items-center space-x-1.5 ${
                    isRevealedForGirlfriend 
                      ? 'bg-[var(--romantic-rose-light,#F0F9FF)] border-[var(--romantic-border,#BAE6FD)] text-[var(--romantic-rose,#0284C7)]' 
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}>
                    <Sparkles className="w-4 h-4 text-[var(--romantic-gold,#F59E0B)] shrink-0" />
                    <span>線索提示：{item.hint}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white">
                      🔒 神秘驚喜任務 #{item.id.slice(-3)}
                    </h3>
                    <p className="text-[var(--romantic-rose-light,#F0F9FF)] text-sm italic mt-1.5 leading-relaxed">
                      「{item.hint || '浪漫驚喜準備中，等待專屬時刻由蔡寶為妳揭曉！'}」
                    </p>
                    <div className="text-[11px] text-slate-400 mt-2 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[var(--romantic-gold,#F59E0B)]" />
                      <span>預計解鎖：{lockStatus.formattedUnlockTime}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleOpenUnlockModal(item)}
                      className="w-full py-2.5 rounded-xl btn-romantic-primary text-white font-medium text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[var(--romantic-border,#BAE6FD)] text-center animate-in fade-in duration-150">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] flex items-center justify-center mb-4">
              <Key className="w-7 h-7" />
            </div>

            <h3 className="font-serif text-xl font-bold text-[var(--romantic-ink,#0F172A)] mb-1">
              解鎖神秘生日驚喜
            </h3>
            <p className="text-[var(--romantic-muted,#64748B)] text-xs mb-4">
              線索提示：「{unlockModalItem.hint}」
            </p>

            <div className="space-y-3 mb-6">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="輸入甜蜜密碼 (如: 0520 或紀念日)"
                className="w-full px-4 py-3 rounded-2xl border-2 border-[var(--romantic-border,#BAE6FD)] bg-white text-center font-mono text-lg font-bold text-[var(--romantic-rose,#0284C7)] focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-2 focus:ring-[var(--romantic-rose,#0284C7)]/20 tracking-widest uppercase"
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
                className="flex-1 py-2.5 rounded-xl text-[var(--romantic-muted,#64748B)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-xs font-medium cursor-pointer border border-[var(--romantic-border,#BAE6FD)]"
              >
                稍後再解
              </button>
              <button
                onClick={handleVerifyCode}
                className="flex-1 py-2.5 rounded-xl btn-romantic-primary text-white text-xs font-semibold shadow-md cursor-pointer"
              >
                確認解鎖 ✨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Surprise Modal */}
      {isEditing && editingSurprise && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[var(--romantic-border,#BAE6FD)] max-h-[90vh] sm:max-h-[88vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[var(--romantic-ink,#0F172A)]">
            
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-[var(--romantic-border,#BAE6FD)] flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] flex items-center justify-center text-base shadow-2xs">
                  🎁
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[var(--romantic-ink,#0F172A)]">
                    {editingSurprise.id?.startsWith('surp-custom') || !editingSurprise.id ? '新增神秘生日驚喜' : '編輯神秘生日驚喜'}
                  </h3>
                  <p className="text-[11px] text-[var(--romantic-muted,#64748B)]">
                    為晴寶規劃專屬驚喜，設定發生時機與解鎖提示
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsEditing(false); setEditingSurprise(null); }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="關閉"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-4 text-xs text-[var(--romantic-ink,#0F172A)]">
              {/* Surprise Title */}
              <div>
                <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1.5 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)]" />
                  <span>驚喜名稱 (解鎖後顯示) *</span>
                </label>
                <input
                  type="text"
                  value={editingSurprise.title}
                  onChange={(e) => setEditingSurprise({ ...editingSurprise, title: e.target.value })}
                  placeholder="例如：特約密醫看診·客房專屬特診"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>

              {/* Date and Time Selection */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-[var(--romantic-border,#BAE6FD)] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--romantic-ink,#0F172A)] flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-[var(--romantic-rose,#0284C7)]" />
                    <span>發生日期與時間 (按時間排序依據) *</span>
                  </label>
                  <span className="text-[10px] text-[var(--romantic-rose-deep,#0369A1)] font-mono font-bold">
                    Day {editingSurprise.dayNumber || 2} · {editingSurprise.time || '18:00'}
                  </span>
                </div>

                {/* Day selector shortcuts */}
                <div>
                  <div className="text-[11px] text-[var(--romantic-muted,#64748B)] mb-1">
                    快速選擇行程日：
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { dayNum: 1, date: '2026-10-16', label: 'Day 1 · 10/16 (五)' },
                      { dayNum: 2, date: '2026-10-17', label: 'Day 2 · 10/17 🎂' },
                      { dayNum: 3, date: '2026-10-18', label: 'Day 3 · 10/18 (日)' }
                    ].map((d) => {
                      const isSelected = editingSurprise.date === d.date || editingSurprise.dayNumber === d.dayNum;
                      return (
                        <button
                          key={d.dayNum}
                          type="button"
                          onClick={() => {
                            const newDate = d.date;
                            const newDayNum = d.dayNum;
                            const newTiming = `Day ${newDayNum} ${editingSurprise.time || '18:00'} (${d.date.slice(5).replace('-', '/')})`;
                            setEditingSurprise({
                              ...editingSurprise,
                              date: newDate,
                              dayNumber: newDayNum,
                              timing: newTiming
                            });
                          }}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                            isSelected
                              ? 'bg-[var(--romantic-rose,#0284C7)] text-white border-transparent shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-[var(--romantic-ink,#0F172A)] border-slate-200'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date & Time Picker inputs */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--romantic-muted,#64748B)] mb-1">
                      選擇日期
                    </label>
                    <input
                      type="date"
                      value={editingSurprise.date || '2026-10-17'}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        const dayNum = newDate === '2026-10-16' ? 1 : newDate === '2026-10-18' ? 3 : 2;
                        const newTiming = `Day ${dayNum} ${editingSurprise.time || '18:00'} (${newDate.slice(5).replace('-', '/')})`;
                        setEditingSurprise({
                          ...editingSurprise,
                          date: newDate,
                          dayNumber: dayNum,
                          timing: newTiming
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-xs font-mono font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--romantic-muted,#64748B)] mb-1">
                      選擇時間
                    </label>
                    <input
                      type="time"
                      value={editingSurprise.time || '18:00'}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        const dayNum = editingSurprise.dayNumber || 2;
                        const dateStr = editingSurprise.date ? ` (${editingSurprise.date.slice(5).replace('-', '/')})` : '';
                        const newTiming = `Day ${dayNum} ${newTime}${dateStr}`;
                        setEditingSurprise({
                          ...editingSurprise,
                          time: newTime,
                          timing: newTiming
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-xs font-mono font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Quick Time Shortcuts */}
                <div>
                  <div className="text-[11px] text-[var(--romantic-muted,#64748B)] mb-1">
                    常用時段快捷填入：
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { time: '00:00', label: '00:00 跨日整點' },
                      { time: '08:30', label: '08:30 早晨' },
                      { time: '12:00', label: '12:00 午餐' },
                      { time: '15:00', label: '15:00 午後' },
                      { time: '18:00', label: '18:00 晚餐' },
                      { time: '20:30', label: '20:30 夜間放鬆' },
                      { time: '23:00', label: '23:00 深夜特診' }
                    ].map((t) => (
                      <button
                        key={t.time}
                        type="button"
                        onClick={() => {
                          const dayNum = editingSurprise.dayNumber || 2;
                          const dateStr = editingSurprise.date ? ` (${editingSurprise.date.slice(5).replace('-', '/')})` : '';
                          setEditingSurprise({
                            ...editingSurprise,
                            time: t.time,
                            timing: `Day ${dayNum} ${t.time}${dateStr}`
                          });
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          editingSurprise.time === t.time
                            ? 'bg-sky-100 text-sky-800 border-sky-300 font-bold'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timing text display & fine-tuning */}
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--romantic-muted,#64748B)] mb-1">
                    卡片顯示時機文字 (自動同步，亦可自行微調)
                  </label>
                  <input
                    type="text"
                    value={editingSurprise.timing || ''}
                    onChange={(e) => setEditingSurprise({ ...editingSurprise, timing: e.target.value })}
                    placeholder="例如：Day 2 18:00 (10/17)"
                    className="w-full px-3 py-1.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-xs font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)]"
                  />
                </div>
              </div>

              {/* Location & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                    地點
                  </label>
                  <input
                    type="text"
                    value={editingSurprise.location}
                    onChange={(e) => setEditingSurprise({ ...editingSurprise, location: e.target.value })}
                    placeholder="例如：煙波客房 / 浪漫餐廳"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                    驚喜類型
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { key: 'gift', label: '🎁 禮物' },
                      { key: 'cake', label: '🎂 慶生' },
                      { key: 'activity', label: '🗝️ 冒險' },
                      { key: 'letter', label: '💌 走心' },
                      { key: 'memory', label: '📸 回憶' }
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setEditingSurprise({ ...editingSurprise, category: cat.key as any })}
                        className={`py-1 px-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer text-center ${
                          editingSurprise.category === cat.key
                            ? 'bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose-deep,#0369A1)] border-[var(--romantic-rose,#0284C7)] font-bold shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  詳細安排與秘密備忘 (解鎖後顯示)
                </label>
                <textarea
                  rows={3}
                  value={editingSurprise.description}
                  onChange={(e) => setEditingSurprise({ ...editingSurprise, description: e.target.value })}
                  placeholder="說明這個驚喜的進行方式..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  神秘提示 (解鎖前晴寶看見的文字)
                </label>
                <input
                  type="text"
                  value={editingSurprise.hint}
                  onChange={(e) => setEditingSurprise({ ...editingSurprise, hint: e.target.value })}
                  placeholder="例如：深夜時段有位神秘醫師要親自看診..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--romantic-ink,#0F172A)] mb-1">
                  手動通關密語 (選填)
                </label>
                <input
                  type="text"
                  value={editingSurprise.unlockCode || ''}
                  onChange={(e) => setEditingSurprise({ ...editingSurprise, unlockCode: e.target.value })}
                  placeholder="預設 0520 或 1017"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>
            </div>

            {/* Modal Sticky Footer */}
            <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-[var(--romantic-border,#BAE6FD)] flex items-center justify-end space-x-3 shrink-0">
              <button
                type="button"
                onClick={() => { setIsEditing(false); setEditingSurprise(null); }}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveSurprise}
                className="px-5 py-2 rounded-xl btn-romantic-primary text-white text-xs font-bold cursor-pointer shadow-md flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>儲存驚喜</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSurprise && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[var(--romantic-border,#BAE6FD)] text-center animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[var(--romantic-ink,#0F172A)] mb-2">
              確定要刪除此驚喜嗎？
            </h3>
            <p className="text-sm text-[var(--romantic-muted,#64748B)] mb-1">
              驚喜項目：<strong className="text-[var(--romantic-ink,#0F172A)] font-semibold">{deletingSurprise.title}</strong>
            </p>
            <p className="text-xs text-[var(--romantic-muted,#64748B)] mb-6">
              時間：{deletingSurprise.timing} · 地點：{deletingSurprise.location}
            </p>
            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setDeletingSurprise(null)}
                className="px-5 py-2.5 rounded-xl text-[var(--romantic-muted,#64748B)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-xs font-semibold cursor-pointer border border-[var(--romantic-border,#BAE6FD)]"
              >
                取消保留
              </button>
              <button
                type="button"
                onClick={confirmDeleteSurprise}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>確認刪除驚喜</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

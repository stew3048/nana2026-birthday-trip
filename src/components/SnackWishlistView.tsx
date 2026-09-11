import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Sparkles, 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Flame, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  Cloud,
  Check,
  Award,
  UtensilsCrossed,
  MessageCircleHeart,
  Users,
  Info,
  Star
} from 'lucide-react';
import { SnackVoteItem, DEFAULT_TAINAN_SNACKS, subscribeToSnacks, updateSnackVote, addCustomSnack, deleteSnackItem } from '../lib/firebase';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

interface SnackWishlistViewProps {
  girlfriendName: string;
  boyfriendName: string;
}

export const SnackWishlistView: React.FC<SnackWishlistViewProps> = ({
  girlfriendName = '晴寶',
  boyfriendName = '蔡寶'
}) => {
  const { isAuthorizedEditor, requireAuthOrPrompt, isBoyfriend, isGirlfriend } = useAuth();
  const [snacks, setSnacks] = useState<SnackVoteItem[]>(DEFAULT_TAINAN_SNACKS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [activeVoter, setActiveVoter] = useState<'qingbao' | 'caibao'>(isBoyfriend ? 'caibao' : 'qingbao');

  // Update voter whenever role changes
  useEffect(() => {
    if (isBoyfriend) {
      setActiveVoter('caibao');
    } else {
      setActiveVoter('qingbao');
    }
  }, [isBoyfriend]);

  // New snack form state
  const [newName, setNewName] = useState('');
  const [newSpots, setNewSpots] = useState('');
  const [newCategory, setNewCategory] = useState('savory');
  const [newLocation, setNewLocation] = useState('中西區');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    setIsSyncing(true);
    const unsub = subscribeToSnacks(
      (items) => {
        setSnacks(items);
        setIsFirebaseConnected(true);
        setIsSyncing(false);
      },
      (err) => {
        console.warn('Firebase sync notice:', err);
        setIsFirebaseConnected(false);
        setIsSyncing(false);
      }
    );

    return () => {
      unsub();
    };
  }, []);

  const handleVote = async (snack: SnackVoteItem, newVote: 'want' | 'must' | 'maybe' | 'pass') => {
    if (!requireAuthOrPrompt('小吃心願投票')) {
      return;
    }
    
    // Determine who is voting
    const isQingbao = activeVoter === 'qingbao';
    
    // Compute new individual votes
    const nextGfVote = isQingbao ? newVote : (snack.girlfriendVote !== undefined ? snack.girlfriendVote : (snack.votedBy === 'qingbao' || snack.votedBy === 'both' ? snack.status : null));
    const nextBfVote = !isQingbao ? newVote : (snack.boyfriendVote !== undefined ? snack.boyfriendVote : (snack.votedBy === 'caibao' || snack.votedBy === 'both' ? snack.status : null));

    // Evaluate consensus & votedBy
    const gfWants = nextGfVote === 'want' || nextGfVote === 'must';
    const bfWants = nextBfVote === 'want' || nextBfVote === 'must';
    
    let computedVotedBy: 'qingbao' | 'caibao' | 'both' | undefined = undefined;
    let computedStatus: 'want' | 'must' | 'maybe' | 'pass' = newVote;

    if (gfWants && bfWants) {
      computedVotedBy = 'both';
      computedStatus = (nextGfVote === 'must' || nextBfVote === 'must') ? 'must' : 'want';
    } else if (gfWants) {
      computedVotedBy = 'qingbao';
      computedStatus = nextGfVote || 'want';
    } else if (bfWants) {
      computedVotedBy = 'caibao';
      computedStatus = nextBfVote || 'want';
    } else {
      if (nextGfVote === 'maybe' || nextBfVote === 'maybe') {
        computedStatus = 'maybe';
        computedVotedBy = nextGfVote === 'maybe' && nextBfVote === 'maybe' ? 'both' : (nextGfVote === 'maybe' ? 'qingbao' : 'caibao');
      } else {
        computedStatus = 'pass';
        computedVotedBy = undefined;
      }
    }

    let likesCount = 0;
    if (gfWants) likesCount++;
    if (bfWants) likesCount++;

    const updatedSnack: SnackVoteItem = {
      ...snack,
      status: computedStatus,
      girlfriendVote: nextGfVote,
      boyfriendVote: nextBfVote,
      votedBy: computedVotedBy,
      likesCount
    };

    const updatedList = snacks.map(s => s.id === snack.id ? updatedSnack : s);
    setSnacks(updatedList);

    if (newVote === 'want' || newVote === 'must') {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.8 }
      });
    }

    // sync to Firebase
    setIsSyncing(true);
    await updateSnackVote(snack.id, {
      status: computedStatus,
      girlfriendVote: nextGfVote,
      boyfriendVote: nextBfVote,
      votedBy: computedVotedBy,
      likesCount
    });
    setIsSyncing(false);
  };

  const handleCreateSnack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuthOrPrompt('新增自訂小吃')) {
      return;
    }
    if (!newName.trim()) return;

    const newSnackItem: Omit<SnackVoteItem, 'id'> = {
      name: newName.trim(),
      category: newCategory,
      recommendedSpots: newSpots.trim() || '市區知名店家',
      locationArea: newLocation.trim() || '台南市區',
      status: 'want',
      likesCount: 1,
      votedBy: activeVoter,
      girlfriendVote: activeVoter === 'qingbao' ? 'want' : null,
      boyfriendVote: activeVoter === 'caibao' ? 'want' : null,
      notes: newNotes.trim() || undefined,
      isCustomAdded: true,
      customAddedBy: activeVoter === 'qingbao' ? girlfriendName : boyfriendName
    };

    setIsSyncing(true);
    await addCustomSnack(newSnackItem);
    setIsSyncing(false);

    setNewName('');
    setNewSpots('');
    setNewNotes('');
    setShowAddModal(false);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.5 }
    });
  };

  const handleDeleteSnack = async (id: string, name: string) => {
    if (!requireAuthOrPrompt('刪除自訂小吃')) {
      return;
    }
    if (confirm(`確定要刪除「${name}」嗎？`)) {
      setIsSyncing(true);
      await deleteSnackItem(id);
      setIsSyncing(false);
    }
  };

  const filteredSnacks = snacks.filter(s => {
    const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchSearch = searchQuery === '' || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.recommendedSpots.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.locationArea && s.locationArea.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const wantCount = snacks.filter(s => s.status === 'want' || s.status === 'must').length;
  const bothCount = snacks.filter(s => s.votedBy === 'both').length;

  return (
    <div className="space-y-6 text-[var(--romantic-ink,#0F172A)]">
      {/* Banner Card */}
      <div className="relative overflow-hidden rounded-3xl btn-romantic-primary p-6 sm:p-8 text-white shadow-xl border border-white/20">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3 border border-white/25">
            <Flame className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span>10/18 (日) Day 3 府城美食探索</span>
            <span className="bg-white text-[var(--romantic-rose,#0284C7)] px-2 py-0.5 rounded-full font-bold text-[10px]">
              {isFirebaseConnected ? '🟢 Firebase 雲端即時同步' : '🟡 離線暫存'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
            🍜 {girlfriendName} 的台南小吃心願選單 & 實時投票
          </h2>
          <p className="mt-2 text-white/90 text-sm sm:text-base leading-relaxed">
            Day 3 早上要帶{girlfriendName}吃遍台南！{girlfriendName}可以在這裡即時勾選想吃的小吃，
            兩人手機連線 Firestore 同步，蔡司機直接導航出發！
          </p>

          {/* Voter Toggle & Stats */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {isBoyfriend ? (
              <div className="flex items-center bg-black/20 backdrop-blur-md rounded-2xl p-1 border border-white/20">
                <button
                  onClick={() => setActiveVoter('caibao')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeVoter === 'caibao'
                      ? 'bg-white text-[var(--romantic-rose,#0284C7)] shadow-md scale-102 font-bold'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  👑 我是 {boyfriendName} (管理者)
                </button>
                <button
                  onClick={() => setActiveVoter('qingbao')}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeVoter === 'qingbao'
                      ? 'bg-white text-[var(--romantic-rose,#0284C7)] shadow-md scale-102 font-bold'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  💖 模擬 {girlfriendName} 投票
                </button>
              </div>
            ) : (
              <div className="flex items-center bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/30 text-white font-bold text-xs sm:text-sm shadow-inner">
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>💖 {girlfriendName} 專屬壽星投票中</span>
                </span>
              </div>
            )}

            <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium flex items-center space-x-2 border border-white/20 text-white">
              <Heart className="w-4 h-4 text-white fill-white/80" />
              <span>已選美食：<strong className="text-white text-base">{wantCount}</strong> 家</span>
              {bothCount > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-[var(--romantic-gold-light,#FEF3C7)] text-[var(--romantic-gold,#F59E0B)] font-bold text-xs">
                  👫 雙向指定 {bothCount} 家
                </span>
              )}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-2xl bg-white text-[var(--romantic-rose,#0284C7)] hover:bg-white/95 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer ml-auto border border-white/40"
            >
              <Plus className="w-4 h-4" />
              <span>新增私房小吃</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logic explanation banner for Both Voted */}
      <div className="bg-[var(--romantic-rose-light,#F0F9FF)] border border-[var(--romantic-border,#BAE6FD)] rounded-2xl p-4 flex items-start space-x-3 text-xs text-[var(--romantic-muted,#64748B)]">
        <Info className="w-5 h-5 text-[var(--romantic-rose,#0284C7)] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-[var(--romantic-ink,#0F172A)]">
            💡 什麼是「👫 兩人雙向指定」？
          </p>
          <p className="text-[var(--romantic-muted,#64748B)] leading-relaxed">
            當 <strong>{girlfriendName}</strong> 與 <strong>{boyfriendName}</strong> 都在各自手機上為同一道小吃按下 <strong>「💖 想吃」</strong> 或 <strong>「⭐ 必吃！」</strong> 時，系統會自動升級標註為『<strong>👫 兩人雙向指定</strong>』！代表兩人心意相通、絕對排入必吃行程！
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 border border-[var(--romantic-border,#BAE6FD)] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {[
            { id: 'all', label: '全部小吃' },
            { id: 'savory', label: '🥩 鹹食主食' },
            { id: 'sweet', label: '🍧 冰品甜點' },
            { id: 'drink', label: '🥤 府城飲品' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'btn-romantic-primary font-bold shadow-xs'
                  : 'bg-slate-50 text-[var(--romantic-muted,#64748B)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] hover:text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--romantic-muted,#64748B)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋小吃或店家名..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
          />
        </div>
      </div>

      {/* Snacks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSnacks.map((snack) => {
          const isWant = snack.status === 'want' || snack.status === 'must';
          const isMust = snack.status === 'must';
          const isPass = snack.status === 'pass';

          return (
            <div
              key={snack.id}
              className={`relative bg-white rounded-3xl p-5 border transition-all hover:shadow-md ${
                isMust
                  ? 'border-[var(--romantic-gold,#F59E0B)] ring-2 ring-[var(--romantic-gold,#F59E0B)]/30 bg-gradient-to-b from-[var(--romantic-gold-light,#FEF3C7)] to-white'
                  : isWant
                  ? 'border-[var(--romantic-border,#BAE6FD)] ring-2 ring-[var(--romantic-rose,#0284C7)]/20 bg-gradient-to-b from-[var(--romantic-rose-light,#F0F9FF)] to-white'
                  : isPass
                  ? 'border-slate-200 opacity-60 bg-slate-50'
                  : 'border-[var(--romantic-border,#BAE6FD)]'
              }`}
            >
              {/* Header inside card */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {snack.locationArea || '台南市區'}
                    </span>
                    {isMust && (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--romantic-gold-light,#FEF3C7)] text-[var(--romantic-gold,#F59E0B)] border border-[var(--romantic-border,#BAE6FD)]">
                        <Award className="w-3 h-3 text-[var(--romantic-gold,#F59E0B)]" />
                        <span>必吃首選 ⭐</span>
                      </span>
                    )}
                    {snack.votedBy === 'qingbao' && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)]">
                        💖 {girlfriendName}敲碗
                      </span>
                    )}
                    {snack.votedBy === 'caibao' && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--romantic-gold-light,#FEF3C7)] text-[var(--romantic-gold,#F59E0B)] border border-[var(--romantic-border,#BAE6FD)]">
                        🙋‍♂️ {boyfriendName}推薦
                      </span>
                    )}
                    {snack.votedBy === 'both' && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] animate-pulse">
                        👫 兩人雙向指定
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[var(--romantic-ink,#0F172A)] mt-1.5">
                    {snack.name}
                  </h3>
                </div>

                <div className="flex items-center space-x-1">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(snack.recommendedSpots.split('/')[0] + ' 台南')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-rose,#0284C7)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] transition-colors"
                    title="在 Google 地圖上開啟"
                  >
                    <MapPin className="w-4 h-4" />
                  </a>

                  {isBoyfriend && (
                    <button
                      onClick={() => handleDeleteSnack(snack.id, snack.name)}
                      className="p-1.5 rounded-xl text-[var(--romantic-muted,#64748B)] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="刪除此小吃"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Recommended spots */}
              <div className="mt-2 text-xs sm:text-sm font-medium text-slate-700 flex items-center space-x-1">
                <span className="text-[var(--romantic-rose,#0284C7)] font-bold">推薦店家：</span>
                <span className="text-[var(--romantic-ink,#0F172A)]">{snack.recommendedSpots}</span>
              </div>

              {/* Notes / Special remarks */}
              {snack.notes && (
                <p className="mt-2 text-xs text-[var(--romantic-muted,#64748B)] leading-relaxed bg-[var(--romantic-rose-light,#F0F9FF)] rounded-xl p-2.5 border border-[var(--romantic-border,#BAE6FD)]">
                  💡 {snack.notes}
                </p>
              )}

              {/* Individual Votes Overview Pill */}
              <div className="mt-3 flex items-center flex-wrap gap-2 text-[11px] bg-slate-50 rounded-xl p-2 border border-[var(--romantic-border,#BAE6FD)]">
                <span className="flex items-center space-x-1">
                  <span className="text-[var(--romantic-muted,#64748B)] font-medium">💖 {girlfriendName}：</span>
                  <span className={`font-bold ${
                    snack.girlfriendVote === 'must' ? 'text-[var(--romantic-gold,#F59E0B)] bg-[var(--romantic-gold-light,#FEF3C7)] px-1.5 py-0.5 rounded-md border border-[var(--romantic-border,#BAE6FD)]' :
                    snack.girlfriendVote === 'want' ? 'text-[var(--romantic-rose,#0284C7)] bg-[var(--romantic-rose-light,#F0F9FF)] px-1.5 py-0.5 rounded-md border border-[var(--romantic-border,#BAE6FD)]' :
                    snack.girlfriendVote === 'maybe' ? 'text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded-md' :
                    snack.girlfriendVote === 'pass' ? 'text-slate-400' : 'text-slate-400 italic'
                  }`}>
                    {snack.girlfriendVote === 'must' ? '⭐ 必吃！' :
                     snack.girlfriendVote === 'want' ? '💖 想吃' :
                     snack.girlfriendVote === 'maybe' ? '👍 嚐鮮' :
                     snack.girlfriendVote === 'pass' ? '❌ Pass' : '尚未選擇'}
                  </span>
                </span>

                <span className="text-slate-300">|</span>

                <span className="flex items-center space-x-1">
                  <span className="text-[var(--romantic-muted,#64748B)] font-medium">🙋‍♂️ {boyfriendName}：</span>
                  <span className={`font-bold ${
                    snack.boyfriendVote === 'must' ? 'text-[var(--romantic-gold,#F59E0B)] bg-[var(--romantic-gold-light,#FEF3C7)] px-1.5 py-0.5 rounded-md border border-[var(--romantic-border,#BAE6FD)]' :
                    snack.boyfriendVote === 'want' ? 'text-[var(--romantic-rose,#0284C7)] bg-[var(--romantic-rose-light,#F0F9FF)] px-1.5 py-0.5 rounded-md border border-[var(--romantic-border,#BAE6FD)]' :
                    snack.boyfriendVote === 'maybe' ? 'text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded-md' :
                    snack.boyfriendVote === 'pass' ? 'text-slate-400' : 'text-slate-400 italic'
                  }`}>
                    {snack.boyfriendVote === 'must' ? '⭐ 必吃！' :
                     snack.boyfriendVote === 'want' ? '💖 想吃' :
                     snack.boyfriendVote === 'maybe' ? '👍 嚐鮮' :
                     snack.boyfriendVote === 'pass' ? '❌ Pass' : '尚未選擇'}
                  </span>
                </span>
              </div>

              {/* Voting buttons */}
              <div className="mt-3 pt-3 border-t border-[var(--romantic-border,#BAE6FD)] flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-[var(--romantic-ink,#0F172A)] font-bold flex items-center space-x-1">
                  <span>{activeVoter === 'caibao' ? `👑 ${boyfriendName}您的投票：` : `💖 ${girlfriendName}您的心願：`}</span>
                </span>

                {(() => {
                  const currentVote = activeVoter === 'caibao' 
                    ? (snack.boyfriendVote !== undefined ? snack.boyfriendVote : (snack.votedBy === 'caibao' || snack.votedBy === 'both' ? snack.status : null))
                    : (snack.girlfriendVote !== undefined ? snack.girlfriendVote : (snack.votedBy === 'qingbao' || snack.votedBy === 'both' ? snack.status : null));

                  return (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleVote(snack, 'must')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentVote === 'must'
                            ? 'btn-romantic-gold text-white shadow-xs scale-105'
                            : 'bg-slate-50 text-slate-700 hover:bg-[var(--romantic-gold-light,#FEF3C7)] hover:text-[var(--romantic-gold,#F59E0B)] border border-[var(--romantic-border,#BAE6FD)]'
                        }`}
                      >
                        ⭐ 必吃！
                      </button>

                      <button
                        onClick={() => handleVote(snack, 'want')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentVote === 'want'
                            ? 'btn-romantic-primary text-white shadow-xs scale-105'
                            : 'bg-slate-50 text-slate-700 hover:bg-[var(--romantic-rose-light,#F0F9FF)] hover:text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)]'
                        }`}
                      >
                        💖 想吃
                      </button>

                      <button
                        onClick={() => handleVote(snack, 'maybe')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          currentVote === 'maybe'
                            ? 'bg-slate-800 text-white shadow-xs'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-[var(--romantic-border,#BAE6FD)]'
                        }`}
                      >
                        👍 嚐鮮
                      </button>

                      <button
                        onClick={() => handleVote(snack, 'pass')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          currentVote === 'pass'
                            ? 'bg-slate-400 text-white'
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-[var(--romantic-border,#BAE6FD)]'
                        }`}
                      >
                        ❌ Pass
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Snack Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-5 sm:p-6 border border-[var(--romantic-border,#BAE6FD)] max-h-[92vh] flex flex-col my-auto overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--romantic-border,#BAE6FD)] shrink-0">
              <h3 className="font-serif text-lg font-bold text-[var(--romantic-ink,#0F172A)] flex items-center space-x-2">
                <UtensilsCrossed className="w-5 h-5 text-[var(--romantic-rose,#0284C7)]" />
                <span>新增私房小吃店家</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[var(--romantic-muted,#64748B)] hover:text-[var(--romantic-ink,#0F172A)] text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSnack} className="mt-4 space-y-4 text-xs flex-1 overflow-y-auto pr-0.5">
              <div>
                <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1">
                  小吃名稱 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：安平白糖椪、阿堂鹹粥"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1">
                  推薦店名 / 地址
                </label>
                <input
                  type="text"
                  placeholder="例如：阿文米粿 / 保安路商圈"
                  value={newSpots}
                  onChange={(e) => setNewSpots(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1">
                    分類
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                  >
                    <option value="savory">🥩 鹹食主食</option>
                    <option value="sweet">🍧 冰品甜點</option>
                    <option value="drink">🥤 府城飲品</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1">
                    區域
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1">
                  想吃理由 / 筆記小語
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="例如：IG超紅必拍、排隊排很久也要吃..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-[var(--romantic-ink,#0F172A)] placeholder:text-[var(--romantic-muted,#64748B)]/60 text-sm font-medium focus:outline-none focus:border-[var(--romantic-rose,#0284C7)] focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-[var(--romantic-muted,#64748B)] hover:bg-[var(--romantic-rose-light,#F0F9FF)] text-xs font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl btn-romantic-primary text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  新增小吃
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

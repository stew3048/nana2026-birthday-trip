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
  MessageCircleHeart
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

  const handleVote = async (snack: SnackVoteItem, status: 'want' | 'must' | 'maybe' | 'pass') => {
    if (!requireAuthOrPrompt('小吃心願投票')) {
      return;
    }
    // optimistic update
    const prevStatus = snack.status;
    const prevVotedBy = snack.votedBy;
    
    let newVotedBy: 'qingbao' | 'caibao' | 'both' = activeVoter;
    if (prevVotedBy && prevVotedBy !== activeVoter && status !== 'pass') {
      newVotedBy = 'both';
    }

    const updatedLikes = status === 'want' || status === 'must' 
      ? Math.max(1, (snack.likesCount || 0) + (prevStatus === 'pass' ? 1 : 0))
      : Math.max(0, (snack.likesCount || 1) - 1);

    const updatedList = snacks.map(s => s.id === snack.id ? { 
      ...s, 
      status, 
      votedBy: newVotedBy,
      likesCount: updatedLikes
    } : s);
    
    setSnacks(updatedList);

    if (status === 'want' || status === 'must') {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.8 }
      });
    }

    // sync to Firebase
    setIsSyncing(true);
    await updateSnackVote(snack.id, {
      status,
      votedBy: newVotedBy,
      likesCount: updatedLikes
    });
    setIsSyncing(false);
  };

  const handleCreateSnack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuthOrPrompt('新增自訂小吃')) {
      return;
    }
    if (!newName.trim()) return;

    const newItem = await addCustomSnack({
      name: newName.trim(),
      recommendedSpots: newSpots.trim() || '台南在地私房店',
      category: newCategory,
      locationArea: newLocation.trim() || '台南市區',
      status: 'want',
      votedBy: activeVoter,
      likesCount: 1,
      notes: newNotes.trim() || `${activeVoter === 'qingbao' ? girlfriendName : boyfriendName} 特別敲碗想吃！`
    });

    if (newItem) {
      setShowAddModal(false);
      setNewName('');
      setNewSpots('');
      setNewNotes('');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
    }
  };

  const handleDeleteSnack = async (id: string, name: string) => {
    if (!requireAuthOrPrompt('刪除小吃項目')) {
      return;
    }
    if (confirm(`確定要刪除「${name}」嗎？`)) {
      setSnacks(snacks.filter(s => s.id !== id));
      await deleteSnackItem(id);
    }
  };

  const filteredSnacks = snacks.filter(snack => {
    const matchesCat = selectedCategory === 'all' || snack.category === selectedCategory;
    const matchesSearch = snack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          snack.recommendedSpots.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (snack.notes && snack.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const wantCount = snacks.filter(s => s.status === 'want' || s.status === 'must').length;

  return (
    <div className="space-y-6">
      {/* Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
            <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>10/18 (日) Day 3 府城美食探索</span>
            <span className="bg-emerald-400 text-emerald-950 px-2 py-0.2 rounded-full font-bold text-[10px]">
              {isFirebaseConnected ? '🟢 Firebase 雲端即時同步' : '🟡 離線暫存'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            🍜 {girlfriendName} 的台南小吃心願選單 & 實時投票
          </h2>
          <p className="mt-2 text-rose-100 text-sm sm:text-base leading-relaxed">
            Day 3 早上要帶{girlfriendName}吃遍台南！{girlfriendName}可以在這裡即時勾選想吃的小吃，
            兩人手機連線 Firestore 同步，蔡司機直接導航出發！
          </p>

          {/* Voter Toggle & Stats */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white/20 backdrop-blur-md rounded-2xl p-1 border border-white/30">
              <button
                onClick={() => setActiveVoter('qingbao')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeVoter === 'qingbao'
                    ? 'bg-white text-rose-600 shadow-md scale-102'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                💖 我是 {girlfriendName} (壽星投票)
              </button>
              <button
                onClick={() => setActiveVoter('caibao')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeVoter === 'caibao'
                    ? 'bg-white text-amber-700 shadow-md scale-102'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                🙋‍♂️ 我是 {boyfriendName} (陪吃兼買單)
              </button>
            </div>

            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium flex items-center space-x-2 border border-white/30">
              <Heart className="w-4 h-4 text-rose-200 fill-rose-200" />
              <span>已入選心願美食：<strong className="text-white text-base">{wantCount}</strong> 家</span>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer ml-auto"
            >
              <Plus className="w-4 h-4" />
              <span>新增私房小吃</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
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
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋小吃或店家名..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
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
                  ? 'border-amber-400 ring-2 ring-amber-300/40 bg-gradient-to-b from-amber-50/40 to-white'
                  : isWant
                  ? 'border-rose-300 ring-2 ring-rose-200/40 bg-gradient-to-b from-rose-50/30 to-white'
                  : isPass
                  ? 'border-stone-200 opacity-60 bg-stone-50/50'
                  : 'border-stone-200'
              }`}
            >
              {/* Header inside card */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                      {snack.locationArea || '台南市區'}
                    </span>
                    {isMust && (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>必吃首選 ⭐</span>
                      </span>
                    )}
                    {snack.votedBy === 'qingbao' && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        💖 {girlfriendName}敲碗
                      </span>
                    )}
                    {snack.votedBy === 'both' && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                        👫 兩人雙向指定
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 mt-1">
                    {snack.name}
                  </h3>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(snack.recommendedSpots.split('/')[0] + ' 台南')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="在 Google 地圖上開啟"
                >
                  <MapPin className="w-4 h-4" />
                </a>
              </div>

              {/* Recommended spots */}
              <div className="mt-2 text-xs sm:text-sm font-medium text-stone-700 flex items-center space-x-1">
                <span className="text-rose-500 font-bold">推薦店家：</span>
                <span>{snack.recommendedSpots}</span>
              </div>

              {/* Notes / Special remarks */}
              {snack.notes && (
                <p className="mt-2 text-xs text-stone-500 leading-relaxed bg-stone-50 rounded-xl p-2.5 border border-stone-100">
                  💡 {snack.notes}
                </p>
              )}

              {/* Voting buttons */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-stone-400 font-medium">
                  {girlfriendName}的心願標記：
                </span>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleVote(snack, 'must')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      snack.status === 'must'
                        ? 'bg-amber-500 text-white shadow-xs scale-105'
                        : 'bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-amber-700'
                    }`}
                  >
                    ⭐ 必吃！
                  </button>

                  <button
                    onClick={() => handleVote(snack, 'want')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      snack.status === 'want'
                        ? 'bg-rose-500 text-white shadow-xs scale-105'
                        : 'bg-stone-100 text-stone-600 hover:bg-rose-100 hover:text-rose-700'
                    }`}
                  >
                    💖 想吃
                  </button>

                  <button
                    onClick={() => handleVote(snack, 'maybe')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      snack.status === 'maybe'
                        ? 'bg-stone-700 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    👍 嚐鮮
                  </button>

                  <button
                    onClick={() => handleVote(snack, 'pass')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      snack.status === 'pass'
                        ? 'bg-stone-400 text-white'
                        : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                    }`}
                  >
                    ❌ Pass
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Snack Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-rose-100">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 flex items-center space-x-2">
                <UtensilsCrossed className="w-5 h-5 text-rose-500" />
                <span>新增私房小吃店家</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSnack} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  小吃名稱 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：安平白糖椪、阿堂鹹粥"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  推薦店名 / 地址
                </label>
                <input
                  type="text"
                  placeholder="例如：阿文米粿 / 保安路商圈"
                  value={newSpots}
                  onChange={(e) => setNewSpots(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    分類
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="savory">🥩 鹹食主食</option>
                    <option value="sweet">🍧 冰品甜點</option>
                    <option value="drink">🥤 府城飲品</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    區域
                  </label>
                  <input
                    type="text"
                    placeholder="如：國華街、安平"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  必吃原因或晴寶備註
                </label>
                <textarea
                  rows={2}
                  placeholder="例如：這家一定要加辣、想吃看看跟六千牛肉湯比起來如何！"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-sm font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-sm font-bold shadow-md shadow-rose-200 transition-all cursor-pointer"
                >
                  儲存並同步至 Firebase 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

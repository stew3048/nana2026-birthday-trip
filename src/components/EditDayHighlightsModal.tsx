import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, Wand2, RotateCcw, Calendar, Check, AlertCircle } from 'lucide-react';
import { DayHighlightCard, DayItinerary } from '../types';

interface EditDayHighlightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayHighlights: DayHighlightCard[];
  itinerary: DayItinerary[];
  onSave: (highlights: DayHighlightCard[]) => void;
}

export const DEFAULT_DAY_HIGHLIGHTS: DayHighlightCard[] = [
  {
    dayNumber: 1,
    dateBadge: 'Day 1 · 10/16 (五)',
    title: '奔向府城 · 逃離日常的溫柔序曲',
    description: '放下所有工作與繁忙，坐在副駕只管放空聽歌。今晚沒有趕路的壓力，只有專屬我們的愜意節奏與溫暖夜色，為這趟慶生之旅揭開最放鬆的序幕。',
    tag1: '🚗 甜蜜啟程',
    tag2: '✨ 極致放鬆夜',
    isSecretSurprise: false
  },
  {
    dayNumber: 2,
    dateBadge: '⭐ Day 2 · 10/17 (六) 晴寶生日',
    title: '🎂 晴寶生日大日子 · 今天妳是全世界最幸福的女孩',
    description: '祝我最心愛的晴寶生日快樂！今天所有的時光與溫柔都只為妳一個人準備。放下所有安排，只要帶著最甜美的笑容，跟著蔡司機一起迎接滿滿的專屬寵溺與走心心動驚喜！',
    tag1: '👑 壽星專屬特權',
    tag2: '🔒 走心神秘驚喜',
    isSecretSurprise: true
  },
  {
    dayNumber: 3,
    dateBadge: 'Day 3 · 10/18 (日)',
    title: '🌿 慢調漫步 · 把所有心動與美味悄悄珍藏',
    description: '睡得好嗎？悠閒退房後，牽著手漫步在府城的溫煦陽光下。與最重要的人好好吃頓暖心好飯、探索充滿驚喜的美好角落，最後帶著滿載的幸福回憶與笑容，一起牽手平安回家。',
    tag1: '🕊️ 暖心慢活步調',
    tag2: '💖 滿載笑容賦歸',
    isSecretSurprise: false
  }
];

export const EditDayHighlightsModal: React.FC<EditDayHighlightsModalProps> = ({
  isOpen,
  onClose,
  dayHighlights,
  itinerary,
  onSave
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  
  // Initialize state with current or default highlights
  const [cards, setCards] = useState<DayHighlightCard[]>(() => {
    if (dayHighlights && dayHighlights.length === 3) {
      return JSON.parse(JSON.stringify(dayHighlights));
    }
    return JSON.parse(JSON.stringify(DEFAULT_DAY_HIGHLIGHTS));
  });

  // Re-sync with latest highlights whenever modal opens or dayHighlights updates
  React.useEffect(() => {
    if (isOpen) {
      if (dayHighlights && dayHighlights.length === 3) {
        setCards(JSON.parse(JSON.stringify(dayHighlights)));
      } else {
        setCards(JSON.parse(JSON.stringify(DEFAULT_DAY_HIGHLIGHTS)));
      }
    }
  }, [isOpen, dayHighlights]);

  if (!isOpen) return null;

  const currentCard = cards[selectedDayIdx] || cards[0] || DEFAULT_DAY_HIGHLIGHTS[0];

  const handleUpdateCurrentCard = (field: keyof DayHighlightCard, value: any) => {
    setCards(prev => {
      const copy = [...prev];
      copy[selectedDayIdx] = {
        ...copy[selectedDayIdx],
        [field]: value
      };
      return copy;
    });
  };

  // Smart Autofill from Public Itinerary items (ignoring secret items to avoid spoilers)
  const handleAutoGenerateFromItinerary = (dayNum: number) => {
    const targetDay = itinerary.find(d => d.dayNumber === dayNum);
    if (!targetDay) return;

    const publicActs = targetDay.activities.filter(a => !a.isSecretSurprise);
    const hasSecretActs = targetDay.activities.some(a => a.isSecretSurprise);

    let generatedDesc = '';
    if (publicActs.length > 0) {
      const publicTitles = publicActs.slice(0, 3).map(a => a.title).join('、');
      generatedDesc = `當天預計造訪：${publicTitles}${hasSecretActs ? '，並穿插蔡寶專屬準備的神秘驚喜時刻！' : '，享受悠閒浪漫的府城時光。'}`;
    } else {
      generatedDesc = '全天包含蔡寶為晴寶精心籌備的神秘專屬行程，敬請期待甜蜜揭曉！';
    }

    setCards(prev => {
      const copy = [...prev];
      copy[selectedDayIdx] = {
        ...copy[selectedDayIdx],
        title: targetDay.themeTitle || copy[selectedDayIdx].title,
        description: generatedDesc,
        tag1: publicActs[0]?.title || '精彩府城行程',
        tag2: hasSecretActs ? '神秘驚喜時段 🔒' : (publicActs[publicActs.length - 1]?.title || '甜蜜相伴')
      };
      return copy;
    });
  };

  const handleResetDefaults = () => {
    if (confirm('確定要將 3 天行程速覽文案恢復為預設浪漫內容嗎？')) {
      setCards(JSON.parse(JSON.stringify(DEFAULT_DAY_HIGHLIGHTS)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(cards);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl border border-[var(--romantic-border,#BAE6FD)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50/50 via-white to-amber-50/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[var(--romantic-rose-light,#F0F9FF)] text-[var(--romantic-rose,#0284C7)] border border-[var(--romantic-border,#BAE6FD)] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--romantic-ink,#0F172A)]">
                ✏️ 編輯行程速覽（避免劇透模式）
              </h3>
              <p className="text-xs text-[var(--romantic-muted,#64748B)]">
                自訂首頁 3 天行程亮點卡片文案，支援防爆雷保護！
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center px-5 pt-3 gap-2 border-b border-slate-100 bg-slate-50/60">
          {cards.map((c, idx) => (
            <button
              key={c.dayNumber}
              type="button"
              onClick={() => setSelectedDayIdx(idx)}
              className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-2xl transition-all cursor-pointer border-b-2 flex items-center space-x-1.5 ${
                selectedDayIdx === idx
                  ? 'border-[var(--romantic-rose,#0284C7)] text-[var(--romantic-rose,#0284C7)] bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Day {c.dayNumber}</span>
              {c.isSecretSurprise && (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-normal">
                  保密
                </span>
              )}
            </button>
          ))}

          <div className="ml-auto flex items-center space-x-2 py-1">
            <button
              type="button"
              onClick={() => handleAutoGenerateFromItinerary(currentCard.dayNumber)}
              className="text-xs text-[var(--romantic-rose,#0284C7)] hover:underline flex items-center space-x-1 font-medium cursor-pointer"
              title="智慧讀取該天公開行程，不包含神秘行程"
            >
              <Wand2 className="w-3 h-3" />
              <span className="hidden sm:inline">從每日時刻表帶入(防劇透)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Spoiler Protection Notice */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">💡 晴寶首頁可見提醒：</div>
              <p className="text-amber-800/90 leading-relaxed">
                若有想要對晴寶保密的餐廳（如法式無菜單）、行程或驚喜，請避免直接在此寫出店名，可填寫「神秘浪漫晚餐」或「神秘驚喜行程」以保持驚喜感！
              </p>
            </div>
          </div>

          {/* Date Badge / Tagline */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              頂部標籤名稱
            </label>
            <input
              type="text"
              value={currentCard.dateBadge}
              onChange={e => handleUpdateCurrentCard('dateBadge', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--romantic-rose,#0284C7)] text-xs text-slate-900"
              placeholder="例如：Day 2 · 10/17 (六) 晴寶生日"
              required
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              卡片大標題
            </label>
            <input
              type="text"
              value={currentCard.title}
              onChange={e => handleUpdateCurrentCard('title', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--romantic-rose,#0284C7)] text-sm font-bold text-slate-900"
              placeholder="例如：晴寶生日大日子 · 默契冒險 ＆ 神秘浪漫盛宴"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              行程亮點描述（晴寶於首頁速覽直接看到的話）
            </label>
            <textarea
              rows={3}
              value={currentCard.description}
              onChange={e => handleUpdateCurrentCard('description', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--romantic-rose,#0284C7)] text-xs text-slate-900 leading-relaxed"
              placeholder="寫一段給晴寶看的當日亮點介紹..."
              required
            />
          </div>

          {/* Footer Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                底部亮點標籤 1
              </label>
              <input
                type="text"
                value={currentCard.tag1 || ''}
                onChange={e => handleUpdateCurrentCard('tag1', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--romantic-rose,#0284C7)] text-xs text-slate-900"
                placeholder="例如：全天候專屬寵愛"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                底部亮點標籤 2
              </label>
              <input
                type="text"
                value={currentCard.tag2 || ''}
                onChange={e => handleUpdateCurrentCard('tag2', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--romantic-rose,#0284C7)] text-xs text-slate-900"
                placeholder="例如：神秘浪漫晚餐"
              />
            </div>
          </div>

          {/* Secret / Spoiler Protected Flag */}
          <div className="pt-2">
            <label className="flex items-center space-x-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={Boolean(currentCard.isSecretSurprise)}
                onChange={e => handleUpdateCurrentCard('isSecretSurprise', e.target.checked)}
                className="w-4 h-4 rounded text-[var(--romantic-rose,#0284C7)] focus:ring-[var(--romantic-rose,#0284C7)]"
              />
              <div>
                <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>標記此日為「包含防爆雷神秘驚喜」</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  在卡片上顯示專屬金色星芒標記，提醒這天有專屬神秘活動！
                </p>
              </div>
            </label>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-[var(--romantic-gold,#F59E0B)]" />
              <span>恢復預設文案</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl btn-romantic-primary text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>儲存速覽文案</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

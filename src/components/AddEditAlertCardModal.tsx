import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Sparkles, 
  Clock, 
  Tag, 
  Gift, 
  UtensilsCrossed, 
  Stethoscope, 
  Cake, 
  KeyRound, 
  Flame, 
  Check, 
  X,
  Layers,
  Calendar,
  Heart
} from 'lucide-react';
import { LiveAlertScenario, SurpriseItem, DayItinerary } from '../types';
import { extractScenarioDateTimeComponents } from '../utils/timeLock';

interface AddEditAlertCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scenario: LiveAlertScenario, syncToSurprises: boolean) => void;
  initialScenario?: LiveAlertScenario | null;
  existingSurprises?: SurpriseItem[];
  existingItinerary?: DayItinerary[];
}

export const AddEditAlertCardModal: React.FC<AddEditAlertCardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialScenario,
  existingSurprises = [],
  existingItinerary = []
}) => {
  const [date, setDate] = useState('2026-10-16');
  const [time, setTime] = useState('15:00');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [secondaryHint, setSecondaryHint] = useState('');
  const [badge, setBadge] = useState('15:00 甜蜜出發');
  const [category, setCategory] = useState<LiveAlertScenario['category']>('sparkles');
  const [selectedSurpriseId, setSelectedSurpriseId] = useState<string>('');
  const [selectedActivityKey, setSelectedActivityKey] = useState<string>('');
  const [syncToSurprises, setSyncToSurprises] = useState(true);

  useEffect(() => {
    if (initialScenario) {
      const parsed = extractScenarioDateTimeComponents(
        initialScenario.triggerTime || initialScenario.timeLabel || '',
        '2026-10-16'
      );
      setDate(parsed.date);
      setTime(parsed.time);
      setTitle(initialScenario.title || '');
      setMessage(initialScenario.message || '');
      setSecondaryHint(initialScenario.secondaryHint || '');
      setBadge(initialScenario.badge || `${parsed.time} 專屬驚喜`);
      setCategory(initialScenario.category || 'sparkles');
      setSelectedSurpriseId(initialScenario.linkedSurpriseId || '');
      setSelectedActivityKey('');
      setSyncToSurprises(true);
    } else {
      setDate('2026-10-16');
      setTime('15:00');
      setTitle('');
      setMessage('');
      setSecondaryHint('');
      setBadge('15:00 甜蜜出發');
      setCategory('sparkles');
      setSelectedSurpriseId('');
      setSelectedActivityKey('');
      setSyncToSurprises(true);
    }
  }, [initialScenario, isOpen]);

  if (!isOpen) return null;

  // Quick import from Itinerary Activity (e.g. 10/16 15:00 蔡寶請半天假直奔台南)
  const handleSelectActivity = (activityKey: string) => {
    setSelectedActivityKey(activityKey);
    if (!activityKey || !existingItinerary || existingItinerary.length === 0) return;

    const [dayIdxStr, actIdxStr] = activityKey.split('_');
    const day = existingItinerary[parseInt(dayIdxStr, 10)];
    const act = day?.activities[parseInt(actIdxStr, 10)];
    if (!act || !day) return;

    setTitle(act.title);
    setMessage(act.description || `蔡寶為晴寶規劃的專屬浪漫行程：${act.title} 💕`);
    setSecondaryHint(act.outfitTip ? `浪漫穿搭建議：${act.outfitTip}` : (act.notes ? `備註提醒：${act.notes}` : '跟著蔡寶一起享受台南專屬浪漫時光！'));

    if (act.category === 'dining') setCategory('dinner');
    else if (act.category === 'birthday_surprise') setCategory('birthday');
    else if (act.title.includes('密室')) setCategory('escape');
    else if (act.title.includes('燒肉')) setCategory('bbq');
    else if (act.title.includes('法式')) setCategory('french');
    else if (act.title.includes('特診') || act.title.includes('看診')) setCategory('clinic');
    else setCategory('sparkles');

    const parsed = extractScenarioDateTimeComponents(`${day.date} ${act.time}`, day.date);
    setDate(parsed.date);
    setTime(parsed.time);
    setBadge(`${parsed.time} ${act.title.replace(/^[^\w\s\u4e00-\u9fa5]+/, '').trim().substring(0, 7)}`);
  };

  // Quick import from existing Surprise Item
  const handleSelectSurprise = (surpriseId: string) => {
    setSelectedSurpriseId(surpriseId);
    if (!surpriseId) return;

    const surprise = existingSurprises.find(s => s.id === surpriseId);
    if (surprise) {
      setTitle(surprise.title.startsWith('✨') || surprise.title.startsWith('🚗') ? surprise.title : `✨ ${surprise.title}`);
      setMessage(surprise.description || `蔡寶為晴寶秘密安排的驚喜環節！${surprise.hint || ''}`);
      setSecondaryHint(surprise.hint ? `浪漫彩蛋：${surprise.hint}` : '蔡寶精心準備的甜蜜時刻 💕');

      if (surprise.category === 'cake') setCategory('birthday');
      else if (surprise.category === 'gift') setCategory('sparkles');
      else if (surprise.category === 'activity') setCategory('escape');
      else setCategory('sparkles');

      // Accurately extract the true start time
      const parsed = extractScenarioDateTimeComponents(
        `${surprise.timing || ''} ${surprise.title || ''}`,
        '2026-10-16'
      );
      setDate(parsed.date);
      setTime(parsed.time);
      setBadge(`${parsed.time} ${surprise.title.replace(/^[^\w\s\u4e00-\u9fa5]+/, '').trim().substring(0, 7)}`);
    }
  };

  const getFormattedTimeLabel = (dt: string, tm: string) => {
    try {
      const [year, month, day] = dt.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
      const weekDay = weekDays[dateObj.getDay()] || '';
      return `${month}/${day} (${weekDay}) ${tm}`;
    } catch {
      return `${dt} ${tm}`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('請輸入驚喜卡片標題！');
      return;
    }
    if (!message.trim()) {
      alert('請輸入推播給晴寶的甜蜜訊息！');
      return;
    }

    const triggerTime = `${date} ${time}`;
    const timeLabel = getFormattedTimeLabel(date, time);

    const scenario: LiveAlertScenario = {
      id: initialScenario?.id || `custom-alert-${Date.now()}`,
      triggerTime,
      timeLabel,
      title: title.trim(),
      message: message.trim(),
      secondaryHint: secondaryHint.trim() || '蔡寶為晴寶精心準備的專屬時刻 💕',
      category,
      badge: badge.trim() || `${time} 驚喜`,
      linkedSurpriseId: selectedSurpriseId || undefined,
      isCustom: true
    };

    onSave(scenario, syncToSurprises);
    onClose();
  };

  const categoryOptions: { key: LiveAlertScenario['category']; label: string; icon: React.ReactNode }[] = [
    { key: 'sparkles', label: '✨ 專屬彩蛋', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
    { key: 'birthday', label: '🎂 壽星生日', icon: <Cake className="w-4 h-4 text-pink-500" /> },
    { key: 'dinner', label: '🍽️ 美食晚餐', icon: <UtensilsCrossed className="w-4 h-4 text-sky-500" /> },
    { key: 'french', label: '🕯️ 燭光法式', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { key: 'clinic', label: '🩺 專屬特診', icon: <Stethoscope className="w-4 h-4 text-blue-500" /> },
    { key: 'escape', label: '🗝️ 默契冒險', icon: <KeyRound className="w-4 h-4 text-purple-500" /> },
    { key: 'bbq', label: '🥩 炭火燒肉', icon: <Flame className="w-4 h-4 text-orange-500" /> }
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-[var(--romantic-border,#BAE6FD)] max-h-[92vh] sm:max-h-[88vh] flex flex-col my-auto text-[var(--romantic-ink,#0F172A)]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 btn-romantic-primary text-white flex items-center justify-between border-b border-white/20 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Bell className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                {initialScenario ? '編輯專屬驚喜卡片' : '➕ 新增專屬即時驚喜卡片'}
              </h3>
              <p className="text-white/80 text-[11px] mt-0.5">
                時間到達時將主動全螢幕彈出給晴寶，播放音樂並發射彩色紙花 🎉
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="關閉"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form id="alert-card-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-sm">
          
          {/* Quick Import from Itinerary Activities (Recommended) */}
          {existingItinerary.length > 0 && !initialScenario && (
            <div className="p-3.5 rounded-2xl bg-[var(--romantic-rose-light,#F0F9FF)] border border-[var(--romantic-border,#BAE6FD)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--romantic-rose,#0284C7)] flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>快速套用：從現有「行程表活動」一鍵帶入 (推薦)</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">精準時間排序</span>
              </div>
              <select
                value={selectedActivityKey}
                onChange={(e) => handleSelectActivity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[var(--romantic-border,#BAE6FD)] text-xs text-[var(--romantic-ink,#0F172A)] focus:outline-none focus:ring-1 focus:ring-[var(--romantic-rose,#0284C7)] cursor-pointer"
              >
                <option value="">-- 點此選擇行程（如 10/16 20:30 煙波三溫暖放鬆）--</option>
                {existingItinerary.map((day, dayIdx) => (
                  <optgroup key={`day-${day.dayNumber}`} label={`Day ${day.dayNumber} (${day.date})`}>
                    {day.activities
                      .filter(act => !act.title.includes('請半天假'))
                      .map((act, actIdx) => (
                        <option key={`act-${dayIdx}-${actIdx}`} value={`${dayIdx}_${actIdx}`}>
                          {act.time} · {act.title}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          {/* Quick Import from existing Surprises */}
          {existingSurprises.length > 0 && !initialScenario && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>快速套用：從現有「神秘驚喜任務」一鍵帶入</span>
                </span>
                <span className="text-[10px] text-amber-700">自動精準換算時間</span>
              </div>
              <select
                value={selectedSurpriseId}
                onChange={(e) => handleSelectSurprise(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="">-- 點此選擇驚喜任務帶入 --</option>
                {existingSurprises
                  .filter(s => !s.title.includes('請半天假'))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.timing} · {s.title}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Timing Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)]" />
                <span>觸發日期</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-xs text-[var(--romantic-ink,#0F172A)] focus:outline-none focus:border-[var(--romantic-rose,#0284C7)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)]" />
                <span>觸發時刻 (24小時制，依此時間排序)</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-xs text-[var(--romantic-ink,#0F172A)] font-mono font-bold focus:outline-none focus:border-[var(--romantic-rose,#0284C7)]"
              />
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] text-[var(--romantic-muted,#64748B)] shrink-0">推薦關鍵時刻：</span>
            <button
              type="button"
              onClick={() => { setDate('2026-10-16'); setTime('18:00'); }}
              className="text-[10px] px-2.5 py-1 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold whitespace-nowrap cursor-pointer border border-sky-300 transition-colors"
            >
              🍽️ 10/16 18:00 晚餐
            </button>
            <button
              type="button"
              onClick={() => { setDate('2026-10-16'); setTime('20:30'); }}
              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap cursor-pointer"
            >
              🧖‍♀️ 10/16 20:30 三溫暖
            </button>
            <button
              type="button"
              onClick={() => { setDate('2026-10-16'); setTime('23:00'); }}
              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap cursor-pointer"
            >
              🩺 10/16 23:00 特診
            </button>
            <button
              type="button"
              onClick={() => { setDate('2026-10-17'); setTime('00:00'); }}
              className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 whitespace-nowrap cursor-pointer"
            >
              🎂 10/17 00:00 壽星整點
            </button>
            <button
              type="button"
              onClick={() => { setDate('2026-10-17'); setTime('15:00'); }}
              className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 whitespace-nowrap cursor-pointer"
            >
              🗝️ 10/17 15:00 密室
            </button>
            <button
              type="button"
              onClick={() => { setDate('2026-10-17'); setTime('18:00'); }}
              className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 whitespace-nowrap cursor-pointer"
            >
              🎂 10/17 18:00 生日大餐
            </button>
            <button
              type="button"
              onClick={() => { setDate('2026-10-18'); setTime('18:00'); }}
              className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 whitespace-nowrap cursor-pointer"
            >
              🥩 10/18 18:00 燒肉
            </button>
          </div>

          {/* Category Theme */}
          <div>
            <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1.5">
              卡片動畫圖示與風格
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categoryOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() => setCategory(opt.key)}
                  className={`p-2 rounded-xl border text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                    category === opt.key
                      ? 'border-[var(--romantic-rose,#0284C7)] bg-[var(--romantic-rose-light,#F0F9FF)] font-bold text-[var(--romantic-rose,#0284C7)] ring-1 ring-[var(--romantic-rose,#0284C7)]'
                      : 'border-[var(--romantic-border,#BAE6FD)] bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Badge & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)]" />
                <span>頂部徽章標籤</span>
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="例如: 21:00 專屬驚喜"
                required
                className="w-full px-3 py-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-xs text-[var(--romantic-ink,#0F172A)] focus:outline-none focus:border-[var(--romantic-rose,#0284C7)]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)]" />
                <span>卡片主標題</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如: 🎆 漁光島夕陽漫步與私房煙火時刻"
                required
                className="w-full px-3 py-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-xs font-medium text-[var(--romantic-ink,#0F172A)] focus:outline-none focus:border-[var(--romantic-rose,#0284C7)]"
              />
            </div>
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1">
              推播給晴寶的深情訊息 (彈窗主文字)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="請晴寶準備好最棒的心情，蔡寶已經為妳準備好浪漫的..."
              required
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-xs leading-relaxed text-[var(--romantic-ink,#0F172A)] focus:outline-none focus:border-[var(--romantic-rose,#0284C7)]"
            />
          </div>

          {/* Secondary Hint */}
          <div>
            <label className="block text-xs font-bold text-[var(--romantic-ink,#0F172A)] mb-1">
              次要甜蜜提示 (彈窗下方金色提示框)
            </label>
            <input
              type="text"
              value={secondaryHint}
              onChange={(e) => setSecondaryHint(e.target.value)}
              placeholder="例如: 蔡寶為晴寶備妥了溫暖毛毯與熱飲 🍵✨"
              className="w-full px-3 py-2 rounded-xl border border-[var(--romantic-border,#BAE6FD)] bg-white text-xs text-[var(--romantic-ink,#0F172A)] focus:outline-none focus:border-[var(--romantic-rose,#0284C7)]"
            />
          </div>

          {/* Sync to Surprises option */}
          {!initialScenario && (
            <label className="flex items-center space-x-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncToSurprises}
                onChange={(e) => setSyncToSurprises(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--romantic-rose,#0284C7)] focus:ring-[var(--romantic-rose,#0284C7)]"
              />
              <span className="text-xs text-[var(--romantic-ink,#0F172A)] flex items-center space-x-1">
                <Gift className="w-3.5 h-3.5 text-[var(--romantic-rose,#0284C7)]" />
                <span>同時在「🎁 神秘驚喜任務」建立對應的通關解鎖卡片 (雙向同步)</span>
              </span>
            </label>
          )}

        </form>

        {/* Action Buttons Sticky Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-[var(--romantic-border,#BAE6FD)] flex items-center justify-end space-x-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer"
          >
            取消
          </button>
          <button
            type="submit"
            form="alert-card-form"
            className="px-5 py-2 rounded-xl btn-romantic-primary text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{initialScenario ? '儲存修改' : '立即新增驚喜卡片'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

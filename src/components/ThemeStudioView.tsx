import React from 'react';
import { 
  Palette, 
  Sparkles, 
  Check, 
  Heart, 
  Calendar, 
  Clock, 
  MapPin, 
  Gift, 
  Utensils, 
  Lock, 
  Unlock, 
  Star, 
  Compass, 
  Shirt, 
  CheckCircle2,
  ArrowRight,
  Flame,
  ThumbsUp
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { APP_THEMES, AppThemeId } from '../utils/themes';
import confetti from 'canvas-confetti';

export const ThemeStudioView: React.FC = () => {
  const { theme, setTheme, themeConfig } = useTheme();

  const handleSelectTheme = (id: AppThemeId) => {
    setTheme(id);
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.2 }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div 
        className="rounded-3xl p-6 sm:p-8 border shadow-sm transition-all relative overflow-hidden"
        style={{ 
          backgroundColor: 'var(--romantic-card)', 
          borderColor: 'var(--romantic-border)' 
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold border vintage-rose-badge">
              <Palette className="w-3.5 h-3.5" />
              <span>🎨 風格試衣間 · 7 大專屬美學主題</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--romantic-ink)' }}>
              探索並切換您最喜愛的手冊風格
            </h2>
            <p className="text-xs sm:text-sm max-w-2xl leading-relaxed" style={{ color: 'var(--romantic-muted)' }}>
              我們準備了包含<strong>「🌊 蔚藍海洋 · 純白海風」</strong>、<strong>「🏝️ 聖托里尼 · 愛琴海純白」</strong>、<strong>「🌸 櫻花粉戀」</strong>等 7 款精心調配的視覺色調。點選任一主題即可<strong>全站即時套用</strong>，純白底色清爽透亮，隨時挑選最合心意的視覺氛圍！
            </p>
          </div>

          {/* Current Active Badge */}
          <div 
            className="p-4 rounded-2xl border shrink-0 flex items-center space-x-3.5"
            style={{ 
              backgroundColor: 'var(--romantic-rose-light)', 
              borderColor: 'var(--romantic-border)' 
            }}
          >
            <div className="text-3xl">{themeConfig.emoji}</div>
            <div>
              <span className="text-[10px] block font-bold uppercase tracking-wider" style={{ color: 'var(--romantic-rose-deep)' }}>
                目前套用主題
              </span>
              <span className="font-serif font-bold text-sm sm:text-base" style={{ color: 'var(--romantic-ink)' }}>
                {themeConfig.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Themes Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg sm:text-xl font-bold flex items-center space-x-2" style={{ color: 'var(--romantic-ink)' }}>
            <span>主題色盤選單 (點擊立即切換)</span>
          </h3>
          <span className="text-xs font-mono" style={{ color: 'var(--romantic-muted)' }}>
            共 5 款專屬風格
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {APP_THEMES.map((item) => {
            const isSelected = item.id === theme;
            return (
              <div
                key={item.id}
                onClick={() => handleSelectTheme(item.id)}
                className={`group rounded-3xl p-5 sm:p-6 border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  isSelected 
                    ? 'ring-2 shadow-lg scale-[1.01]' 
                    : 'hover:shadow-md hover:-translate-y-0.5'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--romantic-card)' : item.colors.cardBg,
                  borderColor: isSelected ? 'var(--romantic-rose)' : item.colors.cardBorder,
                  ringColor: item.colors.primary
                }}
              >
                {/* Active Indicator Top Right */}
                {isSelected && (
                  <div className="absolute top-4 right-4 flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-xs btn-romantic-primary">
                    <Check className="w-3.5 h-3.5" />
                    <span>使用中</span>
                  </div>
                )}

                <div className="space-y-3.5">
                  {/* Category & Emoji */}
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                        style={{
                          backgroundColor: item.colors.primaryLight,
                          color: item.colors.primaryDark,
                          borderColor: item.colors.primary
                        }}
                      >
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h4 
                      className="font-serif text-lg font-bold"
                      style={{ color: isSelected ? 'var(--romantic-ink)' : item.colors.textColor }}
                    >
                      {item.name}
                    </h4>
                    <p 
                      className="text-xs mt-1 font-medium leading-relaxed"
                      style={{ color: item.colors.primaryDark }}
                    >
                      {item.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p 
                    className="text-xs leading-relaxed"
                    style={{ color: isSelected ? 'var(--romantic-muted)' : item.colors.textMuted }}
                  >
                    {item.description}
                  </p>

                  {/* Color Swatches Palette */}
                  <div className="space-y-1.5 pt-1">
                    <span 
                      className="text-[10px] font-mono block"
                      style={{ color: isSelected ? 'var(--romantic-muted)' : item.colors.textMuted }}
                    >
                      核心色彩配置：
                    </span>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-7 h-7 rounded-xl border shadow-xs" 
                        style={{ backgroundColor: item.colors.primary, borderColor: item.colors.primaryDark }}
                        title={`主色調: ${item.colors.primary}`}
                      />
                      <div 
                        className="w-7 h-7 rounded-xl border shadow-xs" 
                        style={{ backgroundColor: item.colors.primaryDark, borderColor: item.colors.primary }}
                        title={`強調深色: ${item.colors.primaryDark}`}
                      />
                      <div 
                        className="w-7 h-7 rounded-xl border shadow-xs" 
                        style={{ backgroundColor: item.colors.accentGold, borderColor: item.colors.accentGoldLight }}
                        title={`燙金/點綴: ${item.colors.accentGold}`}
                      />
                      <div 
                        className="w-7 h-7 rounded-xl border shadow-xs" 
                        style={{ backgroundColor: item.colors.bg, borderColor: item.colors.cardBorder }}
                        title={`底色: ${item.colors.bg}`}
                      />
                      <div 
                        className="w-7 h-7 rounded-xl border shadow-xs" 
                        style={{ backgroundColor: item.colors.cardBg, borderColor: item.colors.cardBorder }}
                        title={`卡片底色: ${item.colors.cardBg}`}
                      />
                    </div>
                  </div>

                  {/* Sample Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.sampleTags.map((tag, i) => (
                      <span 
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md border"
                        style={{
                          backgroundColor: item.colors.primaryLight,
                          color: item.colors.textColor,
                          borderColor: item.colors.cardBorder
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Apply Button */}
                <div className="pt-5 mt-4 border-t" style={{ borderColor: item.colors.cardBorder }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTheme(item.id);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs ${
                      isSelected 
                        ? 'btn-romantic-primary text-white' 
                        : 'bg-white hover:opacity-90 border hover:shadow-sm'
                    }`}
                    style={!isSelected ? {
                      color: item.colors.primaryDark,
                      borderColor: item.colors.primary,
                      backgroundColor: item.colors.primaryLight
                    } : {}}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>已套用此風格</span>
                      </>
                    ) : (
                      <>
                        <Palette className="w-3.5 h-3.5" />
                        <span>套用「{item.shortName}」風格</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Component Showcase Section */}
      <div 
        className="rounded-3xl p-6 sm:p-8 border shadow-sm space-y-6"
        style={{ 
          backgroundColor: 'var(--romantic-card)', 
          borderColor: 'var(--romantic-border)' 
        }}
      >
        <div className="border-b pb-4" style={{ borderColor: 'var(--romantic-border)' }}>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5" style={{ color: 'var(--romantic-rose)' }} />
            <h3 className="font-serif text-xl font-bold" style={{ color: 'var(--romantic-ink)' }}>
              實景組件效果預覽（即時反映所選主題）
            </h3>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--romantic-muted)' }}>
            以下為本站核心模組在「{themeConfig.name}」風格下的真實樣貌：
          </p>
        </div>

        {/* 1. Sample Itinerary Card Preview */}
        <div className="space-y-2">
          <span className="text-xs font-bold font-mono uppercase tracking-wider" style={{ color: 'var(--romantic-rose)' }}>
            1. 行程活動卡片預覽
          </span>
          <div 
            className="p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4"
            style={{ 
              backgroundColor: 'var(--romantic-card)', 
              borderColor: 'var(--romantic-border)' 
            }}
          >
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2">
                <span 
                  className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border"
                  style={{ 
                    backgroundColor: 'var(--romantic-rose-light)', 
                    color: 'var(--romantic-rose-deep)',
                    borderColor: 'var(--romantic-border)'
                  }}
                >
                  ⏰ 18:30 - 20:30
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold vintage-gold-badge">
                  🍽️ 慶生精選大餐
                </span>
              </div>

              <h4 className="font-serif text-base sm:text-lg font-bold" style={{ color: 'var(--romantic-ink)' }}>
                隱密私廚浪漫慶生饗宴 · 壽星專屬特製甜點盤
              </h4>

              <div className="flex items-center space-x-4 text-xs" style={{ color: 'var(--romantic-muted)' }}>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--romantic-rose)' }} />
                  <span>台南市中西區友愛街</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Shirt className="w-3.5 h-3.5" style={{ color: 'var(--romantic-gold)' }} />
                  <span>優雅約會小洋裝</span>
                </span>
              </div>
            </div>

            <div className="flex sm:flex-col items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button className="px-4 py-2 rounded-xl text-xs font-bold btn-romantic-primary text-white cursor-pointer shadow-xs">
                查看地圖導航
              </button>
              <button className="px-3 py-1.5 rounded-xl text-xs font-medium btn-romantic-soft cursor-pointer">
                備註詳情
              </button>
            </div>
          </div>
        </div>

        {/* 2. Sample Surprise Card Preview & Snack Card Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Sample Surprise Card */}
          <div 
            className="p-5 rounded-2xl border space-y-3"
            style={{ 
              backgroundColor: 'var(--romantic-rose-light)', 
              borderColor: 'var(--romantic-border)' 
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md vintage-gold-badge">
                🎁 神秘驚喜任務
              </span>
              <span className="text-[11px] font-mono" style={{ color: 'var(--romantic-muted)' }}>
                Day 1 21:00 解鎖
              </span>
            </div>

            <div className="flex items-start space-x-3">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0"
                style={{ 
                  backgroundColor: 'var(--romantic-card)', 
                  borderColor: 'var(--romantic-border)' 
                }}
              >
                <Gift className="w-5 h-5 animate-bounce" style={{ color: 'var(--romantic-rose)' }} />
              </div>
              <div>
                <h5 className="font-serif font-bold text-sm" style={{ color: 'var(--romantic-ink)' }}>
                  神秘抽屜裡的法式手工客製小禮物
                </h5>
                <p className="text-xs mt-0.5" style={{ color: 'var(--romantic-muted)' }}>
                  線索：藏在飯店落地窗邊的白色提袋中 💕
                </p>
              </div>
            </div>
          </div>

          {/* Sample Snack Food Card */}
          <div 
            className="p-5 rounded-2xl border space-y-3"
            style={{ 
              backgroundColor: 'var(--romantic-card)', 
              borderColor: 'var(--romantic-border)' 
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md vintage-rose-badge">
                🥩 必吃美食投票
              </span>
              <span className="text-xs font-bold" style={{ color: 'var(--romantic-rose)' }}>
                🔥 兩人一致想吃！
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-serif font-bold text-sm" style={{ color: 'var(--romantic-ink)' }}>
                  文章牛肉湯（特選溫體牛）
                </h5>
                <p className="text-xs" style={{ color: 'var(--romantic-muted)' }}>
                  安平區熱門排隊溫體牛肉鮮甜滋味
                </p>
              </div>

              <div className="flex items-center space-x-1.5">
                <button className="px-3 py-1.5 rounded-xl text-xs font-bold btn-romantic-primary text-white flex items-center space-x-1 cursor-pointer">
                  <ThumbsUp className="w-3 h-3" />
                  <span>投一票</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

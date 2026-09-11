export type AppThemeId = 'ocean' | 'aegean' | 'sakura' | 'vintage' | 'peach' | 'sage' | 'midnight';

export interface AppThemeConfig {
  id: AppThemeId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  emoji: string;
  category: string;
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    accentGold: string;
    accentGoldLight: string;
    bg: string;
    cardBg: string;
    cardBorder: string;
    textColor: string;
    textMuted: string;
  };
  sampleTags: string[];
}

export const APP_THEMES: AppThemeConfig[] = [
  {
    id: 'ocean',
    name: '🌊 蔚藍海洋 · 純白海風',
    shortName: '蔚藍海風',
    tagline: '白底海風 · 純淨蔚藍海浪與清爽日光',
    description: '以極簡純白底色為基底，融合地中海蔚藍波光與日光金，帶來最清爽、明亮、純粹的夏日海濱度假氛圍，白底控首選！',
    emoji: '🌊',
    category: '最愛純白底 · 海洋風首選',
    colors: {
      primary: '#0284C7',
      primaryDark: '#0369A1',
      primaryLight: '#F0F9FF',
      accentGold: '#F59E0B',
      accentGoldLight: '#FEF3C7',
      bg: '#FFFFFF',
      cardBg: '#FFFFFF',
      cardBorder: '#E0F2FE',
      textColor: '#0F172A',
      textMuted: '#64748B',
    },
    sampleTags: ['純白極簡', '海洋蔚藍', '清爽透亮', '日光度假']
  },
  {
    id: 'aegean',
    name: '🏝️ 聖托里尼 · 愛琴海純白',
    shortName: '愛琴海藍',
    tagline: '極致純白 · 藍頂白牆與海天一色',
    description: '經典愛琴海藍白小鎮美學，純白石牆質感搭配深邃海藍與陽光珊瑚橙，乾淨無暇、洗鍊高雅。',
    emoji: '🏝️',
    category: '藍白極簡純境',
    colors: {
      primary: '#2563EB',
      primaryDark: '#1D4ED8',
      primaryLight: '#EFF6FF',
      accentGold: '#FB923C',
      accentGoldLight: '#FFF7ED',
      bg: '#FFFFFF',
      cardBg: '#FFFFFF',
      cardBorder: '#DBEAFE',
      textColor: '#1E293B',
      textMuted: '#64748B',
    },
    sampleTags: ['藍白極簡', '海天一色', '度假純境', '高對比白底']
  },
  {
    id: 'sakura',
    name: '🌸 櫻花粉戀 · 夢幻初戀粉',
    shortName: '櫻花粉戀',
    tagline: '甜美浪漫 · 專為女友打造的夢幻粉嫩感',
    description: '以柔嫩玫瑰櫻粉、珠光白底與香檳金交織，營造如初戀般心動、滿滿少女心的慶生氛圍，最適合晴寶的甜美浪漫手冊！',
    emoji: '🌸',
    category: '甜美浪漫女友視角',
    colors: {
      primary: '#E05D84',
      primaryDark: '#C23B64',
      primaryLight: '#FCF0F4',
      accentGold: '#D4A373',
      accentGoldLight: '#FAF0E6',
      bg: '#FFFFFF',
      cardBg: '#FFFFFF',
      cardBorder: '#FCE7F0',
      textColor: '#2E1E24',
      textMuted: '#8C6E79',
    },
    sampleTags: ['少女心噴發', '粉金浪漫', '甜美心動', '慶生首選']
  },
  {
    id: 'peach',
    name: '🍑 蜜桃暖陽 · 托斯卡尼',
    shortName: '蜜桃暖陽',
    tagline: '陽光活力 · 溫暖杏桃、蜜柑與陶土琥珀',
    description: '如同漫步在灑滿南國陽光的安平古堡與神農街，純白底色搭配明亮溫暖的珊瑚蜜桃色調，充滿陽光活力與甜蜜幸福感。',
    emoji: '🍑',
    category: '南國渡假暖陽',
    colors: {
      primary: '#E07A5F',
      primaryDark: '#C85A3D',
      primaryLight: '#FFF2EC',
      accentGold: '#F4A261',
      accentGoldLight: '#FEF4E8',
      bg: '#FFFFFF',
      cardBg: '#FFFFFF',
      cardBorder: '#FCECE4',
      textColor: '#332219',
      textMuted: '#8A6D5E',
    },
    sampleTags: ['陽光溫暖', '南國度假', '元氣蜜桃', '明亮甜美']
  },
  {
    id: 'sage',
    name: '🍃 晨曦森林 · 莫蘭迪鼠尾草綠',
    shortName: '晨曦森林',
    tagline: '自然清幽 · 森林晨霧、抹茶茶韻與燕麥杏',
    description: '舒心療癒的莫蘭迪灰綠色系，純白畫布點綴自然草木綠意，宛如台南巷弄老宅咖啡館的寧靜午後，清爽且耐看。',
    emoji: '🍃',
    category: '日系森系老宅',
    colors: {
      primary: '#4D7C5F',
      primaryDark: '#355C43',
      primaryLight: '#EFF6F2',
      accentGold: '#DDA15E',
      accentGoldLight: '#FAF1E4',
      bg: '#FFFFFF',
      cardBg: '#FFFFFF',
      cardBorder: '#E1EBE5',
      textColor: '#1E2B22',
      textMuted: '#677E6F',
    },
    sampleTags: ['清爽療癒', '森系文青', '耐看不膩', '老宅茶屋']
  },
  {
    id: 'vintage',
    name: '🍷 法式復古 · 勃艮第典雅',
    shortName: '法式復古',
    tagline: '古典文藝 · 羊皮紙、封蠟與勃艮第紅酒',
    description: '經典法式復古沙龍調性，採用溫潤白底、深紅勃艮第酒香與燙金古銅，散發濃郁手寫手帳的典雅厚度。',
    emoji: '🍷',
    category: '法式沙龍手帳',
    colors: {
      primary: '#BA5444',
      primaryDark: '#8C372A',
      primaryLight: '#FAF2EB',
      accentGold: '#C5A059',
      accentGoldLight: '#F7F2E7',
      bg: '#FAF8F5',
      cardBg: '#FFFFFF',
      cardBorder: '#E8DFC8',
      textColor: '#2C221E',
      textMuted: '#7A695E',
    },
    sampleTags: ['法式文藝', '典雅沈穩', '羊皮手帳', '古典封蠟']
  },
  {
    id: 'midnight',
    name: '🌌 星空微醺 · 午夜餐酒館',
    shortName: '星空微醺',
    tagline: '奢華微醺 · 燭光夜景、星夜藍紫與璀璨金',
    description: '深邃高貴的午夜藍紫底蘊，點綴如星光般的溫暖琥珀燭光金，宛如置身台南高空景觀酒吧與米其林餐酒館。',
    emoji: '🌌',
    category: '高空奢華夜景',
    colors: {
      primary: '#8B5CF6',
      primaryDark: '#6D28D9',
      primaryLight: '#261F42',
      accentGold: '#F59E0B',
      accentGoldLight: '#3D3120',
      bg: '#0F0C1B',
      cardBg: '#1A162B',
      cardBorder: '#352D54',
      textColor: '#F5F3FF',
      textMuted: '#A79EC4',
    },
    sampleTags: ['微醺氛圍', '星夜高空', '餐酒夜景', '沈浸式體驗']
  }
];

export const getThemeById = (id: string): AppThemeConfig => {
  return APP_THEMES.find(t => t.id === id) || APP_THEMES[0];
};

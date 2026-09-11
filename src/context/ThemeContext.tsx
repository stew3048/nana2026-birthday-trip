import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppThemeId, AppThemeConfig, APP_THEMES, getThemeById } from '../utils/themes';

interface ThemeContextType {
  theme: AppThemeId;
  themeConfig: AppThemeConfig;
  setTheme: (theme: AppThemeId) => void;
  availableThemes: AppThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialTheme?: AppThemeId }> = ({
  children,
  initialTheme = 'ocean'
}) => {
  const [theme, setThemeState] = useState<AppThemeId>(() => {
    try {
      const saved = localStorage.getItem('qingbao_active_theme');
      if (saved && ['ocean', 'aegean', 'sakura', 'vintage', 'peach', 'sage', 'midnight'].includes(saved)) {
        return saved as AppThemeId;
      }
    } catch (e) {}
    return initialTheme;
  });

  const setTheme = (newTheme: AppThemeId) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('qingbao_active_theme', newTheme);
    } catch (e) {}
  };

  const themeConfig = getThemeById(theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Dynamically apply primary CSS variables for seamless real-time transitions
    const root = document.documentElement;
    const colors = themeConfig.colors;

    root.style.setProperty('--romantic-bg', colors.bg);
    root.style.setProperty('--romantic-card', colors.cardBg);
    root.style.setProperty('--romantic-rose', colors.primary);
    root.style.setProperty('--romantic-rose-deep', colors.primaryDark);
    root.style.setProperty('--romantic-rose-light', colors.primaryLight);
    root.style.setProperty('--romantic-gold', colors.accentGold);
    root.style.setProperty('--romantic-gold-light', colors.accentGoldLight);
    root.style.setProperty('--romantic-ink', colors.textColor);
    root.style.setProperty('--romantic-muted', colors.textMuted);
    root.style.setProperty('--romantic-border', colors.cardBorder);
  }, [theme, themeConfig]);

  return (
    <ThemeContext.Provider value={{ theme, themeConfig, setTheme, availableThemes: APP_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

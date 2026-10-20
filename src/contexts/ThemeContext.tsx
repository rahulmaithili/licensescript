import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AccentColor } from '@/types';
import { getAccent, isAccentColor, DEFAULT_ACCENT } from '@/lib/accents';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('lw_theme_mode') as ThemeMode) || 'dark';
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const stored = localStorage.getItem('lw_accent_color');
    return isAccentColor(stored) ? stored : DEFAULT_ACCENT;
  });

  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme-color', accentColor);
    localStorage.setItem('lw_accent_color', accentColor);
    // Keep the browser chrome colour in sync with the active accent.
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', getAccent(accentColor).brand);
    }
  }, [accentColor]);

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('lw_theme_mode', themeMode);

    if (themeMode === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
        setIsDark(true);
      } else {
        root.classList.remove('dark');
        setIsDark(false);
      }

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add('dark');
          setIsDark(true);
        } else {
          root.classList.remove('dark');
          setIsDark(false);
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (themeMode === 'dark') {
      root.classList.add('dark');
      setIsDark(true);
    } else {
      root.classList.remove('dark');
      setIsDark(false);
    }
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, accentColor, setThemeMode, setAccentColor, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

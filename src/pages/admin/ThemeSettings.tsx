import React, { useState } from 'react';
import { Palette, Check, Sun, Moon, Laptop, Sparkles, RotateCcw } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import type { AccentColor } from '@/types';

// NOTE: these swatches ARE the selectable accent palette, so each preset
// keeps its own colour — that is the feature of this page, so the swatch is
// painted from the preset's hex data via inline style. All surrounding page
// chrome (icons, selected rings, primary actions) follows the active accent
// through the --brand CSS variables (the (--brand) Tailwind shorthand).
const ACCENT_PRESETS: { id: AccentColor; name: string; hex: string }[] = [
  { id: 'royal', name: 'Royal Blue', hex: '#1E40FF' },
  { id: 'indigo', name: 'Royal Indigo', hex: '#4f46e5' },
  { id: 'emerald', name: 'Emerald Green', hex: '#059669' },
  { id: 'rose', name: 'Rose Red', hex: '#e11d48' },
  { id: 'amber', name: 'Amber Gold', hex: '#d97706' },
  { id: 'sky', name: 'Sky Cyan', hex: '#0284c7' },
  { id: 'violet', name: 'Neon Violet', hex: '#7c3aed' },
];

const cardClass =
  'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4';

export const ThemeSettings: React.FC = () => {
  // All theme state lives in ThemeContext: its setters update the
  // `data-theme-color` attribute / `.dark` class on <html> AND persist to
  // localStorage (lw_theme_mode / lw_accent_color), so choices survive a
  // reload and apply across the whole app — not just this page.
  const { themeMode, setThemeMode, accentColor, setAccentColor, isDark } = useTheme();
  const [appliedMsg, setAppliedMsg] = useState('');

  const flashApplied = (msg: string) => {
    setAppliedMsg(msg);
    setTimeout(() => setAppliedMsg(''), 3000);
  };

  const handleMode = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    flashApplied('Display mode applied and saved automatically.');
  };

  const handleAccent = (color: AccentColor, name: string) => {
    setAccentColor(color);
    flashApplied(`${name} accent applied and saved automatically.`);
  };

  const handleReset = () => {
    setThemeMode('dark');
    setAccentColor('royal');
    flashApplied('Theme reset to defaults (Dark mode, Royal Blue) and saved.');
  };

  const modeButton = (
    mode: 'light' | 'dark' | 'system',
    icon: React.ReactNode,
    title: string,
    subtitle: string
  ) => (
    <button
      onClick={() => handleMode(mode)}
      aria-pressed={themeMode === mode}
      className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
        themeMode === mode
          ? 'bg-(--brand-soft) dark:bg-(--brand)/10 border-(--brand) ring-2 ring-(--brand)/30'
          : 'bg-(--brand-soft)/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-(--brand)/50'
      }`}
    >
      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-(--brand) shadow-sm">
        {icon}
      </div>
      <div>
        <span className="font-bold text-sm text-[#0A1330] dark:text-white block">{title}</span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</span>
      </div>
      {themeMode === mode && <Check className="w-4 h-4 text-(--brand) ml-auto shrink-0" />}
    </button>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1330] dark:text-white flex items-center gap-2.5">
            <Palette className="w-8 h-8 text-(--brand)" />
            Theme & Brand Styling
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customize the visual interface. Pick your primary brand accent and default color mode.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Currently showing: <span className="font-bold text-[#0A1330] dark:text-white">{isDark ? 'Dark' : 'Light'}</span>
            {' · '}Mode: <span className="font-bold text-[#0A1330] dark:text-white capitalize">{themeMode}</span>
            {' · '}Accent: <span className="font-bold text-[#0A1330] dark:text-white">{ACCENT_PRESETS.find((p) => p.id === accentColor)?.name || accentColor}</span>
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2.5 rounded-full bg-white dark:bg-slate-800 hover:bg-(--brand-soft) dark:hover:bg-slate-700 text-[#0A1330] dark:text-slate-300 text-sm font-semibold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to defaults</span>
        </button>
      </div>

      {appliedMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{appliedMsg}</span>
        </div>
      )}

      {/* Mode Selection */}
      <div className={cardClass}>
        <h2 className="text-base font-bold text-[#0A1330] dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-(--brand)" />
          Display Theme Mode
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {modeButton('dark', <Moon className="w-5 h-5" />, 'Dark Mode', 'High-contrast SaaS feel')}
          {modeButton('light', <Sun className="w-5 h-5" />, 'Light Mode', 'Crisp clean daytime look')}
          {modeButton('system', <Laptop className="w-5 h-5" />, 'System Match', 'Follow OS settings')}
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Applied instantly via ThemeContext and stored in your browser, so it stays selected after a reload.
        </p>
      </div>

      {/* Accent Color Palette */}
      <div className={cardClass}>
        <h2 className="text-base font-bold text-[#0A1330] dark:text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-(--brand)" />
          Primary Accent Palette
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Applied across all action buttons, key tags, active tabs, and highlights.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {ACCENT_PRESETS.map((preset) => {
            const isSelected = accentColor === preset.id;

            return (
              <button
                key={preset.id}
                onClick={() => handleAccent(preset.id, preset.name)}
                aria-pressed={isSelected}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  isSelected
                    ? 'bg-(--brand-soft) dark:bg-slate-800 border-(--brand) ring-2 ring-(--brand)/30'
                    : 'bg-(--brand-soft)/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 hover:bg-(--brand-soft) dark:hover:bg-slate-800'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-md"
                  style={{ backgroundColor: preset.hex }}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <div>
                  <span className="font-bold text-xs text-[#0A1330] dark:text-white block">{preset.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{preset.hex}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Interactive Preview */}
      <div className={cardClass}>
        <h2 className="text-base font-bold text-[#0A1330] dark:text-white">Live CSS Component Preview</h2>

        <div className="p-6 rounded-2xl bg-(--brand-soft) dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button className="px-4 py-2 rounded-full bg-(--brand) hover:bg-(--brand-hover) text-white text-xs font-bold shadow-lg transition-colors">
              Primary Button
            </button>
            <span className="px-3 py-1 rounded-full text-xs font-bold text-(--brand) bg-(--brand)/10 border border-(--brand)/20">
              Accent Badge
            </span>
            <span className="font-mono text-xs font-bold text-(--brand)">
              LW-XXXX-XXXX-XXXX
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            CSS variable <code className="text-(--brand) font-mono font-bold">--brand</code> is switched on the root document element
            by ThemeContext whenever you pick a mode or accent above — the same variable drives buttons, badges and highlights
            across the whole app. Try switching to Light Mode and this page stays readable.
          </p>
        </div>
      </div>
    </div>
  );
};

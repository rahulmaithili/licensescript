import React from 'react';
import { Palette, Check, Sun, Moon, Laptop, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import type { AccentColor } from '@/types';

const ACCENT_PRESETS: { id: AccentColor; name: string; hex: string; bgClass: string }[] = [
  { id: 'indigo', name: 'Royal Indigo', hex: '#4f46e5', bgClass: 'bg-indigo-600' },
  { id: 'emerald', name: 'Emerald Green', hex: '#059669', bgClass: 'bg-emerald-600' },
  { id: 'rose', name: 'Rose Red', hex: '#e11d48', bgClass: 'bg-rose-600' },
  { id: 'amber', name: 'Amber Gold', hex: '#d97706', bgClass: 'bg-amber-600' },
  { id: 'sky', name: 'Sky Cyan', hex: '#0284c7', bgClass: 'bg-sky-600' },
  { id: 'violet', name: 'Neon Violet', hex: '#7c3aed', bgClass: 'bg-violet-600' },
];

export const ThemeSettings: React.FC = () => {
  const { themeMode, setThemeMode, accentColor, setAccentColor, isDark } = useTheme();

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Palette className="w-8 h-8 text-indigo-400" />
          Theme & Brand Styling
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize the visual interface. Pick your primary brand accent and default color mode.
        </p>
      </div>

      {/* Mode Selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Display Theme Mode
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setThemeMode('dark')}
            className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
              themeMode === 'dark'
                ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30'
                : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-slate-800 text-amber-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block">Dark Mode</span>
              <span className="text-[11px] text-slate-400">High-contrast SaaS feel</span>
            </div>
          </button>

          <button
            onClick={() => setThemeMode('light')}
            className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
              themeMode === 'light'
                ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30'
                : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-slate-800 text-amber-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block">Light Mode</span>
              <span className="text-[11px] text-slate-400">Crisp clean daytime look</span>
            </div>
          </button>

          <button
            onClick={() => setThemeMode('system')}
            className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
              themeMode === 'system'
                ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30'
                : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block">System Match</span>
              <span className="text-[11px] text-slate-400">Follow OS settings</span>
            </div>
          </button>
        </div>
      </div>

      {/* Accent Color Palette */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-400" />
          Primary Accent Palette
        </h2>
        <p className="text-xs text-slate-400">
          Applied across all action buttons, key tags, active tabs, and highlights.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {ACCENT_PRESETS.map((preset) => {
            const isSelected = accentColor === preset.id;

            return (
              <button
                key={preset.id}
                onClick={() => setAccentColor(preset.id)}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-white ring-2 ring-white/20'
                    : 'bg-slate-800/50 border-slate-700/80 hover:bg-slate-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${preset.bgClass} flex items-center justify-center text-white shrink-0 shadow-md`}>
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">{preset.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{preset.hex}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Interactive Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white">Live CSS Component Preview</h2>

        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold shadow-lg shadow-indigo-600/30">
              Primary Button
            </button>
            <span className="px-3 py-1 rounded-full text-xs font-bold text-accent bg-accent/10 border border-accent/20">
              Accent Badge
            </span>
            <span className="font-mono text-xs font-bold text-accent">
              LW-SAMPLE-KEY-2026
            </span>
          </div>
          <p className="text-xs text-slate-400">
            CSS variable <code className="text-accent font-mono font-bold">--accent</code> is dynamically updated on the root document element.
          </p>
        </div>
      </div>
    </div>
  );
};

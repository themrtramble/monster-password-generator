import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Check, Sliders } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateRandomPassword, DEFAULT_SYMBOLS, EXTENDED_SYMBOLS } from '../utils/generators';
import type { RandomOptions } from '../utils/generators';
import type { StrengthAnalysis } from '../utils/strengthEngine';
import { analyzePassword } from '../utils/strengthEngine';
import { StrengthMeter } from './StrengthMeter';
import { sounds } from '../utils/soundEffects';

interface CustomStudioProps {
  onSaveToHistory?: (password: string, analysis: StrengthAnalysis) => void;
}

export const CustomStudio: React.FC<CustomStudioProps> = ({ onSaveToHistory }) => {
  const [opts, setOpts] = useState<RandomOptions>({
    length: 20,
    lower: true,
    upper: true,
    digits: true,
    symbols: true,
    symbolSet: DEFAULT_SYMBOLS,
    brackets: false,
    emoji: false,
    unicodeExtra: false,
    hexOnly: false,
    excludeAmbiguous: true,
    excludeSimilarSymbols: true,
    noRepeat: false,
    forceAllTypes: true,
    customChars: '',
    excludeChars: '',
  });

  const [symbolPreset, setSymbolPreset] = useState<'standard' | 'extended' | 'custom'>('standard');
  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<StrengthAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    sounds.playClick();
    setError(null);
    try {
      const { password: newPw } = generateRandomPassword(opts);
      setPassword(newPw);
      const ana = analyzePassword(newPw);
      setAnalysis(ana);
      if (onSaveToHistory) onSaveToHistory(newPw, ana);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to generate password with selected options.');
      }
    }
  };

  useEffect(() => {
    handleGenerate();
  }, [opts]);

  const handleOptionChange = <K extends keyof RandomOptions>(key: K, value: RandomOptions[K]) => {
    setOpts(prev => ({ ...prev, [key]: value }));
  };

  const handleSymbolPresetChange = (preset: 'standard' | 'extended' | 'custom') => {
    setSymbolPreset(preset);
    if (preset === 'standard') handleOptionChange('symbolSet', DEFAULT_SYMBOLS);
    else if (preset === 'extended') handleOptionChange('symbolSet', EXTENDED_SYMBOLS);
  };

  const handleCopy = () => {
    if (!password) return;
    sounds.playCopyChime();
    navigator.clipboard.writeText(password);
    setCopied(true);

    confetti({ particleCount: 40, spread: 60, origin: { y: 0.75 } });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Studio Controls Header */}
      <div className="p-6 rounded-3xl glass-card border border-cyan-500/30 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Custom Studio</h2>
            <p className="text-xs text-slate-400">Configure character pools, exclusions, and entropy settings</p>
          </div>
        </div>

        {/* Display Box */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/40 shadow-inner">
          <div className="w-full overflow-x-auto no-scrollbar py-2 text-center md:text-left">
            <span className="font-mono text-xl md:text-2xl font-extrabold tracking-wider text-cyan-200 select-all">
              {password || 'Select options...'}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleGenerate}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition transform hover:rotate-180 duration-500"
              title="Generate New Password"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-950 transition transform active:scale-95 shadow-lg ${
                copied ? 'bg-emerald-400' : 'bg-gradient-to-r from-cyan-400 to-fuchsia-400 hover:brightness-110'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Length Slider */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-300 uppercase tracking-wider">
            <span>Password Length</span>
            <span className="text-lg font-black text-cyan-300">{opts.length}</span>
          </div>
          <input
            type="range"
            min="4"
            max="128"
            value={opts.length}
            onChange={(e) => handleOptionChange('length', parseInt(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Character Sets Toggle Grid */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
            Character Sets & Modes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Lowercase */}
            <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${opts.lower ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
              <span className="text-xs font-bold">Lowercase (a-z)</span>
              <input
                type="checkbox"
                checked={opts.lower}
                onChange={(e) => handleOptionChange('lower', e.target.checked)}
                className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
              />
            </label>

            {/* Uppercase */}
            <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${opts.upper ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
              <span className="text-xs font-bold">Uppercase (A-Z)</span>
              <input
                type="checkbox"
                checked={opts.upper}
                onChange={(e) => handleOptionChange('upper', e.target.checked)}
                className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
              />
            </label>

            {/* Digits */}
            <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${opts.digits ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
              <span className="text-xs font-bold">Digits (0-9)</span>
              <input
                type="checkbox"
                checked={opts.digits}
                onChange={(e) => handleOptionChange('digits', e.target.checked)}
                className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
              />
            </label>

            {/* Symbols */}
            <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${opts.symbols ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
              <span className="text-xs font-bold">Symbols (!@#$)</span>
              <input
                type="checkbox"
                checked={opts.symbols}
                onChange={(e) => handleOptionChange('symbols', e.target.checked)}
                className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
              />
            </label>

            {/* Brackets */}
            <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${opts.brackets ? 'bg-fuchsia-500/10 border-fuchsia-500/40 text-fuchsia-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
              <span className="text-xs font-bold">Brackets ()[]{}&lt;&gt;</span>
              <input
                type="checkbox"
                checked={opts.brackets}
                onChange={(e) => handleOptionChange('brackets', e.target.checked)}
                className="accent-fuchsia-400 w-4 h-4 rounded cursor-pointer"
              />
            </label>

            {/* Emojis */}
            <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${opts.emoji ? 'bg-amber-500/10 border-amber-500/40 text-amber-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
              <span className="text-xs font-bold">🔥 Emojis</span>
              <input
                type="checkbox"
                checked={opts.emoji}
                onChange={(e) => handleOptionChange('emoji', e.target.checked)}
                className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
              />
            </label>

            {/* Unicode Accents */}
            <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${opts.unicodeExtra ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
              <span className="text-xs font-bold">Accented Unicode (é, ñ...)</span>
              <input
                type="checkbox"
                checked={opts.unicodeExtra}
                onChange={(e) => handleOptionChange('unicodeExtra', e.target.checked)}
                className="accent-emerald-400 w-4 h-4 rounded cursor-pointer"
              />
            </label>

            {/* Hex Only */}
            <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${opts.hexOnly ? 'bg-purple-500/10 border-purple-500/40 text-purple-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
              <span className="text-xs font-bold">HEX-Only Mode</span>
              <input
                type="checkbox"
                checked={opts.hexOnly}
                onChange={(e) => handleOptionChange('hexOnly', e.target.checked)}
                className="accent-purple-400 w-4 h-4 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Symbol Set Selector */}
        {opts.symbols && !opts.hexOnly && (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
              Symbol Set Preset
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSymbolPresetChange('standard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${symbolPreset === 'standard' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
              >
                Standard (!@#$...)
              </button>
              <button
                onClick={() => handleSymbolPresetChange('extended')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${symbolPreset === 'extended' ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
              >
                Extended (¬±§€£...)
              </button>
              <button
                onClick={() => handleSymbolPresetChange('custom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${symbolPreset === 'custom' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
              >
                Custom Symbols
              </button>
            </div>
            {symbolPreset === 'custom' && (
              <input
                type="text"
                value={opts.symbolSet || ''}
                onChange={(e) => handleOptionChange('symbolSet', e.target.value)}
                placeholder="Enter symbols (e.g. !@#$...)"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-400 outline-none"
              />
            )}
          </div>
        )}

        {/* Filters & Exclusions */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
            Exclusions & Safety Filters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${opts.excludeAmbiguous ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
              <span className="text-xs font-bold">Exclude Ambiguous (il1Lo0O)</span>
              <input
                type="checkbox"
                checked={opts.excludeAmbiguous}
                onChange={(e) => handleOptionChange('excludeAmbiguous', e.target.checked)}
                className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
              />
            </label>

            <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${opts.excludeSimilarSymbols ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
              <span className="text-xs font-bold">Exclude Similar (|`'")</span>
              <input
                type="checkbox"
                checked={opts.excludeSimilarSymbols}
                onChange={(e) => handleOptionChange('excludeSimilarSymbols', e.target.checked)}
                className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
              />
            </label>

            <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${opts.noRepeat ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
              <span className="text-xs font-bold">No Repeated Characters</span>
              <input
                type="checkbox"
                checked={opts.noRepeat}
                onChange={(e) => handleOptionChange('noRepeat', e.target.checked)}
                className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
              />
            </label>

            <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${opts.forceAllTypes ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
              <span className="text-xs font-bold">Force 1+ of Each Type</span>
              <input
                type="checkbox"
                checked={opts.forceAllTypes}
                onChange={(e) => handleOptionChange('forceAllTypes', e.target.checked)}
                className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Custom Include & Exclude Specific Chars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1 block">Custom Included Characters</label>
            <input
              type="text"
              value={opts.customChars || ''}
              onChange={(e) => handleOptionChange('customChars', e.target.value)}
              placeholder="e.g. ⚡🔥"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 mb-1 block">Custom Excluded Characters</label>
            <input
              type="text"
              value={opts.excludeChars || ''}
              onChange={(e) => handleOptionChange('excludeChars', e.target.value)}
              placeholder="e.g. xyz123"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Strength Output */}
      {analysis && (
        <StrengthMeter
          analysis={analysis}
          currentPassword={password}
          onApplyEnhanced={(enhanced) => {
            setPassword(enhanced);
            const ana = analyzePassword(enhanced);
            setAnalysis(ana);
            if (onSaveToHistory) onSaveToHistory(enhanced, ana);
          }}
        />
      )}
    </div>
  );
};

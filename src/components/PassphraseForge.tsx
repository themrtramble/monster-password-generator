import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Check, Type } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generatePassphrase, generatePronounceablePassword } from '../utils/generators';
import type { PassphraseOptions } from '../utils/generators';
import type { StrengthAnalysis } from '../utils/strengthEngine';
import { analyzePassword } from '../utils/strengthEngine';
import { StrengthMeter } from './StrengthMeter';
import { sounds } from '../utils/soundEffects';

interface PassphraseForgeProps {
  onSaveToHistory?: (password: string, analysis: StrengthAnalysis) => void;
}

export const PassphraseForge: React.FC<PassphraseForgeProps> = ({ onSaveToHistory }) => {
  const [mode, setMode] = useState<'passphrase' | 'pronounceable'>('passphrase');
  const [opts, setOpts] = useState<PassphraseOptions>({
    wordCount: 4,
    separator: '-',
    capitalize: true,
    includeNumber: true,
    includeSymbol: true
  });
  const [pronounceLen, setPronounceLen] = useState<number>(14);

  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<StrengthAnalysis | null>(null);

  const handleGenerate = () => {
    sounds.playClick();
    let newPw = '';
    if (mode === 'passphrase') {
      newPw = generatePassphrase(opts);
    } else {
      newPw = generatePronounceablePassword(pronounceLen);
    }
    setPassword(newPw);
    const ana = analyzePassword(newPw);
    setAnalysis(ana);
    if (onSaveToHistory) onSaveToHistory(newPw, ana);
  };

  useEffect(() => {
    handleGenerate();
  }, [opts, mode, pronounceLen]);

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
      <div className="p-6 rounded-3xl glass-card border border-cyan-500/30 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Passphrase & Phonetic Forge</h2>
              <p className="text-xs text-slate-400">High entropy memorable passwords built from curated wordlists or syllables</p>
            </div>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setMode('passphrase')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${mode === 'passphrase' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'}`}
            >
              Multi-Word Passphrase
            </button>
            <button
              onClick={() => setMode('pronounceable')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${mode === 'pronounceable' ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40' : 'text-slate-400'}`}
            >
              Phonetic Syllable
            </button>
          </div>
        </div>

        {mode === 'passphrase' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Word Count Slider */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2 col-span-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>Word Count</span>
                <span className="text-lg font-black text-cyan-300">{opts.wordCount}</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                value={opts.wordCount}
                onChange={(e) => setOpts({ ...opts, wordCount: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Separator */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
              <label className="text-xs font-bold text-slate-400 block">Separator Character</label>
              <select
                value={opts.separator}
                onChange={(e) => setOpts({ ...opts, separator: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono outline-none"
              >
                <option value="-">Hyphen (-)</option>
                <option value="_">Underscore (_)</option>
                <option value=".">Period (.)</option>
                <option value=" ">Space ( )</option>
                <option value="#">Hash (#)</option>
                <option value="@">At sign (@)</option>
              </select>
            </div>

            {/* Controls */}
            <div className="flex flex-col justify-center gap-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={opts.capitalize}
                  onChange={(e) => setOpts({ ...opts, capitalize: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4 rounded"
                />
                Capitalize Each Word
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={opts.includeNumber}
                  onChange={(e) => setOpts({ ...opts, includeNumber: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4 rounded"
                />
                Add Random Number
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={opts.includeSymbol}
                  onChange={(e) => setOpts({ ...opts, includeSymbol: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4 rounded"
                />
                Add Random Symbol
              </label>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2 max-w-md">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span>Syllable Length</span>
              <span className="text-lg font-black text-fuchsia-300">{pronounceLen}</span>
            </div>
            <input
              type="range"
              min="8"
              max="24"
              value={pronounceLen}
              onChange={(e) => setPronounceLen(parseInt(e.target.value))}
              className="w-full accent-fuchsia-400 cursor-pointer"
            />
          </div>
        )}

        {/* Display Box */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/40 shadow-inner">
          <div className="w-full overflow-x-auto no-scrollbar py-2 text-center md:text-left">
            <span className="font-mono text-xl md:text-2xl font-extrabold tracking-wider text-cyan-200 select-all">
              {password}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleGenerate}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition transform hover:rotate-180 duration-500"
              title="Generate New Passphrase"
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
      </div>

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

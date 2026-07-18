import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Check, Hash, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generatePatternPassword, DEFAULT_SYMBOLS } from '../utils/generators';
import type { StrengthAnalysis } from '../utils/strengthEngine';
import { analyzePassword } from '../utils/strengthEngine';
import { StrengthMeter } from './StrengthMeter';
import { sounds } from '../utils/soundEffects';

interface PatternForgeProps {
  onSaveToHistory?: (password: string, analysis: StrengthAnalysis) => void;
}

export const PatternForge: React.FC<PatternForgeProps> = ({ onSaveToHistory }) => {
  const [pattern, setPattern] = useState<string>('ULLL-DDDD-SSLL');
  const [symbolSet, setSymbolSet] = useState<string>(DEFAULT_SYMBOLS);
  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<StrengthAnalysis | null>(null);

  const presets = [
    { label: 'Standard Web', pattern: 'ULLL-DDDD-SSLL' },
    { label: 'High Security Key', pattern: 'XXXX-XXXX-XXXX-XXXX' },
    { label: 'Pin & Symbol Mix', pattern: 'DDDD-SSSS-DDDD' },
    { label: 'Ambiguous-Free Alnum', pattern: 'AAAA-AAAA-AAAA-AAAA' },
    { label: 'License Product Key', pattern: 'UUUU-DDDD-UUUU-DDDD' }
  ];

  const handleGenerate = () => {
    sounds.playClick();
    if (!pattern) return;
    const newPw = generatePatternPassword(pattern, symbolSet);
    setPassword(newPw);
    const ana = analyzePassword(newPw);
    setAnalysis(ana);
    if (onSaveToHistory) onSaveToHistory(newPw, ana);
  };

  useEffect(() => {
    handleGenerate();
  }, [pattern, symbolSet]);

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
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Pattern Forge</h2>
            <p className="text-xs text-slate-400">Design custom structural templates using pattern legend tokens</p>
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Info className="w-4 h-4 text-cyan-400" /> Pattern Legend:
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-mono">L = lowercase</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300 font-mono">U = UPPERCASE</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-mono">D = Digit (0-9)</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-mono">S = Symbol</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-mono">A = Alnum (no il1Lo0O)</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-mono">X = Any Char</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-400">others = literal hyphen/space</span>
          </div>
        </div>

        {/* Preset Badges */}
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setPattern(p.pattern)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${pattern === p.pattern ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
            >
              {p.label} <span className="font-mono opacity-70">({p.pattern})</span>
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1 block">Pattern Template String</label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. ULLL-DDDD-SSLL"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-cyan-500/30 font-mono text-cyan-200 text-sm focus:border-cyan-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 mb-1 block">Symbols to use for 'S'</label>
            <input
              type="text"
              value={symbolSet}
              onChange={(e) => setSymbolSet(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-slate-300 text-xs focus:border-cyan-400 outline-none"
            />
          </div>
        </div>

        {/* Result Display Box */}
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

import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Check, Shield, Zap, Eye, EyeOff } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateRandomPassword } from '../utils/generators';
import type { StrengthAnalysis } from '../utils/strengthEngine';
import { analyzePassword } from '../utils/strengthEngine';
import { StrengthMeter } from './StrengthMeter';
import { sounds } from '../utils/soundEffects';

interface QuickGeneratorProps {
  onSaveToHistory?: (password: string, analysis: StrengthAnalysis) => void;
}

export const QuickGenerator: React.FC<QuickGeneratorProps> = ({ onSaveToHistory }) => {
  const [length, setLength] = useState<number>(24);
  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [masked, setMasked] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<StrengthAnalysis | null>(null);

  const handleGenerate = () => {
    sounds.playClick();
    try {
      const { password: newPw } = generateRandomPassword({
        length,
        lower: true,
        upper: true,
        digits: true,
        symbols: true,
        excludeAmbiguous: true,
        excludeSimilarSymbols: true,
        forceAllTypes: true
      });
      setPassword(newPw);
      const ana = analyzePassword(newPw);
      setAnalysis(ana);
      if (onSaveToHistory) onSaveToHistory(newPw, ana);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    handleGenerate();
  }, [length]);

  const handleCopy = () => {
    if (!password) return;
    sounds.playCopyChime();
    navigator.clipboard.writeText(password);
    setCopied(true);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.75 }
    });

    setTimeout(() => setCopied(false), 2000);
  };

  const displayString = masked
    ? password.length <= 4
      ? '*'.repeat(password.length)
      : password.slice(0, 2) + '*'.repeat(password.length - 4) + password.slice(-2)
    : password;

  return (
    <div className="space-y-6">
      {/* Primary Card */}
      <div className="p-6 md:p-8 rounded-3xl glass-card border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/10 via-fuchsia-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Quick Generator</h2>
              <p className="text-xs text-slate-400">High-entropy military grade preset (24 chars, 4 charsets)</p>
            </div>
          </div>

          <button
            onClick={() => setMasked(!masked)}
            className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title={masked ? "Unmask password" : "Mask password"}
          >
            {masked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Password Display Box */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-6 rounded-2xl bg-slate-950/80 border border-cyan-500/40 shadow-inner group">
          <div className="w-full overflow-x-auto no-scrollbar py-2 text-center md:text-left">
            <span className="font-mono text-xl md:text-3xl font-extrabold tracking-wider text-cyan-200 select-all drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]">
              {displayString}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleGenerate}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all transform hover:rotate-180 duration-500"
              title="Generate New Password"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-950 transition-all transform active:scale-95 shadow-lg ${
                copied
                  ? 'bg-emerald-400 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 hover:brightness-110 shadow-cyan-500/30 hover:scale-105'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-slate-950" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 text-slate-950" />
                  Copy Password
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Length Slider */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Length:</span>
            <span className="text-lg font-black text-cyan-300 w-8">{length}</span>
            <input
              type="range"
              min="8"
              max="64"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full sm:w-64 accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Entropy: <span className="text-emerald-300 font-extrabold">{analysis?.effectiveEntropyBits || 0} bits</span></span>
          </div>
        </div>
      </div>

      {/* Strength Analysis Card */}
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

import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Wand2, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import type { StrengthAnalysis } from '../utils/strengthEngine';
import { autoEnhancePassword } from '../utils/strengthEngine';
import { sounds } from '../utils/soundEffects';

interface StrengthMeterProps {
  analysis: StrengthAnalysis;
  currentPassword?: string;
  onApplyEnhanced?: (newPw: string) => void;
}

export const StrengthMeter: React.FC<StrengthMeterProps> = ({
  analysis,
  currentPassword = '',
  onApplyEnhanced
}) => {
  const handleEnhance = () => {
    sounds.playPowerSound();
    const enhanced = autoEnhancePassword(currentPassword);
    if (onApplyEnhanced) {
      onApplyEnhanced(enhanced);
    }
  };

  const circleRadius = 38;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (analysis.scorePercent / 100) * circumference;

  return (
    <div className="flex flex-col gap-6 p-6 rounded-2xl glass-card border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Background radial highlight */}
      <div
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: analysis.badgeHex }}
      />

      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl border shadow-inner transition-colors duration-300"
            style={{
              backgroundColor: `${analysis.badgeHex}15`,
              borderColor: `${analysis.badgeHex}40`
            }}
          >
            {analysis.scorePercent >= 60 ? (
              <ShieldCheck className="w-6 h-6" style={{ color: analysis.badgeHex }} />
            ) : (
              <ShieldAlert className="w-6 h-6" style={{ color: analysis.badgeHex }} />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Strength Analysis
              <span
                className="px-2.5 py-0.5 text-xs font-extrabold uppercase rounded-full tracking-wider"
                style={{
                  backgroundColor: `${analysis.badgeHex}20`,
                  color: analysis.badgeHex,
                  border: `1px solid ${analysis.badgeHex}50`
                }}
              >
                {analysis.label}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-vector Shannon & Pattern Entropy Breakdown
            </p>
          </div>
        </div>

        {/* Auto-Enhance Button */}
        {onApplyEnhanced && currentPassword && (
          <button
            onClick={handleEnhance}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-gradient-to-r from-cyan-400 via-fuchsia-300 to-emerald-300 hover:brightness-110 shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all transform hover:scale-105 active:scale-95"
          >
            <Wand2 className="w-4 h-4 text-slate-950" />
            Auto-Fix & Enhance Strength
          </button>
        )}
      </div>

      {/* Gauges & Entropy Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Score Ring */}
        <div className="flex items-center justify-center p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r={circleRadius}
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r={circleRadius}
                stroke={`url(#scoreGradient-${analysis.scorePercent})`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id={`scoreGradient-${analysis.scorePercent}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={analysis.badgeHex} />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-100 tracking-tighter">
                {analysis.scorePercent}%
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
            </div>
          </div>
        </div>

        {/* Bit Entropy metrics */}
        <div className="sm:col-span-2 grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Effective Entropy
            </span>
            <span className="text-xl font-extrabold text-cyan-300 mt-1 block">
              {analysis.effectiveEntropyBits} <span className="text-xs font-normal text-slate-400">bits</span>
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Pattern-adjusted bit strength
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Shannon Pool Entropy
            </span>
            <span className="text-xl font-extrabold text-slate-200 mt-1 block">
              {analysis.poolEntropyBits} <span className="text-xs font-normal text-slate-400">bits</span>
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Raw character set complexity
            </span>
          </div>

          <div className="col-span-2 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Character Diversity:</span>
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${analysis.diversity.hasLower ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-600'}`}>a-z</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${analysis.diversity.hasUpper ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-600'}`}>A-Z</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${analysis.diversity.hasDigits ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-600'}`}>0-9</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${analysis.diversity.hasSymbols ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-600'}`}>!@#</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${analysis.diversity.hasUnicodeOrEmoji ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40' : 'bg-slate-800 text-slate-600'}`}>🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Vector Crack Time Matrix */}
      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Time Required to Crack Across Scenarios
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Online Throttled
            </span>
            <span className="text-[10px] text-slate-500 block mb-1">100 attempts/sec</span>
            <span className="text-sm font-extrabold text-cyan-300">
              {analysis.crackTimes.onlineThrottled}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Online Fast API
            </span>
            <span className="text-[10px] text-slate-500 block mb-1">10,000 attempts/sec</span>
            <span className="text-sm font-extrabold text-cyan-300">
              {analysis.crackTimes.onlineFast}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Offline Slow Hash
            </span>
            <span className="text-[10px] text-slate-500 block mb-1">Argon2id / bcrypt</span>
            <span className="text-sm font-extrabold text-emerald-400">
              {analysis.crackTimes.offlineSlowHash}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Offline Fast GPU
            </span>
            <span className="text-[10px] text-slate-500 block mb-1">100B hashes/sec</span>
            <span className="text-sm font-extrabold text-rose-400">
              {analysis.crackTimes.offlineFastHash}
            </span>
          </div>
        </div>
      </div>

      {/* Pattern Warnings & Deductions */}
      {analysis.penaltiesApplied.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Detected Pattern Penalties ({analysis.penaltiesApplied.length})
          </h4>
          <div className="space-y-1.5">
            {analysis.penaltiesApplied.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-rose-200">
                <span>• {item.reason}</span>
                <span className="font-bold text-rose-400">-{item.deductionBits} bits</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
          <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Recommendations to Boost Strength
          </h4>
          <ul className="space-y-1 text-xs text-slate-300">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

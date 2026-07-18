import React, { useState } from 'react';
import { Layers, Copy, Check, RefreshCw, Filter, FileText, FileSpreadsheet, FileCode } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateBulkPasswords, DEFAULT_SYMBOLS } from '../utils/generators';
import type { RandomOptions } from '../utils/generators';
import type { StrengthAnalysis } from '../utils/strengthEngine';
import { analyzePassword } from '../utils/strengthEngine';
import { sounds } from '../utils/soundEffects';

export const BulkStudio: React.FC = () => {
  const [count, setCount] = useState<number>(20);
  const [length, setLength] = useState<number>(20);
  const [passwords, setPasswords] = useState<{ password: string; analysis: StrengthAnalysis }[]>([]);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [filterLabel, setFilterLabel] = useState<string>('ALL');

  const handleGenerateBulk = () => {
    sounds.playPowerSound();
    const opts: RandomOptions = {
      length,
      lower: true,
      upper: true,
      digits: true,
      symbols: true,
      symbolSet: DEFAULT_SYMBOLS,
      excludeAmbiguous: true,
      excludeSimilarSymbols: true,
      forceAllTypes: true
    };

    const rawList = generateBulkPasswords(count, opts);
    const analyzedList = rawList.map(pw => ({
      password: pw,
      analysis: analyzePassword(pw)
    }));

    setPasswords(analyzedList);
  };

  const filteredPasswords = filterLabel === 'ALL'
    ? passwords
    : passwords.filter(item => item.analysis.label.toUpperCase() === filterLabel);

  const handleCopyAll = () => {
    if (passwords.length === 0) return;
    sounds.playCopyChime();
    const text = filteredPasswords.map(p => p.password).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.75 } });
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopySingle = (pw: string, index: number) => {
    sounds.playCopyChime();
    navigator.clipboard.writeText(pw);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const exportToFile = (format: 'txt' | 'csv' | 'json') => {
    sounds.playClick();
    if (passwords.length === 0) return;

    let content = '';
    let mimeType = 'text/plain';
    let fileName = `passwords_${Date.now()}.${format}`;

    if (format === 'txt') {
      content = filteredPasswords.map(p => p.password).join('\n');
    } else if (format === 'csv') {
      mimeType = 'text/csv';
      content = 'Index,Password,EffectiveEntropyBits,StrengthLabel,CrackTimeFastGPU\n' +
        filteredPasswords.map((p, idx) =>
          `"${idx + 1}","${p.password}","${p.analysis.effectiveEntropyBits}","${p.analysis.label}","${p.analysis.crackTimes.offlineFastHash}"`
        ).join('\n');
    } else if (format === 'json') {
      mimeType = 'application/json';
      content = JSON.stringify(
        filteredPasswords.map((p, idx) => ({
          id: idx + 1,
          password: p.password,
          entropyBits: p.analysis.effectiveEntropyBits,
          label: p.analysis.label,
          crackTimes: p.analysis.crackTimes
        })),
        null,
        2
      );
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl glass-card border border-cyan-500/30 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Bulk Generation Studio</h2>
            <p className="text-xs text-slate-400">Generate up to 1,000 secure passwords with real-time audit & export</p>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span>Quantity</span>
              <span className="text-lg font-black text-cyan-300">{count}</span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span>Length per Password</span>
              <span className="text-lg font-black text-cyan-300">{length}</span>
            </div>
            <input
              type="range"
              min="12"
              max="64"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={handleGenerateBulk}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 hover:brightness-110 shadow-lg shadow-cyan-500/30 transition transform hover:scale-105 active:scale-95"
          >
            <RefreshCw className="w-5 h-5" />
            Generate {count} Passwords Now
          </button>

          {passwords.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:text-cyan-300 hover:border-cyan-500/40 transition"
              >
                {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                {copiedAll ? 'Copied All!' : 'Copy All'}
              </button>

              <button
                onClick={() => exportToFile('txt')}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:text-cyan-300 transition"
                title="Export as TXT"
              >
                <FileText className="w-4 h-4 text-cyan-400" /> .TXT
              </button>

              <button
                onClick={() => exportToFile('csv')}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:text-emerald-300 transition"
                title="Export as CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> .CSV
              </button>

              <button
                onClick={() => exportToFile('json')}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:text-fuchsia-300 transition"
                title="Export as JSON"
              >
                <FileCode className="w-4 h-4 text-fuchsia-400" /> .JSON
              </button>
            </div>
          )}
        </div>

        {/* Results List */}
        {passwords.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Generated Pool ({filteredPasswords.length})
              </span>
              <div className="flex items-center gap-1 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                {['ALL', 'UNBREAKABLE', 'EXTREME', 'STRONG', 'GOOD', 'FAIR'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setFilterLabel(lvl)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${filterLabel === lvl ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto no-scrollbar rounded-2xl bg-slate-950/80 border border-slate-800 divide-y divide-slate-900">
              {filteredPasswords.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 px-4 hover:bg-slate-900/50 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 w-6">#{idx + 1}</span>
                    <span className="font-mono text-sm font-bold text-cyan-200">{item.password}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="px-2 py-0.5 text-[10px] font-extrabold rounded uppercase"
                      style={{
                        backgroundColor: `${item.analysis.badgeHex}20`,
                        color: item.analysis.badgeHex,
                        border: `1px solid ${item.analysis.badgeHex}40`
                      }}
                    >
                      {item.analysis.label} ({item.analysis.effectiveEntropyBits}b)
                    </span>

                    <button
                      onClick={() => handleCopySingle(item.password, idx)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 transition"
                      title="Copy Password"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

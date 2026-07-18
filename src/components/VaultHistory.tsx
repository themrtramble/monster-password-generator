import React, { useState } from 'react';
import { History, Trash2, Copy, Check, Eye, EyeOff, Download, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { StrengthAnalysis } from '../utils/strengthEngine';
import { sounds } from '../utils/soundEffects';

export interface HistoryItem {
  id: string;
  timestamp: string;
  password: string;
  analysis: StrengthAnalysis;
}

interface VaultHistoryProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
}

export const VaultHistory: React.FC<VaultHistoryProps> = ({
  history,
  onClearHistory,
  onDeleteHistoryItem
}) => {
  const [masked, setMasked] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (pw: string, id: string) => {
    sounds.playCopyChime();
    navigator.clipboard.writeText(pw);
    setCopiedId(id);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.75 } });
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExportHistory = () => {
    sounds.playClick();
    if (history.length === 0) return;
    const content = JSON.stringify(history, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `password_vault_history_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl glass-card border border-cyan-500/30 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Vault & Generation History</h2>
              <p className="text-xs text-slate-400">Encrypted in local memory — recent session passwords & strength audits</p>
            </div>
          </div>

          {history.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMasked(!masked)}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
                title={masked ? 'Show Passwords' : 'Mask Passwords'}
              >
                {masked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              <button
                onClick={handleExportHistory}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 transition"
                title="Export History JSON"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  onClearHistory();
                }}
                className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition text-xs font-bold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear History
              </button>
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <Lock className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">Vault History is Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Generated or tested passwords during your session will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 divide-y divide-slate-900 overflow-hidden">
            {history.map((item) => {
              const displayPw = masked
                ? item.password.length <= 4
                  ? '*'.repeat(item.password.length)
                  : item.password.slice(0, 2) + '*'.repeat(item.password.length - 4) + item.password.slice(-2)
                : item.password;

              return (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-cyan-200 select-all">
                        {displayPw}
                      </span>
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
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Generated at: {item.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(item.password, item.id)}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 transition"
                      title="Copy Password"
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        onDeleteHistoryItem(item.id);
                      }}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-rose-400 transition"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

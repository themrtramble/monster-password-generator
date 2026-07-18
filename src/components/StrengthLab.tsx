import React, { useState } from 'react';
import { TestTube, Search, Eye, EyeOff, Wand2 } from 'lucide-react';
import type { StrengthAnalysis } from '../utils/strengthEngine';
import { analyzePassword, autoEnhancePassword } from '../utils/strengthEngine';
import { StrengthMeter } from './StrengthMeter';
import { sounds } from '../utils/soundEffects';

export const StrengthLab: React.FC = () => {
  const [inputPw, setInputPw] = useState<string>('P@ssw0rd123!');
  const [masked, setMasked] = useState<boolean>(false);

  const analysis: StrengthAnalysis = analyzePassword(inputPw);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPw(e.target.value);
    sounds.playClick();
  };

  const handleEnhance = () => {
    sounds.playPowerSound();
    const enhanced = autoEnhancePassword(inputPw);
    setInputPw(enhanced);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl glass-card border border-cyan-500/30 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <TestTube className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Strength Lab & Password Auditor</h2>
            <p className="text-xs text-slate-400">Type or paste any password to run real-time vulnerability & attack vector analysis</p>
          </div>
        </div>

        {/* Input Field Box */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 pointer-events-none" />
            <input
              type={masked ? 'password' : 'text'}
              value={inputPw}
              onChange={handleInputChange}
              placeholder="Type or paste a password to test..."
              className="w-full pl-12 pr-44 py-4 rounded-2xl bg-slate-950/90 border border-cyan-500/40 text-cyan-200 font-mono text-lg md:text-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none shadow-inner transition"
            />
            <div className="absolute right-3 flex items-center gap-2">
              <button
                onClick={handleEnhance}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 hover:brightness-110 transition shadow-md"
                title="Auto-Fix & Enhance Strength"
              >
                <Wand2 className="w-3.5 h-3.5" /> Auto-Fix
              </button>
              <button
                onClick={() => setMasked(!masked)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
                title={masked ? 'Unmask' : 'Mask'}
              >
                {masked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Quick Test Suggestions */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Sample Test Presets:</span>
          {['P@ssw0rd123!', 'qwerty2026', 'Correct-Horse-Battery-Staple', '9x#mK$7!vL2pQ#8z'].map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputPw(sample);
                sounds.playClick();
              }}
              className="px-3 py-1 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800 text-cyan-300 hover:border-cyan-500/40 transition"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Section */}
      <StrengthMeter
        analysis={analysis}
        currentPassword={inputPw}
        onApplyEnhanced={(enhanced) => setInputPw(enhanced)}
      />
    </div>
  );
};

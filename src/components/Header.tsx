import React from 'react';
import { Shield, Volume2, VolumeX, Sparkles, Cpu, History, Zap, Sliders, Hash, Type, Layers, TestTube } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  theme: 'cyber' | 'neon' | 'dark';
  setTheme: (t: 'cyber' | 'neon' | 'dark') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  soundEnabled,
  setSoundEnabled,
  theme,
  setTheme
}) => {
  const tabs = [
    { id: 'quick', label: 'Quick Gen', icon: Zap },
    { id: 'studio', label: 'Custom Studio', icon: Sliders },
    { id: 'pattern', label: 'Pattern Forge', icon: Hash },
    { id: 'passphrase', label: 'Passphrase', icon: Type },
    { id: 'bulk', label: 'Bulk Forge', icon: Layers },
    { id: 'analyzer', label: 'Strength Lab', icon: TestTube },
    { id: 'history', label: 'Vault History', icon: History },
  ];

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
    if (next) sounds.playClick();
  };

  return (
    <header className="relative z-10 w-full mb-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-2xl glass-card border border-cyan-500/20 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-fuchsia-500 animate-pulse" />

        <div className="flex items-center gap-4">
          <div className="relative p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-fuchsia-500/10 to-emerald-500/20 border border-cyan-400/40 shadow-inner group">
            <Shield className="w-10 h-10 text-cyan-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
            <Sparkles className="w-4 h-4 text-fuchsia-400 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-emerald-300 bg-clip-text text-transparent">
                MONSTER PWGEN
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                ULTRA 3.0
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Quantum-Safe Entropy Engine & Real-Time Strength Analyzer
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Theme switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/60 border border-slate-800">
            <button
              onClick={() => { setTheme('cyber'); sounds.playClick(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                theme === 'cyber'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cyber
            </button>
            <button
              onClick={() => { setTheme('neon'); sounds.playClick(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                theme === 'neon'
                  ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Neon
            </button>
            <button
              onClick={() => { setTheme('dark'); sounds.playClick(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                theme === 'dark'
                  ? 'bg-slate-800 text-slate-200 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Minimal
            </button>
          </div>

          {/* Sound FX toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Disable Audio FX' : 'Enable Audio FX'}
            className={`p-2.5 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <nav className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar mt-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                sounds.playClick();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border-cyan-400/50 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.25)] scale-[1.02]'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};

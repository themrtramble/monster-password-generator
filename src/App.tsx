import { useState, useEffect } from 'react';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { Header } from './components/Header';
import { QuickGenerator } from './components/QuickGenerator';
import { CustomStudio } from './components/CustomStudio';
import { PatternForge } from './components/PatternForge';
import { PassphraseForge } from './components/PassphraseForge';
import { BulkStudio } from './components/BulkStudio';
import { StrengthLab } from './components/StrengthLab';
import { VaultHistory } from './components/VaultHistory';
import type { HistoryItem } from './components/VaultHistory';
import type { StrengthAnalysis } from './utils/strengthEngine';
import { Lock } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('quick');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [theme, setTheme] = useState<'cyber' | 'neon' | 'dark'>('cyber');
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('pwgen_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pwgen_history', JSON.stringify(history.slice(0, 100)));
    } catch {
      // Ignore quota errors
    }
  }, [history]);

  const handleSaveToHistory = (password: string, analysis: StrengthAnalysis) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      password,
      analysis
    };

    setHistory(prev => {
      // Avoid duplicate consecutive entries
      if (prev.length > 0 && prev[0].password === password) return prev;
      return [newItem, ...prev].slice(0, 50);
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className={`min-h-screen text-slate-100 relative overflow-x-hidden font-sans ${
      theme === 'cyber'
        ? 'bg-slate-950 text-slate-100'
        : theme === 'neon'
        ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950 via-slate-950 to-black text-slate-100'
        : 'bg-slate-900 text-slate-200'
    }`}>
      {/* Dynamic Background Particle Mesh */}
      <BackgroundCanvas />

      {/* Main Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12 flex flex-col min-h-screen">
        {/* Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          theme={theme}
          setTheme={setTheme}
        />

        {/* Tab Content Body */}
        <main className="flex-1">
          {activeTab === 'quick' && <QuickGenerator onSaveToHistory={handleSaveToHistory} />}
          {activeTab === 'studio' && <CustomStudio onSaveToHistory={handleSaveToHistory} />}
          {activeTab === 'pattern' && <PatternForge onSaveToHistory={handleSaveToHistory} />}
          {activeTab === 'passphrase' && <PassphraseForge onSaveToHistory={handleSaveToHistory} />}
          {activeTab === 'bulk' && <BulkStudio />}
          {activeTab === 'analyzer' && <StrengthLab />}
          {activeTab === 'history' && (
            <VaultHistory
              history={history}
              onClearHistory={handleClearHistory}
              onDeleteHistoryItem={handleDeleteHistoryItem}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Zero-Knowledge Local Crypto • Client-Side Security</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Built for Ultra High-Entropy & Security</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;

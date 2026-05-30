import { useState, useEffect } from "react";
import { LogIn, Book } from "lucide-react";
import Journal from "../../src/views/Journal/index.jsx";
import { getSettings, watchAuth, signIn } from "../../src/db.js";

export default function JournalApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('honey');

  useEffect(() => {
    return watchAuth((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    getSettings().then(s => {
      const t = s.theme || 'honey';
      setTheme(t);
      document.documentElement.setAttribute('data-theme', t);
    });
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#090b10]">
      <div className="spinner" />
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 py-12 bg-[#090b10] text-white text-center">
      <div className="mb-8 p-6 rounded-full bg-accent/10 border border-accent/20">
        <Book size={64} className="text-accent" />
      </div>
      <h1 className="text-3xl font-black mb-2 tracking-tight">Journal Solo</h1>
      <p className="text-dim text-sm mb-12 max-w-xs">Deine tägliche Reflexion.</p>
      <button onClick={signIn} className="w-full max-w-sm flex items-center justify-center gap-3 px-8 py-3.5 bg-white text-black rounded-xl font-bold">
        <LogIn size={20} /> Anmelden
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      {/* Mini Header for Solo App */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)] bg-[var(--card)] lg:hidden">
        <div className="flex items-center gap-2 font-black text-lg">
          <Book size={20} className="text-[var(--accent)]" />
          Journal
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto py-8">
        <Journal />
      </main>
    </div>
  );
}

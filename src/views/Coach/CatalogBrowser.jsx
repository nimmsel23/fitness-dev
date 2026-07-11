import { useState } from 'react';
import { Dumbbell, Search, Filter } from 'lucide-react';

export default function CatalogBrowser() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-[calc(100vh-12rem)] border border-fit-line/30 rounded-2xl overflow-hidden bg-fit-bg">
      
      {/* Left Sidebar: Search & Filters */}
      <div className="w-80 border-r border-fit-line/30 bg-fit-bg2/50 flex flex-col">
        <div className="p-4 border-b border-fit-line/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-fit-dim" size={16} />
            <input
              type="text"
              placeholder="Übung suchen..."
              className="w-full bg-fit-bg border border-fit-line rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-fit-accent transition-colors text-fit-ink"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 text-fit-dim mb-4">
            <Filter size={14} />
            <span className="text-xs font-black uppercase tracking-widest">Filter</span>
          </div>
          <p className="text-xs text-fit-muted">Hier kommen Filter für Muskelgruppen, Equipment etc. hin.</p>
        </div>
      </div>

      {/* Main Content: Exercise Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
          <Dumbbell className="w-12 h-12 text-fit-dim" />
          <h3 className="text-xl font-black text-fit-dim">Katalog Browser</h3>
          <p className="text-xs max-w-sm leading-relaxed">
            Nutzt die <code>/fitness/search</code> API aus <code>fitness_agent/api.py</code>, 
            um Übungen live anzuzeigen und per Klick im Enhancer zu öffnen.
          </p>
        </div>
      </div>

    </div>
  );
}

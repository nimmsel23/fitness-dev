import { useState, useEffect } from 'react';
import { Dumbbell, Search, Filter, Loader2 } from 'lucide-react';
import { searchExercises } from '@db';
import { useDebounce } from '@src/hooks/useDebounce'; // Or standard setTimeout if missing

export default function CatalogBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Einfacher Debounce
  useEffect(() => {
    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchExercises(searchQuery, 50); // limit 50
        setResults(data?.results || []);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  return (
    <div className="flex h-[calc(100vh-12rem)] border border-fit-line/30 rounded-2xl overflow-hidden bg-fit-bg">
      
      {/* Left Sidebar: Search & Filters */}
      <div className="w-80 border-r border-fit-line/30 bg-fit-bg2/50 flex flex-col">
        <div className="p-4 border-b border-fit-line/30 relative">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-fit-dim" size={16} />
          <input
            type="text"
            placeholder="Übung suchen..."
            className="w-full bg-fit-bg border border-fit-line rounded-xl py-2 pl-10 pr-10 text-sm focus:outline-none focus:border-fit-accent transition-colors text-fit-ink"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {loading && <Loader2 className="absolute right-7 top-1/2 -translate-y-1/2 text-fit-accent animate-spin" size={16} />}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {results.length === 0 && !loading && (
             <div className="p-8 text-center text-fit-dim text-xs">
               Keine Ergebnisse gefunden.
             </div>
          )}
          <ul className="divide-y divide-fit-line/20">
            {results.map((ex) => (
              <li 
                key={ex.exercise_id || ex.id} 
                className="p-3 hover:bg-fit-bg transition-colors cursor-pointer group"
              >
                <div className="text-sm font-bold text-fit-ink truncate group-hover:text-fit-accent">
                  {ex.display_name || ex.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-fit-dim border border-fit-line/50 rounded-md px-1.5 py-0.5">
                    {ex.source || 'wger'}
                  </span>
                  <span className="text-xs text-fit-muted truncate">
                    {(ex.primary_muscles || []).join(', ')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content: Exercise Grid / Enhancer */}
      <div className="flex-1 p-6 overflow-y-auto relative bg-fit-bg">
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
          <Dumbbell className="w-12 h-12 text-fit-dim" />
          <h3 className="text-xl font-black text-fit-dim">Katalog Enhancer</h3>
          <p className="text-xs max-w-sm leading-relaxed">
            Wähle links eine Übung aus, um sie detailliert zu bearbeiten (Biomechanik, Heatmap, API-Metadaten).
          </p>
        </div>
      </div>

    </div>
  );
}

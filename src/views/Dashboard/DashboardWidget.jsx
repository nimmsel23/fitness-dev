import { useState, useRef, useEffect } from 'react';
import { ExternalLink, Maximize2 } from 'lucide-react';

export default function DashboardWidget({ 
  children, 
  title, 
  onNavigate, 
  targetTab, 
  isEditMode,
  className = ""
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const timerRef = useRef(null);

  // Double click for modal
  const handleDoubleClick = (e) => {
    if (isEditMode) return;
    e.stopPropagation();
    setIsModalOpen(true);
  };

  // Long press for mobile
  const handleTouchStart = () => {
    if (isEditMode) return;
    timerRef.current = setTimeout(() => {
      setIsModalOpen(true);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleClick = (e) => {
    if (isEditMode) return;
    
    // Check if we clicked a button or a clickable element inside children
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) {
      return;
    }

    if (targetTab && onNavigate) {
       onNavigate(targetTab);
    }
  };

  return (
    <>
      <div 
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`relative group transition-all h-full ${isEditMode ? 'pointer-events-none select-none' : 'cursor-pointer active:scale-[0.98]'} ${className}`}
      >
        {children}
        
        {/* Overlay hint on hover (desktop) */}
        {!isEditMode && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-40 transition-opacity">
            <Maximize2 size={14} />
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}>
          <div 
            className="bg-fit-card border border-fit-line w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 border-b border-fit-line flex items-center justify-between">
              <h3 className="text-xl font-black text-fit-ink">{title || 'Widget Detail'}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-fit-bg2 flex items-center justify-center text-fit-dim hover:text-fit-ink"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {children}
            </div>

            <div className="p-6 bg-fit-bg2/50 border-t border-fit-line flex justify-end">
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  if (targetTab && onNavigate) onNavigate(targetTab);
                }}
                className="btn btn-primary px-8 py-3 flex items-center gap-2 font-black uppercase tracking-widest text-[10px]"
              >
                Zum Tab wechseln <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

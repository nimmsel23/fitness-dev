import { useState } from "react";
import { User, Copy, Check, X } from "lucide-react";

export default function UserProfile({ user, subtitle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(user?.uid || "default");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedUid = user?.uid 
    ? (user.uid.length > 12 ? `${user.uid.slice(0, 6)}…${user.uid.slice(-6)}` : user.uid)
    : "default";

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="p-4 rounded-2xl bg-fit-bg2 border border-fit-line hover:border-fit-accent/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-fit-accent/10 border border-fit-accent/20 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={20} className="text-fit-accent" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-black text-fit-ink truncate group-hover:text-fit-accent transition-colors">
              {user?.displayName || "Client"}
            </div>
            <div className="text-[9px] font-bold text-fit-dim truncate opacity-50">
              {subtitle || user?.email}
            </div>
            <div className="text-[8px] font-mono text-fit-accent/70 truncate mt-0.5 tracking-wider">
              UID: {truncatedUid}
            </div>
          </div>
        </div>
      </div>

      {/* User Info Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-fit-card border border-fit-line rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-fit-bg2 border border-fit-line flex items-center justify-center text-fit-dim hover:text-fit-accent hover:border-fit-accent/20 transition-all active:scale-90"
            >
              <X size={14} />
            </button>

            {/* Large Avatar */}
            <div className="w-20 h-20 rounded-full bg-fit-accent/5 border border-fit-accent/10 flex items-center justify-center overflow-hidden mb-4 shadow-xl">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={36} className="text-fit-accent" />
              )}
            </div>

            {/* Profile Info */}
            <h3 className="text-lg font-black text-fit-ink mb-1">
              {user?.displayName || "Client"}
            </h3>
            <p className="text-xs font-bold text-fit-dim uppercase tracking-wider mb-6">
              {user?.email || "Local User"}
            </p>

            {/* Info Table / UID Container */}
            <div className="w-full space-y-3 mb-8 text-left">
              <div className="bg-fit-bg2 border border-fit-line rounded-2xl p-4 space-y-1">
                <div className="text-[9px] font-black text-fit-dim uppercase tracking-widest">
                  User ID (UID)
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-fit-accent truncate select-all">
                    {user?.uid || "default"}
                  </span>
                  <button 
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-fit-card border border-fit-line text-fit-dim hover:text-fit-accent hover:border-fit-accent/20 transition-all active:scale-90 flex-shrink-0"
                    title="Copy UID"
                  >
                    {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm / Close button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full py-3.5 rounded-2xl bg-fit-accent text-black font-black uppercase tracking-wider text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-fit-accent/15"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </>
  );
}

import { LogOut, User } from "lucide-react";

export default function AccountSection({ user, signOut }) {
  if (!user) return null;

  return (
    <section className="card p-6 border-t-4 border-t-fit-accent animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-4">
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="w-12 h-12 rounded-2xl shadow-md" />
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-fit-accent/10 flex items-center justify-center">
            <User size={20} className="text-fit-accent" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-black text-fit-ink">{user.displayName || 'Angemeldet'}</div>
          <div className="text-[10px] font-bold text-fit-dim truncate">{user.email}</div>
          <div className="text-[9px] font-mono opacity-30 mt-0.5">{user.uid?.slice(0, 12)}…</div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-fit-red bg-fit-red/5 border border-fit-red/10 hover:bg-fit-red/10 transition-all"
        >
          <LogOut size={12} />
          Logout
        </button>
      </div>
    </section>
  );
}

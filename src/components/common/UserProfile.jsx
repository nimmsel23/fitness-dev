import { User } from "lucide-react";

export default function UserProfile({ user, subtitle }) {
  return (
    <div className="p-4 rounded-2xl bg-[var(--bg2)] border border-[var(--line)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center overflow-hidden">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={20} className="text-[var(--accent)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-black text-[var(--ink)] truncate">{user.displayName || "Client"}</div>
          <div className="text-[9px] font-bold text-[var(--dim)] truncate opacity-50">{subtitle || user.email}</div>
        </div>
      </div>
    </div>
  );
}

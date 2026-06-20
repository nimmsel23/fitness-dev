import { User } from "lucide-react";

export default function UserProfile({ user, subtitle }) {
  return (
    <div className="p-4 rounded-2xl bg-fit-bg2 border border-fit-line">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-fit-accent/10 border border-fit-accent/20 flex items-center justify-center overflow-hidden">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={20} className="text-fit-accent" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-black text-fit-ink truncate">{user.displayName || "Client"}</div>
          <div className="text-[9px] font-bold text-fit-dim truncate opacity-50">{subtitle || user.email}</div>
        </div>
      </div>
    </div>
  );
}

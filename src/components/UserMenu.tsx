import { LogOut } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { useAuth } from '../context/AuthContext';

function firstName(meta: User['user_metadata']) {
  const full = meta?.full_name as string | undefined;
  if (full?.trim()) return full.trim().split(/\s+/)[0] ?? 'You';
  const email = meta?.email as string | undefined;
  if (email) return email.split('@')[0] ?? 'You';
  return 'You';
}

export default function UserMenu({ user }: { user: User }) {
  const { signOut } = useAuth();
  const meta = user.user_metadata ?? {};
  const avatarUrl = meta.avatar_url as string | undefined;
  const name = firstName(meta);
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2 rounded-full border border-brand-border bg-brand-card px-3 py-1.5">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-8 w-8 shrink-0 rounded-full object-cover"
          width={32}
          height={32}
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-accent font-display text-xs font-bold text-black">
          {initial}
        </div>
      )}
      <span className="max-w-[120px] truncate font-body text-sm text-brand-text">
        {name}
      </span>
      <button
        type="button"
        onClick={() => void signOut()}
        className="shrink-0 rounded-md p-1 text-brand-muted hover:bg-brand-border/40 hover:text-brand-text"
        aria-label="Sign out"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}

import { NavLink } from 'react-router-dom';
import { Library, Upload, Guitar, type LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { useToneStore } from '../store/useToneStore';

const links: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Library', icon: Library },
  { to: '/upload', label: 'Add Tone', icon: Upload },
];

export default function Sidebar() {
  const syncStatus = useToneStore((s) => s.syncStatus);

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 flex flex-col border-r border-brand-border bg-brand-surface px-4 py-6">
      <div className="flex items-center gap-2 mb-10 px-2">
        <Guitar size={20} className="text-brand-accent" />
        <span className="font-display text-xl font-semibold tracking-tight text-brand-text">
          ToneLib
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                isActive
                  ? 'bg-brand-accent/10 text-brand-accent font-medium'
                  : 'text-brand-subtext hover:text-brand-text hover:bg-brand-border/40',
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-2 px-2">
        <div className="text-xs text-brand-muted font-body">Phase 3 — Supabase</div>
        <div className="font-mono text-xs text-brand-muted">
          {syncStatus === 'synced' && (
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
              Synced
            </span>
          )}
          {syncStatus === 'local' && (
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              Local only
            </span>
          )}
          {syncStatus === 'error' && (
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
              Offline
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}

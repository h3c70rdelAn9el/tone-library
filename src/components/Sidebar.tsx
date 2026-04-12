import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Library,
  Upload,
  Guitar,
  Star,
  Menu,
  type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useToneStore } from '../store/useToneStore';

const links: { to: string; label: string; icon: LucideIcon; end?: boolean }[] =
  [
    { to: '/', label: 'Library', icon: Library, end: true },
    { to: '/favorites', label: 'Favorites', icon: Star },
    { to: '/upload', label: 'Add Tone', icon: Upload },
  ];

function NavItems({
  onNavigate,
  variant,
}: {
  onNavigate?: () => void;
  variant: 'desktop' | 'drawer';
}) {
  const totalTones = useToneStore((s) => s.tones.length);
  const favoriteCount = useToneStore(
    (s) => s.tones.filter((t) => t.favorite).length,
  );

  const labelClass =
    variant === 'drawer'
      ? 'max-w-[200px] opacity-100'
      : 'max-w-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-w-[160px] group-hover:opacity-100';

  const countClass =
    variant === 'drawer'
      ? 'ml-auto inline-flex'
      : 'ml-auto hidden max-w-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:inline-flex group-hover:max-w-[48px] group-hover:opacity-100';

  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end ?? false}
          onClick={onNavigate}
          className={({ isActive }) =>
            clsx(
              'flex items-center rounded-xl py-2.5 text-sm transition-all',
              variant === 'desktop' &&
                'justify-center gap-0 px-2 group-hover:justify-start group-hover:gap-3 group-hover:px-3',
              variant === 'drawer' && 'justify-start gap-3 px-3',
              isActive
                ? 'bg-brand-accent/10 font-medium text-brand-accent'
                : 'text-brand-subtext hover:bg-brand-border/40 hover:text-brand-text',
            )
          }
        >
          <Icon size={16} className="shrink-0" />
          <span
            className={clsx(
              'whitespace-nowrap font-body',
              labelClass,
              variant === 'desktop' && 'overflow-hidden',
            )}
          >
            {label}
          </span>
          {(to === '/' || to === '/favorites') && (
            <span
              className={clsx(
                'w-fit shrink-0 rounded-md bg-brand-border px-1.5 py-0.5 font-mono text-[10px] text-brand-subtext',
                countClass,
              )}
            >
              {to === '/' ? totalTones : favoriteCount}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function SyncFooter({ expanded }: { expanded: boolean }) {
  const syncStatus = useToneStore((s) => s.syncStatus);

  const wrap = expanded
    ? 'max-w-[220px] opacity-100'
    : 'max-w-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-w-[220px] group-hover:opacity-100';

  return (
    <div className="mt-auto space-y-2 px-2">
      <div
        className={clsx(
          'whitespace-nowrap text-xs font-body text-brand-muted',
          wrap,
        )}
      >
        Phase 3 — Supabase
      </div>
      <div
        className={clsx('whitespace-nowrap font-mono text-xs text-brand-muted', wrap)}
      >
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
        {syncStatus === 'guest' && (
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-muted" />
            Guest mode
          </span>
        )}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-surface text-brand-text shadow-lg lg:hidden"
        aria-label="Open menu"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      <aside className="group relative z-40 hidden h-screen w-14 shrink-0 flex-col border-r border-brand-border bg-brand-surface px-2 py-6 transition-all duration-300 ease-out hover:w-56 hover:px-4 lg:flex">
        <div className="mb-10 flex items-center gap-2 px-2">
          <Guitar size={20} className="shrink-0 text-brand-accent" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap font-display text-xl font-semibold tracking-tight text-brand-text opacity-0 transition-all duration-300 group-hover:max-w-[200px] group-hover:opacity-100">
            ToneLib
          </span>
        </div>

        <NavItems variant="desktop" />
        <SyncFooter expanded={false} />
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-[70] bg-black/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              className="fixed left-0 top-0 z-[80] flex h-full w-[min(300px,88vw)] flex-col border-r border-brand-border bg-brand-surface px-4 py-6 shadow-2xl lg:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              <div className="mb-10 flex items-center gap-2 px-2">
                <Guitar size={20} className="text-brand-accent" />
                <span className="font-display text-xl font-semibold tracking-tight text-brand-text">
                  ToneLib
                </span>
              </div>
              <NavItems
                variant="drawer"
                onNavigate={() => setMobileOpen(false)}
              />
              <div className="mt-auto px-2 pt-8">
                <SyncFooter expanded />
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

    </>
  );
}

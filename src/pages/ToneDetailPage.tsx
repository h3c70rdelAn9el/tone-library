import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToneStore } from '../store/useToneStore';
import { useSelectedTone } from '../hooks/useSelectedTone';
import AmpDisplay from '../components/AmpDisplay';
import {
  deleteTone as deleteToneRemote,
  toggleFavorite as toggleFavoriteRemote,
  tryFetchAllTones,
  tryFetchFavoriteToneIds,
} from '../services/toneService';
import { useAuth } from '../context/AuthContext';
import TagBadge from '../components/TagBadge';
import {
  ArrowLeft,
  Star,
  FileAudio,
  Mic2,
  Download,
  Trash2,
  Pencil,
  Sparkles,
} from 'lucide-react';
import RecreateSetup from '../components/RecreateSetup';

function downloadBlob(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function openOrDownloadFile(url: string, filename: string) {
  if (url.startsWith('blob:')) {
    downloadBlob(url, filename);
    return;
  }
  if (/^https?:\/\//i.test(url)) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  downloadBlob(url, filename);
}

export default function ToneDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isGuest = !authLoading && !user;

  const tone = useToneStore((s) => (id ? s.getToneById(id) : undefined));
  const favorited = useToneStore((s) =>
    id ? s.favoriteToneIds.includes(id) : false,
  );
  const setTones = useToneStore((s) => s.setTones);
  const setFavoriteToneIds = useToneStore((s) => s.setFavoriteToneIds);
  const deleteToneLocal = useToneStore((s) => s.deleteTone);
  const toggleFavoriteLocal = useToneStore((s) => s.toggleFavorite);
  const clearFilters = useToneStore((s) => s.clearFilters);
  const toggleActiveTag = useToneStore((s) => s.toggleActiveTag);
  const { selectTone } = useSelectedTone();

  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [recreateOpen, setRecreateOpen] = useState(false);

  useEffect(() => {
    if (tone) selectTone(tone);
  }, [tone, selectTone]);

  /** Library/Favorites run `useTones`; opening `/tone/:id` directly does not. Refetch so the store matches the server in production. */
  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    void (async () => {
      const list = await tryFetchAllTones();
      const favs = await tryFetchFavoriteToneIds();
      if (cancelled || list === null || favs === null) return;
      setTones(list);
      setFavoriteToneIds(favs);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, user, authLoading, setTones, setFavoriteToneIds]);

  if (!tone) {
    return (
      <div className="p-8 font-body text-sm text-brand-subtext">
        Tone not found.{' '}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-brand-accent underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (isGuest) return;
    if (!window.confirm('Delete this tone?')) return;
    setDeleteError(null);
    const ok = await deleteToneRemote(tone.id);
    if (ok) {
      deleteToneLocal(tone.id);
      navigate('/');
    } else {
      setDeleteError('Could not delete this tone on the server.');
    }
  };

  const handleFavorite = async () => {
    if (isGuest) return;
    setFavoriteError(null);
    const ok = await toggleFavoriteRemote(tone.id, favorited);
    if (ok) {
      toggleFavoriteLocal(tone.id);
    } else {
      setFavoriteError('Could not update favorite.');
    }
  };

  return (
    <div className="flex h-screen min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-brand-border px-4 py-5 lg:px-8 lg:py-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-sm text-brand-subtext transition-colors hover:text-brand-text"
        >
          <ArrowLeft size={14} />
          Back to Library
        </button>

        <div className="mb-2 flex items-start justify-between gap-4">
          <h1 className="min-w-0 font-display-heading text-4xl font-semibold leading-none text-brand-text lg:text-5xl">
            {tone.name}
          </h1>
          {!isGuest ? (
            <div className="flex shrink-0 flex-col items-end gap-1">
              <button
                type="button"
                onClick={() => void handleFavorite()}
                className="rounded-md p-1 transition-colors hover:bg-brand-border/40"
                aria-label={favorited ? 'Remove favorite' : 'Add favorite'}
              >
                <Star
                  size={18}
                  className={
                    favorited
                      ? 'fill-brand-accent text-brand-accent'
                      : 'text-brand-subtext'
                  }
                />
              </button>
              {favoriteError ? (
                <p className="text-xs text-red-400">{favoriteError}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <p className="font-body text-xs text-brand-muted">
          Added {tone.createdAt}
          {tone.updatedAt && tone.updatedAt.slice(0, 10) !== tone.createdAt
            ? ` · Updated ${tone.updatedAt.slice(0, 10)}`
            : null}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <div className="flex w-full shrink-0 flex-col items-center justify-center px-4 py-8 lg:min-h-0 lg:w-1/2 lg:border-r lg:border-brand-border lg:py-10 xl:w-3/5 lg:overflow-y-auto">
          <AmpDisplay tone={tone} />
        </div>

        <div className="w-full min-w-0 shrink-0 px-4 py-6 lg:min-h-0 lg:w-1/2 lg:flex-1 lg:overflow-y-auto lg:py-8 xl:w-2/5">
          <div className="mx-auto w-full max-w-2xl lg:mx-0 lg:max-w-none lg:pr-2">
            <div className="mb-8 flex flex-wrap gap-2">
              {tone.genreTags.map((tag) => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  onClick={
                    isGuest
                      ? undefined
                      : () => {
                          clearFilters();
                          toggleActiveTag(tag);
                          navigate('/');
                        }
                  }
                />
              ))}
            </div>

            {tone.description ? (
              <div className="mb-8 rounded-2xl border border-brand-border bg-brand-card p-5">
                <p className="mb-3 font-body text-xs font-semibold uppercase tracking-wide text-brand-muted">
                  Description
                </p>
                <p className="text-sm leading-relaxed text-brand-text">
                  {tone.description}
                </p>
              </div>
            ) : null}

            {tone.mixNotes ? (
              <div className="mb-8 rounded-2xl border border-brand-border bg-brand-card p-5">
                <p className="mb-3 font-body text-xs font-semibold uppercase tracking-wide text-brand-muted">
                  Mix notes
                </p>
                <p className="text-sm leading-relaxed text-brand-text">
                  {tone.mixNotes}
                </p>
              </div>
            ) : null}

            <div className="mb-8 rounded-2xl border border-brand-border bg-brand-card p-5">
              <p className="mb-4 font-body text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Files
              </p>
              <div className="flex flex-col gap-3">
                {(tone.namFile || tone.namFileUrl) && (
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3 text-sm text-brand-subtext">
                      <FileAudio size={14} className="shrink-0 text-brand-accent" />
                      <span className="truncate font-body tabular-nums">
                        {tone.namFile || 'NAM file'}
                      </span>
                    </div>
                    {isGuest ? (
                      <span className="shrink-0 text-xs text-brand-muted">
                        Sign in to download
                      </span>
                    ) : tone.namFileUrl ? (
                      <button
                        type="button"
                        onClick={() =>
                          openOrDownloadFile(
                            tone.namFileUrl!,
                            tone.namFile || 'tone.nam',
                          )
                        }
                        className="flex shrink-0 items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-brand-accent"
                      >
                        <Download size={12} />
                        Download
                      </button>
                    ) : (
                      <span className="text-xs text-brand-muted">No file attached</span>
                    )}
                  </div>
                )}
                {(tone.irFile || tone.irFileUrl) && (
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3 text-sm text-brand-subtext">
                      <Mic2 size={14} className="shrink-0 text-brand-accent" />
                      <span className="truncate font-body tabular-nums">
                        {tone.irFile || 'IR file'}
                      </span>
                    </div>
                    {isGuest ? (
                      <span className="shrink-0 text-xs text-brand-muted">
                        Sign in to download
                      </span>
                    ) : tone.irFileUrl ? (
                      <button
                        type="button"
                        onClick={() =>
                          openOrDownloadFile(
                            tone.irFileUrl!,
                            tone.irFile || 'impulse.wav',
                          )
                        }
                        className="flex shrink-0 items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-brand-accent"
                      >
                        <Download size={12} />
                        Download
                      </button>
                    ) : (
                      <span className="text-xs text-brand-muted">No file attached</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8">
              {(tone.tuning || tone.guitarType) ? (
                <div className="mb-2 flex flex-wrap gap-2 text-xs text-brand-muted">
                  {tone.tuning ? (
                    <span>🎸 {tone.tuning}</span>
                  ) : null}
                  {tone.guitarType ? (
                    <span>⚡ {tone.guitarType}</span>
                  ) : null}
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => setRecreateOpen(true)}
                className="btn-secondary flex items-center gap-2 bg-brand-card/40"
              >
                <Sparkles size={14} />
                Adapt tone
              </button>
            </div>

            {isGuest ? (
              <p className="mb-6 text-sm text-brand-muted">
                Sign in to manage your tones
              </p>
            ) : null}

            {!isGuest ? (
              <>
                {deleteError ? (
                  <p className="mb-3 text-sm text-red-400">{deleteError}</p>
                ) : null}
                <div className="flex flex-wrap gap-3 pb-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/tone/${tone.id}/edit`)}
                    className="btn-secondary flex items-center gap-2 bg-brand-card/40"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-red-400/60 transition-colors hover:text-red-400"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {recreateOpen ? (
        <RecreateSetup tone={tone} onClose={() => setRecreateOpen(false)} />
      ) : null}
    </div>
  );
}

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToneStore } from '../store/useToneStore';
import {
  deleteTone as deleteToneRemote,
  toggleFavorite as toggleFavoriteRemote,
} from '../services/toneService';
import TagBadge from '../components/TagBadge';
import {
  ArrowLeft,
  Star,
  FileAudio,
  Mic2,
  Download,
  Trash2,
  Pencil,
} from 'lucide-react';

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
  const tone = useToneStore((s) => (id ? s.getToneById(id) : undefined));
  const deleteToneLocal = useToneStore((s) => s.deleteTone);
  const toggleFavoriteLocal = useToneStore((s) => s.toggleFavorite);
  const clearFilters = useToneStore((s) => s.clearFilters);
  const toggleActiveTag = useToneStore((s) => s.toggleActiveTag);

  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!tone) {
    return (
      <div className="p-8 text-brand-subtext font-body text-sm">
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
    setFavoriteError(null);
    const ok = await toggleFavoriteRemote(tone.id, tone.favorite);
    if (ok) {
      toggleFavoriteLocal(tone.id);
    } else {
      setFavoriteError('Could not update favorite.');
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-brand-subtext hover:text-brand-text text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Library
      </button>

      <div className="flex items-start justify-between mb-2 gap-4">
        <h1 className="font-display text-5xl font-semibold tracking-tight text-brand-text leading-none min-w-0">
          {tone.name}
        </h1>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <button
            type="button"
            onClick={() => void handleFavorite()}
            className="p-1 rounded-md hover:bg-brand-border/40 transition-colors"
            aria-label={tone.favorite ? 'Remove favorite' : 'Add favorite'}
          >
            <Star
              size={18}
              className={
                tone.favorite
                  ? 'text-brand-accent fill-brand-accent'
                  : 'text-brand-subtext'
              }
            />
          </button>
          {favoriteError ? (
            <p className="text-xs text-red-400">{favoriteError}</p>
          ) : null}
        </div>
      </div>

      <p className="text-brand-muted font-body text-xs mb-6">Added {tone.createdAt}</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {tone.tags.map((tag) => (
          <TagBadge
            key={tag}
            tag={tag}
            onClick={() => {
              clearFilters();
              toggleActiveTag(tag);
              navigate('/');
            }}
          />
        ))}
      </div>

      <div className="bg-brand-card border border-brand-border rounded-2xl p-5 mb-8">
        <p className="text-xs font-body font-semibold uppercase tracking-wide text-brand-muted mb-3">
          Notes
        </p>
        <p className="text-brand-text text-sm leading-relaxed">{tone.notes}</p>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-2xl p-5 mb-8">
        <p className="text-xs font-body font-semibold uppercase tracking-wide text-brand-muted mb-4">
          Files
        </p>
        <div className="flex flex-col gap-3">
          {(tone.namFile || tone.namFileURL) && (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 text-sm text-brand-subtext min-w-0">
                <FileAudio size={14} className="text-brand-accent shrink-0" />
                <span className="font-body text-sm tabular-nums truncate">
                  {tone.namFile || 'NAM file'}
                </span>
              </div>
              {tone.namFileURL ? (
                <button
                  type="button"
                  onClick={() =>
                    openOrDownloadFile(
                      tone.namFileURL!,
                      tone.namFile || 'tone.nam',
                    )
                  }
                  className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-accent transition-colors shrink-0"
                >
                  <Download size={12} />
                  Download
                </button>
              ) : (
                <span className="text-xs text-brand-muted">No file attached</span>
              )}
            </div>
          )}
          {(tone.irFile || tone.irFileURL) && (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 text-sm text-brand-subtext min-w-0">
                <Mic2 size={14} className="text-brand-accent shrink-0" />
                <span className="font-body text-sm tabular-nums truncate">
                  {tone.irFile || 'IR file'}
                </span>
              </div>
              {tone.irFileURL ? (
                <button
                  type="button"
                  onClick={() =>
                    openOrDownloadFile(
                      tone.irFileURL!,
                      tone.irFile || 'impulse.wav',
                    )
                  }
                  className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-accent transition-colors shrink-0"
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

      {deleteError ? (
        <p className="mb-3 text-sm text-red-400">{deleteError}</p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="button"
          className="flex items-center gap-2 text-sm bg-brand-card border border-brand-border text-brand-subtext px-4 py-2 rounded-full hover:text-brand-text hover:border-brand-accent/40 transition-all"
        >
          <Pencil size={13} />
          Edit
        </button>
        <button
          type="button"
          onClick={() => void handleDelete()}
          className="flex items-center gap-2 text-sm text-red-400/60 hover:text-red-400 px-4 py-2 rounded-full transition-colors"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </div>
  );
}

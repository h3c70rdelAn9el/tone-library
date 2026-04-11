import { useParams, useNavigate } from 'react-router-dom';
import { useToneStore } from '../store/useToneStore';
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

export default function ToneDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tone = useToneStore((s) => (id ? s.getToneById(id) : undefined));
  const deleteTone = useToneStore((s) => s.deleteTone);
  const toggleFavorite = useToneStore((s) => s.toggleFavorite);

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

  const handleDelete = () => {
    if (!window.confirm('Delete this tone?')) return;
    deleteTone(tone.id);
    navigate('/');
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
        <button
          type="button"
          onClick={() => toggleFavorite(tone.id)}
          className="shrink-0 p-1 rounded-md hover:bg-brand-border/40 transition-colors"
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
      </div>

      <p className="text-brand-muted font-body text-xs mb-6">Added {tone.createdAt}</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {tone.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
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
                    downloadBlob(tone.namFileURL!, tone.namFile || 'tone.nam')
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
                    downloadBlob(tone.irFileURL!, tone.irFile || 'impulse.wav')
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
          onClick={handleDelete}
          className="flex items-center gap-2 text-sm text-red-400/60 hover:text-red-400 px-4 py-2 rounded-full transition-colors"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </div>
  );
}

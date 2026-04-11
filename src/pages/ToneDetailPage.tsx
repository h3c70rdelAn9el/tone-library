import { useParams, useNavigate } from 'react-router-dom';
import { mockTones } from '../data/mockTones';
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

export default function ToneDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tone = mockTones.find((t) => t.id === id);

  if (!tone) {
    return (
      <div className="p-8 text-brand-subtext font-mono text-sm">
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

      <div className="flex items-start justify-between mb-2">
        <h1 className="font-display text-5xl font-bold uppercase tracking-widest text-brand-text leading-none">
          {tone.name}
        </h1>
        {tone.favorite && (
          <Star
            size={18}
            className="text-brand-accent fill-brand-accent mt-1 ml-4 shrink-0"
          />
        )}
      </div>

      <p className="text-brand-muted font-mono text-xs mb-6">Added {tone.createdAt}</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {tone.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>

      <div className="bg-brand-card border border-brand-border rounded-lg p-5 mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-brand-muted mb-3">
          Notes
        </p>
        <p className="text-brand-text text-sm leading-relaxed">{tone.notes}</p>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-lg p-5 mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-brand-muted mb-4">
          Files
        </p>
        <div className="flex flex-col gap-3">
          {tone.namFile && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-brand-subtext">
                <FileAudio size={14} className="text-brand-accent" />
                <span className="font-mono">{tone.namFile}</span>
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-accent transition-colors"
              >
                <Download size={12} />
                Download
              </button>
            </div>
          )}
          {tone.irFile && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-brand-subtext">
                <Mic2 size={14} className="text-brand-accent" />
                <span className="font-mono">{tone.irFile}</span>
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-accent transition-colors"
              >
                <Download size={12} />
                Download
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          className="flex items-center gap-2 text-sm bg-brand-card border border-brand-border text-brand-subtext px-4 py-2 rounded-md hover:text-brand-text hover:border-brand-accent/40 transition-all"
        >
          <Pencil size={13} />
          Edit
        </button>
        <button
          type="button"
          className="flex items-center gap-2 text-sm text-red-400/60 hover:text-red-400 px-4 py-2 rounded-md transition-colors"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </div>
  );
}

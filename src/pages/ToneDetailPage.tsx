import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToneStore } from '../store/useToneStore';
import { useSelectedTone } from '../hooks/useSelectedTone';

/** Deep links select the tone and return to the library (Phase 5 amp-first UX). */
export default function ToneDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectTone } = useSelectedTone();
  const tone = useToneStore((s) => (id ? s.getToneById(id) : undefined));

  useEffect(() => {
    if (!tone) return;
    selectTone(tone);
    navigate('/', { replace: true });
  }, [tone, selectTone, navigate]);

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

  return (
    <div className="flex h-full min-h-0 flex-1 items-center justify-center p-8 text-sm text-brand-muted">
      Opening library…
    </div>
  );
}

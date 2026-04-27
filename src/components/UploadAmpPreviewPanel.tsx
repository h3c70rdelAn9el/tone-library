import AmpHead from './AmpHead';
import AmpCabinet from './AmpCabinet';
import { resolveAmpTheme } from '../lib/ampThemes';
import type { ToneCard } from '../types/tone';
import { useMemo } from 'react';

type UploadAmpPreviewPanelProps = {
  previewTone: ToneCard;
};

export default function UploadAmpPreviewPanel({
  previewTone,
}: UploadAmpPreviewPanelProps) {
  const theme = useMemo(
    () => resolveAmpTheme(previewTone),
    [previewTone],
  );

  return (
    <aside
      className="flex min-h-[280px] shrink-0 flex-col items-center justify-center gap-2 border-t border-brand-border bg-brand-card/20 px-4 py-10 lg:min-h-0 lg:flex-1 lg:border-l lg:border-t-0 lg:overflow-y-auto lg:px-6 lg:py-12"
      aria-label="Amp preview"
    >
      <p className="mb-2 font-body text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
        Library preview
      </p>
      <div className="w-full max-w-md">
        <AmpHead tone={previewTone} theme={theme} />
        <AmpCabinet theme={theme} />
      </div>
      <p className="mt-2 max-w-sm text-center font-body text-xs text-brand-muted">
        Updates as you set the name, genre tags, and amp style. Knob positions
        reflect saved EQ values when set, otherwise genre tags (cosmetic).
      </p>
    </aside>
  );
}

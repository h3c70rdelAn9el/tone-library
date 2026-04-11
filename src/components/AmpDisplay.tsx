import { AnimatePresence, motion } from 'framer-motion';
import type { Tone } from '../types/tone';
import { resolveAmpTheme } from '../lib/ampThemes';
import AmpHead from './AmpHead';
import AmpCabinet from './AmpCabinet';

type AmpDisplayProps = {
  tone: Tone | null;
};

export default function AmpDisplay({ tone }: AmpDisplayProps) {
  if (!tone) {
    return (
      <div className="flex min-h-[200px] w-full max-w-2xl flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border/60 bg-brand-card/30 px-6 py-16 text-center">
        <p className="font-body text-sm text-brand-muted">
          Select a tone from the library
        </p>
      </div>
    );
  }

  const theme = resolveAmpTheme(tone);

  return (
    <div className="w-full max-w-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={tone.id}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.25, ease: 'easeIn' },
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col"
        >
          <AmpHead tone={tone} theme={theme} />
          <AmpCabinet theme={theme} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

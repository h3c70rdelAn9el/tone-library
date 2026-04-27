import { motion, AnimatePresence } from 'framer-motion';
import type { ToneCard } from '../types/tone';
import { resolveAmpTheme } from '../lib/ampThemes';
import AmpCabinet from './AmpCabinet';
import AmpHead from './AmpHead';

type AmpDisplayProps = {
  tone: ToneCard | null;
};

export default function AmpDisplay({ tone }: AmpDisplayProps) {
  if (!tone) {
    return (
      <div className="flex h-full min-h-[280px] w-full max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-body text-sm text-brand-muted">
          Select a tone from the library
        </p>
      </div>
    );
  }

  const theme = resolveAmpTheme(tone);

  return (
    <div className="flex w-full max-w-xl flex-col items-center justify-center gap-4 px-2 py-4 lg:px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={tone.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full flex-col items-center gap-3"
        >
          <AmpHead tone={tone} theme={theme} />
          <AmpCabinet theme={theme} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

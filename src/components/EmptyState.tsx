import { Guitar } from 'lucide-react';

export default function EmptyState({
  message = 'No tones found.',
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-brand-muted gap-4">
      <Guitar size={40} strokeWidth={1} />
      <p className="font-body text-lg font-medium text-brand-subtext">{message}</p>
    </div>
  );
}

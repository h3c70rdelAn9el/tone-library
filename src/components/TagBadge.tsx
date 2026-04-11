export default function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="text-xs font-mono px-2 py-0.5 rounded-sm bg-brand-border text-brand-subtext uppercase tracking-widest">
      {tag}
    </span>
  );
}

export default function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="text-xs font-body font-medium px-2.5 py-1 rounded-full bg-brand-border/50 text-brand-subtext border border-brand-border/60 capitalize">
      {tag}
    </span>
  );
}

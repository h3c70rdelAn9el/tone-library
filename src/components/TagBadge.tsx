import clsx from 'clsx';

type TagBadgeProps = {
  tag: string;
  onClick?: () => void;
};

export default function TagBadge({ tag, onClick }: TagBadgeProps) {
  const className = clsx(
    'text-xs font-body font-medium px-2.5 py-1 rounded-full bg-brand-border/50 text-brand-subtext border border-brand-border/60 capitalize',
    onClick &&
      'cursor-pointer hover:border-brand-accent/40 hover:text-brand-text transition-colors',
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {tag}
      </button>
    );
  }

  return <span className={className}>{tag}</span>;
}

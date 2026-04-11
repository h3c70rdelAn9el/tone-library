export default function LoadingState() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-brand-border bg-brand-card p-5"
        >
          <div className="mb-3 h-6 w-3/4 rounded-md bg-brand-border/60" />
          <div className="mb-2 h-3 w-full rounded-md bg-brand-border/40" />
          <div className="mb-4 h-3 w-5/6 rounded-md bg-brand-border/40" />
          <div className="mb-4 flex flex-col gap-1">
            <div className="h-3 w-1/2 rounded-md bg-brand-border/30" />
            <div className="h-3 w-2/5 rounded-md bg-brand-border/30" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <div className="h-6 w-14 rounded-full bg-brand-border/50" />
            <div className="h-6 w-16 rounded-full bg-brand-border/50" />
            <div className="h-6 w-12 rounded-full bg-brand-border/50" />
          </div>
        </div>
      ))}
    </div>
  );
}

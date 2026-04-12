/**
 * Decorative “signal activity” LED strip — plugin-style identity element.
 */
export default function SignalIndicator() {
  const heightsPx = [6, 11, 16, 11, 6];
  return (
    <div
      className="flex h-5 items-end gap-0.5"
      aria-hidden>
      {heightsPx.map((h, i) => (
        <div
          key={i}
          className="signal-led-bar w-[3px] rounded-sm bg-brand-accent"
          style={{
            height: h,
            animationDelay: `${i * 0.09}s`,
          }}
        />
      ))}
    </div>
  );
}

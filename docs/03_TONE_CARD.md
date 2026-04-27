1. Add a new section under “Mix Notes”

Create:

<div className="mb-8 rounded-2xl border border-brand-border bg-brand-card p-5">
  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-muted">
    Tone Controls
  </p>

  <div className="grid grid-cols-2 gap-3 text-sm text-brand-text">
    <div>Gain: {tone.gain ?? "—"}</div>
    <div>Bass: {tone.bass ?? "—"}</div>
    <div>Mid: {tone.mid ?? "—"}</div>
    <div>Treble: {tone.treble ?? "—"}</div>
  </div>
</div>
2. Add missing context section (THIS IS IMPORTANT)

Add below Tone Controls:

<div className="mb-8 rounded-2xl border border-brand-border bg-brand-card p-5">
  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-muted">
    Tone Context
  </p>

  <div className="text-sm text-brand-text space-y-1">
    <div>Tuning: {tone.tuning ?? "—"}</div>
    <div>Guitar: {tone.guitarType ?? "—"}</div>
    <div>Pickup: {tone.pickupPosition ?? "—"}</div>
    <div>Amp Style: {tone.ampStyle ?? "—"}</div>
  </div>
</div>
✔ Result of Step 1:

Tone page now shows:

sound (EQ)
context (tuning/guitar)
behavior (notes)

👉 This makes Recreate Mode feel grounded in real data

✅ STEP 2 — Upgrade Recreate Mode output (make it feel “smart”)

Right now it feels like a tool.

You’re going to make it feel like a system that understands tone behavior.

In your Recreate results UI, add 2 things:

1. Add “interpretation line” (MOST IMPORTANT)

Inside results screen:

<p className="text-sm text-brand-muted mb-3">
  {result.compatibility > 80
    ? "This tone should translate closely to your setup."
    : result.compatibility > 50
    ? "This tone will change character but remain usable."
    : "This tone will behave significantly differently in your setup."}
</p>
2. Group adjustments into “Action vs Warning”

Replace flat lists with:

<div className="mb-4">
  <p className="text-xs uppercase text-brand-muted mb-2">Adjustments</p>
  <ul className="text-sm space-y-1">
    {result.adjustments.map((a, i) => (
      <li key={i}>• {a}</li>
    ))}
  </ul>
</div>

<div>
  <p className="text-xs uppercase text-brand-muted mb-2">Warnings</p>
  <ul className="text-sm space-y-1 text-red-300/80">
    {result.warnings.map((w, i) => (
      <li key={i}>• {w}</li>
    ))}
  </ul>
</div>
✔ Result of Step 2:

Recreate Mode now feels:

opinionated
contextual
less “math output”
more “musician feedback tool”
🎯 What you will have after these 2 steps

You will effectively have:

ToneDetailPage:
full tone “profile”
EQ + context visible
feels like a real object
Recreate Mode:
interpretation layer
structured feedback
not just numbers
🧠 Why this matters (no fluff)

These two steps complete your architecture:

Layer Status
Data model DONE
Backend DONE
Recreate logic DONE
UI understanding layer THIS IS WHAT YOU’RE BUILDING NOW

📄 docs/07-recreate_mode_ab_comparison.md

# Recreate Mode — A/B Tone Comparison (Phase 3)

## Overview

Recreate Mode currently supports:

- setup input
- compatibility scoring
- suggested tone adjustments
- refine loop (iteration)

This upgrade introduces:

> direct A/B comparison between original tone and adapted tone

---

# 1. Goal

Let users visually and mentally compare:

- Original ToneCard
- Suggested Adapted Tone

This turns Recreate Mode into a **decision tool**, not just an analyzer.

---

# 2. Core Concept

Recreate Mode already outputs:

```ts id="core1"
suggestedTone?: Partial<ToneCard>

This is now used for comparison.

3. UI Layout Change

Inside RecreateResultView, add a new section:

A/B Comparison Panel
<div className="mt-6 rounded-2xl border border-brand-border bg-brand-card p-5">
  <p className="text-xs uppercase text-brand-muted mb-4">
    A / B Comparison
  </p>

  <div className="grid grid-cols-2 gap-6 text-sm">

    {/* ORIGINAL */}
    <div>
      <p className="text-brand-muted mb-2">Original</p>

      <div className="space-y-1">
        <div>Gain: {tone.gain ?? "—"}</div>
        <div>Bass: {tone.bass ?? "—"}</div>
        <div>Mid: {tone.mid ?? "—"}</div>
        <div>Treble: {tone.treble ?? "—"}</div>
      </div>
    </div>

    {/* ADAPTED */}
    <div>
      <p className="text-brand-accent mb-2">Adapted</p>

      <div className="space-y-1">
        <div>Gain: {result.suggestedTone?.gain ?? tone.gain ?? "—"}</div>
        <div>Bass: {result.suggestedTone?.bass ?? tone.bass ?? "—"}</div>
        <div>Mid: {result.suggestedTone?.mid ?? tone.mid ?? "—"}</div>
        <div>Treble: {result.suggestedTone?.treble ?? tone.treble ?? "—"}</div>
      </div>
    </div>

  </div>
</div>
4. Highlight Differences (important UX upgrade)

Add visual cues for changes.

Example helper:

function diff(a?: number, b?: number) {
  if (a == null || b == null) return false
  return a !== b
}

Then in UI:

<div className={diff(tone.gain, result.suggestedTone?.gain) ? "text-yellow-400" : ""}>
  Gain: ...
</div>
5. UX Principle

This feature is NOT about numbers.

It is about perception:

“what changes if I play this tone in my setup?”

6. Behavioral Shift
Before A/B:
user reads analysis
interprets mentally
After A/B:
user sees difference instantly
understands transformation visually
7. Why this matters

This introduces a key product capability:

comparative audio reasoning (without audio yet)

This is what separates:

App type Behavior
tone library browse presets
analyzer explain tones
adaptation system transform + compare tones

You are now in the third category.

8. Optional Enhancement (do later, not now)

Add delta indicators:

+1 gain
-0.5 bass

But only if UI remains clean.
```

🧠 Step 3A — Extend result object

In recreateTone.ts, add:

export type RecreateResult = {
compatibility: number
adjustments: string[]
warnings: string[]
notes: string[]

suggestedTone?: Partial<ToneCard>
}
⚙️ Step 3B — Add “suggested tone adjustments”

Inside your function:

const suggestedTone: Partial<ToneCard> = { ...tone }

Then apply simple rules:

Tuning mismatch
if (tone.tuning && tone.tuning !== setup.tuning) {
suggestedTone.bass = (tone.bass ?? 5) - 0.5
}
Guitar mismatch
if (tone.guitarType && tone.guitarType !== setup.guitarType) {
suggestedTone.gain = (tone.gain ?? 5) + 0.5
}
Tightness compensation
if (tone.tightness && tone.tightness > 7) {
suggestedTone.mid = (tone.mid ?? 5) + 0.5
}
Return it:
return {
compatibility: Math.max(0, score),
adjustments,
warnings,
notes,
suggestedTone
}
🧭 Step 3C — UI: show “A/B preview”

In Recreate results screen:

Add section:
{result.suggestedTone && (

  <div className="mt-6 rounded-2xl border border-brand-border bg-brand-card p-5">
    <p className="text-xs uppercase text-brand-muted mb-2">
      Suggested Adaptation
    </p>

    <div className="text-sm space-y-1">
      <div>Gain: {result.suggestedTone.gain ?? "—"}</div>
      <div>Bass: {result.suggestedTone.bass ?? "—"}</div>
      <div>Mid: {result.suggestedTone.mid ?? "—"}</div>
      <div>Treble: {result.suggestedTone.treble ?? "—"}</div>
    </div>

  </div>
)}

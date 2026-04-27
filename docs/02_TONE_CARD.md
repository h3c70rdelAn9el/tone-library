📄 docs/RECREATE_MODE_PHASE_2.md

# Recreate Mode (Phase 2 Implementation)

This is a lightweight, rule-based system that turns ToneVault from a tone storage app into a tone adaptation tool.

No AI required. Uses existing ToneCard fields only.

---

# 1. Goal

Given:

- a ToneCard
- a user’s guitar setup

Return:

- compatibility score (0–100)
- adjustments list
- warnings list
- optional notes

---

# 2. Input Types

```ts
export type UserSetup = {
  tuning: string
  guitarType: "single_coil" | "humbucker" | "active"
  pickupPosition?: "neck" | "middle" | "bridge"
}
3. Core Function

Create a new file:

src/lib/recreateTone.ts

import type { ToneCard } from "../types/tone"

export type UserSetup = {
  tuning: string
  guitarType: "single_coil" | "humbucker" | "active"
  pickupPosition?: string
}

export type RecreateResult = {
  compatibility: number
  adjustments: string[]
  warnings: string[]
  notes: string[]
}

export function recreateTone(
  tone: ToneCard,
  setup: UserSetup
): RecreateResult {
  let score = 100

  const adjustments: string[] = []
  const warnings: string[] = []
  const notes: string[] = []

  // --- Tuning mismatch ---
  if (tone.tuning && tone.tuning !== setup.tuning) {
    score -= 25
    adjustments.push("Adjust low-end EQ slightly")
    warnings.push(`Tone was designed for ${tone.tuning}`)
  }

  // --- Guitar type mismatch ---
  if (tone.guitarType && tone.guitarType !== setup.guitarType) {
    score -= 30
    adjustments.push("Adjust gain and EQ for pickup type difference")
    warnings.push(`Optimized for ${tone.guitarType}`)
  }

  // --- Noise risk ---
  if (tone.noiseLevel && tone.noiseLevel > 7 && setup.guitarType === "single_coil") {
    warnings.push("Higher noise floor expected with single coils")
  }

  // --- Tightness behavior ---
  if (tone.tightness && tone.tightness > 7 && setup.tuning !== "Drop C") {
    adjustments.push("Reduce low-end slightly for clarity")
  }

  return {
    compatibility: Math.max(0, score),
    adjustments,
    warnings,
    notes
  }
}
4. UI Integration (Minimal)
Step 1 — Add button

In Tone Detail page:

<button onClick={() => setShowRecreate(true)}>
  Recreate Tone
</button>
Step 2 — Setup Form

Create:

src/components/RecreateSetup.tsx

Fields:

tuning (select)
guitarType (segmented control)
pickupPosition (optional)

On submit:

const result = recreateTone(tone, userSetup)
setResult(result)
Step 3 — Results View

Display:

Compatibility
72%
Adjustments
list adjustments
Warnings
list warnings
Notes
optional notes
5. Rules (keep simple)

Use ONLY these:

Tuning
mismatch → -25 score
Guitar type
mismatch → -30 score
Noise
high noise + single coil → warning
Tightness
high tightness + non-drop tuning → low-end adjustment
6. Where to plug it in
Tone detail page → trigger Recreate Mode
RecreateSetup component → collects input
recreateTone.ts → logic
Results component → display output
7. Done criteria

You are done when:

 Button opens setup UI
 User selects setup
 Score + adjustments render
 No backend changes required
 Uses existing ToneCard only
8. Important

Do NOT overbuild this.

No AI.
No backend changes.
No new schema.

This is a product behavior layer, not infrastructure.


---

If you follow that file literally, you’ll have Recreate Mode working
```

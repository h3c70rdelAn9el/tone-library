📄 docs/06-recreate_mode_refine_loop.md

# Recreate Mode — Refine Loop Upgrade

## Overview

Recreate Mode currently generates:

- compatibility score
- adjustments
- warnings
- suggested tone changes

This is the first version of ToneVault’s **tone adaptation system**.

---

## Problem with current version

Right now Recreate Mode is:

> input → result → done

This makes it feel like a report generator.

Musicians don’t work like this.

They iterate.

---

## Goal of this upgrade

Transform Recreate Mode into:

> input → result → refine → updated result

This introduces a **feedback loop without adding AI or backend complexity**.

---

# 1. Core Concept: Refine Loop

User should be able to:

- adjust setup after seeing results
- immediately see updated results
- stay inside Recreate Mode

No modal close required.

---

# 2. UI Change — Add Refine Action

In `RecreateResultView`, add a button:

```tsx id="refine_button"
<button
  onClick={() => setStep("setup")}
  className="btn-secondary mt-4"
>
  Refine setup →
</button>
3. UX Flow Update
Before:
Tone → Setup → Result → Close
After:
Tone → Setup → Result → Refine → Result → Refine...
4. State Structure (simple)

In RecreateSetup:

type RecreateStep = "setup" | "result"

Or extend existing state:

const [step, setStep] = useState<"setup" | "result">("setup")
5. Key Behavior Change

When user clicks:

"Refine setup"

DO NOT reset everything.

Instead:

keep previous setup values
allow small adjustments
re-run recreateTone()
6. UX Principle
Old behavior:
one-shot analysis
New behavior:
iterative exploration

This aligns with real guitar workflow:

tweak → listen → tweak again

7. Suggested Enhancement (optional but recommended)

When returning to setup screen:

Pre-fill with last used values:

tuning: previousSetup.tuning
guitarType: previousSetup.guitarType
pickupPosition: previousSetup.pickupPosition
8. Why this matters

This change upgrades ToneVault from:

Before:
static analyzer
After:
interactive tone tuning system
9. What this enables later

This refine loop becomes the foundation for:

A/B tone comparison
AI-assisted tone matching (future)
“try closest match” suggestions
tone learning system
10. Done criteria

You are done when:

Result screen shows "Refine setup"
Clicking it returns to setup screen
Previous inputs are preserved
Recreate result updates immediately after changes

---

If you implement this, your app stops feeling like:

> “a feature inside a tone library”

and starts feeling like:

> “a tool musicians actively work with”
```

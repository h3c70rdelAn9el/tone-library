# ToneForge — UI Upgrade Plan (v1.0)

## Context

ToneForge is already a working guitar tone preset app with a dark, modern UI.

Current state:

- Functional UI exists
- Dark theme implemented
- Basic animations present
- Preset/tone library concept working

Goal of this phase:
👉 Transform ToneForge from “working app” → “feels like a real audio product (Neural DSP / plugin-grade UI)”

---

# 1. Core Design Direction

## Target feel

ToneForge should feel like:

- A guitar amp plugin interface
- A creative “tone shaping studio”
- Slightly industrial, premium, minimal

## Keywords guiding UI

- forged
- signal
- amp
- studio
- hardware-like
- tactile

---

# 2. UI Hierarchy Fix (MOST IMPORTANT)

## Problem to solve

Current UI likely feels flat or evenly weighted.

## Rules going forward

- Only ONE primary action per screen
- Everything else is secondary
- Selected tone/preset must always be visually dominant

## Implementation goals

- Add clear "Active Tone" state
- Add visual contrast between:
  - selected vs unselected presets
  - primary vs secondary actions

---

# 3. Component System Upgrade

## Cards (Presets / Tones)

Each tone card should have:

- Subtle gradient background (not pure flat color)
- Border: low contrast
- Hover:
  - lift: translateY(-2px)
  - glow accent
  - slight border brightening
- Active state:
  - accent border
  - glow effect
  - slightly larger scale (1.02 max)

---

## Buttons

### Primary button

Used only for:

- Save tone
- Create preset
- Apply tone

Behavior:

- accent background
- subtle glow
- hover brightness increase

### Secondary button

- ghost style
- border only
- hover = accent border + text color change

---

# 4. Interaction Feel (IMPORTANT)

## Global motion rules

- transitions: 150–200ms max
- easing: ease-out or cubic-bezier(0.2, 0.8, 0.2, 1)
- avoid slow animations (feels laggy in audio tools)

## Micro-interactions to add

- card hover lift
- button press: scale(0.98)
- active selection pulse (very subtle)

---

# 5. Signature ToneForge UI Element (MUST ADD)

Pick at least ONE:

## Option A: Signal Indicator

- small animated LED bar
- represents “audio signal activity”
- subtle pulse animation

## Option B: Waveform Strip

- decorative waveform line
- sits in header or tone card
- slowly animates or pulses

## Option C: "Forge Glow State"

- when saving a tone:
  - screen briefly glows accent color
  - soft pulse animation
  - gives “forging sound” feedback

👉 This is critical for product identity

---

# 6. Layout Improvements

## Recommended structure

## Spacing rules

- Use consistent spacing scale:
  - 8px / 12px / 16px / 24px
- Avoid random padding values

---

# 7. Theme System Cleanup

Ensure these are centralized:

## Colors

- background primary
- background secondary
- border subtle
- accent color

## Rule

👉 No hardcoded colors inside components (except accent usage)

---

# 8. Typography Rules

- Headings: Outfit
- Body: Plus Jakarta Sans

Rules:

- Headings slightly tighter tracking (-0.02em)
- Avoid too many font weights (max 3)

---

# 9. “Audio Product Feel” Checklist

Every interaction should pass this test:

- Does it feel responsive?
- Does it feel slightly tactile?
- Does it feel intentional (not web-default)?
- Does it feel like a plugin, not a website?

If NO → adjust motion or contrast

---

# 10. Next Build Target

After implementing this phase, ToneForge should have:

- Strong visual hierarchy
- Clear active tone state
- At least 1 signature UI element
- Consistent component system
- Plugin-like interaction feel

---

# End Goal

ToneForge should feel like:

> “A digital guitar amp you open to _shape sound_, not browse a list.”

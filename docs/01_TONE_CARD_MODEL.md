# Tone Card Model

## Overview

ToneVault is no longer just a preset storage app.

A **Tone Card** represents a guitar tone as a combination of:

- Sound configuration (amp, IR, gain, EQ, etc.)
- Context (how and where it is used)
- Playability characteristics (how it behaves in real use)

This shifts the app from "saving presets" to **understanding and reproducing tones across real-world setups**.

---

## Tone Card Concept

A Tone Card is the core unit of the system.

It is NOT just a file or preset — it is a structured representation of a playable tone.

### Core Structure

```ts
export type ToneCard = {
  id: string;
  userId: string;

  name: string;
  description?: string;

  // Sound definition
  ampModel?: string;
  irFileUrl?: string;
  gain: number;
  bass: number;
  mid: number;
  treble: number;
  presence?: number;

  // Context (critical differentiator)
  tuning?: string;
  guitarType?: 'single_coil' | 'humbucker' | 'active';
  pickupPosition?: 'neck' | 'middle' | 'bridge';
  genreTags: string[];

  // Behavioral notes
  mixNotes?: string;
  playStyle?: 'rhythm' | 'lead' | 'ambient' | 'clean';

  // Perceived characteristics
  tightness?: number;
  clarity?: number;
  noiseLevel?: number;

  createdAt: string;
  updatedAt: string;
};
```

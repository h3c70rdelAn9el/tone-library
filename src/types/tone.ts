export type AmpStyle =
  | 'modern-black'
  | 'vintage-cream'
  | 'british-gold'
  | 'custom-dark';

export type GuitarType = 'single_coil' | 'humbucker' | 'active';

export type PickupPosition = 'neck' | 'middle' | 'bridge';

export type PlayStyle = 'rhythm' | 'lead' | 'ambient' | 'clean';

/** Core domain model — favorites live in `tone_favorites`, not here. */
export type ToneCard = {
  id: string;
  name: string;
  description?: string;
  mixNotes?: string;

  ampModel?: string;
  namFile: string;
  irFile: string;
  namFileUrl: string | null;
  irFileUrl: string | null;
  gain: number | null;
  bass: number | null;
  mid: number | null;
  treble: number | null;
  presence: number | null;

  tuning?: string;
  guitarType?: GuitarType;
  pickupPosition?: PickupPosition;
  genreTags: string[];

  playStyle?: PlayStyle;
  tightness: number | null;
  clarity: number | null;
  noiseLevel: number | null;

  ampStyle?: AmpStyle | null;
  createdAt: string;
  updatedAt: string;
};

export type Tone = ToneCard;

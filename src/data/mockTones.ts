export interface Tone {
  id: string;
  name: string;
  tags: string[];
  notes: string;
  namFile: string;
  irFile: string;
  createdAt: string;
  favorite: boolean;
}

export const mockTones: Tone[] = [
  {
    id: '1',
    name: 'Metal Rhythm Tight',
    tags: ['metal', 'rhythm', 'high-gain'],
    notes:
      'Recto-style crunch. Tight low end, scooped mids. Works great for down-tuned riffs.',
    namFile: 'metal_rhythm_tight.nam',
    irFile: 'mesa_v30_close.wav',
    createdAt: '2025-03-10',
    favorite: true,
  },
  {
    id: '2',
    name: 'Clean Glassy Strat',
    tags: ['clean', 'strat', 'ambient'],
    notes: 'Fender-style clean. Very glassy and responsive. Blooms with reverb.',
    namFile: 'clean_glassy_strat.nam',
    irFile: 'tweed_sm57.wav',
    createdAt: '2025-03-14',
    favorite: false,
  },
  {
    id: '3',
    name: 'Blues Crunch OD',
    tags: ['blues', 'crunch', 'overdrive'],
    notes:
      "Mid-forward crunch. Plays well with the guitar's volume knob. Think SRV.",
    namFile: 'blues_crunch_od.nam',
    irFile: 'greenback_ribbon.wav',
    createdAt: '2025-03-18',
    favorite: true,
  },
  {
    id: '4',
    name: 'Ambient Post Lead',
    tags: ['ambient', 'lead', 'clean'],
    notes:
      'Washy, reverb-heavy lead tone. Shimmer-friendly. Good for soundscapes.',
    namFile: 'ambient_post_lead.nam',
    irFile: 'church_ir_stereo.wav',
    createdAt: '2025-03-22',
    favorite: false,
  },
  {
    id: '5',
    name: 'Djent Modern High Gain',
    tags: ['metal', 'djent', 'high-gain', 'rhythm'],
    notes:
      'Extremely tight modern high gain. Boosted with Horizon Drive impulse. Drop A capable.',
    namFile: 'djent_modern_hg.nam',
    irFile: 'ownhammer_6505.wav',
    createdAt: '2025-04-01',
    favorite: false,
  },
  {
    id: '6',
    name: 'Country Twang Clean',
    tags: ['clean', 'country', 'twang'],
    notes: 'Bright and spanky. Nashville tone. Telecaster pairs perfectly.',
    namFile: 'country_twang_clean.nam',
    irFile: 'tweed_deluxe_1x12.wav',
    createdAt: '2025-04-05',
    favorite: true,
  },
];

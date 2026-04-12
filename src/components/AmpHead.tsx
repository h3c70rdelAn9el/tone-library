import type { Tone } from '../types/tone';
import type { AmpTheme } from '../lib/ampThemes';
import { deriveKnobValues } from '../lib/ampThemes';
import AmpKnob from './AmpKnob';

type AmpHeadProps = {
  tone: Tone;
  theme: AmpTheme;
};

const KNOB_LABELS = ['GAIN', 'BASS', 'MID', 'TREBLE', 'PRESENCE', 'VOLUME'] as const;

export default function AmpHead({ tone, theme }: AmpHeadProps) {
  const v = deriveKnobValues(tone);
  const values = [v.gain, v.bass, v.mid, v.treble, v.presence, v.volume];
  const title =
    tone.name.length > 28 ? `${tone.name.slice(0, 26)}…` : tone.name;

  const knobY = 168;
  const startX = 86;
  const step = 86;

  return (
    <svg
      viewBox="0 0 600 280"
      width="100%"
      className="aspect-[600/280] h-auto w-full max-h-[min(40vh,280px)] drop-shadow-2xl"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Amp head for ${tone.name}`}
    >
      <defs>
        <linearGradient id="amp-head-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.body} stopOpacity={1} />
          <stop offset="100%" stopColor={theme.body} stopOpacity={0.92} />
        </linearGradient>
        <linearGradient id="amp-head-panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={theme.panel} stopOpacity={1} />
          <stop offset="100%" stopColor={theme.panel} stopOpacity={0.88} />
        </linearGradient>
        <filter id="amp-head-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.45" />
        </filter>
      </defs>

      <path
        d="M 210 36 Q 300 12 390 36"
        fill="none"
        stroke={theme.body}
        strokeWidth={10}
        strokeLinecap="round"
        opacity={0.95}
      />

      <rect
        x={28}
        y={44}
        width={544}
        height={216}
        rx={10}
        fill="url(#amp-head-body)"
        filter="url(#amp-head-shadow)"
      />
      <rect
        x={28}
        y={44}
        width={544}
        height={18}
        rx={3}
        fill={theme.body}
        opacity={0.55}
      />

      {[
        [36, 52],
        [556, 52],
        [36, 244],
        [556, 244],
      ].map(([sx, sy], i) => (
        <circle key={i} cx={sx} cy={sy} r={4} fill="#6a6a70" opacity={0.85} />
      ))}

      <rect
        x={48}
        y={78}
        width={504}
        height={164}
        rx={6}
        fill="url(#amp-head-panel)"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth={1}
      />
      <rect
        x={48}
        y={78}
        width={504}
        height={164}
        rx={6}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={1}
      />

      <text
        x={300}
        y={118}
        textAnchor="middle"
        style={{
          fontFamily: 'Outfit, system-ui, sans-serif',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '0.04em',
          fill: theme.text,
          textTransform: 'uppercase',
        }}
        textLength={Math.min(420, Math.max(120, title.length * 13))}
        lengthAdjust="spacingAndGlyphs"
      >
        {title}
      </text>

      {KNOB_LABELS.map((label, i) => (
        <AmpKnob
          key={label}
          label={label}
          value={values[i] ?? 0.5}
          theme={theme}
          cx={startX + i * step}
          cy={knobY}
        />
      ))}

      <circle
        cx={518}
        cy={108}
        r={6}
        className="amp-led"
        style={{ fill: theme.accent }}
      />

      <rect x={472} y={208} width={22} height={10} rx={2} fill="#2a2a30" opacity={0.9} />
      <rect x={498} y={208} width={22} height={10} rx={2} fill="#2a2a30" opacity={0.9} />
    </svg>
  );
}

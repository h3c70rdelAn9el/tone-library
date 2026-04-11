import type { AmpTheme } from '../lib/ampThemes';

type AmpKnobProps = {
  label: string;
  value: number;
  theme: AmpTheme;
  cx: number;
  cy: number;
  size?: number;
};

/** Display-only knob; indicator sweeps ~270° from 7 o'clock toward 5 o'clock. */
export default function AmpKnob({
  label,
  value,
  theme,
  cx,
  cy,
  size = 26,
}: AmpKnobProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const angleDeg = 225 - clamped * 270;
  const rad = (angleDeg * Math.PI) / 180;
  const r = size * 0.45;
  const x2 = cx + r * Math.cos(rad);
  const y2 = cy - r * Math.sin(rad);

  const gradId = `knob-grad-${label}-${cx}-${cy}`.replace(/\s/g, '');

  return (
    <g>
      <defs>
        <radialGradient id={gradId} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={theme.knob} stopOpacity={0.95} />
          <stop offset="70%" stopColor={theme.knob} stopOpacity={1} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.35} />
        </radialGradient>
      </defs>
      <circle
        cx={cx}
        cy={cy}
        r={size}
        fill={`url(#${gradId})`}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth={1}
      />
      <circle
        cx={cx}
        cy={cy}
        r={size * 0.55}
        fill="rgba(0,0,0,0.22)"
      />
      <line
        x1={cx}
        y1={cy}
        x2={x2}
        y2={y2}
        stroke="rgba(255,255,255,0.85)"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <text
        x={cx}
        y={cy + size + 14}
        textAnchor="middle"
        className="fill-current font-mono uppercase"
        style={{
          fontSize: 9,
          letterSpacing: '0.06em',
          fill: theme.text,
          opacity: 0.55,
        }}
      >
        {label}
      </text>
    </g>
  );
}

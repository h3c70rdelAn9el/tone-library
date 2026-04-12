import { useId } from 'react';
import type { AmpTheme } from '../lib/ampThemes';

type AmpCabinetProps = {
  theme: AmpTheme;
};

export default function AmpCabinet({ theme }: AmpCabinetProps) {
  const uid = useId().replace(/:/g, '');
  const patternId = `grille-${uid}`;

  return (
    <svg
      viewBox="0 0 600 380"
      width="100%"
      className="aspect-[600/380] h-auto w-full max-h-[min(48vh,380px)] drop-shadow-2xl -mt-1"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-hidden
    >
      <defs>
        <pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width={8}
          height={8}
        >
          <path
            d="M0 4h8M4 0v8"
            stroke={theme.grillePattern}
            strokeWidth={0.6}
            opacity={0.55}
          />
          <circle cx={2} cy={2} r={0.6} fill={theme.grillePattern} opacity={0.35} />
        </pattern>
        <linearGradient id={`cab-body-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.body} />
          <stop offset="100%" stopColor={theme.body} stopOpacity={0.9} />
        </linearGradient>
        <filter id={`cab-sh-${uid}`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodOpacity={0.4} />
        </filter>
      </defs>

      <rect
        x={28}
        y={12}
        width={544}
        height={340}
        rx={12}
        fill={`url(#cab-body-${uid})`}
        filter={`url(#cab-sh-${uid})`}
      />

      {[
        [40, 28],
        [560, 28],
        [40, 336],
        [560, 336],
      ].map(([sx, sy], i) => (
        <circle key={i} cx={sx} cy={sy} r={4} fill="#6a6a70" opacity={0.85} />
      ))}

      <rect
        x={56}
        y={36}
        width={488}
        height={300}
        rx={8}
        fill={theme.grille}
        stroke="rgba(0,0,0,0.4)"
        strokeWidth={2}
      />
      <rect
        x={64}
        y={48}
        width={472}
        height={276}
        rx={6}
        fill={`url(#${patternId})`}
        opacity={0.95}
      />

      <g transform="translate(300 186)">
        <circle r={118} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={4} />
        <circle r={102} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
        <circle r={86} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
        <circle r={70} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
        <circle r={22} fill={theme.grillePattern} opacity={0.55} />
        {[[118, 0], [-118, 0], [0, 118], [0, -118]].map(([dx, dy], i) => (
          <circle key={i} cx={dx} cy={dy} r={3} fill="#444" opacity={0.7} />
        ))}
      </g>

      <rect
        x={250}
        y={312}
        width={100}
        height={22}
        rx={3}
        fill={theme.accent}
        opacity={0.92}
      />
      <text
        x={300}
        y={327}
        textAnchor="middle"
        style={{
          fontFamily: 'Outfit, system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.2em',
          fill: '#0d0d0f',
        }}
      >
        TONELIB
      </text>
    </svg>
  );
}

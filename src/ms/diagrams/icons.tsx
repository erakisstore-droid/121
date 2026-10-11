import type React from 'react';
import {PAL} from '../config';

type IconProps = {cx: number; cy: number; s: number; opacity?: number};
const C = PAL.charcoal;
const W = PAL.offWhite;
const B = PAL.beige;

/** Round off-white node with outline, used behind icons. */
export const Node: React.FC<IconProps & {children?: React.ReactNode}> = ({cx, cy, s, opacity = 1, children}) =>
  opacity <= 0.001 ? null : (
    <g opacity={opacity}>
      <circle cx={cx} cy={cy} r={s} fill={W} stroke={C} strokeWidth={3.5} />
      {children}
    </g>
  );

/** Muscle-tone dial with the needle pushed high. */
export const ToneGauge: React.FC<IconProps & {level: number}> = ({cx, cy, s, level, opacity = 1}) => {
  const a = Math.PI * (1 - level);
  const r = s * 0.62;
  return (
    <g opacity={opacity}>
      <path d={`M ${cx - r} ${cy + s * 0.18} A ${r} ${r} 0 0 1 ${cx + r} ${cy + s * 0.18}`} fill="none" stroke={B} strokeWidth={s * 0.16} strokeLinecap="round" />
      <path
        d={`M ${cx + r * Math.cos(Math.PI * 0.25)} ${cy + s * 0.18 - r * Math.sin(Math.PI * 0.25)} A ${r} ${r} 0 0 1 ${cx + r} ${cy + s * 0.18}`}
        fill="none"
        stroke={C}
        strokeWidth={s * 0.16}
        strokeLinecap="round"
      />
      <line x1={cx} y1={cy + s * 0.18} x2={cx + Math.cos(a) * r * 0.85} y2={cy + s * 0.18 - Math.sin(a) * r * 0.85} stroke={C} strokeWidth={s * 0.08} strokeLinecap="round" />
      <circle cx={cx} cy={cy + s * 0.18} r={s * 0.09} fill={C} />
    </g>
  );
};

/** Weak "lift" command: up arrow with a dashed shaft and one of three bars filled. */
export const LiftSignal: React.FC<IconProps & {strength: number}> = ({cx, cy, s, strength, opacity = 1}) => (
  <g opacity={opacity}>
    <line x1={cx - s * 0.12} y1={cy + s * 0.45} x2={cx - s * 0.12} y2={cy - s * 0.3} stroke={C} strokeWidth={s * 0.08} strokeDasharray={`${s * 0.12} ${s * 0.1}`} strokeLinecap="round" />
    <path d={`M ${cx - s * 0.34} ${cy - s * 0.18} L ${cx - s * 0.12} ${cy - s * 0.46} L ${cx + s * 0.1} ${cy - s * 0.18}`} fill="none" stroke={C} strokeWidth={s * 0.08} strokeLinecap="round" strokeLinejoin="round" />
    {[0, 1, 2].map((i) => (
      <rect
        key={i}
        x={cx + s * 0.2 + i * s * 0.15}
        y={cy + s * 0.45 - s * (0.22 + i * 0.16)}
        width={s * 0.1}
        height={s * (0.22 + i * 0.16)}
        rx={s * 0.03}
        fill={i < Math.round(strength * 3) ? C : B}
      />
    ))}
  </g>
);

/** Flat side-view brain silhouette with a few sulci lines. */
export const Brain: React.FC<IconProps> = ({cx, cy, s, opacity = 1}) => (
  <g opacity={opacity} transform={`translate(${cx} ${cy}) scale(${s / 100})`}>
    <path
      d="M -92 18 C -110 -30 -70 -78 -20 -80 C 10 -96 60 -88 80 -58 C 112 -40 112 6 92 26 C 88 52 56 64 30 56 C 14 70 -18 70 -34 56 C -66 64 -98 48 -92 18 Z"
      fill={B}
      stroke={C}
      strokeWidth={4}
    />
    <path d="M -10 -78 C -16 -50 4 -38 -6 -14 M 40 -82 C 30 -56 52 -40 40 -18 M -60 -50 C -40 -34 -54 -10 -36 8 M 74 -20 C 50 -10 62 18 40 28 M -6 10 C 10 24 -4 40 12 54"
      fill="none" stroke={C} strokeWidth={3.5} strokeLinecap="round" />
    <path d="M 18 56 C 22 70 26 82 26 96" fill="none" stroke={C} strokeWidth={4} />
  </g>
);

export const Thermometer: React.FC<IconProps & {level: number}> = ({cx, cy, s, level, opacity = 1}) => (
  <g opacity={opacity}>
    <rect x={cx - s * 0.13} y={cy - s * 0.6} width={s * 0.26} height={s * 0.85} rx={s * 0.13} fill={W} stroke={C} strokeWidth={3.5} />
    <circle cx={cx} cy={cy + s * 0.38} r={s * 0.24} fill={PAL.orange} stroke={C} strokeWidth={3.5} />
    <rect x={cx - s * 0.06} y={cy + s * 0.25 - s * 0.72 * level} width={s * 0.12} height={s * 0.72 * level} rx={s * 0.05} fill={PAL.orange} />
    {[0, 1, 2].map((i) => (
      <line key={i} x1={cx + s * 0.2} y1={cy - s * 0.4 + i * s * 0.2} x2={cx + s * 0.32} y2={cy - s * 0.4 + i * s * 0.2} stroke={C} strokeWidth={3} strokeLinecap="round" />
    ))}
  </g>
);

/** Generic infection marker: a round particle with short spikes. */
export const Infection: React.FC<IconProps & {spin?: number}> = ({cx, cy, s, spin = 0, opacity = 1}) => (
  <g opacity={opacity} transform={`rotate(${spin} ${cx} ${cy})`}>
    {Array.from({length: 8}).map((_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return (
        <g key={i}>
          <line x1={cx + Math.cos(a) * s * 0.32} y1={cy + Math.sin(a) * s * 0.32} x2={cx + Math.cos(a) * s * 0.52} y2={cy + Math.sin(a) * s * 0.52} stroke={C} strokeWidth={3.5} strokeLinecap="round" />
          <circle cx={cx + Math.cos(a) * s * 0.55} cy={cy + Math.sin(a) * s * 0.55} r={s * 0.07} fill={B} stroke={C} strokeWidth={3} />
        </g>
      );
    })}
    <circle cx={cx} cy={cy} r={s * 0.34} fill={B} stroke={C} strokeWidth={3.5} />
    <circle cx={cx - s * 0.1} cy={cy - s * 0.06} r={s * 0.06} fill={C} />
    <circle cx={cx + s * 0.12} cy={cy + s * 0.08} r={s * 0.05} fill={C} />
  </g>
);

/** Schematic bladder filling from the bottom. */
export const Bladder: React.FC<IconProps & {level: number}> = ({cx, cy, s, level, opacity = 1}) => {
  const top = cy - s * 0.45;
  const bot = cy + s * 0.32;
  const fillTop = bot - (bot - top) * level;
  const shape = `M ${cx - s * 0.08} ${cy + s * 0.52} L ${cx - s * 0.08} ${cy + s * 0.36} C ${cx - s * 0.5} ${cy + s * 0.3} ${cx - s * 0.52} ${cy - s * 0.45} ${cx} ${cy - s * 0.45} C ${cx + s * 0.52} ${cy - s * 0.45} ${cx + s * 0.5} ${cy + s * 0.3} ${cx + s * 0.08} ${cy + s * 0.36} L ${cx + s * 0.08} ${cy + s * 0.52}`;
  const id = `bl-${Math.round(cx)}-${Math.round(cy)}`;
  return (
    <g opacity={opacity}>
      <defs>
        <clipPath id={id}>
          <path d={shape} />
        </clipPath>
      </defs>
      <path d={shape} fill={W} />
      <rect x={cx - s} y={fillTop} width={s * 2} height={s} fill={B} clipPath={`url(#${id})`} />
      <path d={shape} fill="none" stroke={C} strokeWidth={3.5} strokeLinejoin="round" />
    </g>
  );
};

/** Generic medicine: one capsule and one round tablet, no packaging or branding. */
export const Medicine: React.FC<IconProps> = ({cx, cy, s, opacity = 1}) => (
  <g opacity={opacity}>
    <g transform={`rotate(-35 ${cx - s * 0.12} ${cy})`}>
      <rect x={cx - s * 0.55} y={cy - s * 0.16} width={s * 0.86} height={s * 0.32} rx={s * 0.16} fill={W} stroke={C} strokeWidth={3.5} />
      <path d={`M ${cx - s * 0.12} ${cy - s * 0.16} L ${cx + s * 0.15} ${cy - s * 0.16} A ${s * 0.16} ${s * 0.16} 0 0 1 ${cx + s * 0.15} ${cy + s * 0.16} L ${cx - s * 0.12} ${cy + s * 0.16} Z`} fill={B} stroke={C} strokeWidth={3.5} />
    </g>
    <circle cx={cx + s * 0.4} cy={cy + s * 0.32} r={s * 0.22} fill={W} stroke={C} strokeWidth={3.5} />
    <line x1={cx + s * 0.25} y1={cy + s * 0.32} x2={cx + s * 0.55} y2={cy + s * 0.32} stroke={C} strokeWidth={3} />
  </g>
);

/** Plain unbranded supplement jar. */
export const SupplementJar: React.FC<IconProps> = ({cx, cy, s, opacity = 1}) => (
  <g opacity={opacity}>
    <rect x={cx - s * 0.32} y={cy - s * 0.55} width={s * 0.64} height={s * 0.18} rx={s * 0.05} fill={B} stroke={C} strokeWidth={3.5} />
    <rect x={cx - s * 0.38} y={cy - s * 0.38} width={s * 0.76} height={s * 0.9} rx={s * 0.12} fill={W} stroke={C} strokeWidth={3.5} />
    <rect x={cx - s * 0.26} y={cy - s * 0.12} width={s * 0.52} height={s * 0.36} rx={s * 0.05} fill={B} />
  </g>
);

/** Faceless clinician bust with stethoscope and clipboard. */
export const Clinician: React.FC<IconProps & {clipboard?: boolean}> = ({cx, cy, s, opacity = 1, clipboard = true}) => (
  <g opacity={opacity}>
    <path d={`M ${cx - s * 0.62} ${cy + s * 0.75} C ${cx - s * 0.6} ${cy + s * 0.1} ${cx + s * 0.6} ${cy + s * 0.1} ${cx + s * 0.62} ${cy + s * 0.75} Z`} fill={W} stroke={C} strokeWidth={3.5} />
    <path d={`M ${cx - s * 0.16} ${cy + s * 0.16} L ${cx} ${cy + s * 0.5} L ${cx + s * 0.16} ${cy + s * 0.16}`} fill={B} stroke={C} strokeWidth={3} strokeLinejoin="round" />
    <path d={`M ${cx - s * 0.28} ${cy + s * 0.22} C ${cx - s * 0.34} ${cy + s * 0.5} ${cx - s * 0.1} ${cy + s * 0.62} ${cx - s * 0.02} ${cy + s * 0.5}`} fill="none" stroke={C} strokeWidth={3} strokeLinecap="round" />
    <circle cx={cx - s * 0.02} cy={cy + s * 0.5} r={s * 0.05} fill={C} />
    <circle cx={cx} cy={cy - s * 0.22} r={s * 0.26} fill={W} stroke={C} strokeWidth={3.5} />
    {clipboard ? (
      <g>
        <rect x={cx + s * 0.38} y={cy + s * 0.12} width={s * 0.42} height={s * 0.56} rx={s * 0.05} fill={B} stroke={C} strokeWidth={3} />
        {[0, 1, 2].map((i) => (
          <line key={i} x1={cx + s * 0.46} y1={cy + s * (0.28 + i * 0.13)} x2={cx + s * 0.72} y2={cy + s * (0.28 + i * 0.13)} stroke={C} strokeWidth={2.5} strokeLinecap="round" />
        ))}
      </g>
    ) : null}
  </g>
);

/** Simple phone handset for "contact your doctor". */
export const Phone: React.FC<IconProps> = ({cx, cy, s, opacity = 1}) => (
  <g opacity={opacity} transform={`translate(${cx} ${cy}) scale(${s / 100})`}>
    <path
      d="M -38 -46 C -30 -54 -18 -52 -12 -42 L -2 -24 C 2 -16 0 -8 -6 -2 L -14 6 C -6 22 6 34 22 42 L 30 34 C 36 28 44 26 52 30 L 70 40 C 80 46 82 58 74 66 L 62 78 C 50 90 28 90 8 78 C -24 58 -50 32 -68 0 C -80 -20 -78 -40 -66 -52 Z"
      fill={W}
      stroke={C}
      strokeWidth={5}
      strokeLinejoin="round"
      transform="translate(-4 -14)"
    />
  </g>
);

/** Small sparkle-free contact marks (short ticks) where toes brush the floor. */
export const Scuff: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) =>
  k <= 0.01 ? null : (
    <g opacity={k}>
      {[-1, 0, 1].map((i) => (
        <line key={i} x1={x + i * 12} y1={y - 8} x2={x + i * 18} y2={y - 22 - (i === 0 ? 6 : 0)} stroke={C} strokeWidth={3.5} strokeLinecap="round" />
      ))}
    </g>
  );

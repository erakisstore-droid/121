import type React from 'react';
import {PAL} from '../config';

const C = PAL.charcoal;
const W = PAL.offWhite;
const B = PAL.beige;

/** Blood-sample tube: glass body, cap, sample level and an "Lipid Profile" label. */
export const BloodTube: React.FC<{x: number; y: number; w: number; h: number; level: number; label?: number; opacity?: number; rot?: number}> = ({
  x,
  y,
  w,
  h,
  level,
  label = 1,
  opacity = 1,
  rot = 0,
}) => {
  if (opacity <= 0.001) return null;
  const capH = h * 0.14;
  const bodyY = y + capH * 0.8;
  const bodyH = h - capH * 0.8;
  const r = w / 2;
  const body = `M ${x} ${bodyY} L ${x} ${bodyY + bodyH - r} A ${r} ${r} 0 0 0 ${x + w} ${bodyY + bodyH - r} L ${x + w} ${bodyY} Z`;
  const fillTop = bodyY + bodyH - (bodyH - 18) * level;
  const id = `tube-${Math.round(x)}-${Math.round(y)}-${Math.round(w)}`;
  const lw = w * 0.82;
  const ly = bodyY + bodyH * 0.22;
  const lh = bodyH * 0.34;
  const fs = Math.max(14, w * 0.2);
  return (
    <g opacity={opacity} transform={rot ? `rotate(${rot} ${x + w / 2} ${y + h / 2})` : undefined}>
      <defs>
        <clipPath id={id}>
          <path d={body} />
        </clipPath>
      </defs>
      <path d={body} fill={W} />
      <rect x={x - 10} y={fillTop} width={w + 20} height={bodyH + 20} fill={PAL.orangeDeep} clipPath={`url(#${id})`} />
      <line x1={x - 10} y1={fillTop} x2={x + w + 10} y2={fillTop} stroke={C} strokeWidth={3} clipPath={`url(#${id})`} opacity={level > 0.02 ? 1 : 0} />
      <path d={body} fill="none" stroke={C} strokeWidth={Math.max(3, w * 0.03)} />
      <line x1={x + w * 0.2} y1={bodyY + 20} x2={x + w * 0.2} y2={bodyY + bodyH * 0.8} stroke={W} strokeWidth={w * 0.06} strokeLinecap="round" opacity={0.7} />
      <rect x={x - w * 0.08} y={y} width={w * 1.16} height={capH} rx={w * 0.12} fill={B} stroke={C} strokeWidth={Math.max(3, w * 0.03)} />
      {label > 0.001 ? (
        <g opacity={label}>
          <rect x={x + (w - lw) / 2} y={ly} width={lw} height={lh} rx={8} fill={W} stroke={C} strokeWidth={3} />
          <text x={x + w / 2} y={ly + lh * 0.38} textAnchor="middle" fontFamily="Cairo" fontWeight={800} fontSize={fs} fill={C}>
            Lipid
          </text>
          <text x={x + w / 2} y={ly + lh * 0.38 + fs * 1.1} textAnchor="middle" fontFamily="Cairo" fontWeight={800} fontSize={fs} fill={C}>
            Profile
          </text>
          <line x1={x + w * 0.22} y1={ly + lh * 0.82} x2={x + w * 0.78} y2={ly + lh * 0.82} stroke={PAL.line} strokeWidth={4} strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );
};

/** Calm outlined heart (no ECG, no alarm). */
export const Heart: React.FC<{cx: number; cy: number; s: number; opacity?: number; beat?: number}> = ({cx, cy, s, opacity = 1, beat = 0}) => {
  if (opacity <= 0.001) return null;
  const k = (s / 100) * (1 + 0.03 * beat);
  return (
    <g opacity={opacity} transform={`translate(${cx} ${cy}) scale(${k})`}>
      <path d="M 0 78 C -40 50 -96 14 -96 -30 C -96 -64 -70 -86 -44 -86 C -22 -86 -8 -74 0 -58 C 8 -74 22 -86 44 -86 C 70 -86 96 -64 96 -30 C 96 14 40 50 0 78 Z" fill={W} stroke={C} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -30 -84 C -30 -110 -12 -120 6 -118 M 22 -86 C 26 -108 44 -116 58 -110" fill="none" stroke={C} strokeWidth={5} strokeLinecap="round" />
      <path d="M -52 -40 C -40 -16 -40 10 -20 30" fill="none" stroke={B} strokeWidth={8} strokeLinecap="round" />
    </g>
  );
};

/** Minimal flat brain outline. */
export const BrainOutline: React.FC<{cx: number; cy: number; s: number; opacity?: number}> = ({cx, cy, s, opacity = 1}) =>
  opacity <= 0.001 ? null : (
    <g opacity={opacity} transform={`translate(${cx} ${cy}) scale(${s / 100})`}>
      <path d="M -92 18 C -110 -30 -70 -78 -20 -80 C 10 -96 60 -88 80 -58 C 112 -40 112 6 92 26 C 88 52 56 64 30 56 C 14 70 -18 70 -34 56 C -66 64 -98 48 -92 18 Z" fill={W} stroke={C} strokeWidth={5} />
      <path d="M -10 -78 C -16 -50 4 -38 -6 -14 M 40 -82 C 30 -56 52 -40 40 -18 M -60 -50 C -40 -34 -54 -10 -36 8 M 74 -20 C 50 -10 62 18 40 28" fill="none" stroke={B} strokeWidth={6} strokeLinecap="round" />
    </g>
  );

export const Sneaker: React.FC<{cx: number; cy: number; s: number; opacity?: number}> = ({cx, cy, s, opacity = 1}) =>
  opacity <= 0.001 ? null : (
    <g opacity={opacity} transform={`translate(${cx} ${cy}) scale(${s / 100})`}>
      <path d="M -70 20 L -66 -34 C -50 -30 -38 -30 -28 -40 C -10 -14 20 -6 54 0 C 72 4 80 14 78 28 L -70 28 Z" fill={W} stroke={C} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -72 28 L 80 28 L 76 40 L -70 40 Z" fill={B} stroke={C} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -26 -26 L -16 -16 M -14 -32 L -4 -22 M -2 -18 L 8 -8" stroke={C} strokeWidth={4} strokeLinecap="round" />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={-110 + i * 6} y1={-20 + i * 18} x2={-86 + i * 6} y2={-20 + i * 18} stroke={C} strokeWidth={5} strokeLinecap="round" />
      ))}
    </g>
  );

export const Cake: React.FC<{cx: number; cy: number; s: number; opacity?: number}> = ({cx, cy, s, opacity = 1}) =>
  opacity <= 0.001 ? null : (
    <g opacity={opacity} transform={`translate(${cx} ${cy}) scale(${s / 100})`}>
      <rect x={-60} y={-10} width={120} height={60} rx={10} fill={B} stroke={C} strokeWidth={5} />
      <path d="M -60 8 C -40 22 -20 -2 0 12 C 20 26 40 2 60 14" fill="none" stroke={C} strokeWidth={4} />
      <rect x={-6} y={-48} width={12} height={38} rx={4} fill={W} stroke={C} strokeWidth={4} />
      <path d="M 0 -56 C -10 -66 -4 -76 0 -84 C 6 -74 10 -66 0 -56 Z" fill={PAL.orangeDeep} stroke={C} strokeWidth={3} />
    </g>
  );

export const CalendarIcon: React.FC<{cx: number; cy: number; s: number; opacity?: number}> = ({cx, cy, s, opacity = 1}) =>
  opacity <= 0.001 ? null : (
    <g opacity={opacity} transform={`translate(${cx} ${cy}) scale(${s / 100})`}>
      <rect x={-60} y={-50} width={120} height={110} rx={14} fill={W} stroke={C} strokeWidth={5} />
      <rect x={-60} y={-50} width={120} height={30} rx={14} fill={B} stroke={C} strokeWidth={5} />
      <line x1={-30} y1={-64} x2={-30} y2={-38} stroke={C} strokeWidth={6} strokeLinecap="round" />
      <line x1={30} y1={-64} x2={30} y2={-38} stroke={C} strokeWidth={6} strokeLinecap="round" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => <rect key={`${r}-${c}`} x={-44 + c * 24} y={-8 + r * 20} width={14} height={11} rx={3} fill={r === 1 && c === 2 ? PAL.orangeDeep : PAL.line} />),
      )}
    </g>
  );

/** Medical-assessment symbol: stethoscope. */
export const Stethoscope: React.FC<{cx: number; cy: number; s: number; opacity?: number}> = ({cx, cy, s, opacity = 1}) =>
  opacity <= 0.001 ? null : (
    <g opacity={opacity} transform={`translate(${cx} ${cy}) scale(${s / 100})`}>
      <path d="M -40 -70 L -40 -20 C -40 20 40 20 40 -20 L 40 -70" fill="none" stroke={C} strokeWidth={8} strokeLinecap="round" />
      <path d="M 0 12 L 0 40 C 0 70 50 74 54 40 L 54 20" fill="none" stroke={C} strokeWidth={8} strokeLinecap="round" />
      <circle cx={54} cy={8} r={18} fill={B} stroke={C} strokeWidth={6} />
      <circle cx={-40} cy={-74} r={8} fill={C} />
      <circle cx={40} cy={-74} r={8} fill={C} />
    </g>
  );

export const Check: React.FC<{cx: number; cy: number; r: number; opacity?: number; dashed?: boolean}> = ({cx, cy, r, opacity = 1, dashed}) =>
  opacity <= 0.001 ? null : (
    <g opacity={opacity}>
      <circle cx={cx} cy={cy} r={r} fill={W} stroke={C} strokeWidth={4} strokeDasharray={dashed ? '8 7' : undefined} />
      {!dashed ? <path d={`M ${cx - r * 0.42} ${cy + r * 0.02} L ${cx - r * 0.1} ${cy + r * 0.32} L ${cx + r * 0.45} ${cy - r * 0.32}`} fill="none" stroke={C} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /> : null}
    </g>
  );

/** Connection node on a thread: off-white dot with a charcoal ring. */
export const NodeDot: React.FC<{x: number; y: number; o?: number; r?: number}> = ({x, y, o = 1, r = 11}) =>
  o <= 0.001 ? null : <circle cx={x} cy={y} r={r} fill={W} stroke={C} strokeWidth={4} opacity={o} />;

/** Line-art anatomical heart (style board): outline with vessels and a pulse accent. */
export const HeartLine: React.FC<{cx: number; cy: number; s: number; opacity?: number; beat?: number}> = ({cx, cy, s, opacity = 1, beat = 0}) => {
  if (opacity <= 0.001) return null;
  const k = (s / 100) * (1 + 0.04 * beat);
  return (
    <g opacity={opacity} transform={`translate(${cx} ${cy}) scale(${k})`}>
      <path
        d="M -8 -52 C -48 -64 -84 -34 -80 6 C -76 46 -40 76 4 96 C 46 74 82 44 84 4 C 86 -30 64 -54 34 -52 C 22 -51 12 -46 4 -40"
        fill={W}
        stroke={C}
        strokeWidth={5.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M -8 -52 C -10 -76 -2 -98 18 -104 C 36 -108 52 -98 54 -84 M 18 -104 L 22 -122 M 40 -100 L 50 -116 M -26 -58 C -34 -74 -32 -92 -22 -100" fill="none" stroke={C} strokeWidth={5.5} strokeLinecap="round" />
      <path d="M -40 -14 C -26 10 -18 40 2 66 M 30 -30 C 18 -6 18 22 30 44" fill="none" stroke={C} strokeWidth={4} strokeLinecap="round" opacity={0.85} />
      {beat > 0.05
        ? [-1, 0, 1].map((i) => (
            <line key={i} x1={92 + i * 4} y1={-70 + i * 26} x2={112 + i * 8} y2={-84 + i * 30} stroke={C} strokeWidth={5} strokeLinecap="round" opacity={beat} />
          ))
        : null}
    </g>
  );
};

/** Line-art brain inside a cream node. */
export const BrainNode: React.FC<{cx: number; cy: number; r: number; opacity?: number}> = ({cx, cy, r, opacity = 1}) =>
  opacity <= 0.001 ? null : (
    <g opacity={opacity}>
      <circle cx={cx} cy={cy} r={r} fill={W} stroke={C} strokeWidth={4} />
      <g transform={`translate(${cx} ${cy}) scale(${r / 150})`}>
        <path d="M -92 18 C -110 -30 -70 -78 -20 -80 C 10 -96 60 -88 80 -58 C 112 -40 112 6 92 26 C 88 52 56 64 30 56 C 14 70 -18 70 -34 56 C -66 64 -98 48 -92 18 Z" fill="none" stroke={C} strokeWidth={7} />
        <path d="M -10 -78 C -16 -50 4 -38 -6 -14 M 40 -82 C 30 -56 52 -40 40 -18 M -60 -50 C -40 -34 -54 -10 -36 8 M 74 -20 C 50 -10 62 18 40 28 M 20 56 C 24 74 28 86 28 100" fill="none" stroke={C} strokeWidth={6} strokeLinecap="round" />
      </g>
    </g>
  );

/** Faceless person silhouette (for age progression). */
export const PersonGlyph: React.FC<{x: number; y: number; h: number; opacity?: number}> = ({x, y, h, opacity = 1}) =>
  opacity <= 0.001 ? null : (
    <g opacity={opacity}>
      <circle cx={x} cy={y - h + h * 0.12} r={h * 0.12} fill={C} />
      <path d={`M ${x - h * 0.16} ${y - h * 0.72} L ${x + h * 0.16} ${y - h * 0.72} L ${x + h * 0.13} ${y - h * 0.32} L ${x + h * 0.09} ${y} L ${x - h * 0.09} ${y} L ${x - h * 0.13} ${y - h * 0.32} Z`} fill={C} />
    </g>
  );

/** Family (three people) icon inside a cream node. */
export const FamilyNode: React.FC<{cx: number; cy: number; r: number; opacity?: number}> = ({cx, cy, r, opacity = 1}) =>
  opacity <= 0.001 ? null : (
    <g opacity={opacity}>
      <circle cx={cx} cy={cy} r={r} fill={W} stroke={C} strokeWidth={4} />
      {[
        [-0.36, 0.08, 0.5],
        [0.36, 0.08, 0.5],
        [0, 0.18, 0.62],
      ].map(([dx, dy, k], i) => (
        <g key={i}>
          <circle cx={cx + dx * r} cy={cy - r * 0.3 + dy * r} r={r * 0.15 * k * 1.6} fill="none" stroke={C} strokeWidth={5} />
          <path d={`M ${cx + dx * r - r * 0.24 * k * 1.4} ${cy + r * 0.45} C ${cx + dx * r - r * 0.22 * k * 1.4} ${cy + r * 0.02 + dy * r}, ${cx + dx * r + r * 0.22 * k * 1.4} ${cy + r * 0.02 + dy * r}, ${cx + dx * r + r * 0.24 * k * 1.4} ${cy + r * 0.45}`} fill="none" stroke={C} strokeWidth={5} strokeLinecap="round" />
        </g>
      ))}
    </g>
  );

/** DNA glyph inside a cream node. */
export const DnaNode: React.FC<{cx: number; cy: number; r: number; opacity?: number}> = ({cx, cy, r, opacity = 1}) => {
  if (opacity <= 0.001) return null;
  const h = r * 0.62;
  const a = Array.from({length: 21}, (_, i) => i / 20);
  const strand = (ph: number) => a.map((u, i) => `${i ? 'L' : 'M'} ${cx + Math.sin(u * Math.PI * 2 + ph) * r * 0.24} ${cy - h + 2 * h * u}`).join(' ');
  return (
    <g opacity={opacity}>
      <circle cx={cx} cy={cy} r={r} fill={W} stroke={C} strokeWidth={4} />
      <path d={strand(0)} fill="none" stroke={C} strokeWidth={5} strokeLinecap="round" />
      <path d={strand(Math.PI)} fill="none" stroke={C} strokeWidth={5} strokeLinecap="round" />
      {[0.15, 0.35, 0.65, 0.85].map((u) => (
        <line key={u} x1={cx + Math.sin(u * Math.PI * 2) * r * 0.24} y1={cy - h + 2 * h * u} x2={cx - Math.sin(u * Math.PI * 2) * r * 0.24} y2={cy - h + 2 * h * u} stroke={C} strokeWidth={4} />
      ))}
    </g>
  );
};

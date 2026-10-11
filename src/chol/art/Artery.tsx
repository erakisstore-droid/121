import type React from 'react';
import {random} from 'remotion';
import {PAL} from '../config';

export type Plaque = {
  /** centre x of the plaque */
  x: number;
  /** half-length along the vessel */
  w: number;
  /** 0–1 protrusion into the lumen as a fraction of the lumen radius */
  h: number;
  side: 'top' | 'bottom';
};

export type ArterySpec = {
  x0: number;
  x1: number;
  cy: number;
  /** lumen radius */
  R: number;
  /** wall thickness */
  T: number;
  plaques: Plaque[];
};

const window = (x: number, c: number, w: number) => {
  const d = Math.abs(x - c);
  if (d >= w) return 0;
  return Math.pow((1 + Math.cos((Math.PI * d) / w)) / 2, 1.1);
};

/** Inner (intima) boundary of each wall, accounting for plaque protrusion. */
export const innerTop = (s: ArterySpec, x: number) =>
  s.cy - s.R + s.plaques.filter((p) => p.side === 'top').reduce((m, p) => m + p.h * s.R * window(x, p.x, p.w), 0);
export const innerBottom = (s: ArterySpec, x: number) =>
  s.cy + s.R - s.plaques.filter((p) => p.side === 'bottom').reduce((m, p) => m + p.h * s.R * window(x, p.x, p.w), 0);

const sample = (s: ArterySpec, f: (x: number) => number, n = 60) =>
  Array.from({length: n + 1}, (_, i) => {
    const x = s.x0 + ((s.x1 - s.x0) * i) / n;
    return [x, f(x)] as const;
  });
const pts = (a: readonly (readonly [number, number])[]) => a.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

export type Particle = {x: number; y: number; kind: 'ldl' | 'cell'; id: number};

/**
 * Deterministic flow through the open lumen (right → left, matching RTL reading).
 * Lanes are scaled by the local open width, so particles squeeze past plaque.
 */
export const flowParticles = (s: ArterySpec, t: number, count: number, ldlShare: number, speed = 150): Particle[] => {
  const span = s.x1 - s.x0 + 60;
  return Array.from({length: count}, (_, i) => {
    const r1 = random(`sp-${i}`);
    const r2 = random(`of-${i}`);
    const r3 = random(`ln-${i}`);
    const kind: Particle['kind'] = random(`kd-${i}`) < ldlShare ? 'ldl' : 'cell';
    const d = (r2 * span + t * speed * (0.8 + 0.4 * r1)) % span;
    const x = s.x1 + 30 - d;
    const top = innerTop(s, x);
    const bot = innerBottom(s, x);
    const mid = (top + bot) / 2;
    const half = Math.max(0, (bot - top) / 2 - 16);
    return {x, y: mid + (r3 * 2 - 1) * half * 0.85, kind, id: i};
  });
};

/** LDL particle: beige sphere with a darker core ring, distinct from blood cells. */
export const LdlDot: React.FC<{x: number; y: number; r?: number; opacity?: number}> = ({x, y, r = 12, opacity = 1}) => (
  <g opacity={opacity}>
    <circle cx={x} cy={y} r={r} fill={PAL.beige} stroke={PAL.charcoal} strokeWidth={3} />
    <circle cx={x} cy={y} r={r * 0.42} fill="none" stroke={PAL.charcoal} strokeWidth={2} />
  </g>
);
export const Cell: React.FC<{x: number; y: number; opacity?: number}> = ({x, y, opacity = 1}) => (
  <ellipse cx={x} cy={y} rx={16} ry={8} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={2} opacity={opacity} />
);

/** Small "LDL" tag that rides on a particle. */
export const LdlTag: React.FC<{x: number; y: number; opacity?: number}> = ({x, y, opacity = 1}) =>
  opacity <= 0.001 ? null : (
    <g opacity={opacity}>
      <line x1={x} y1={y - 10} x2={x} y2={y - 46} stroke={PAL.charcoal} strokeWidth={3} />
      <rect x={x - 44} y={y - 92} width={88} height={48} rx={24} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={3} />
      <text x={x} y={y - 58} textAnchor="middle" fontFamily="Cairo" fontWeight={800} fontSize={30} fill={PAL.charcoal}>
        LDL
      </text>
    </g>
  );

/**
 * Longitudinal artery section: two walls (outer layer + gray media lines + intima),
 * a lumen, and plaque that sits WITHIN the wall beneath the intima and bulges inward.
 */
export const ArterySection: React.FC<{
  s: ArterySpec;
  t: number;
  flow?: {count: number; ldlShare: number; speed?: number; opacity?: number};
  /** particles retained inside the wall: positions are given relative to the wall (u = x, v = depth 0–1 below intima) */
  retained?: {x: number; v: number; o: number; side: 'top' | 'bottom'}[];
  children?: React.ReactNode;
  opacity?: number;
}> = ({s, t, flow, retained = [], children, opacity = 1}) => {
  if (opacity <= 0.001) return null;
  const top = sample(s, (x) => innerTop(s, x));
  const bot = sample(s, (x) => innerBottom(s, x));
  const outerTop = s.cy - s.R - s.T;
  const outerBot = s.cy + s.R + s.T;
  const lumen = `${pts(top)} ${pts([...bot].reverse())}`;
  const media = (k: number, side: 1 | -1) =>
    sample(s, (x) => (side < 0 ? s.cy - s.R - s.T * k : s.cy + s.R + s.T * k) + Math.sin(x / 38) * 3, 80);
  const plaqueShape = (p: Plaque) => {
    const n = 40;
    const xs = Array.from({length: n + 1}, (_, i) => p.x - p.w + (2 * p.w * i) / n);
    const sign = p.side === 'top' ? -1 : 1;
    const base = p.side === 'top' ? s.cy - s.R : s.cy + s.R;
    const deep = xs.map((x) => [x, base + sign * s.T * 0.55 * Math.min(1, p.h * 2.2) * window(x, p.x, p.w)] as const);
    const inner = xs.map((x) => [x, p.side === 'top' ? innerTop(s, x) : innerBottom(s, x)] as const);
    return `${pts(deep)} ${pts([...inner].reverse())}`;
  };
  const particles = flow ? flowParticles(s, t, flow.count, flow.ldlShare, flow.speed) : [];
  return (
    <g opacity={opacity}>
      {/* walls */}
      <polygon points={`${s.x0},${outerTop} ${s.x1},${outerTop} ${pts([...top].reverse())}`} fill={PAL.offWhite} />
      <polygon points={`${s.x0},${outerBot} ${s.x1},${outerBot} ${pts([...bot].reverse())}`} fill={PAL.offWhite} />
      {[0.35, 0.65].map((k) => (
        <g key={k}>
          <polyline points={pts(media(k, -1))} fill="none" stroke={PAL.line} strokeWidth={4} />
          <polyline points={pts(media(k, 1))} fill="none" stroke={PAL.line} strokeWidth={4} />
        </g>
      ))}
      {/* lumen with flowing blood */}
      <polygon points={lumen} fill={PAL.orangeDeep} />
      {s.plaques.filter((p) => p.h > 0.005).map((p, i) => (
        <polygon key={i} points={plaqueShape(p)} fill={PAL.beige} stroke={PAL.charcoal} strokeWidth={3} strokeLinejoin="round" />
      ))}
      {retained.map((r, i) => {
        const base = r.side === 'top' ? innerTop(s, r.x) : innerBottom(s, r.x);
        const y = base + (r.side === 'top' ? -1 : 1) * (12 + r.v * s.T * 0.45);
        return <LdlDot key={i} x={r.x} y={y} r={8} opacity={r.o} />;
      })}
      {particles.map((p) =>
        p.x < s.x0 - 20 || p.x > s.x1 + 20 ? null : p.kind === 'ldl' ? <LdlDot key={p.id} x={p.x} y={p.y} opacity={flow?.opacity ?? 1} /> : <Cell key={p.id} x={p.x} y={p.y} opacity={flow?.opacity ?? 1} />,
      )}
      {/* intima (thin inner lining) drawn over plaque so plaque reads as inside the wall */}
      <polyline points={pts(top)} fill="none" stroke={PAL.offWhite} strokeWidth={8} />
      <polyline points={pts(top)} fill="none" stroke={PAL.charcoal} strokeWidth={3.5} />
      <polyline points={pts(bot)} fill="none" stroke={PAL.offWhite} strokeWidth={8} />
      <polyline points={pts(bot)} fill="none" stroke={PAL.charcoal} strokeWidth={3.5} />
      <line x1={s.x0} y1={outerTop} x2={s.x1} y2={outerTop} stroke={PAL.charcoal} strokeWidth={4.5} />
      <line x1={s.x0} y1={outerBot} x2={s.x1} y2={outerBot} stroke={PAL.charcoal} strokeWidth={4.5} />
      {/* section cut ends */}
      {[s.x0, s.x1].map((x) => (
        <g key={x}>
          <line x1={x} y1={outerTop} x2={x} y2={innerTop(s, x)} stroke={PAL.charcoal} strokeWidth={4.5} strokeLinecap="round" />
          <line x1={x} y1={outerBot} x2={x} y2={innerBottom(s, x)} stroke={PAL.charcoal} strokeWidth={4.5} strokeLinecap="round" />
        </g>
      ))}
      {children}
    </g>
  );
};

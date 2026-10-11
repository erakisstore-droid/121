import {Easing, interpolate} from 'remotion';

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  soft: Easing.bezier(0.33, 0, 0.2, 1),
} as const;

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 between absolute seconds a and b. */
export const ramp = (t: number, a: number, b: number, easing: (x: number) => number = EASE.inOut): number =>
  b <= a ? (t >= a ? 1 : 0) : interpolate(t, [a, b], [0, 1], {...CL, easing});

/** 0→1→0 window: fades in over `fin` after `a`, out over `fout` before `b`. */
export const win = (t: number, a: number, b: number, fin = 0.4, fout = 0.4): number =>
  Math.min(ramp(t, a, a + fin), 1 - ramp(t, b - fout, b));

export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

export type Rect = {x: number; y: number; w: number; h: number};
export const mixRect = (a: Rect, b: Rect, k: number): Rect => ({
  x: mix(a.x, b.x, k),
  y: mix(a.y, b.y, k),
  w: mix(a.w, b.w, k),
  h: mix(a.h, b.h, k),
});

/** Smooth periodic bump centred at c (phase units 0–1) with width s. */
export const bump = (p: number, c: number, s: number) => {
  let d = Math.abs(p - c) % 1;
  if (d > 0.5) d = 1 - d;
  return Math.exp(-(d * d) / (2 * s * s));
};

export const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

export const deg = (d: number) => (d * Math.PI) / 180;

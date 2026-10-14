import type React from 'react';
import {PAL} from '../config';

/**
 * Schematic fatty-acid motif: a zig-zag carbon chain ending in a head group.
 * Not an exact molecular structure. `kinks` marks a few double-bond accents.
 */
export const FattyAcidMotif: React.FC<{x: number; y: number; len: number; seg?: number; amp?: number; p: number; kinks?: number[]; w?: number; color?: string; dir?: 1 | -1; opacity?: number}> = ({
  x,
  y,
  len,
  seg = 14,
  amp = 22,
  p,
  kinks = [],
  w = 7,
  color = PAL.charcoal,
  dir = 1,
  opacity = 1,
}) => {
  if (p <= 0.001 || opacity <= 0.001) return null;
  const n = Math.max(1, Math.round(seg * p));
  const step = len / seg;
  const pts = Array.from({length: n + 1}, (_, i) => ({x: x + dir * i * step, y: y + (i % 2 ? -amp : amp) / 2}));
  return (
    <g opacity={opacity}>
      <polyline points={pts.map((q) => `${q.x},${q.y}`).join(' ')} fill="none" stroke={color} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" />
      {kinks.filter((k) => k < n).map((k) => {
        const a = pts[k];
        const b = pts[k + 1];
        const nx = -(b.y - a.y);
        const ny = b.x - a.x;
        const l = Math.hypot(nx, ny) || 1;
        return <line key={k} x1={a.x + (nx / l) * 12} y1={a.y + (ny / l) * 12} x2={b.x + (nx / l) * 12} y2={b.y + (ny / l) * 12} stroke={PAL.orangeDeep} strokeWidth={w * 0.7} strokeLinecap="round" />;
      })}
      <circle cx={x} cy={y + amp / 2} r={w * 2.4} fill={PAL.offWhite} stroke={color} strokeWidth={w * 0.6} />
    </g>
  );
};

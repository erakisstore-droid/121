import type React from 'react';
import {PAL} from '../config';

/**
 * Reusable matte omega-3 capsule with modeled depth (SVG gradients): cream and
 * orange halves, soft cylinder shading, highlight and contact shadow.
 * `open` separates the halves; `depth` (0–1) fades the shading into flat art.
 */
export const OmegaCapsule: React.FC<{
  id: string;
  cx: number;
  cy: number;
  len: number;
  rad: number;
  rot?: number;
  open?: number;
  depth?: number;
  opacity?: number;
  label?: number;
}> = ({id, cx, cy, len, rad, rot = -24, open = 0, depth = 1, opacity = 1, label = 0}) => {
  if (opacity <= 0.001) return null;
  const half = len / 2;
  const gap = open * rad * 0.7;
  const shade = (c: string) => (
    <linearGradient id={`${id}-${c}`} x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stopColor={PAL.offWhite} stopOpacity={0.55 * depth} />
      <stop offset="0.35" stopColor={PAL.offWhite} stopOpacity={0.1 * depth} />
      <stop offset="0.75" stopColor={PAL.charcoal} stopOpacity={0.12 * depth} />
      <stop offset="1" stopColor={PAL.charcoal} stopOpacity={0.25 * depth} />
    </linearGradient>
  );
  const halfPath = (side: -1 | 1) => {
    const x0 = side * (gap / 2);
    const x1 = side * (gap / 2 + half);
    // straight body + rounded cap at the far end
    return side > 0
      ? `M ${x0} ${-rad} L ${x1 - rad} ${-rad} A ${rad} ${rad} 0 0 1 ${x1 - rad} ${rad} L ${x0} ${rad} Z`
      : `M ${x0} ${-rad} L ${x1 + rad} ${-rad} A ${rad} ${rad} 0 0 0 ${x1 + rad} ${rad} L ${x0} ${rad} Z`;
  };
  return (
    <g opacity={opacity}>
      <defs>
        {shade('s')}
        <radialGradient id={`${id}-shadow`}>
          <stop offset="0" stopColor={PAL.charcoal} stopOpacity={0.28 * depth} />
          <stop offset="1" stopColor={PAL.charcoal} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={cx + 10} cy={cy + rad * 2.4} rx={len * 0.55} ry={rad * 0.42} fill={`url(#${id}-shadow)`} />
      <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
        {/* cream half (left) and orange half (right) */}
        <path d={halfPath(-1)} fill={PAL.offWhite} />
        <path d={halfPath(-1)} fill={`url(#${id}-s)`} />
        <path d={halfPath(1)} fill={PAL.orange} />
        <path d={halfPath(1)} fill={`url(#${id}-s)`} />
        {/* overlap collar where the halves meet */}
        <rect x={-gap / 2 - rad * 0.18} y={-rad} width={rad * 0.36} height={rad * 2} fill={PAL.orangeDeep} opacity={0.9} />
        <path d={halfPath(-1)} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinejoin="round" />
        <path d={halfPath(1)} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinejoin="round" />
        {/* soft specular band */}
        <rect x={-half * 0.85} y={-rad * 0.62} width={len * 0.82} height={rad * 0.22} rx={rad * 0.11} fill={PAL.offWhite} opacity={0.65 * depth} />
        {label > 0.001 ? (
          <g opacity={label}>
            <rect x={gap / 2 + half * 0.18} y={-rad * 0.55} width={half * 0.55} height={rad * 1.1} rx={8} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={3} />
            {[0.25, 0.5, 0.75].map((k) => (
              <line key={k} x1={gap / 2 + half * 0.25} y1={-rad * 0.55 + rad * 1.1 * k} x2={gap / 2 + half * 0.66} y2={-rad * 0.55 + rad * 1.1 * k} stroke={PAL.line} strokeWidth={4} strokeLinecap="round" />
            ))}
          </g>
        ) : null}
      </g>
    </g>
  );
};

/** Sampled drop outline (n points) for morphing into a circle. */
export const dropPoints = (cx: number, cy: number, r: number, n = 72) =>
  Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    // teardrop: pointed top
    const k = 1 - 0.55 * Math.max(0, -Math.sin(a)) ** 3;
    const px = Math.cos(a) * r * k;
    const py = Math.sin(a) * r * (a < 0 && a > -Math.PI ? 1.35 : 1);
    return {x: cx + px, y: cy + py};
  });
export const circlePoints = (cx: number, cy: number, r: number, n = 72) =>
  Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return {x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r};
  });
export const polyStr = (p: {x: number; y: number}[]) => p.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ');

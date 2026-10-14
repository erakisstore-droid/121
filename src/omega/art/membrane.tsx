import type React from 'react';
import {random} from 'remotion';
import {PAL} from '../config';

/**
 * Neuronal cell membrane close-up: a phospholipid bilayer with gentle, ongoing
 * molecular motion. `dha` (0–1) progressively highlights DHA-containing lipids
 * (orange, kinked tails). This is the cell membrane, not myelin.
 */
export const CellMembrane: React.FC<{x0: number; x1: number; y: number; t: number; dha: number; opacity?: number; n?: number}> = ({x0, x1, y, t, dha, opacity = 1, n = 13}) => {
  if (opacity <= 0.001) return null;
  const step = (x1 - x0) / n;
  const tail = 92;
  const lipid = (i: number, side: -1 | 1) => {
    const x = x0 + step * (i + 0.5);
    const bob = Math.sin(t * 2.2 + i * 0.9 + (side > 0 ? 1.3 : 0)) * 6;
    const hy = y + side * (tail + 26) + bob;
    const isDha = random(`dha-${i}-${side}`) < 0.55 && random(`dhak-${i}-${side}`) < dha * 1.3;
    const sway = Math.sin(t * 1.7 + i) * 5;
    const tailPath = (dx: number) => {
      const sx = x + dx;
      const sy = hy - side * 20;
      const ey = y + side * 6;
      return isDha
        ? `M ${sx} ${sy} L ${sx + 10 + sway} ${sy - side * tail * 0.35} L ${sx - 6 + sway} ${sy - side * tail * 0.6} L ${sx + 8} ${ey}`
        : `M ${sx} ${sy} C ${sx + sway} ${sy - side * tail * 0.4}, ${sx - sway} ${sy - side * tail * 0.7}, ${sx} ${ey}`;
    };
    return (
      <g key={`${i}-${side}`}>
        <path d={tailPath(-9)} fill="none" stroke={isDha ? PAL.orangeDeep : PAL.charcoal} strokeWidth={isDha ? 7 : 5} strokeLinecap="round" strokeLinejoin="round" />
        <path d={tailPath(9)} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" />
        <circle cx={x} cy={hy} r={24} fill={isDha ? PAL.orange : PAL.beige} stroke={PAL.charcoal} strokeWidth={4} />
      </g>
    );
  };
  return (
    <g opacity={opacity}>
      <rect x={x0 - 20} y={y - tail - 60} width={x1 - x0 + 40} height={(tail + 60) * 2} rx={40} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
      <rect x={x0} y={y - 8} width={x1 - x0} height={16} fill={PAL.line} opacity={0.6} />
      {Array.from({length: n}, (_, i) => lipid(i, -1))}
      {Array.from({length: n}, (_, i) => lipid(i, 1))}
    </g>
  );
};

/** Simple neuron icon (soma, dendrites, axon) used to locate the membrane close-up. */
export const NeuronIcon: React.FC<{x: number; y: number; s: number; opacity?: number}> = ({x, y, s, opacity = 1}) =>
  opacity <= 0.001 ? null : (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${s / 100})`}>
      <path d="M -40 -10 L -90 -50 M -38 10 L -96 30 M -10 -42 L -20 -96 M 10 -40 L 40 -92 M 36 0 L 200 0" stroke={PAL.charcoal} strokeWidth={9} strokeLinecap="round" fill="none" />
      <circle r={44} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={7} />
      <circle r={16} fill={PAL.beige} />
    </g>
  );

/**
 * Inflammatory signalling, shown as REGULATION: signal particles travel from a
 * source cell to tissue; with `order` → 1 their timing and spacing become even.
 */
export const InflammatorySignals: React.FC<{x0: number; x1: number; y: number; t: number; order: number; opacity?: number}> = ({x0, x1, y, t, order, opacity = 1}) => {
  if (opacity <= 0.001) return null;
  const lanes = [-90, 0, 90];
  const span = x1 - x0 - 200;
  return (
    <g opacity={opacity}>
      {lanes.map((dy) => (
        <line key={dy} x1={x0 + 100} y1={y + dy} x2={x1 - 100} y2={y + dy} stroke={PAL.charcoal} strokeWidth={3} strokeDasharray="4 12" strokeLinecap="round" opacity={0.6} />
      ))}
      {lanes.flatMap((dy, li) =>
        Array.from({length: 5}, (_, i) => {
          const chaos = 1 - order;
          const sp = 0.9 + chaos * (random(`sp-${li}-${i}`) - 0.5) * 1.2;
          const off = i / 5 + chaos * (random(`of-${li}-${i}`) - 0.5) * 0.35;
          const u = (((t * 0.22 * sp + off) % 1) + 1) % 1;
          const jy = chaos * Math.sin(t * 6 + i * 2 + li) * 22;
          return (
            <path
              key={`${li}-${i}`}
              d={`M ${x0 + 100 + u * span} ${y + dy + jy - 13} l 15 13 l -15 13 z`}
              fill={PAL.orange}
              stroke={PAL.charcoal}
              strokeWidth={3}
              strokeLinejoin="round"
            />
          );
        }),
      )}
      {/* source immune cell (left) and tissue (right) */}
      <g>
        <circle cx={x0 + 40} cy={y} r={92} fill={PAL.beige} stroke={PAL.charcoal} strokeWidth={5} />
        {Array.from({length: 9}, (_, i) => {
          const a = (i / 9) * Math.PI * 2;
          return <circle key={i} cx={x0 + 40 + Math.cos(a) * 92} cy={y + Math.sin(a) * 92} r={11} fill={PAL.beige} stroke={PAL.charcoal} strokeWidth={4} />;
        })}
        <circle cx={x0 + 30} cy={y - 8} r={34} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
      </g>
      <rect x={x1 - 110} y={y - 150} width={120} height={300} rx={30} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={x1 - 92} y={y - 126 + i * 66} width={84} height={50} rx={14} fill={PAL.beige} stroke={PAL.charcoal} strokeWidth={3} />
      ))}
    </g>
  );
};

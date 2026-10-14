import type React from 'react';
import {random} from 'remotion';
import {PAL} from '../config';
import {Fish, type FishKind} from './fish';

/** Flat brain + spinal cord (side view). */
export const BrainSpine: React.FC<{x: number; y: number; s: number; draw: number; opacity?: number}> = ({x, y, s, draw, opacity = 1}) => {
  if (opacity <= 0.001) return null;
  const cordLen = 520 * draw;
  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-20} y={60} width={40} height={cordLen} rx={20} fill={PAL.beige} stroke={PAL.charcoal} strokeWidth={5} />
      {Array.from({length: Math.floor(cordLen / 52)}, (_, i) => (
        <line key={i} x1={-20} y1={100 + i * 52} x2={-52} y2={118 + i * 52} stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" />
      ))}
      <g transform="translate(0 -40)">
        <path d="M -150 30 C -175 -50 -110 -125 -30 -128 C 20 -150 100 -138 128 -92 C 178 -64 178 10 146 42 C 140 82 90 100 48 88 C 22 108 -28 108 -54 88 C -104 100 -158 76 -150 30 Z" fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={6} />
        <path d="M -16 -124 C -26 -80 6 -60 -10 -22 M 64 -130 C 48 -90 84 -64 64 -28 M -96 -80 C -64 -54 -86 -16 -58 12 M 118 -32 C 80 -16 98 28 64 44" fill="none" stroke={PAL.beige} strokeWidth={9} strokeLinecap="round" />
      </g>
    </g>
  );
};

/**
 * Axon with simplified myelin segments; signals travel along it. A localized
 * region shows immune activity and an affected (thinned, dashed) segment.
 */
export const AxonMyelin: React.FC<{x0: number; x1: number; y: number; t: number; immune: number; opacity?: number}> = ({x0, x1, y, t, immune, opacity = 1}) => {
  if (opacity <= 0.001) return null;
  const n = 7;
  const seg = (x1 - x0) / n;
  const hit = 4;
  return (
    <g opacity={opacity}>
      <line x1={x0 - 30} y1={y} x2={x1 + 30} y2={y} stroke={PAL.charcoal} strokeWidth={8} strokeLinecap="round" />
      {Array.from({length: n}, (_, i) => {
        const affected = i === hit ? immune : 0;
        return (
          <rect
            key={i}
            x={x0 + i * seg + 10}
            y={y - 30 + affected * 10}
            width={seg - 20}
            height={60 - affected * 20}
            rx={26}
            fill={PAL.beige}
            fillOpacity={1 - 0.6 * affected}
            stroke={PAL.charcoal}
            strokeWidth={4}
            strokeDasharray={affected > 0.4 ? '10 8' : undefined}
          />
        );
      })}
      {[0, 0.33, 0.66].map((o, i) => {
        const u = (((t * 0.35 + o) % 1) + 1) % 1;
        const xx = x0 + (x1 - x0) * u;
        const slow = xx > x0 + hit * seg && xx < x0 + (hit + 1) * seg ? 1 - 0.5 * immune : 1;
        return <circle key={i} cx={xx} cy={y} r={14 * slow} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />;
      })}
      {immune > 0.01
        ? Array.from({length: 5}, (_, i) => {
            const cx = x0 + (hit + 0.5) * seg + (random(`ic-${i}`) - 0.5) * seg * 1.3;
            const cy = y + (i % 2 ? -1 : 1) * (70 + random(`icy-${i}`) * 40) + Math.sin(t * 2 + i) * 6;
            return (
              <g key={i} opacity={immune}>
                <circle cx={cx} cy={cy} r={22} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
                <circle cx={cx - 4} cy={cy - 3} r={8} fill={PAL.orangeDeep} />
              </g>
            );
          })
        : null}
    </g>
  );
};

/** Food plate: rim draws, then fish and simple food shapes slide in. */
export const Plate: React.FC<{cx: number; cy: number; r: number; rim: number; fish: number[]; extras: number; t: number; opacity?: number}> = ({cx, cy, r, rim, fish, extras, t, opacity = 1}) => {
  if (opacity <= 0.001) return null;
  const circ = 2 * Math.PI * r;
  const kinds: FishKind[] = ['sardine', 'mackerel', 'salmon'];
  const slots = [
    {x: cx + r * 0.28, y: cy - r * 0.32, s: 0.5},
    {x: cx - r * 0.18, y: cy + r * 0.05, s: 0.5},
    {x: cx + r * 0.2, y: cy + r * 0.42, s: 0.46},
  ];
  return (
    <g opacity={opacity}>
      <circle cx={cx + 12} cy={cy + 16} r={r} fill={PAL.charcoal} opacity={0.12 * rim} />
      <circle cx={cx} cy={cy} r={r} fill={PAL.offWhite} fillOpacity={rim} stroke={PAL.charcoal} strokeWidth={6} strokeDasharray={`${circ * rim} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={r * 0.82} fill="none" stroke={PAL.line} strokeWidth={5} opacity={rim} />
      {extras > 0.01 ? (
        <g opacity={extras}>
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={cx - r * 0.45 + i * 30} cy={cy - r * 0.38 + i * 18} rx={34} ry={18} fill={PAL.beige} stroke={PAL.charcoal} strokeWidth={4} transform={`rotate(${-30 + i * 25} ${cx - r * 0.45 + i * 30} ${cy - r * 0.38 + i * 18})`} />
          ))}
          <path d={`M ${cx - r * 0.52} ${cy + r * 0.4} q 40 -60 90 -20 q -40 50 -90 20 z`} fill={PAL.orange} stroke={PAL.charcoal} strokeWidth={4} />
        </g>
      ) : null}
      {kinds.map((k, i) =>
        (fish[i] ?? 0) > 0.001 ? (
          <Fish key={k} kind={k} x={slots[i].x + (1 - fish[i]) * 520} y={slots[i].y} s={slots[i].s} t={t} opacity={Math.min(1, fish[i] * 2)} />
        ) : null,
      )}
    </g>
  );
};

/** Central MS-treatment symbol: shield with a medical cross. Label is HTML by the caller. */
export const TreatmentShield: React.FC<{cx: number; cy: number; s: number; p: number}> = ({cx, cy, s, p}) => {
  if (p <= 0.001) return null;
  const k = s * (0.6 + 0.4 * p);
  return (
    <g opacity={Math.min(1, p * 1.5)} transform={`translate(${cx} ${cy}) scale(${k / 100})`}>
      <path d="M 0 -110 L 92 -76 L 92 0 C 92 62 48 100 0 118 C -48 100 -92 62 -92 0 L -92 -76 Z" fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -22 -50 L 22 -50 L 22 -14 L 58 -14 L 58 26 L 22 26 L 22 62 L -22 62 L -22 26 L -58 26 L -58 -14 L -22 -14 Z" fill={PAL.orange} stroke={PAL.charcoal} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};

export const SUPP_ROWS = [
  {label: 'Fish oil', key: 'oil'},
  {label: 'EPA', key: 'epa'},
  {label: 'DHA', key: 'dha'},
] as const;

/**
 * Flat supplement ingredient panel. Amount fields are BLANK (no dose shown or
 * recommended). The bracket groups EPA + DHA per serving.
 */
export const SupplementLabel: React.FC<{x: number; y: number; w: number; h: number; rows: number; bracket: number; t: number}> = ({x, y, w, h, rows, bracket, t}) => {
  const rowH = 120;
  const top = y + 150;
  return (
    <g>
      <rect x={x + 12} y={y + 16} width={w} height={h} rx={28} fill={PAL.charcoal} opacity={0.12} />
      <rect x={x} y={y} width={w} height={h} rx={28} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={5} />
      <text x={x + 40} y={y + 76} fontFamily="Cairo" fontWeight={800} fontSize={48} fill={PAL.charcoal}>
        Supplement Facts
      </text>
      <text x={x + 40} y={y + 120} fontFamily="Cairo" fontWeight={700} fontSize={32} fill={PAL.charcoal} opacity={0.7}>
        per serving
      </text>
      <line x1={x + 30} y1={y + 140} x2={x + w - 30} y2={y + 140} stroke={PAL.charcoal} strokeWidth={6} />
      {SUPP_ROWS.map((r, i) => {
        const k = Math.max(0, Math.min(1, rows * 3 - i));
        const ry = top + i * rowH;
        const key = r.key !== 'oil';
        return (
          <g key={r.key} opacity={k} transform={`translate(${(1 - k) * 30} 0)`}>
            {key ? <rect x={x + 18} y={ry + 12} width={w - 36} height={rowH - 24} rx={16} fill={PAL.beige} opacity={bracket} /> : null}
            <text x={x + 44} y={ry + rowH / 2 + 16} fontFamily="Cairo" fontWeight={key ? 800 : 700} fontSize={46} fill={PAL.charcoal}>
              {r.label}
            </text>
            {/* blank amount field */}
            <rect x={x + w - 270} y={ry + rowH / 2 - 26} width={200} height={52} rx={12} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={3} strokeDasharray="9 7" />
            <text x={x + w - 54} y={ry + rowH / 2 + 12} textAnchor="end" fontFamily="Cairo" fontWeight={700} fontSize={30} fill={PAL.charcoal} opacity={0.55}>
              mg
            </text>
            {i < 2 ? <line x1={x + 30} y1={ry + rowH} x2={x + w - 30} y2={ry + rowH} stroke={PAL.line} strokeWidth={3} /> : null}
          </g>
        );
      })}
      {bracket > 0.001 ? (
        <g opacity={bracket}>
          <path d={`M ${x + w + 10} ${top + rowH + 14} L ${x + w + 36} ${top + rowH + 14} L ${x + w + 36} ${top + rowH * 3 - 14} L ${x + w + 10} ${top + rowH * 3 - 14}`} fill="none" stroke={PAL.charcoal} strokeWidth={6} strokeLinejoin="round" />
          <circle cx={x + w + 36} cy={top + rowH * 2} r={8 + Math.sin(t * 4) * 2} fill={PAL.orangeDeep} />
        </g>
      ) : null}
    </g>
  );
};

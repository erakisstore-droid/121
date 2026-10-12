import type React from 'react';
import {PAL} from '../config';
import {mix} from '../../ms/lib/anim';
import {LdlCluster} from './hero';

export const REPORT_ROWS = ['Total cholesterol', 'LDL-C', 'HDL-C', 'TG'] as const;

/**
 * Minimal lab report: cream paper with a folded corner, "Lipid Profile" header and four
 * labelled rows. Result fields are blank placeholder bars — no patient values.
 * `open` unfolds it horizontally; `rows[i]` reveals row i; `emph` highlights LDL-C.
 */
export const LabReport: React.FC<{x: number; y: number; w: number; h: number; open: number; rows: number[]; emph: number; dim?: number; opacity?: number}> = ({
  x,
  y,
  w,
  h,
  open,
  rows,
  emph,
  dim = 0,
  opacity = 1,
}) => {
  if (opacity <= 0.001 || open <= 0.001) return null;
  const ww = w * open;
  const headH = 130;
  const rowH = (h - headH - 40) / 4;
  const fold = 70;
  const id = `rep-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g opacity={opacity}>
      <defs>
        <clipPath id={id}>
          <rect x={x - 10} y={y - 10} width={ww + 20} height={h + 30} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={x + 10} y={y + 14} width={w} height={h} rx={24} fill={PAL.charcoal} opacity={0.12} />
        <path d={`M ${x + 24} ${y} L ${x + w - fold} ${y} L ${x + w} ${y + fold} L ${x + w} ${y + h - 24} Q ${x + w} ${y + h} ${x + w - 24} ${y + h} L ${x + 24} ${y + h} Q ${x} ${y + h} ${x} ${y + h - 24} L ${x} ${y + 24} Q ${x} ${y} ${x + 24} ${y} Z`} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} strokeLinejoin="round" />
        <path d={`M ${x + w - fold} ${y} L ${x + w - fold} ${y + fold - 10} Q ${x + w - fold} ${y + fold} ${x + w - fold + 10} ${y + fold} L ${x + w} ${y + fold} Z`} fill={PAL.beige} stroke={PAL.charcoal} strokeWidth={4} strokeLinejoin="round" />
        <text x={x + 40} y={y + 82} fontFamily="Cairo" fontWeight={800} fontSize={56} fill={PAL.charcoal}>
          Lipid Profile
        </text>
        <line x1={x + 30} y1={y + headH} x2={x + w - 30} y2={y + headH} stroke={PAL.charcoal} strokeWidth={3} />
        {REPORT_ROWS.map((label, i) => {
          const k = rows[i] ?? 0;
          if (k <= 0.001) return null;
          const ry = y + headH + 20 + i * rowH;
          const isLdl = i === 1;
          const e = isLdl ? emph : 0;
          const o = isLdl ? 1 : 1 - dim;
          const cy = ry + rowH / 2;
          return (
            <g key={label} opacity={k * o} transform={`translate(${(1 - k) * 30} 0)`}>
              {e > 0.001 ? <rect x={x + 14} y={ry + 6} width={w - 28} height={rowH - 12} rx={18} fill={PAL.beige} opacity={e} /> : null}
              {e > 0.001 ? <rect x={x + 14} y={ry + 6} width={12} height={rowH - 12} rx={6} fill={PAL.orangeDeep} opacity={e} /> : null}
              <text x={x + 44} y={cy + 14} fontFamily="Cairo" fontWeight={isLdl ? 800 : 700} fontSize={mix(40, 46, e)} fill={PAL.charcoal}>
                {label}
              </text>
              <LdlCluster x={x + w - 330} y={cy} r={i === 2 ? 20 : 24} opacity={i === 2 ? 0.75 : 1} />
              {/* blank result field */}
              <rect x={x + w - 280} y={cy - 12} width={220} height={24} rx={12} fill={PAL.line} />
              {i < 3 ? <line x1={x + 30} y1={ry + rowH} x2={x + w - 30} y2={ry + rowH} stroke={PAL.line} strokeWidth={3} /> : null}
            </g>
          );
        })}
      </g>
    </g>
  );
};

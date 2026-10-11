import type React from 'react';
import {PAL} from '../config';
import {mix} from '../../ms/lib/anim';

export const REPORT_ROWS = ['Total cholesterol', 'LDL-C', 'HDL-C', 'Triglycerides'] as const;

/**
 * Minimal lab report on a cream card: header band, four labelled rows with BLANK
 * result fields (no patient values). `rows[i]` reveals row i, `emph` highlights LDL-C.
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
  const headH = 110;
  const rowH = (h - headH - 40) / 4;
  return (
    <g opacity={opacity}>
      <defs>
        <clipPath id={`rep-${Math.round(x)}-${Math.round(y)}`}>
          <rect x={x - 10} y={y - 10} width={ww + 20} height={h + 20} />
        </clipPath>
      </defs>
      <g clipPath={`url(#rep-${Math.round(x)}-${Math.round(y)})`}>
        <rect x={x} y={y} width={w} height={h} rx={28} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
        <rect x={x + 26} y={y + 30} width={150} height={16} rx={8} fill={PAL.beige} />
        <rect x={x + 26} y={y + 60} width={240} height={12} rx={6} fill={PAL.line} />
        <rect x={x + w - 96} y={y + 26} width={60} height={60} rx={12} fill={PAL.beige} stroke={PAL.charcoal} strokeWidth={3} />
        <path d={`M ${x + w - 66} ${y + 38} l 0 36 M ${x + w - 84} ${y + 56} l 36 0`} stroke={PAL.charcoal} strokeWidth={6} strokeLinecap="round" />
        <line x1={x + 20} y1={y + headH} x2={x + w - 20} y2={y + headH} stroke={PAL.charcoal} strokeWidth={3} />
        {REPORT_ROWS.map((label, i) => {
          const k = rows[i] ?? 0;
          if (k <= 0.001) return null;
          const ry = y + headH + 20 + i * rowH;
          const isLdl = i === 1;
          const e = isLdl ? emph : 0;
          const o = isLdl ? 1 : 1 - dim;
          return (
            <g key={label} opacity={k * o} transform={`translate(${(1 - k) * 30} 0)`}>
              {e > 0.001 ? <rect x={x + 14} y={ry + 6} width={w - 28} height={rowH - 12} rx={18} fill={PAL.beige} opacity={e} /> : null}
              {e > 0.001 ? <rect x={x + 14} y={ry + 6} width={12} height={rowH - 12} rx={6} fill={PAL.orangeDeep} opacity={e} /> : null}
              <text x={x + 44} y={ry + rowH / 2 + 15} fontFamily="Cairo" fontWeight={isLdl ? 800 : 700} fontSize={mix(40, 46, e)} fill={PAL.charcoal}>
                {label}
              </text>
              <rect x={x + w - 270} y={ry + rowH / 2 - 30} width={130} height={60} rx={12} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={3} strokeDasharray="8 7" />
              <text x={x + w - 40} y={ry + rowH / 2 + 12} textAnchor="end" fontFamily="Cairo" fontWeight={700} fontSize={30} fill={PAL.charcoal} opacity={0.6}>
                mg/dL
              </text>
              {i < 3 ? <line x1={x + 30} y1={ry + rowH} x2={x + w - 30} y2={ry + rowH} stroke={PAL.line} strokeWidth={3} /> : null}
            </g>
          );
        })}
      </g>
    </g>
  );
};

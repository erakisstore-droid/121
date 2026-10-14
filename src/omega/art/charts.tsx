import type React from 'react';
import {DATA, PAL} from '../config';
import {mix, ramp} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';

/** Qualitative downward triglyceride indicator: no axis values, no bars, no effect size. */
export const QualitativeTGIndicator: React.FC<{x: number; y: number; w: number; h: number; p: number; t: number; opacity?: number}> = ({x, y, w, h, p, t, opacity = 1}) => {
  if (opacity <= 0.001) return null;
  const d = `M ${x + 150} ${y + 70} C ${x + w * 0.45} ${y + 80}, ${x + w * 0.55} ${y + h - 70}, ${x + w - 60} ${y + h - 60}`;
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} rx={26} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
      <text x={x + 40} y={y + 78} fontFamily="Cairo" fontWeight={800} fontSize={52} fill={PAL.charcoal}>
        TG
      </text>
      <line x1={x + 150} y1={y + 30} x2={x + 150} y2={y + h - 30} stroke={PAL.line} strokeWidth={4} />
      <path d={d} fill="none" stroke={PAL.charcoal} strokeWidth={9} strokeLinecap="round" {...drawOn(d, p)} />
      {p >= 0.98 ? (
        <path d={`M ${x + w - 92} ${y + h - 86} L ${x + w - 56} ${y + h - 60} L ${x + w - 96} ${y + h - 42}`} fill="none" stroke={PAL.charcoal} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      ) : null}
      {/* travelling marker keeps the indicator alive without changing its meaning */}
      {p >= 0.98 ? <circle cx={mix(x + 170, x + w - 90, (t * 0.35) % 1)} cy={mix(y + 76, y + h - 64, Math.sin(((t * 0.35) % 1) * Math.PI * 0.5))} r={9} fill={PAL.orangeDeep} /> : null}
    </g>
  );
};

/** Small directional indicator card (icon + downward arrow). Label is HTML (Arabic) by the caller. */
export const MarkerIndicator: React.FC<{x: number; y: number; w: number; h: number; p: number; icon: 'flame' | 'spark'; opacity?: number}> = ({x, y, w, h, p, icon, opacity = 1}) => {
  if (opacity <= 0.001 || p <= 0.001) return null;
  const cx = x + 70;
  const cy = y + h / 2 - 20;
  return (
    <g opacity={opacity * Math.min(1, p * 2)} transform={`translate(0 ${(1 - p) * 30})`}>
      <rect x={x} y={y} width={w} height={h} rx={24} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
      {icon === 'flame' ? (
        <path d={`M ${cx} ${cy - 40} C ${cx + 34} ${cy - 6}, ${cx + 26} ${cy + 34}, ${cx} ${cy + 36} C ${cx - 26} ${cy + 34}, ${cx - 34} ${cy - 2}, ${cx - 8} ${cy - 18} C ${cx - 6} ${cy - 2}, ${cx + 2} ${cy + 2}, ${cx} ${cy - 40} Z`} fill={PAL.orange} stroke={PAL.charcoal} strokeWidth={4} strokeLinejoin="round" />
      ) : (
        <g>
          <circle cx={cx} cy={cy} r={22} fill={PAL.beige} stroke={PAL.charcoal} strokeWidth={4} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2;
            return <line key={i} x1={cx + Math.cos(a) * 30} y1={cy + Math.sin(a) * 30} x2={cx + Math.cos(a) * 42} y2={cy + Math.sin(a) * 42} stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" />;
          })}
        </g>
      )}
      <path d={`M ${x + w - 60} ${y + 34} L ${x + w - 60} ${y + 34 + 60 * p}`} stroke={PAL.charcoal} strokeWidth={7} strokeLinecap="round" />
      {p > 0.9 ? <path d={`M ${x + w - 78} ${y + 82} L ${x + w - 60} ${y + 100} L ${x + w - 42} ${y + 82}`} fill="none" stroke={PAL.charcoal} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /> : null}
    </g>
  );
};

/** Exact geometry for the forest plot (linear HR axis 0.5–1.5). */
export const FOREST = {x0: 160, x1: 880, y: 0} as const;
export const hrX = (hr: number) => FOREST.x0 + ((hr - DATA.cardio.axis[0]) / (DATA.cardio.axis[1] - DATA.cardio.axis[0])) * (FOREST.x1 - FOREST.x0);

/**
 * Compact forest-style plot for purified EPA vs standard therapy:
 * reference line at HR 1.00, CI 0.67–0.94, point 0.79. Values never animate
 * once drawn; only `axis`, `ci` and `pt` reveal them.
 */
export const HazardRatioPlot: React.FC<{y: number; axis: number; ci: number; pt: number; t: number; opacity?: number}> = ({y, axis, ci, pt, t, opacity = 1}) => {
  if (opacity <= 0.001) return null;
  const c = DATA.cardio;
  const ay = y + 230;
  const ticks = [0.5, 0.75, 1, 1.25, 1.5];
  const axisD = `M ${FOREST.x0} ${ay} L ${FOREST.x1} ${ay}`;
  const ciD = `M ${hrX(c.lo)} ${y + 140} L ${hrX(c.hi)} ${y + 140}`;
  return (
    <g opacity={opacity}>
      <rect x={110} y={y} width={820} height={330} rx={26} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
      <path d={axisD} stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" {...drawOn(axisD, axis)} />
      {ticks.map((v, i) => {
        const k = ramp(axis, 0.15 + i * 0.15, 0.3 + i * 0.15);
        return (
          <g key={v} opacity={k}>
            <line x1={hrX(v)} y1={ay - 10} x2={hrX(v)} y2={ay + 10} stroke={PAL.charcoal} strokeWidth={4} />
            <text x={hrX(v)} y={ay + 48} textAnchor="middle" fontFamily="Cairo" fontWeight={700} fontSize={32} fill={PAL.charcoal}>
              {v.toFixed(2).replace(/0$/, '')}
            </text>
          </g>
        );
      })}
      {/* reference line at HR = 1.00 */}
      <line x1={hrX(c.ref)} y1={y + 96} x2={hrX(c.ref)} y2={ay} stroke={PAL.charcoal} strokeWidth={3} strokeDasharray="10 8" opacity={ramp(axis, 0.6, 1)} />
      <path d={ciD} stroke={PAL.charcoal} strokeWidth={7} strokeLinecap="round" {...drawOn(ciD, ci)} />
      {ci >= 1 ? (
        <>
          <line x1={hrX(c.lo)} y1={y + 122} x2={hrX(c.lo)} y2={y + 158} stroke={PAL.charcoal} strokeWidth={5} />
          <line x1={hrX(c.hi)} y1={y + 122} x2={hrX(c.hi)} y2={y + 158} stroke={PAL.charcoal} strokeWidth={5} />
        </>
      ) : null}
      {pt > 0.001 ? (
        <g>
          <rect x={hrX(c.hr) - 16 * pt} y={y + 140 - 16 * pt} width={32 * pt} height={32 * pt} fill={PAL.orange} stroke={PAL.charcoal} strokeWidth={4} />
          {pt >= 1 ? <circle cx={hrX(c.hr)} cy={y + 140} r={28 + Math.sin(t * 3) * 4} fill="none" stroke={PAL.orangeDeep} strokeWidth={3} opacity={0.7} /> : null}
        </g>
      ) : null}
    </g>
  );
};

/** Five-year cohort timeline with EXACTLY 839 dots (one per participant) and a counter. */
export const CohortTimeline: React.FC<{x: number; y: number; w: number; p: number; dots: number; t: number; opacity?: number}> = ({x, y, w, p, dots, t, opacity = 1}) => {
  if (opacity <= 0.001) return null;
  const n = DATA.ms.n;
  const cols = 30; // 30 × 28 = 840 ≥ 839
  const gap = (w * 0.68) / cols;
  const shown = Math.round(n * dots);
  const lineD = `M ${x + w - 20} ${y + 330} L ${x + 20} ${y + 330}`;
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={400} rx={26} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
      {Array.from({length: shown}, (_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        return <circle key={i} cx={x + w - 30 - c * gap} cy={y + 32 + r * 9.4} r={3.4} fill={i % 7 === 0 ? PAL.orangeDeep : PAL.charcoal} opacity={0.85} />;
      })}
      <path d={lineD} stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(lineD, p)} />
      {[0, 1, 2, 3, 4, 5].map((yr) => {
        const xx = x + w - 20 - ((w - 40) * yr) / 5;
        const k = ramp(p, yr / 5 - 0.05, yr / 5 + 0.05);
        return (
          <g key={yr} opacity={k}>
            <line x1={xx} y1={y + 318} x2={xx} y2={y + 342} stroke={PAL.charcoal} strokeWidth={4} />
            <text x={xx} y={y + 386} textAnchor="middle" fontFamily="Cairo" fontWeight={700} fontSize={32} fill={PAL.charcoal}>
              {yr}
            </text>
          </g>
        );
      })}
      {p > 0.02 ? <circle cx={x + w - 20 - (w - 40) * Math.min(1, p)} cy={y + 330} r={13 + (p >= 1 ? Math.sin(t * 4) * 2 : 0)} fill={PAL.orange} stroke={PAL.charcoal} strokeWidth={4} /> : null}
    </g>
  );
};

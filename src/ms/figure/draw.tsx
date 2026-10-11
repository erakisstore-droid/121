import type React from 'react';
import {PAL} from '../config';
import type {LegPose, Pt} from './gait';

const poly = (pts: Pt[]) => pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

/** Outline pass + fill pass for a jointed limb drawn as a rounded capsule chain. */
export const Capsule: React.FC<{pts: Pt[]; w: number; fill: string; ol?: number; pass?: 'outline' | 'fill' | 'both'}> = ({
  pts,
  w,
  fill,
  ol = 4,
  pass = 'both',
}) => (
  <>
    {pass !== 'fill' ? (
      <polyline points={poly(pts)} fill="none" stroke={PAL.charcoal} strokeWidth={w + ol * 2} strokeLinecap="round" strokeLinejoin="round" />
    ) : null}
    {pass !== 'outline' ? (
      <polyline points={poly(pts)} fill="none" stroke={fill} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    ) : null}
  </>
);

export type MuscleSpec = {
  /** 0–1 visibility of the calf (posterior) muscle. */
  calf?: number;
  /** 0–1 visibility of the front-of-shin (dorsiflexor) muscle. */
  front?: number;
  /** 0–1 visibility of the thigh muscle. */
  thigh?: number;
  /** 0–1 tightness: shortens, thickens and straightens fibres. */
  tension?: number;
  /** Extra brief squeeze (0–1) for an involuntary contraction. */
  squeeze?: number;
};

const Belly: React.FC<{a: Pt; b: Pt; side: number; width: number; offset: number; opacity: number; tension: number; squeeze: number; ol: number}> = ({
  a,
  b,
  side,
  width,
  offset,
  opacity,
  tension,
  squeeze,
  ol,
}) => {
  if (opacity <= 0.001) return null;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const shorten = 1 - 0.12 * tension - 0.06 * squeeze;
  const thick = 1 + 0.22 * tension + 0.12 * squeeze;
  const L = len * 0.62 * shorten;
  const W = width * thick;
  const cx = a.x + dx * 0.42;
  const cy = a.y + dy * 0.42;
  const fibres = [-0.45, -0.15, 0.15, 0.45];
  const wave = 1 - tension;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${ang}) translate(0 ${side * offset})`} opacity={opacity}>
      <path
        d={`M ${-L / 2} 0 C ${-L / 4} ${-W}, ${L / 4} ${-W}, ${L / 2} 0 C ${L / 4} ${W}, ${-L / 4} ${W}, ${-L / 2} 0 Z`}
        fill={PAL.beige}
        stroke={PAL.charcoal}
        strokeWidth={ol * 0.7}
      />
      {fibres.map((k) => (
        <path
          key={k}
          d={`M ${-L * 0.36} ${k * W * 0.75} q ${L * 0.18} ${-6 * wave} ${L * 0.36} 0 t ${L * 0.36} 0`}
          fill="none"
          stroke={PAL.charcoal}
          strokeWidth={ol * 0.35}
          strokeLinecap="round"
          opacity={0.55}
        />
      ))}
    </g>
  );
};

/** One leg: thigh, shin, foot capsules with optional schematic muscles. */
export const Leg: React.FC<{pose: LegPose; w: number; fill?: string; ol?: number; muscles?: MuscleSpec; pass?: 'outline' | 'fill' | 'both'}> = ({
  pose,
  w,
  fill = PAL.offWhite,
  ol = 4,
  muscles,
  pass = 'both',
}) => {
  const footW = w * 0.5;
  const footPts = [pose.heel, pose.ball, pose.toe];
  const legPts = [pose.hip, pose.knee, pose.ankle];
  const m = muscles ?? {};
  const tension = m.tension ?? 0;
  const squeeze = m.squeeze ?? 0;
  return (
    <g>
      {pass !== 'fill' ? (
        <>
          <Capsule pts={footPts} w={footW} fill={fill} ol={ol} pass="outline" />
          <Capsule pts={legPts} w={w} fill={fill} ol={ol} pass="outline" />
        </>
      ) : null}
      {pass !== 'outline' ? (
        <>
          <Capsule pts={footPts} w={footW} fill={fill} ol={ol} pass="fill" />
          <Capsule pts={legPts} w={w} fill={fill} ol={ol} pass="fill" />
          {/* posterior side of a right-facing leg is the left side of the knee→ankle vector */}
          <Belly a={pose.knee} b={pose.ankle} side={1} width={w * 0.26} offset={w * 0.12} opacity={m.calf ?? 0} tension={tension} squeeze={squeeze} ol={ol} />
          <Belly a={pose.knee} b={pose.ankle} side={-1} width={w * 0.14} offset={w * 0.2} opacity={m.front ?? 0} tension={0} squeeze={0} ol={ol} />
          <Belly a={pose.hip} b={pose.knee} side={1} width={w * 0.28} offset={w * 0.1} opacity={m.thigh ?? 0} tension={tension} squeeze={squeeze} ol={ol} />
        </>
      ) : null}
    </g>
  );
};

/** Floor line, optionally with scrolling ground ticks. */
export const Floor: React.FC<{x0: number; x1: number; y: number; scroll?: number; ticks?: boolean; w?: number; opacity?: number}> = ({
  x0,
  x1,
  y,
  scroll = 0,
  ticks = false,
  w = 5,
  opacity = 1,
}) => {
  const gap = 70;
  const off = ((scroll % gap) + gap) % gap;
  const marks: number[] = [];
  if (ticks) for (let x = x0 - gap + off; x < x1; x += gap) if (x > x0 + 6 && x < x1 - 30) marks.push(x);
  return (
    <g opacity={opacity}>
      <line x1={x0} y1={y} x2={x1} y2={y} stroke={PAL.charcoal} strokeWidth={w} strokeLinecap="round" />
      {marks.map((x) => (
        <line key={x} x1={x} y1={y + 14} x2={x + 26} y2={y + 14} stroke={PAL.charcoal} strokeWidth={w * 0.6} strokeLinecap="round" opacity={0.45} />
      ))}
    </g>
  );
};

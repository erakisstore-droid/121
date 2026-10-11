import type React from 'react';
import {PAL} from '../config';
import {Leg} from '../figure/draw';
import {legFromAngles} from '../figure/gait';
import {dimsFor} from '../figure/Walker';
import {deg, type Rect} from '../lib/anim';
import {arcPath} from '../lib/paths';

/**
 * Compact spasticity diagram: leg with tense calf/thigh muscles, the normal knee
 * range as a dashed ghost arc and the current (restricted) range as a solid arc.
 */
export const KneeArc: React.FC<{r: Rect; t: number; amp: number; tension: number; squeeze?: number; opacity?: number}> = ({
  r,
  t,
  amp,
  tension,
  squeeze = 0,
  opacity = 1,
}) => {
  if (opacity <= 0.001) return null;
  const L = (r.h - 70) / 2.15;
  const hip = {x: r.x + r.w * 0.5, y: r.y + 44};
  const hipA = 6;
  const knee = amp + amp * Math.sin((t / 1.9) * Math.PI * 2 - Math.PI / 2) + 6 * squeeze;
  const pose = legFromAngles(hip, hipA, knee, 0, dimsFor(L));
  const R = L * 0.76;
  const a1 = hipA - 2 * amp;
  return (
    <g opacity={opacity}>
      <path d={arcPath(pose.knee, R, hipA, hipA - 54)} fill="none" stroke={PAL.line} strokeWidth={5} strokeDasharray="12 10" strokeLinecap="round" />
      <Leg pose={pose} w={L * 0.3} muscles={{calf: 1, thigh: 1, tension, squeeze}} />
      <circle cx={hip.x} cy={hip.y} r={L * 0.16} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={3.5} />
      <path d={arcPath(pose.knee, R, hipA, a1)} fill="none" stroke={PAL.charcoal} strokeWidth={8} strokeLinecap="round" />
      <line
        x1={pose.knee.x + Math.sin(deg(a1)) * (R - 18)}
        y1={pose.knee.y + Math.cos(deg(a1)) * (R - 18)}
        x2={pose.knee.x + Math.sin(deg(a1)) * (R + 18)}
        y2={pose.knee.y + Math.cos(deg(a1)) * (R + 18)}
        stroke={PAL.charcoal}
        strokeWidth={7}
        strokeLinecap="round"
      />
    </g>
  );
};

/** Placement of the knee-arc diagram inside a panel (shared by beats 15–16). */
export const kneeRect = (p: Rect): Rect => ({x: p.x + p.w / 2 - 150, y: p.y + 6, w: 300, h: p.h - 10});

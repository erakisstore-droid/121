import type React from 'react';
import {PAL} from '../config';
import {Floor, type MuscleSpec} from '../figure/draw';
import type {LegMods} from '../figure/gait';
import {WalkerFigure, walkerPoses} from '../figure/Walker';
import type {Rect} from '../lib/anim';
import {Scuff} from './icons';

/** Lower-body walker (legs only) clipped to a rectangle: the reusable "leg view". */
export const LegsView: React.FC<{
  id: string;
  r: Rect;
  phase: number;
  near: LegMods;
  muscles?: MuscleSpec;
  /** Hip x as a fraction of the rect width. */
  hx?: number;
  opacity?: number;
  floorScroll?: number;
}> = ({id, r, phase, near, muscles, hx = 0.5, opacity = 1, floorScroll}) => {
  if (opacity <= 0.001 || r.w < 4 || r.h < 4) return null;
  const floorY = r.y + r.h * 0.84;
  const L = r.h * 0.31;
  const poses = walkerPoses({x: r.x + r.w * hx, floorY, phase, L, near});
  const toeOnFloor = poses.near.toe.y > floorY - 2 && ((phase % 1) + 1) % 1 > 0.66;
  return (
    <g opacity={opacity}>
      <defs>
        <clipPath id={id}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={Math.min(28, r.w / 2, r.h / 2)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <Floor x0={r.x + 24} x1={r.x + r.w - 24} y={floorY} w={4} ticks={floorScroll !== undefined} scroll={floorScroll ?? 0} />
        <WalkerFigure poses={poses} nearMuscles={muscles} />
        <Scuff x={poses.near.toe.x} y={floorY} k={toeOnFloor ? 1 : 0} />
        <circle cx={poses.hip.x} cy={poses.hip.y} r={L * 0.16} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={3} />
      </g>
    </g>
  );
};

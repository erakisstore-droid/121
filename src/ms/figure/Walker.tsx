import type React from 'react';
import {PAL} from '../config';
import {deg} from '../lib/anim';
import {Capsule, Leg, type MuscleSpec} from './draw';
import {gaitAngles, gaitLeg, hipLift, type LegDims, type LegMods, type LegPose, type Pt} from './gait';

export type WalkerSpec = {
  /** Hip x position. */
  x: number;
  floorY: number;
  /** Gait phase of the near (affected) leg; far leg is half a cycle later. */
  phase: number;
  /** Thigh length in px; other segments derive from it. */
  L: number;
  near?: LegMods;
  far?: LegMods;
};

export const dimsFor = (L: number): LegDims => ({thigh: L, shin: L, foot: L * 0.46});

export type WalkerPoses = {hip: Pt; near: LegPose; far: LegPose; dims: LegDims};

/** Pure pose solver, shared by drawings and overlays (AFO, FES, toe paths). */
export const walkerPoses = (s: WalkerSpec): WalkerPoses => {
  const dims = dimsFor(s.L);
  const lift = hipLift(s.phase, dims, s.near ?? {}, s.far ?? {});
  const hip = {x: s.x, y: s.floorY - lift};
  const near = gaitLeg(hip, s.phase, dims, s.near, s.floorY);
  const far = gaitLeg(hip, s.phase + 0.5, dims, s.far, s.floorY);
  return {hip, near, far, dims};
};

type DrawProps = {
  poses: WalkerPoses;
  /** Draw torso, arms and head. */
  full?: boolean;
  phase?: number;
  nearMuscles?: MuscleSpec;
  ol?: number;
};

/** Faceless schematic walker: far limbs beige, near limbs off-white. */
export const WalkerFigure: React.FC<DrawProps> = ({poses, full = false, phase = 0, nearMuscles, ol}) => {
  const {hip, near, far, dims} = poses;
  const L = dims.thigh;
  const w = L * 0.3;
  const o = ol ?? Math.max(2.5, L * 0.028);
  const lean = 4;
  const torsoLen = L * 1.25;
  const sh = {x: hip.x + Math.sin(deg(lean)) * torsoLen, y: hip.y - Math.cos(deg(lean)) * torsoLen};
  const headR = L * 0.25;
  const head = {x: sh.x + L * 0.04, y: sh.y - headR * 1.45};
  const arm = (p: number) => {
    const hipA = gaitAngles(p).hip - 7;
    const a = -0.75 * hipA;
    const elbow = {x: sh.x + Math.sin(deg(a)) * L * 0.78, y: sh.y + Math.cos(deg(a)) * L * 0.78};
    const fa = a + 22 + 8 * Math.max(0, Math.sin(deg(a * 4)));
    const hand = {x: elbow.x + Math.sin(deg(fa)) * L * 0.78, y: elbow.y + Math.cos(deg(fa)) * L * 0.78};
    return [sh, elbow, hand];
  };
  return (
    <g>
      {full ? <Capsule pts={arm(phase + 0.5)} w={w * 0.62} fill={PAL.beige} ol={o} /> : null}
      <Leg pose={far} w={w} fill={PAL.beige} ol={o} />
      {full ? (
        <>
          <Capsule pts={[hip, sh]} w={w * 1.35} fill={PAL.offWhite} ol={o} />
          <circle cx={head.x} cy={head.y} r={headR} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={o * 2} />
          <circle cx={head.x} cy={head.y} r={headR} fill={PAL.offWhite} />
        </>
      ) : null}
      <Leg pose={near} w={w} fill={PAL.offWhite} ol={o} muscles={nearMuscles} />
      {full ? <Capsule pts={arm(phase)} w={w * 0.62} fill={PAL.offWhite} ol={o} /> : null}
    </g>
  );
};

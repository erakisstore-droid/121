import type React from 'react';
import {PAL, STAGE} from './config';
import {deg, mix} from '../ms/lib/anim';
import {Capsule} from '../ms/figure/draw';
import {ik2} from '../ms/figure/ik';
import type {Pose, Pt} from './poses';

const {L, ballR, floor} = STAGE;
const ARM = 0.9 * L;
const lerp = (a: Pt, b: Pt, k: number): Pt => ({x: mix(a.x, b.x, k), y: mix(a.y, b.y, k)});
const rot = (v: Pt, a: number): Pt => ({x: v.x * Math.cos(a) - v.y * Math.sin(a), y: v.x * Math.sin(a) + v.y * Math.cos(a)});
const add = (a: Pt, b: Pt): Pt => ({x: a.x + b.x, y: a.y + b.y});

/** Joint positions for a pose. Left limbs bend outward to −x, right limbs to +x. */
export const rig = (p: Pose) => {
  const a = deg(p.lean);
  const hipL = add(p.pelvis, rot({x: -0.3 * L, y: 0}, a * 0.3));
  const hipR = add(p.pelvis, rot({x: 0.3 * L, y: 0}, a * 0.3));
  const neck = add(p.pelvis, rot({x: 0, y: -1.35 * L}, a));
  const shL = add(neck, rot({x: -0.42 * L, y: 0.08 * L}, a));
  const shR = add(neck, rot({x: 0.42 * L, y: 0.08 * L}, a));
  const head = add(neck, rot({x: 0, y: -0.5 * L}, a));
  const ikKneeL = ik2(hipL, p.footL, L, L, 1);
  const ikKneeR = ik2(hipR, p.footR, L, L, -1);
  const kneeL = p.kneeL ? lerp(ikKneeL, p.kneeL, p.kneeLW ?? 0) : ikKneeL;
  const kneeR = p.kneeR ? lerp(ikKneeR, p.kneeR, p.kneeRW ?? 0) : ikKneeR;
  const elL = ik2(shL, p.handL, ARM, ARM, 1);
  const elR = ik2(shR, p.handR, ARM, ARM, -1);
  // keep hands on the reachable sphere so the ball never floats away from a straight arm
  const reach = (s: Pt, h: Pt): Pt => {
    const d = Math.hypot(h.x - s.x, h.y - s.y);
    const m = 2 * ARM - 0.5;
    return d <= m ? h : {x: s.x + ((h.x - s.x) * m) / d, y: s.y + ((h.y - s.y) * m) / d};
  };
  return {hipL, hipR, neck, shL, shR, head, kneeL, kneeR, elL, elR, handL: reach(shL, p.handL), handR: reach(shR, p.handR)};
};

export const Ball: React.FC<{p: Pt; vis: number; spin: number}> = ({p, vis, spin}) =>
  vis <= 0.01 ? null : (
    <g opacity={Math.min(1, vis * 1.4)} transform={`translate(${p.x} ${p.y}) scale(${0.6 + 0.4 * vis}) rotate(${spin})`}>
      <circle r={ballR} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={5} />
      <path d={`M ${-ballR * 0.92} ${-ballR * 0.3} C ${-ballR * 0.2} ${-ballR * 0.05} ${-ballR * 0.2} ${ballR * 0.6} ${-ballR * 0.45} ${ballR * 0.85}`} fill="none" stroke={PAL.orangeDeep} strokeWidth={4} strokeLinecap="round" />
      <path d={`M ${ballR * 0.92} ${ballR * 0.3} C ${ballR * 0.2} ${ballR * 0.05} ${ballR * 0.2} ${-ballR * 0.6} ${ballR * 0.45} ${-ballR * 0.85}`} fill="none" stroke={PAL.orangeDeep} strokeWidth={4} strokeLinecap="round" />
    </g>
  );

/** Soft floor shadows for feet and ball (shrink with height). */
export const Shadows: React.FC<{pose: Pose}> = ({pose}) => {
  const ballH = Math.max(0, floor - ballR - pose.ball.y);
  const bk = Math.max(0.25, 1 - ballH / (3 * L));
  return (
    <g fill={PAL.charcoal}>
      <ellipse cx={(pose.footL.x + pose.footR.x) / 2} cy={floor + 10} rx={Math.abs(pose.footR.x - pose.footL.x) / 2 + 0.45 * L} ry={16} opacity={0.14} />
      <ellipse cx={pose.ball.x} cy={floor + 6} rx={ballR * 1.3 * bk} ry={7 * bk} opacity={0.22 * bk * pose.ballVis} />
    </g>
  );
};

/** Faceless brand figure: charcoal outline, off-white near limbs, beige far limbs, charcoal shorts and shoes. */
export const Figure: React.FC<{pose: Pose; opacity?: number; ghost?: boolean}> = ({pose, opacity = 1, ghost = false}) => {
  const j = rig(pose);
  const w = 0.3 * L;
  const ol = 5;
  const foot = (f: Pt, side: number) => [f, {x: f.x + side * 0.16 * L, y: f.y}];
  const shortsL = lerp(j.hipL, j.kneeL, 0.38);
  const shortsR = lerp(j.hipR, j.kneeR, 0.38);
  if (ghost) {
    return (
      <g opacity={opacity} fill="none" stroke={PAL.offWhite} strokeLinecap="round" strokeLinejoin="round" strokeWidth={w * 0.55}>
        <polyline points={[j.hipL, j.kneeL, pose.footL].map((p) => `${p.x},${p.y}`).join(' ')} />
        <polyline points={[j.hipR, j.kneeR, pose.footR].map((p) => `${p.x},${p.y}`).join(' ')} />
        <polyline points={[j.shL, j.elL, j.handL].map((p) => `${p.x},${p.y}`).join(' ')} />
        <polyline points={[j.shR, j.elR, j.handR].map((p) => `${p.x},${p.y}`).join(' ')} />
        <line x1={pose.pelvis.x} y1={pose.pelvis.y} x2={j.neck.x} y2={j.neck.y} strokeWidth={w * 1.1} />
        <circle cx={j.head.x} cy={j.head.y} r={0.24 * L} fill={PAL.offWhite} stroke="none" />
      </g>
    );
  }
  return (
    <g opacity={opacity}>
      <Capsule pts={foot(pose.footL, -1)} w={w * 0.75} fill={PAL.charcoal} ol={ol} />
      <Capsule pts={foot(pose.footR, 1)} w={w * 0.75} fill={PAL.charcoal} ol={ol} />
      <Capsule pts={[j.hipL, j.kneeL, pose.footL]} w={w} fill={PAL.beige} ol={ol} />
      <Capsule pts={[j.hipR, j.kneeR, pose.footR]} w={w} fill={PAL.offWhite} ol={ol} />
      <Capsule pts={[j.hipL, shortsL]} w={w * 1.25} fill={PAL.charcoal} ol={ol} />
      <Capsule pts={[j.hipR, shortsR]} w={w * 1.25} fill={PAL.charcoal} ol={ol} />
      <Capsule pts={[j.hipL, j.hipR]} w={w * 1.3} fill={PAL.charcoal} ol={ol} />
      <Capsule pts={[lerp(pose.pelvis, j.neck, 0.3), lerp(pose.pelvis, j.neck, 0.72)]} w={0.8 * L} fill={PAL.offWhite} ol={ol} />
      <Capsule pts={[j.shL, j.shR]} w={w * 1.05} fill={PAL.offWhite} ol={ol} />
      <circle cx={j.head.x} cy={j.head.y} r={0.33 * L} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={ol * 2} />
      <path
        d={`M ${j.head.x - 0.33 * L} ${j.head.y - 0.04 * L} A ${0.33 * L} ${0.33 * L} 0 0 1 ${j.head.x + 0.33 * L} ${j.head.y - 0.04 * L} Z`}
        fill={PAL.charcoal}
        transform={`rotate(${pose.lean} ${j.head.x} ${j.head.y})`}
      />
      <Capsule pts={[j.shL, j.elL, j.handL]} w={w * 0.78} fill={PAL.beige} ol={ol} />
      <Capsule pts={[j.shR, j.elR, j.handR]} w={w * 0.78} fill={PAL.offWhite} ol={ol} />
      <circle cx={j.handL.x} cy={j.handL.y} r={w * 0.5} fill={PAL.beige} stroke={PAL.charcoal} strokeWidth={ol} />
      <circle cx={j.handR.x} cy={j.handR.y} r={w * 0.5} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={ol} />
    </g>
  );
};

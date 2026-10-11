import {bump, deg, mix, smooth} from '../lib/anim';

/** Side-view leg kinematics (figure faces +x, y grows downward). */
export type LegMods = {
  /** 0–1: forefoot stays low during swing (reduced dorsiflexion). */
  footDrop?: number;
  /** 0–1: compensatory higher hip/knee lift during swing. */
  steppage?: number;
  /** 0–1: reduced knee/ankle excursion (increased tone). */
  stiffness?: number;
  /** 0–1: ankle held near neutral (AFO or effective FES). */
  support?: number;
};

export type LegDims = {thigh: number; shin: number; foot: number};
export type Pt = {x: number; y: number};
export type LegPose = {hip: Pt; knee: Pt; ankle: Pt; heel: Pt; toe: Pt; ball: Pt; shinAngle: number; footAngle: number};

/** Joint angles in degrees for gait phase p (0 = heel strike, swing ≈ 0.62–1). */
export const gaitAngles = (p: number, m: LegMods = {}) => {
  const ph = ((p % 1) + 1) % 1;
  const stiff = m.stiffness ?? 0;
  // thigh: extends through stance, flexes forward quickly during swing
  const base =
    ph < 0.55 ? mix(25, -10, smooth(ph / 0.55)) : ph < 0.88 ? mix(-10, 28, smooth((ph - 0.55) / 0.33)) : mix(28, 25, smooth((ph - 0.88) / 0.12));
  const hip = base + 18 * (m.steppage ?? 0) * bump(ph, 0.8, 0.09);
  const knee =
    (1 - 0.6 * stiff) * (14 * bump(ph, 0.14, 0.06) + 60 * bump(ph, 0.73, 0.1)) +
    32 * (m.steppage ?? 0) * bump(ph, 0.76, 0.08);
  return {hip, knee, ph};
};

const footPoints = (ankle: Pt, psi: number, d: LegDims) => {
  const fx = Math.cos(deg(psi));
  const fy = Math.sin(deg(psi));
  const nx = -fy;
  const ny = fx;
  const h = d.foot * 0.16;
  const heel = {x: ankle.x - fx * d.foot * 0.24 + nx * h, y: ankle.y - fy * d.foot * 0.24 + ny * h};
  const ball = {x: ankle.x + fx * d.foot * 0.55 + nx * h, y: ankle.y + fy * d.foot * 0.55 + ny * h};
  const toe = {x: ankle.x + fx * d.foot * 0.78 + nx * h * 0.7, y: ankle.y + fy * d.foot * 0.78 + ny * h * 0.7};
  return {heel, ball, toe};
};

/**
 * Forward kinematics from explicit angles (degrees).
 * hipA: thigh angle from vertical (+ forward); kneeA: knee flexion (+);
 * ankleA: plantarflexion relative to neutral (+ = toes down).
 */
export const legFromAngles = (hip: Pt, hipA: number, kneeA: number, ankleA: number, d: LegDims): LegPose => {
  const knee = {x: hip.x + Math.sin(deg(hipA)) * d.thigh, y: hip.y + Math.cos(deg(hipA)) * d.thigh};
  const phi = hipA - kneeA;
  const ankle = {x: knee.x + Math.sin(deg(phi)) * d.shin, y: knee.y + Math.cos(deg(phi)) * d.shin};
  const psi = -phi + ankleA;
  return {hip, knee, ankle, ...footPoints(ankle, psi, d), shinAngle: phi, footAngle: psi};
};

/** Ankle angle over the gait cycle (stance keeps the foot on the floor). */
const ankleFor = (ph: number, phi: number, m: LegMods) => {
  const drop = m.footDrop ?? 0;
  const sup = m.support ?? 0;
  const stiff = m.stiffness ?? 0;
  // desired foot-to-ground angle in stance
  let psiStance: number;
  if (ph < 0.08) psiStance = mix(mix(-14, 4, drop), 0, smooth(ph / 0.08));
  else if (ph < 0.45) psiStance = 0;
  else psiStance = mix(0, 32 * (1 - 0.5 * stiff), smooth((ph - 0.45) / 0.17));
  if (ph < 0.62) return psiStance + phi;
  const toeOff = 32 * (1 - 0.5 * stiff) + phi;
  const swingTarget = mix(mix(-6, 30, drop), -4, sup);
  const a1 = mix(toeOff, swingTarget, smooth((ph - 0.62) / 0.12));
  const strike = mix(mix(-14, 4, drop), -10, sup) + phi;
  return mix(a1, strike, smooth((ph - 0.93) / 0.07));
};

/** Leg pose at gait phase p, with toes never penetrating the floor (light graze instead). */
export const gaitLeg = (hip: Pt, p: number, d: LegDims, m: LegMods = {}, floorY?: number): LegPose => {
  const {hip: hA, knee: kA, ph} = gaitAngles(p, m);
  const phi = hA - kA;
  let a = ankleFor(ph, phi, m);
  let pose = legFromAngles(hip, hA, kA, a, d);
  if (floorY !== undefined && ph >= 0.62 && Math.max(pose.toe.y, pose.ball.y) > floorY) {
    // reduce plantarflexion until the toe just touches the floor
    let lo = -40;
    let hi = a;
    for (let i = 0; i < 14; i++) {
      const midA = (lo + hi) / 2;
      const pp = legFromAngles(hip, hA, kA, midA, d);
      if (Math.max(pp.toe.y, pp.ball.y) > floorY) hi = midA;
      else lo = midA;
    }
    a = lo;
    pose = legFromAngles(hip, hA, kA, a, d);
  }
  return pose;
};

/** Lowest point of a pose relative to its hip. */
export const lowest = (pose: LegPose) => Math.max(pose.heel.y, pose.toe.y, pose.ball.y, pose.ankle.y) - pose.hip.y;

/** Hip height above the floor so the stance leg rests on it. */
export const hipLift = (p: number, d: LegDims, near: LegMods, far: LegMods) => {
  const o = {x: 0, y: 0};
  const pN = ((p % 1) + 1) % 1;
  const pF = (pN + 0.5) % 1;
  const cands: number[] = [];
  if (pN < 0.62) cands.push(lowest(gaitLeg(o, pN, d, near)));
  if (pF < 0.62) cands.push(lowest(gaitLeg(o, pF, d, far)));
  return Math.max(...cands);
};

/** Ground speed (px per phase unit) for floor scrolling / translation. */
export const strideSpeed = (d: LegDims) => {
  const o = {x: 0, y: 0};
  const a = gaitLeg(o, 0.12, d);
  const b = gaitLeg(o, 0.42, d);
  return (a.ankle.x - b.ankle.x) / 0.3;
};

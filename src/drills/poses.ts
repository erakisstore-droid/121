/**
 * Pose solvers for each drill (front view, page pixels). A pose gives targets
 * (pelvis, feet, hands, ball); Figure.tsx resolves knees and elbows with IK.
 * Every drill is periodic and alternates sides each cycle (`dir`), and each
 * cycle ends exactly where the next one starts, so motion loops seamlessly.
 */
import {BLEND, DRILLS, STAGE, type Drill} from './config';
import {mix, smooth} from '../ms/lib/anim';

export type Pt = {x: number; y: number};
export type Pose = {
  pelvis: Pt;
  /** Torso tilt in degrees (+ leans the shoulders toward +x). */
  lean: number;
  footL: Pt;
  footR: Pt;
  handL: Pt;
  handR: Pt;
  /** Optional knee override (blended over the IK knee by its weight). */
  kneeL?: Pt;
  kneeLW?: number;
  kneeR?: Pt;
  kneeRW?: number;
  ball: Pt;
  ballVis: number;
  /** Draw the ball behind the legs (passing under a raised knee). */
  ballBehind: number;
};

const {cx, floor, L, ballR} = STAGE;
const BY = floor - ballR;
const P = (x: number, y: number): Pt => ({x, y});
const lerp = (a: Pt, b: Pt, k: number): Pt => P(mix(a.x, b.x, k), mix(a.y, b.y, k));
const sm = (x: number) => smooth(x);
const bez = (a: Pt, c: Pt, b: Pt, s: number): Pt =>
  P((1 - s) * (1 - s) * a.x + 2 * s * (1 - s) * c.x + s * s * b.x, (1 - s) * (1 - s) * a.y + 2 * s * (1 - s) * c.y + s * s * b.y);
/** Ball dropped from a (gravity, starts at rest) to b. */
const drop = (a: Pt, b: Pt, s: number): Pt => P(mix(a.x, b.x, s), a.y + (b.y - a.y) * s * s);
const sides = (dir: number, own: Pt, other: Pt) => (dir > 0 ? {handR: own, handL: other} : {handL: own, handR: other});

export type Cycle = {f: number; n: number; dir: number};
export const cycleIn = (d: Drill, t: number): Cycle => {
  const c = (t - d.a) / d.period;
  const n = Math.floor(c);
  return {f: c - n, n, dir: n % 2 === 0 ? 1 : -1};
};

type Solver = (c: Cycle) => Pose;

/** 1 · Wide squat, ball dropped between the legs, caught by the other hand. */
const between: Solver = ({f, dir}) => {
  const py = floor - 1.5 * L - 0.06 * L * Math.sin(Math.PI * f);
  const pelvis = P(cx + dir * 0.15 * L * (1 - 2 * sm(f)), py);
  const hy = floor - 1.5 * L + 0.25 * L;
  const rel = P(cx + dir * 0.35 * L, hy);
  const cat = P(cx - dir * 0.35 * L, hy);
  const bounce = P(cx, BY);
  const ball = f < 0.45 ? drop(rel, bounce, f / 0.45) : bez(bounce, P(mix(bounce.x, cat.x, 0.5), hy - 0.35 * L), cat, (f - 0.45) / 0.55);
  const wide = (s: number) => P(cx + s * 1.4 * L, py - 0.45 * L);
  const own = f < 0.12 ? rel : lerp(rel, wide(dir), sm((f - 0.12) / 0.55));
  const other = lerp(wide(-dir), cat, sm(f / 0.92));
  return {
    pelvis,
    lean: dir * 5 * (1 - 2 * sm(f)),
    footL: P(cx - 1.05 * L, floor),
    footR: P(cx + 1.05 * L, floor),
    ...sides(dir, own, other),
    ball,
    ballVis: 1,
    ballBehind: 0,
  };
};

/** 2 · Knee raise, ball passed hand to hand under the raised leg. */
const underLeg: Solver = ({f, dir: s}) => {
  const k = sm(f / 0.25) * (1 - sm((f - 0.72) / 0.28));
  const py = floor - 1.93 * L + 0.04 * L * k;
  const px = cx - s * 0.08 * L * k;
  const hipX = px + s * 0.3 * L;
  const knee = P(hipX + s * 0.14 * L, py + 0.08 * L);
  const liftedFoot = P(hipX + s * 0.06 * L, py + 0.98 * L);
  const restFoot = P(cx + s * 0.32 * L, floor);
  const foot = lerp(restFoot, liftedFoot, k);
  const rest = (side: number) => P(px + side * 0.78 * L, py + 0.05 * L);
  const s0 = P(knee.x + s * 0.62 * L, py + 0.38 * L);
  const e0 = P(knee.x - s * 0.62 * L, py + 0.38 * L);
  const ctrl = P(knee.x, py + 1.05 * L);
  let ball: Pt;
  if (f < 0.3) ball = lerp(rest(s), s0, sm(f / 0.3));
  else if (f < 0.62) ball = bez(s0, ctrl, e0, sm((f - 0.3) / 0.32));
  else ball = lerp(e0, rest(-s), sm((f - 0.7) / 0.3));
  const own = f < 0.3 ? ball : lerp(s0, rest(s), sm((f - 0.36) / 0.5));
  const other = f < 0.62 ? lerp(rest(-s), e0, sm((f - 0.2) / 0.42)) : ball;
  const support = P(cx - s * 0.32 * L, floor);
  const legs = s > 0 ? {footR: foot, footL: support, kneeR: knee, kneeRW: k} : {footL: foot, footR: support, kneeL: knee, kneeLW: k};
  return {
    pelvis: P(px, py),
    lean: -s * 4 * k,
    ...legs,
    ...sides(s, own, other),
    ball,
    ballVis: 1,
    ballBehind: f > 0.36 && f < 0.56 ? 1 : 0,
  };
};

/** 3 · Split-step hops while the ball is tossed hand to hand at chest height. */
const juggle: Solver = ({f, dir}) => {
  const hop = Math.sin(Math.PI * f);
  const py = floor - 1.9 * L - 0.12 * L * hop;
  const fy = floor - 0.12 * L * hop;
  const rest = (side: number) => P(cx + side * 0.5 * L, py - 0.42 * L);
  const a = rest(dir);
  const b = rest(-dir);
  const H = 0.95 * L;
  const ball = P(mix(a.x, b.x, f), mix(a.y, b.y, f) - 4 * H * f * (1 - f));
  const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
  const own = P(a.x, a.y + 0.16 * L * Math.sin(Math.PI * clamp01(f / 0.35)));
  const other = P(b.x, b.y - 0.12 * L * Math.sin(Math.PI * clamp01((f - 0.6) / 0.4)));
  return {
    pelvis: P(cx, py),
    lean: 0,
    footL: P(cx - 0.42 * L, fy),
    footR: P(cx + 0.42 * L, fy),
    ...sides(dir, own, other),
    ball,
    ballVis: 1,
    ballBehind: 0,
  };
};

/** 4 · Side-to-side lunge: bounce across the body, catch low on the far side. */
const lungeBounce: Solver = ({f, dir}) => {
  const s = sm(f);
  const px = cx + dir * 0.55 * L * (1 - 2 * s);
  const py = floor - 1.45 * L - 0.18 * L * Math.sin(Math.PI * f);
  const C = (side: number) => P(cx + side * 1.15 * L, floor - 1.1 * L);
  const up = (side: number) => P(cx + side * 1.0 * L, floor - 2.95 * L);
  const rel = C(dir);
  const cat = C(-dir);
  const bounce = P(cx - dir * 0.1 * L, BY);
  const ball = f < 0.35 ? drop(rel, bounce, f / 0.35) : bez(bounce, P(mix(bounce.x, cat.x, 0.55), cat.y - 1.2 * L), cat, (f - 0.35) / 0.65);
  const own = f < 0.08 ? rel : lerp(rel, up(dir), sm((f - 0.08) / 0.6));
  const other = lerp(up(-dir), cat, sm((f - 0.2) / 0.75));
  return {
    pelvis: P(px, py),
    lean: dir * 10 * (1 - 2 * s),
    footL: P(cx - 1.3 * L, floor),
    footR: P(cx + 1.3 * L, floor),
    ...sides(dir, own, other),
    ball,
    ballVis: 1,
    ballBehind: 0,
  };
};

/** 5 · Ready position, split step, step out and catch a ball bouncing in from the side. */
const sideCatch: Solver = ({f, dir}) => {
  const hopK = f > 0.15 && f < 0.35 ? Math.sin((Math.PI * (f - 0.15)) / 0.2) : 0;
  const st = sm((f - 0.35) / 0.25) * (1 - sm((f - 0.88) / 0.12));
  const px = cx + dir * 0.3 * L * st;
  const py = floor - 1.8 * L - 0.1 * L * hopK + 0.15 * L * st;
  const fy = floor - 0.1 * L * hopK;
  const near = P(cx + dir * (0.55 * L + 0.45 * L * st), fy);
  const far = P(cx - dir * 0.55 * L, fy);
  const start = P(cx + dir * 720, floor - 2.3 * L);
  const bounce = P(cx + dir * 1.3 * L, BY);
  const cat = P(cx + dir * 1.05 * L, floor - 1.55 * L);
  const rest = (side: number) => P(px + side * 0.6 * L, py - 0.3 * L);
  const handIn = f < 0.85 ? lerp(rest(dir), cat, sm((f - 0.45) / 0.4)) : lerp(cat, rest(dir), sm((f - 0.88) / 0.12));
  let ball: Pt;
  if (f < 0.55) ball = bez(start, P(mix(start.x, bounce.x, 0.5), start.y - 0.5 * L), bounce, f / 0.55);
  else if (f < 0.85) ball = bez(bounce, P(mix(bounce.x, cat.x, 0.5), cat.y - 0.6 * L), cat, (f - 0.55) / 0.3);
  else ball = handIn;
  const vis = Math.min(1, f / 0.05, f < 0.9 ? 1 : 1 - (f - 0.9) / 0.1);
  const other = P(rest(-dir).x - dir * 0.25 * L * st, rest(-dir).y - 0.25 * L * st);
  return {
    pelvis: P(px, py),
    lean: dir * 8 * st,
    ...(dir > 0 ? {footR: near, footL: far} : {footL: near, footR: far}),
    ...sides(dir, handIn, other),
    ball,
    ballVis: Math.max(0, vis),
    ballBehind: 0,
  };
};

/** 6 · Slow, deep lunge from side to side: bounce, sweep across, reach and catch. */
const sweep: Solver = ({f, dir}) => {
  const sig = -dir + 2 * dir * sm((f - 0.1) / 0.7);
  const px = cx + 0.75 * L * sig;
  const py = floor - 1.28 * L - 0.4 * L * (1 - Math.abs(sig));
  const K = (side: number) => P(cx + side * 1.55 * L, floor - 0.8 * L);
  const up = (side: number) => P(cx + side * 0.6 * L, floor - 3.4 * L);
  const from = K(-dir);
  const to = K(dir);
  const bounce = P(cx, BY);
  let ball: Pt;
  if (f < 0.12) ball = from;
  else if (f < 0.45) ball = drop(from, bounce, (f - 0.12) / 0.33);
  else if (f < 0.8) ball = bez(bounce, P(mix(bounce.x, to.x, 0.5), to.y - 1.3 * L), to, (f - 0.45) / 0.35);
  else ball = to;
  const trailing = f < 0.12 ? from : lerp(from, up(-dir), sm((f - 0.12) / 0.5));
  const reaching = lerp(up(dir), to, sm((f - 0.25) / 0.55));
  return {
    pelvis: P(px, py),
    lean: 25 * sig,
    footL: P(cx - 1.45 * L, floor),
    footR: P(cx + 1.45 * L, floor),
    ...sides(dir, reaching, trailing),
    ball,
    ballVis: 1,
    ballBehind: 0,
  };
};

const SOLVERS: Record<Drill['kind'], Solver> = {between, underLeg, juggle, lungeBounce, sideCatch, sweep};

const mixPt = (a: Pt | undefined, b: Pt | undefined, k: number, fa: Pt, fb: Pt) => lerp(a ?? fa, b ?? fb, k);
const mixPose = (a: Pose, b: Pose, k: number): Pose => ({
  pelvis: lerp(a.pelvis, b.pelvis, k),
  lean: mix(a.lean, b.lean, k),
  footL: lerp(a.footL, b.footL, k),
  footR: lerp(a.footR, b.footR, k),
  handL: lerp(a.handL, b.handL, k),
  handR: lerp(a.handR, b.handR, k),
  kneeL: a.kneeL || b.kneeL ? mixPt(a.kneeL, b.kneeL, k, b.kneeL ?? a.pelvis, a.kneeL ?? b.pelvis) : undefined,
  kneeLW: mix(a.kneeLW ?? 0, b.kneeLW ?? 0, k),
  kneeR: a.kneeR || b.kneeR ? mixPt(a.kneeR, b.kneeR, k, b.kneeR ?? a.pelvis, a.kneeR ?? b.pelvis) : undefined,
  kneeRW: mix(a.kneeRW ?? 0, b.kneeRW ?? 0, k),
  ball: lerp(a.ball, b.ball, k),
  ballVis: mix(a.ballVis, b.ballVis, k),
  ballBehind: k < 0.5 ? a.ballBehind : b.ballBehind,
});

export const drillIndexAt = (t: number) => {
  let i = 0;
  while (i < DRILLS.length - 1 && t >= DRILLS[i + 1].a) i++;
  return i;
};

export const solve = (i: number, t: number) => SOLVERS[DRILLS[i].kind](cycleIn(DRILLS[i], t));

/** Pose at absolute time t, cross-faded over BLEND seconds after each drill change. */
export const poseAt = (t: number): Pose => {
  const i = drillIndexAt(t);
  const p = solve(i, t);
  if (i === 0 || t >= DRILLS[i].a + BLEND) return p;
  return mixPose(solve(i - 1, t), p, sm((t - DRILLS[i].a) / BLEND));
};

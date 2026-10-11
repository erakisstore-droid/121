import {ASSETS, POLL_ROWS, at} from '../config';
import {mix, ramp, type Rect} from './anim';

/* ---------- Act 1: walking figure ---------- */
export const WALK = {L: 140, floorY: 1250, x0: 215, rate: 0.62} as const;

const rateAt = (t: number) => WALK.rate * (1 - 0.72 * Math.exp(-((t - at(1, 0.58)) ** 2) / (2 * 0.22 ** 2)));
/** 1 while the figure travels across the floor, 0 once it walks in place. */
const travelK = (t: number) => 1 - ramp(t, at(1, 0.8), at(2, 0.1));

const DT = 1 / 240;
const integrate = (t: number) => {
  let phase = 0;
  let travel = 0;
  let scroll = 0;
  for (let s = 0; s < t; s += DT) {
    const dt = Math.min(DT, t - s);
    const dp = rateAt(s) * dt;
    phase += dp;
    travel += dp * travelK(s);
    scroll += dp * (1 - travelK(s));
  }
  return {phase, travel, scroll};
};
/** Phase offset so the hesitation lands in the near leg's swing. */
const P0 = 0.8 - integrate(at(1, 0.58)).phase;

export const walkState = (t: number, strideSpeed: number) => {
  const {phase, travel, scroll} = integrate(t);
  return {phase: phase + P0, x: WALK.x0 + travel * strideSpeed, scroll: scroll * strideSpeed};
};

/* ---------- Act 2: poll card ---------- */
export const POLL_CARD = {x: 100, y: 470, w: 790, pad: 14} as const;
const WW = POLL_CARD.w - POLL_CARD.pad * 2;
const WH = (WW * ASSETS.poll.h) / ASSETS.poll.w;
export const POLL_CARD_H = WH + POLL_CARD.pad * 2;

export const pollState = (t: number) => {
  const enter = ramp(t, at(4, 0), at(4, 0.22));
  const leave = ramp(t, at(5, 0.05), at(5, 0.3));
  const fd = ramp(t, at(4, 0.5), at(4, 0.62));
  const sp = ramp(t, at(4, 0.75), at(4, 0.87));
  const back = ramp(t, at(5, 0), at(5, 0.2));
  const zoom = 1 + 0.06 * (fd - back);
  const fy = mix(mix(0.578, 0.578, fd), 0.485, sp);
  return {dy: (1 - enter) * 140 + leave * 140, opacity: Math.min(enter, 1 - leave), zoom, fx: 0.5, fy, fd, sp, back};
};

/** Screen rect of a poll row (image pixels → screen) at time t. */
export const pollRowScreen = (row: keyof typeof POLL_ROWS, t: number, outset = 5): Rect => {
  const s = pollState(t);
  const k = WW / ASSETS.poll.w;
  const ox = s.fx * WW;
  const oy = s.fy * WH;
  const wx = POLL_CARD.x + POLL_CARD.pad;
  const wy = POLL_CARD.y + POLL_CARD.pad + s.dy;
  const r = POLL_ROWS[row];
  const sx = (u: number) => wx + (u * k - ox) * s.zoom + ox;
  const sy = (v: number) => wy + (v * k - oy) * s.zoom + oy;
  return {x: sx(r.x) - outset, y: sy(r.y) - outset, w: (sx(r.x + r.w) - sx(r.x)) + outset * 2, h: (sy(r.y + r.h) - sy(r.y)) + outset * 2};
};

/* ---------- Leg-view cards (beats 2–3) ---------- */
export const LEG_CARDS = {
  stiff: {x: 505, y: 900, w: 395, h: 520},
  drop: {x: 95, y: 900, w: 395, h: 520},
  up: 430,
} as const;
export const NODES = {
  stiff: {x: 702, y: 1320},
  drop: {x: 292, y: 1320},
  r: 100,
  junction: {x: 495, y: 1030},
} as const;

export const rectCenter = (r: Rect) => ({x: r.x + r.w / 2, y: r.y + r.h / 2});

/* ---------- Act 3: CNS pathway ---------- */
export const PATH = {
  brain: {x: 495, y: 640, s: 115},
  cordTop: {x: 525, y: 748},
  cordBottom: {x: 525, y: 1045},
  legHip: {x: 600, y: 1085},
  legL: 200,
  hipA: 3,
  kneeA: 5,
  lens: {x: 755, y: 870, r: 135},
  lensSpot: {x: 525, y: 900, r: 44},
} as const;
export const NERVE_MAIN = 'M 495 655 C 505 700 525 710 525 755 L 525 1040 C 525 1100 572 1110 580 1175 L 578 1405';
export const NERVE_FRONT = 'M 525 1040 C 532 1120 640 1140 648 1235 L 640 1400';

/* ---------- Act 4: spasticity / foot drop / gait ---------- */
export const SPAS = {hip: {x: 330, y: 640}, L: 270, hipA: 6, arcR: 205} as const;
export const MUSCLE_PANEL = {x: 575, y: 560, w: 325, h: 600} as const;
export const WINDOW = {x: 90, y: 470, w: 810, h: 1070} as const;
export const FOOTVIEW = {hip: {x: 400, y: 170}, L: 430, floorY: 1330, arcR: 178} as const;
export const GAIT = {x: 495, floorY: 1440, L: 230, cycle: 2.8, p0: 0.25} as const;

/* ---------- Act 5: treatments ---------- */
export const TREAT_CARDS = {
  pt: {x: 650, y: 820, w: 250, h: 330},
  brace: {x: 370, y: 820, w: 250, h: 330},
  meds: {x: 90, y: 820, w: 250, h: 330},
  railY: 755,
} as const;
export const EX_PANEL = {x: 90, y: 440, w: 810, h: 460} as const;
export const RESEARCH = {x: 125, y: 928, w: 740} as const;
export const MED_CARD = {x: 90, y: 990, w: 390, h: 460} as const;
export const DOC_CARD = {x: 510, y: 990, w: 390, h: 460} as const;

/* ---------- Act 6: triggers, supplement, contact ---------- */
export const P16 = {x: 430, y: 450, w: 470, h: 520} as const;
export const TRIGGER_NODES = [
  {x: 230, y: 560},
  {x: 230, y: 715},
  {x: 230, y: 870},
] as const;
export const SUPP_CARD = {x: 110, y: 640, w: 330, h: 440} as const;
export const DOC_CARD_17 = {x: 550, y: 640, w: 330, h: 440} as const;
export const CONTACT = {x: 340, y: 895, w: 310, h: 240} as const;
export const BUBBLE = {x: 120, y: 890, w: 750, h: 250} as const;

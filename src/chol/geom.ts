import type {ArterySpec} from './art/Artery';
import {at} from './config';
import {EASE, mix, ramp} from '../ms/lib/anim';

/** Age timeline runs right → left (RTL): younger at the right. */
export const AGE = {y: 1420, xYoung: 860, xOld: 130, a0: 10, a1: 60} as const;
export const ageX = (a: number, y0: number = AGE.a0) => AGE.xYoung - ((a - y0) / (AGE.a1 - AGE.a0)) * (AGE.xYoung - AGE.xOld);

/** Magnifier lens (beat 3) → full artery reveal (beat 4). */
export const lensAt = (t: number) => {
  const open = ramp(t, at(3, 0), at(3, 0.25));
  const reveal = ramp(t, at(4, 0), at(4, 0.09), EASE.inOut);
  const from = {x: ageX(26), y: 1215, r: 48};
  const to = {x: 495, y: 1000, r: 300};
  return {
    x: mix(from.x, to.x, open),
    y: mix(from.y, to.y, open),
    r: mix(mix(from.r, to.r, open), 1250, reveal),
    ring: 1 - reveal,
    open,
  };
};

const BASE = {x0: 90, x1: 900, cy: 1000, R: 140, T: 72} as const;
export const PLAQUE_X = 470;

/** Plaque protrusion (fraction of lumen radius) over the whole video. */
export const plaqueH = (t: number) => {
  const build = 0.32 * ramp(t, at(4, 0.6), at(4, 1), EASE.soft);
  const grow = 0.2 * ramp(t, at(5, 0), at(5, 0.6), EASE.soft);
  const rewind = (build + grow - 0.09) * ramp(t, at(6, 0.08), at(6, 0.75), EASE.inOut);
  const later = 0.1 * ramp(t, at(14, 0.2), at(14, 0.75), (x) => 1 - (1 - x) ** 3);
  return build + grow - rewind + later;
};

/** The single artery that carries the story; it shrinks to a strip and returns. */
type Pose = {cy: number; sc: number};
const mixPose = (a: Pose, b: Pose, k: number): Pose => ({cy: mix(a.cy, b.cy, k), sc: mix(a.sc, b.sc, k)});
const FULL: Pose = {cy: BASE.cy, sc: 1};
const STRIP: Pose = {cy: 1440, sc: 0.4};
const LOW: Pose = {cy: 1330, sc: 0.62};
export const arteryAt = (t: number): ArterySpec => {
  let p = mixPose(FULL, STRIP, ramp(t, at(7, 0), at(7, 0.16)));
  p = mixPose(p, FULL, ramp(t, at(14, 0), at(14, 0.16)));
  p = mixPose(p, LOW, ramp(t, at(15, 0), at(15, 0.3)));
  return {
    x0: BASE.x0,
    x1: BASE.x1,
    cy: p.cy,
    R: BASE.R * p.sc,
    T: BASE.T * p.sc,
    plaques: [{x: PLAQUE_X, w: 175, h: plaqueH(t), side: 'top'}],
  };
};

/** "Passing years" ruler offset: forward through beats 4–5, rewinds in beat 6, forward again in beat 14. */
export const yearsScroll = (t: number) => {
  const seg = (a: number, b: number, v: number) => Math.max(0, Math.min(t, b) - a) * v;
  return seg(at(4, 0.86), at(6, 0.05), 70) - seg(at(6, 0.1), at(6, 0.75), 300) + seg(at(14, 0.2), at(14, 1), 45);
};

/** LDL particles that cross the intima and stay inside the wall (beat 4). */
export const ENTRY = [
  {dx: -110, v: 0.55, k: 0},
  {dx: -40, v: 0.25, k: 1},
  {dx: 30, v: 0.7, k: 2},
  {dx: 95, v: 0.4, k: 3},
] as const;
export const entryProgress = (t: number, k: number) => ramp(t, at(4, 0.3 + k * 0.045), at(4, 0.42 + k * 0.045), EASE.inOut);

/* Source A card (beat 7) */
export const CARD_A = {x: 110, y: 470, w: 790} as const;
export const MARK19 = {x: 495, y: 1135, r: 125} as const;
export const TL8 = {y: 1250} as const;
export const TUBE8 = {x: 680, y: 760, w: 96, h: 330} as const;

/* Beats 9–11 */
export const TUBE9 = {x: 110, y: 480, w: 92, h: 310} as const;
export const REPORT = {x: 240, y: 540, w: 660, h: 760} as const;
export const REPORT_HEAD = 110;
export const reportRowRect = (i: number) => {
  const rowH = (REPORT.h - REPORT_HEAD - 40) / 4;
  return {x: REPORT.x, y: REPORT.y + REPORT_HEAD + 20 + i * rowH, w: REPORT.w, h: rowH};
};
export const LDL_CARD = {x: 110, y: 480, w: 790, h: 190} as const;
export const SCALE = {x0: 150, x1: 860, y: 745, tick: 0.66} as const;
export const CARD_B = {x: 110, y: 830, w: 790} as const;
export const ASSESS = {x: 495, y: 1268} as const;

/* Beats 12–13 */
export const DNA = {x: 250, y0: 520, y1: 1060, amp: 46, turns: 3} as const;
export const TREE = {
  g1: [{x: 570, y: 560}, {x: 790, y: 560}],
  parent: {x: 680, y: 790},
  you: {x: 590, y: 1030},
  sib: {x: 790, y: 1030},
} as const;
export const CAL = {x0: 130, x1: 860, y: 880, h: 140, cells: 8} as const;
export const calCell = (i: number) => CAL.x1 - (i + 0.5) * ((CAL.x1 - CAL.x0) / CAL.cells);
/* Beat 14 care timeline (above the artery) */
export const CARE = {x0: 420, x1: 880, y: 690} as const;

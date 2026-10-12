import type {ArterySpec} from './art/Artery';
import {at} from './config';
import {EASE, mix, ramp} from '../ms/lib/anim';

/* ---------- Page p1: tube, heart, age timeline, artery ---------- */
/** Age timeline (beat 2) runs right → left (RTL): younger at the right. */
export const AGE = {y: 1420, xYoung: 860, xOld: 130, a0: 10, a1: 60} as const;
export const ageX = (a: number) => AGE.xYoung - ((a - AGE.a0) / (AGE.a1 - AGE.a0)) * (AGE.xYoung - AGE.xOld);
export const TUBE1 = {x: 175, y: 520, w: 200, h: 680} as const;
export const HEART1 = {x: 720, y: 860, s: 160} as const;

export const ARTERY_BASE = {x0: 90, x1: 900, cy: 1000, R: 140, T: 72} as const;
export const PLAQUE_X = 470;

/** Plaque protrusion (fraction of lumen radius). Grows over beats 4–5, then a slow plateau in beat 14. */
export const plaqueH = (t: number) => {
  const build = 0.32 * ramp(t, at(4, 0.6), at(4, 1), EASE.soft);
  const grow = 0.2 * ramp(t, at(5, 0), at(5, 0.6), EASE.soft);
  const later = 0.06 * ramp(t, at(14, 0.3), at(14, 0.85), (x) => 1 - (1 - x) ** 3);
  return build + grow + later;
};

/** The artery backbone; it moves lower in beats 15–16 to make room for the bubble. */
export const arteryAt = (t: number): ArterySpec => {
  const down = ramp(t, at(15, 0), at(15, 0.3));
  const sc = mix(1, 0.62, down);
  return {
    x0: ARTERY_BASE.x0,
    x1: ARTERY_BASE.x1,
    cy: mix(ARTERY_BASE.cy, 1330, down),
    R: ARTERY_BASE.R * sc,
    T: ARTERY_BASE.T * sc,
    plaques: [{x: PLAQUE_X, w: 175, h: plaqueH(t), side: 'top'}],
  };
};

/** "Passing years" ruler offset (beats 4–5). */
export const yearsScroll = (t: number) => Math.max(0, Math.min(t, at(6, 0.05)) - at(4, 0.86)) * 70;

/** LDL particles that cross the intima and stay inside the wall (beat 4). */
export const ENTRY = [
  {dx: -110, v: 0.55, k: 0},
  {dx: -40, v: 0.25, k: 1},
  {dx: 30, v: 0.7, k: 2},
  {dx: 95, v: 0.4, k: 3},
] as const;
export const entryProgress = (t: number, k: number) => ramp(t, at(4, 0.3 + k * 0.045), at(4, 0.42 + k * 0.045), EASE.inOut);

/** Beat 6 youth timeline: peels off the artery's lower edge and runs right, into page p3. */
export const YOUTH = {y: 1270, x0: 900, x1: 2260, a0: 60, a1: 15} as const;
export const youthX = (a: number) => YOUTH.x0 + ((YOUTH.a0 - a) / (YOUTH.a0 - YOUTH.a1)) * (YOUTH.x1 - YOUTH.x0);

/* ---------- Page p3: source A dashboard ---------- */
export const CARD_A = {x: 110, y: 470, w: 790} as const;
export const CARD_A_SMALL = {x: 110, y: 470, w: 460} as const;
export const MARK19 = {x: 495, y: 1135, r: 125} as const;
export const MARK19_B = {x: 260, y: 1210, r: 92} as const;
export const TUBE3 = {x: 640, y: 720, w: 170, h: 600} as const;

/* ---------- Page p4: report ---------- */
export const REPORT = {x: 140, y: 540, w: 760, h: 760} as const;
export const REPORT_HEAD = 110;
export const reportRowRect = (i: number) => {
  const rowH = (REPORT.h - REPORT_HEAD - 40) / 4;
  return {x: REPORT.x, y: REPORT.y + REPORT_HEAD + 20 + i * rowH, w: REPORT.w, h: rowH};
};
export const LDL_CARD = {x: 110, y: 480, w: 790, h: 190} as const;
export const SCALE = {x0: 150, x1: 860, y: 745, tick: 0.66} as const;
export const CARD_B = {x: 110, y: 900, w: 790} as const;
export const ASSESS = {x: 495, y: 1268} as const;

/* ---------- Page p5: DNA + calendar ---------- */
export const DNA = {x: 300, y0: 560, y1: 1120, amp: 50, turns: 3} as const;
export const NODES = {parent: {x: 720, y: 640}, you: {x: 720, y: 1040}} as const;
export const CALENDAR = {x: 190, y: 640, w: 700, h: 560, rings: 6} as const;
export const TRACK = {y: 1350, xStart: 820, xEnd: 260} as const;
export const trackX = (years: number) => mix(TRACK.xStart, TRACK.xEnd, years / 5);

/* ---------- Page p1 (beats 14–16) ---------- */
export const CARE = {x0: 420, x1: 880, y: 690} as const;

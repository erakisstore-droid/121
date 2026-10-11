import type {Pt} from './gait';

/** Two-bone IK: elbow position for shoulder s reaching target h (bends downward/backward). */
export const ik2 = (s: Pt, h: Pt, l1: number, l2: number, bend = 1): Pt => {
  const dx = h.x - s.x;
  const dy = h.y - s.y;
  const d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01);
  const a = Math.atan2(dy, dx);
  const cosB = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const b = Math.acos(Math.max(-1, Math.min(1, cosB)));
  const ang = a + bend * b;
  return {x: s.x + Math.cos(ang) * l1, y: s.y + Math.sin(ang) * l1};
};

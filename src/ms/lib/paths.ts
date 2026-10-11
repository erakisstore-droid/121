import {evolvePath} from '@remotion/paths';

/** strokeDasharray/offset props that reveal `d` up to progress p (0–1). */
export const drawOn = (d: string, p: number) => {
  const e = evolvePath(Math.min(1, Math.max(0, p)), d);
  return {strokeDasharray: e.strokeDasharray, strokeDashoffset: e.strokeDashoffset};
};

export const roundRectPath = (x: number, y: number, w: number, h: number, r: number, startRight = true) => {
  const rr = Math.min(r, w / 2, h / 2);
  // start at the right-middle edge (RTL reading start) and go clockwise
  return startRight
    ? `M ${x + w} ${y + h / 2} L ${x + w} ${y + h - rr} Q ${x + w} ${y + h} ${x + w - rr} ${y + h} L ${x + rr} ${y + h} Q ${x} ${y + h} ${x} ${y + h - rr} L ${x} ${y + rr} Q ${x} ${y} ${x + rr} ${y} L ${x + w - rr} ${y} Q ${x + w} ${y} ${x + w} ${y + rr} Z`
    : `M ${x} ${y + h / 2} L ${x} ${y + rr} Q ${x} ${y} ${x + rr} ${y} L ${x + w - rr} ${y} Q ${x + w} ${y} ${x + w} ${y + rr} L ${x + w} ${y + h - rr} Q ${x + w} ${y + h} ${x + w - rr} ${y + h} L ${x + rr} ${y + h} Q ${x} ${y + h} ${x} ${y + h - rr} Z`;
};

export const curve = (a: {x: number; y: number}, b: {x: number; y: number}, bend = 0.5) =>
  `M ${a.x} ${a.y} C ${a.x} ${a.y + (b.y - a.y) * bend}, ${b.x} ${b.y - (b.y - a.y) * bend}, ${b.x} ${b.y}`;

/** Arc around c between two limb directions given as (sin a, cos a) angles in degrees. */
export const arcPath = (c: {x: number; y: number}, r: number, a0: number, a1: number) => {
  const rad = (a: number) => (a * Math.PI) / 180;
  const p = (a: number) => ({x: c.x + Math.sin(rad(a)) * r, y: c.y + Math.cos(rad(a)) * r});
  const s = p(a0);
  const e = p(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 < a0 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} ${sweep} ${e.x} ${e.y}`;
};

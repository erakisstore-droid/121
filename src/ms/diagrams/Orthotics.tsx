import type React from 'react';
import {PAL} from '../config';
import {Capsule} from '../figure/draw';
import type {LegPose, Pt} from '../figure/gait';

const lerp = (a: Pt, b: Pt, k: number): Pt => ({x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k});
const shinFrame = (p: LegPose) => {
  const dx = p.ankle.x - p.knee.x;
  const dy = p.ankle.y - p.knee.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  // posterior normal for a right-facing leg
  return {u: {x: ux, y: uy}, back: {x: uy, y: -ux}, len};
};
const off = (p: Pt, v: Pt, k: number): Pt => ({x: p.x + v.x * k, y: p.y + v.y * k});

/** Ankle-foot orthosis: posterior calf shell running under the foot, with two straps. */
export const AFO: React.FC<{pose: LegPose; w: number; opacity?: number}> = ({pose, w, opacity = 1}) => {
  if (opacity <= 0.001) return null;
  const f = shinFrame(pose);
  const top = off(lerp(pose.knee, pose.ankle, 0.22), f.back, w * 0.52);
  const low = off(lerp(pose.knee, pose.ankle, 0.92), f.back, w * 0.5);
  const heel = off(pose.heel, f.back, w * 0.06);
  const sole: Pt = {x: pose.ball.x, y: pose.ball.y + w * 0.08};
  const strap = (k: number) => {
    const c = lerp(pose.knee, pose.ankle, k);
    return {a: off(c, f.back, w * 0.56), b: off(c, f.back, -w * 0.56)};
  };
  const s1 = strap(0.3);
  const s2 = strap(0.8);
  return (
    <g opacity={opacity}>
      <Capsule pts={[top, low, heel, sole]} w={w * 0.26} fill={PAL.beige} ol={3.5} />
      {[s1, s2].map((s, i) => (
        <line key={i} x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y} stroke={PAL.charcoal} strokeWidth={w * 0.14} strokeLinecap="round" />
      ))}
    </g>
  );
};

/**
 * FES: cuff just below the knee with a small stimulator on the outer side, the
 * common peroneal nerve wrapping below the fibular head, and discreet pulses
 * (short arcs + dots along the nerve) at the start of swing.
 */
export const FES: React.FC<{pose: LegPose; w: number; pulse: number; opacity?: number}> = ({pose, w, pulse, opacity = 1}) => {
  if (opacity <= 0.001) return null;
  const f = shinFrame(pose);
  const c = lerp(pose.knee, pose.ankle, 0.2);
  const a = off(c, f.back, w * 0.58);
  const b = off(c, f.back, -w * 0.58);
  // nerve: behind the knee → around the fibular head → front of the shin
  const n0 = off(lerp(pose.knee, pose.ankle, -0.08), f.back, w * 0.36);
  const n1 = off(lerp(pose.knee, pose.ankle, 0.1), f.back, w * 0.1);
  const n2 = off(lerp(pose.knee, pose.ankle, 0.3), f.back, -w * 0.28);
  const n3 = off(lerp(pose.knee, pose.ankle, 0.55), f.back, -w * 0.3);
  const d = `M ${n0.x} ${n0.y} Q ${n1.x} ${n1.y} ${n2.x} ${n2.y} L ${n3.x} ${n3.y}`;
  const dot = (k: number) => (k < 0.5 ? lerp(n0, n2, k * 2) : lerp(n2, n3, (k - 0.5) * 2));
  return (
    <g opacity={opacity}>
      <path d={d} fill="none" stroke={PAL.charcoal} strokeWidth={8} strokeLinecap="round" />
      <path d={d} fill="none" stroke={PAL.offWhite} strokeWidth={4} strokeLinecap="round" />
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={PAL.charcoal} strokeWidth={w * 0.22} strokeLinecap="round" />
      <rect x={c.x - w * 0.2} y={c.y - w * 0.17} width={w * 0.4} height={w * 0.34} rx={w * 0.07} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={3} transform={`rotate(${(Math.atan2(f.u.y, f.u.x) * 180) / Math.PI - 90} ${c.x} ${c.y})`} />
      {pulse > 0.01 ? (
        <g opacity={Math.sin(Math.PI * pulse)}>
          {[1, 2].map((i) => (
            <path
              key={i}
              d={`M ${c.x - f.back.x * w * (0.25 + i * 0.22) + f.u.x * w * 0.3} ${c.y - f.back.y * w * (0.25 + i * 0.22) + f.u.y * w * 0.3} q ${-f.back.x * w * 0.18} ${-f.back.y * w * 0.18} ${-f.u.x * w * 0.6} ${-f.u.y * w * 0.6}`}
              fill="none"
              stroke={PAL.charcoal}
              strokeWidth={3}
              strokeLinecap="round"
            />
          ))}
          {[0, 0.33].map((k) => {
            const p = dot(Math.min(1, pulse * 1.2 + k));
            return <circle key={k} cx={p.x} cy={p.y} r={w * 0.07} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={2.5} />;
          })}
        </g>
      ) : null}
    </g>
  );
};

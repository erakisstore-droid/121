import type React from 'react';
import {PAL, at} from '../config';
import {CalendarIcon, Cake, Check, HeartLine, NodeDot} from '../art/objects';
import {HeroTube} from '../art/hero';
import {CARE, arteryAt} from '../geom';
import {EASE, mix, mixRect, ramp, type Rect} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';
import {useAbsT} from '../../ms/lib/time';
import {CardRect} from '../../ms/ui/primitives';

const MINI_REPORT = {x: 230, y: 520, w: 170, h: 220} as const;
const TUBE14 = {x: 110, y: 480, w: 84, h: 280} as const;
const TUBE16 = {x: 440, y: 830, w: 120, h: 380} as const;
const BUBBLE15: Rect = {x: 170, y: 520, w: 680, h: 280};
const BUBBLE16: Rect = {x: 200, y: 490, w: 620, h: 250};
const HEART16 = {x: 250, y: 1010} as const;
const CAL16 = {x: 770, y: 1030} as const;

/** Beats 14–16 (page p1): report → long-term care timeline around tube and artery (plaque growth eases);
 *  the last care marker becomes a comment bubble; tube, heart and calendar settle beside it. */
export const ActF: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const s = arteryAt(t);

  // Beat 14
  const enter = ramp(t, at(14, 0.05), at(14, 0.2));
  const c1 = `M ${TUBE14.x + TUBE14.w + 4} ${TUBE14.y + TUBE14.h * 0.55} L ${MINI_REPORT.x} ${TUBE14.y + TUBE14.h * 0.55}`;
  const careD = `M ${CARE.x0} ${CARE.y} L ${CARE.x1} ${CARE.y}`;
  const link = ramp(t, at(14, 0.15), at(14, 0.3));
  const careK = ramp(t, at(14, 0.28), at(14, 0.45));
  const cps = [0, 1, 2, 3].map((i) => ({x: mix(CARE.x0 + 30, CARE.x1 - 20, i / 3), k: ramp(t, at(14, 0.4 + i * 0.12), at(14, 0.5 + i * 0.12))}));

  // Beat 15: last care marker → comment bubble
  const toBubble = ramp(t, at(15, 0), at(15, 0.35), EASE.out);
  const f14Out = ramp(t, at(15, 0), at(15, 0.2));
  const last = cps[3];
  const seed: Rect = {x: last.x - 28, y: CARE.y - 28, w: 56, h: 56};
  const settle = ramp(t, at(16, 0), at(16, 0.3), EASE.inOut);
  const bub = mixRect(mixRect(seed, BUBBLE15, toBubble), BUBBLE16, settle);
  const lines = ramp(t, at(15, 0.2), at(15, 0.6));
  const cake = ramp(t, at(15, 0.25), at(15, 0.45)) * (1 - ramp(t, at(16, 0), at(16, 0.12)));
  const tailBase = bub.x + bub.w * 0.3;

  // Beat 16: tube, heart and calendar settle under the bubble, threaded to the artery
  const row = ramp(t, at(16, 0.15), at(16, 0.45), EASE.out);
  const tube = {
    x: mix(TUBE14.x, TUBE16.x, settle),
    y: mix(TUBE14.y, TUBE16.y, settle),
    w: mix(TUBE14.w, TUBE16.w, settle),
    h: mix(TUBE14.h, TUBE16.h, settle),
  };
  const tubeOn = (enter > 0 ? 1 : 0) * (1 - f14Out * (1 - settle));
  const arteryTop = s.cy - s.R - s.T;
  const threadY = 1225;
  const threadD = `M ${HEART16.x} ${HEART16.y + 110} L ${HEART16.x} ${threadY - 20} Q ${HEART16.x} ${threadY} ${HEART16.x + 20} ${threadY} L ${CAL16.x - 20} ${threadY} Q ${CAL16.x} ${threadY} ${CAL16.x} ${threadY - 20} L ${CAL16.x} ${CAL16.y + 80} M ${TUBE16.x + TUBE16.w / 2} ${TUBE16.y + TUBE16.h + 6} L ${TUBE16.x + TUBE16.w / 2} ${threadY} M 640 ${threadY} L 640 ${arteryTop}`;
  const thread = ramp(t, at(16, 0.35), at(16, 0.7));

  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {f14Out < 1 ? (
        <g opacity={1 - f14Out}>
          <path d={c1} stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(c1, link)} />
          <g opacity={enter}>
            <CardRect r={MINI_REPORT} radius={20} />
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <rect x={MINI_REPORT.x + 22} y={MINI_REPORT.y + 40 + i * 44} width={i === 1 ? 70 : 90} height={12} rx={6} fill={i === 1 ? PAL.orangeDeep : PAL.line} />
                <rect x={MINI_REPORT.x + 120} y={MINI_REPORT.y + 36 + i * 44} width={32} height={18} rx={9} fill={PAL.line} />
              </g>
            ))}
          </g>
          <path d={careD} stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(careD, careK)} />
          <NodeDot x={CARE.x0} y={CARE.y} o={careK} />
          {cps.map((c, i) => (i === 3 && toBubble > 0.02 ? null : <Check key={i} cx={c.x} cy={CARE.y} r={28} opacity={c.k} />))}
        </g>
      ) : null}
      {toBubble > 0.001 ? (
        <g>
          <path d={`M ${tailBase - 40} ${bub.y + bub.h - 4} L ${tailBase - 60} ${bub.y + bub.h + 64} L ${tailBase + 46} ${bub.y + bub.h - 4}`} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} strokeLinejoin="round" opacity={toBubble} />
          <rect x={bub.x + 10} y={bub.y + 14} width={bub.w} height={bub.h} rx={Math.min(64, bub.h / 2)} fill={PAL.charcoal} opacity={0.12 * toBubble} />
          <CardRect r={bub} radius={Math.min(64, bub.h / 2)} sw={4.5} />
          <rect x={tailBase - 38} y={bub.y + bub.h - 8} width={82} height={6} fill={PAL.offWhite} opacity={toBubble} />
          {/* placeholder reply lines + typing dots (no invented responses) */}
          {[0, 1, 2].map((i) => {
            const k = ramp(lines, i * 0.25, i * 0.25 + 0.5);
            const w = [0.62, 0.5, 0.34][i] * (bub.w - 120);
            return <rect key={i} x={bub.x + bub.w - 60 - w * k} y={bub.y + 62 + i * 52} width={w * k} height={18} rx={9} fill={PAL.line} />;
          })}
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={bub.x + 86 + i * 34} cy={bub.y + bub.h - 56} r={10} fill={PAL.charcoal} opacity={0.35 + 0.65 * Math.max(0, Math.sin(t * 5 - i * 0.8))} />
          ))}
          <Cake cx={bub.x + 120} cy={bub.y + 120} s={82} opacity={cake} />
        </g>
      ) : null}
      {thread > 0.001 ? (
        <g>
          <path d={threadD} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" {...drawOn(threadD, thread)} />
          <NodeDot x={TUBE16.x + TUBE16.w / 2} y={threadY} o={ramp(thread, 0.5, 0.7)} />
          <NodeDot x={640} y={arteryTop} o={ramp(thread, 0.9, 1)} />
        </g>
      ) : null}
      <HeartLine cx={HEART16.x} cy={HEART16.y} s={90} beat={Math.max(0, Math.sin(t * Math.PI * 2 * 1.1)) ** 6} opacity={row} />
      <CalendarIcon cx={CAL16.x} cy={CAL16.y} s={150} opacity={row} />
      <HeroTube id="tube14" x={tube.x} y={tube.y} w={tube.w} h={tube.h} level={0.62} build={ramp(t, at(14, 0.12), at(14, 0.3), EASE.out)} label={1} opacity={tubeOn} />
    </svg>
  );
};

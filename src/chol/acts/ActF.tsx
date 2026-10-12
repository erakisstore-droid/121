import type React from 'react';
import {PAL, at} from '../config';
import {CalendarIcon, Cake, Check} from '../art/objects';
import {HeroTube} from '../art/hero';
import {CARE, arteryAt} from '../geom';
import {EASE, mix, mixRect, ramp, type Rect} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';
import {useAbsT} from '../../ms/lib/time';
import {CardRect, Txt} from '../../ms/ui/primitives';

const MINI_REPORT = {x: 230, y: 520, w: 170, h: 220} as const;
const TUBE14 = {x: 110, y: 480, w: 84, h: 280} as const;
const BUBBLE15: Rect = {x: 150, y: 540, w: 690, h: 320};
const BUBBLE16: Rect = {x: 110, y: 480, w: 790, h: 600};

/** Beats 14–16: back to tube + artery, report → long-term care timeline, plaque growth eases;
 * the last care marker becomes a comment bubble that grows to hold the tube and a calendar. */
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

  // Beat 15: last care checkpoint → comment bubble
  const toBubble = ramp(t, at(15, 0), at(15, 0.35), EASE.out);
  const f14Out = ramp(t, at(15, 0), at(15, 0.2));
  const last = cps[3];
  const seed: Rect = {x: last.x - 30, y: CARE.y - 30, w: 60, h: 60};
  const grow16 = ramp(t, at(16, 0), at(16, 0.3), EASE.inOut);
  const bub = mixRect(mixRect(seed, BUBBLE15, toBubble), BUBBLE16, grow16);
  const q15 = ramp(t, at(15, 0.2), at(15, 0.55));
  const q16 = ramp(t, at(16, 0.1), at(16, 0.35));
  const inner = ramp(t, at(16, 0.25), at(16, 0.5));
  const tail = toBubble;
  const tailX = mix(bub.x + bub.w * 0.5, bub.x + bub.w * 0.5, grow16);
  const arteryTop = s.cy - s.R - s.T;
  const tailTip = {x: tailX, y: mix(bub.y + bub.h + 60, arteryTop - 10, grow16)};
  const tube = {x: mix(TUBE14.x, bub.x + 120, grow16), y: mix(TUBE14.y, bub.y + 170, grow16), w: mix(TUBE14.w, 110, grow16), h: mix(TUBE14.h, 360, grow16)};
  const tubeO = Math.max(enter * (1 - f14Out * (1 - grow16)), inner);
  const link16 = ramp(t, at(16, 0.4), at(16, 0.6));
  const linkD = `M ${bub.x + 250} ${bub.y + 350} C ${bub.x + 360} ${bub.y + 420}, ${bub.x + 470} ${bub.y + 420}, ${bub.x + 560} ${bub.y + 360}`;

  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {f14Out < 1 ? (
          <g opacity={1 - f14Out}>
            <path d={c1} stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(c1, link)} />
            <g opacity={enter}>
              <CardRect r={MINI_REPORT} radius={20} />
              {[0, 1, 2, 3].map((i) => (
                <g key={i}>
                  <rect x={MINI_REPORT.x + 22} y={MINI_REPORT.y + 40 + i * 44} width={i === 1 ? 70 : 90} height={12} rx={6} fill={i === 1 ? PAL.orangeDeep : PAL.line} />
                  <rect x={MINI_REPORT.x + 120} y={MINI_REPORT.y + 32 + i * 44} width={30} height={26} rx={6} fill="none" stroke={PAL.charcoal} strokeWidth={2.5} strokeDasharray="5 4" />
                </g>
              ))}
            </g>
            <path d={careD} stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(careD, careK)} />
            {cps.map((c, i) => (i === 3 && toBubble > 0.02 ? null : <Check key={i} cx={c.x} cy={CARE.y} r={28} opacity={c.k} />))}
          </g>
        ) : null}
        {/* comment bubble */}
        {toBubble > 0.001 ? (
          <g>
            <path d={`M ${tailX - 46} ${bub.y + bub.h - 4} L ${tailTip.x} ${tailTip.y} L ${tailX + 46} ${bub.y + bub.h - 4}`} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} strokeLinejoin="round" opacity={tail} />
            <CardRect r={bub} radius={Math.min(70, bub.h / 2)} sw={4.5} />
            <rect x={tailX - 42} y={bub.y + bub.h - 8} width={84} height={6} fill={PAL.offWhite} opacity={tail} />
            <Cake cx={bub.x + bub.w - 110} cy={bub.y + bub.h / 2 + 10} s={90} opacity={ramp(t, at(15, 0.15), at(15, 0.35)) * (1 - ramp(t, at(16, 0), at(16, 0.12)))} />
            {inner > 0.001 ? (
              <g opacity={inner}>
                <CalendarIcon cx={bub.x + bub.w - 200} cy={bub.y + 360} s={170} />
                <path d={linkD} fill="none" stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" {...drawOn(linkD, link16)} />
              </g>
            ) : null}
          </g>
        ) : null}
        <HeroTube id="tube14" x={tube.x} y={tube.y} w={tube.w} h={tube.h} level={0.62} build={ramp(t, at(14, 0.12), at(14, 0.3), EASE.out)} label={1} opacity={tubeO > 0.001 ? 1 : 0} />
      </svg>
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${(1 - q15) * 100}%)`}}>
        <Txt x={bub.x + 30} y={bub.y + bub.h / 2 - 52} w={bub.w - 210} size={70} opacity={q15 > 0 ? 1 - ramp(t, at(16, 0), at(16, 0.08)) : 0} nowrap>
          كام سنة عندك؟
        </Txt>
      </div>
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${(1 - q16) * 100}%)`}}>
        <Txt x={bub.x + 30} y={bub.y + 40} w={bub.w - 60} size={70} opacity={q16 > 0 ? 1 : 0}>
          آخر تحليل كان إمتى؟
        </Txt>
      </div>
    </>
  );
};

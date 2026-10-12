import type React from 'react';
import {PAL, at} from '../config';
import {BrainOutline, Heart} from '../art/objects';
import {LdlDot} from '../art/Artery';
import {YOUTH, arteryAt, youthX, yearsScroll} from '../geom';
import {mix, ramp} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';
import {useAbsT} from '../../ms/lib/time';
import {Txt} from '../../ms/ui/primitives';

/** Branch vessel drawn as wall + lumen strokes. */
const Branch: React.FC<{d: string; p: number; o: number}> = ({d, p, o}) =>
  p <= 0.001 ? null : (
    <g opacity={o}>
      <path d={d} fill="none" stroke={PAL.charcoal} strokeWidth={44} strokeLinecap="round" {...drawOn(d, p)} />
      <path d={d} fill="none" stroke={PAL.offWhite} strokeWidth={36} strokeLinecap="round" {...drawOn(d, p)} />
      <path d={d} fill="none" stroke={PAL.orangeDeep} strokeWidth={16} strokeLinecap="round" {...drawOn(d, p)} />
    </g>
  );

/** Beats 04–06 overlays: passing-years ruler, branches to heart and brain, complication inset, rewind. */
export const ActB: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const s = arteryAt(t);
  const outerTop = s.cy - s.R - s.T;
  const outerBot = s.cy + s.R + s.T;

  // passing-years ruler
  const rulerIn = ramp(t, at(4, 0.86), at(4, 0.96));
  const rulerOut = ramp(t, at(6, 0), at(6, 0.12));
  const ry = outerBot + 52;
  const off = yearsScroll(t);
  const ticks: number[] = [];
  for (let x = 900 - (((-off % 48) + 48) % 48); x > 520; x -= 48) ticks.push(x);

  // beat 5: branches to brain and heart, plus a small complication inset
  const br = ramp(t, at(5, 0.15), at(5, 0.45));
  const organs = ramp(t, at(5, 0.35), at(5, 0.5));
  const bOut = ramp(t, at(6, 0), at(6, 0.2));
  const up = `M 250 ${outerTop + 6} C 250 ${outerTop - 50}, 250 ${outerTop - 70}, 250 650`;
  const down = `M 250 ${outerBot - 6} C 250 ${outerBot + 40}, 250 ${outerBot + 60}, 250 1338`;
  const inset = ramp(t, at(5, 0.45), at(5, 0.6)) * (1 - ramp(t, at(5, 0.92), at(6, 0.1)));
  const clot = ramp(t, at(5, 0.58), at(5, 0.8));

  // beat 6 youth timeline (continues into the source-A area in beat 7)
  const youth = ramp(t, at(6, 0.05), at(6, 0.6));
  const youthOut = t >= at(7, 0) ? 1 : 0;
  const ticksOut = ramp(t, at(6, 0.92), at(7, 0));
  const mini = ramp(t, at(6, 0.6), at(6, 0.8));
  const youthD = `M ${YOUTH.x0} ${outerBot} C ${YOUTH.x0 + 60} ${outerBot}, ${YOUTH.x0 + 40} ${YOUTH.y}, ${YOUTH.x0 + 110} ${YOUTH.y} L ${YOUTH.x1} ${YOUTH.y}`;

  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <clipPath id="cb-mini">
            <circle cx={youthX(25)} cy={YOUTH.y - 160} r={88} />
          </clipPath>
        </defs>
        <Branch d={up} p={br} o={1 - bOut} />
        <Branch d={down} p={br} o={1 - bOut} />
        <BrainOutline cx={250} cy={560} s={88} opacity={organs * (1 - bOut)} />
        <Heart cx={250} cy={1420} s={78} opacity={organs * (1 - bOut)} />
        {inset > 0.001 ? (
          <g opacity={inset}>
            <defs>
              <clipPath id="cb-inset">
                <circle cx={745} cy={565} r={102} />
              </clipPath>
            </defs>
            <line x1={560} y1={outerTop + 10} x2={690} y2={640} stroke={PAL.charcoal} strokeWidth={3} strokeDasharray="8 7" />
            <circle cx={745} cy={565} r={106} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={5} />
            <g clipPath="url(#cb-inset)">
              <rect x={630} y={460} width={240} height={60} fill={PAL.offWhite} />
              <rect x={630} y={520} width={240} height={140} fill={PAL.orangeDeep} />
              <path d="M 630 520 L 680 520 C 700 520 705 566 745 566 C 785 566 790 520 810 520 L 870 520 L 870 470 L 630 470 Z" fill={PAL.beige} stroke={PAL.charcoal} strokeWidth={3.5} />
              <path d="M 630 520 L 680 520 C 700 520 705 566 745 566 C 785 566 790 520 810 520 L 870 520" fill="none" stroke={PAL.charcoal} strokeWidth={4} />
              {[
                [735, 578, 13],
                [756, 584, 11],
                [745, 596, 10],
                [722, 590, 9],
              ].map(([x, y, r], i) => (
                <circle key={i} cx={x} cy={y} r={r * clot} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={3} />
              ))}
              {clot > 0.5 ? <path d="M 718 584 L 770 600 M 728 600 L 762 576" stroke={PAL.charcoal} strokeWidth={2.5} opacity={(clot - 0.5) * 2} /> : null}
            </g>
          </g>
        ) : null}
        {rulerIn > 0.001 && rulerOut < 1 ? (
          <g opacity={rulerIn * (1 - rulerOut)}>
            <line x1={520} y1={ry} x2={900} y2={ry} stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" />
            {ticks.map((x) => (
              <line key={x} x1={x} y1={ry - 14} x2={x} y2={ry} stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" opacity={0.75} />
            ))}
          </g>
        ) : null}
        {/* beat 6: the artery's lower edge peels into a timeline running toward younger ages */}
        {youth > 0.001 && youthOut < 1 ? (
          <g opacity={1 - youthOut}>
            <path d={youthD} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" {...drawOn(youthD, youth)} />
            {[60, 50, 40, 30, 20].map((a, i) => {
              const k = ramp(t, at(6, 0.2 + i * 0.1), at(6, 0.3 + i * 0.1));
              return (
                <g key={a} opacity={k * (1 - ticksOut)}>
                  <line x1={youthX(a)} y1={YOUTH.y - 14} x2={youthX(a)} y2={YOUTH.y + 14} stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" />
                  <text x={youthX(a)} y={YOUTH.y + 62} textAnchor="middle" fontFamily="Cairo" fontWeight={700} fontSize={40} fill={PAL.charcoal}>
                    {a}
                  </text>
                </g>
              );
            })}
            {mini > 0.001 ? (
              <g opacity={mini * (1 - ticksOut)}>
                <line x1={youthX(25)} y1={YOUTH.y} x2={youthX(25)} y2={YOUTH.y - 70} stroke={PAL.charcoal} strokeWidth={4} />
                <circle cx={youthX(25)} cy={YOUTH.y - 160} r={92} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={5} />
                <g clipPath="url(#cb-mini)">
                  <rect x={youthX(25) - 100} y={YOUTH.y - 252} width={200} height={50} fill={PAL.offWhite} />
                  <rect x={youthX(25) - 100} y={YOUTH.y - 202} width={200} height={84} fill={PAL.orangeDeep} />
                  <path d={`M ${youthX(25) - 100} ${YOUTH.y - 202} L ${youthX(25) - 40} ${YOUTH.y - 202} C ${youthX(25) - 22} ${YOUTH.y - 202} ${youthX(25) - 18} ${YOUTH.y - 186} ${youthX(25)} ${YOUTH.y - 186} C ${youthX(25) + 18} ${YOUTH.y - 186} ${youthX(25) + 22} ${YOUTH.y - 202} ${youthX(25) + 40} ${YOUTH.y - 202} L ${youthX(25) + 100} ${YOUTH.y - 202} L ${youthX(25) + 100} ${YOUTH.y - 222} L ${youthX(25) - 100} ${YOUTH.y - 222} Z`} fill={PAL.beige} stroke={PAL.charcoal} strokeWidth={3} />
                  <rect x={youthX(25) - 100} y={YOUTH.y - 118} width={200} height={30} fill={PAL.offWhite} />
                  <line x1={youthX(25) - 100} y1={YOUTH.y - 118} x2={youthX(25) + 100} y2={YOUTH.y - 118} stroke={PAL.charcoal} strokeWidth={3} />
                  <LdlDot x={youthX(25) - 50 + ((t * 60) % 100)} y={YOUTH.y - 150} r={9} />
                </g>
              </g>
            ) : null}
          </g>
        ) : null}
      </svg>
      <Txt x={mix(560, 560, 0)} y={ry + 6} w={340} size={40} weight={700} opacity={rulerIn * (1 - rulerOut)} align="right">
        مع مرور السنين
      </Txt>
    </>
  );
};

import type React from 'react';
import {PAL, at} from '../config';
import {Plate, SupplementLabel, TreatmentShield} from '../art/body';
import {OmegaCapsule} from '../art/capsule';
import {PathPulse} from '../art/common';
import {pageDelta} from '../frame';
import {ICONS16} from './Cohort';
import {BrainNode, HeartLine} from '../../chol/art/objects';
import {EASE, mix, mixRect, ramp} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';
import {useAbsT} from '../../ms/lib/time';
import {CardRect, Txt} from '../../ms/ui/primitives';

type P = {x: number; y: number; r: number};
const mixP = (a: P, b: P, k: number): P => ({x: mix(a.x, b.x, k), y: mix(a.y, b.y, k), r: mix(a.r, b.r, k)});
const PANEL = {x: 100, y: 520, w: 600, h: 540} as const;

/** Beats 17–21 (p9): path folds into the plate rim → fish + optional supplement branch → MS-treatment shield → balanced composition → capsule label unfolds into an ingredient panel. */
export const Food: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const d8 = pageDelta('p8', 'p9');
  const k19 = ramp(t, at(19, 0), at(19, 0.3), EASE.inOut);
  const k20 = ramp(t, at(20, 0), at(20, 0.35), EASE.inOut);
  const k21 = ramp(t, at(21, 0), at(21, 0.3), EASE.inOut);

  // positions per beat
  const plate = mixP(mixP(mixP({x: 540, y: 880, r: 270}, {x: 300, y: 700, r: 170}, k19), {x: 290, y: 690, r: 165}, k20), {x: 230, y: 1330, r: 92}, k21);
  const heart = mixP({x: 790, y: 690, r: 110}, {x: 700, y: 1330, r: 80}, k21);
  const brain = mixP({x: 545, y: 1000, r: 100}, {x: 465, y: 1330, r: 80}, k21);
  const shield = mixP(mixP({x: 540, y: 1150, r: 2.3}, {x: 250, y: 1270, r: 1.2}, k20), {x: 880, y: 1310, r: 0.75}, k21);
  const cap = {x: mix(mix(800, 820, k20), 830, k21), y: mix(mix(1330, 1340, k20), 470 + 80, k21), len: mix(210, 170, k19)};

  // beat 17: incoming path folds into the rim
  const inD = `M ${ICONS16.plate.x + 62 + d8.x} ${ICONS16.plate.y + d8.y} C ${ICONS16.plate.x + 300 + d8.x} ${ICONS16.plate.y + d8.y}, ${200} ${1260}, ${plate.x} ${plate.y + plate.r}`;
  const inK = ramp(t, at(17, 0.05), at(17, 0.5));
  const rim = ramp(t, at(17, 0.45), at(17, 0.98), EASE.inOut);
  // beat 18
  const fish = [0, 1, 2].map((i) => ramp(t, at(18, 0.05 + i * 0.15), at(18, 0.25 + i * 0.15), EASE.out));
  const extras = ramp(t, at(18, 0.1), at(18, 0.3));
  const capIn = ramp(t, at(18, 0.55), at(18, 0.78), EASE.out);
  const branch = `M ${plate.x + plate.r * 0.7} ${plate.y + plate.r * 0.7} C ${plate.x + plate.r} ${plate.y + plate.r * 1.1}, ${cap.x - 120} ${cap.y - 60}, ${cap.x - 110} ${cap.y}`;
  // beat 19
  const shieldP = ramp(t, at(19, 0.15), at(19, 0.45), EASE.out);
  // beat 20: balanced triangle
  const tri = ramp(t, at(20, 0.25), at(20, 0.6));
  const links = [
    `M ${plate.x + plate.r} ${plate.y} L ${heart.x - heart.r} ${heart.y}`,
    `M ${plate.x + plate.r * 0.6} ${plate.y + plate.r * 0.8} L ${brain.x - brain.r * 0.7} ${brain.y - brain.r * 0.7}`,
    `M ${heart.x - heart.r * 0.6} ${heart.y + heart.r * 0.8} L ${brain.x + brain.r * 0.7} ${brain.y - brain.r * 0.7}`,
  ];
  // beat 21: label unfolds into the ingredient panel
  const labelSeed = {x: cap.x + 10, y: cap.y - 20, w: 50, h: 40};
  const panelR = mixRect(labelSeed, PANEL, ramp(t, at(21, 0.05), at(21, 0.32), EASE.out));
  const rows = ramp(t, at(21, 0.3), at(21, 0.6));
  const bracket = ramp(t, at(21, 0.55), at(21, 0.75));
  const beat = Math.max(0, Math.sin(t * Math.PI * 2 * 1.1)) ** 6;
  const panelDone = ramp(t, at(21, 0.28), at(21, 0.34));

  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {inK > 0.001 ? <path d={inD} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" opacity={1 - k19} {...drawOn(inD, inK)} /> : null}
        {tri > 0.001
          ? links.map((d) => (
              <g key={d}>
                <path d={d} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(d, tri)} />
                <PathPulse d={d} t={t} n={1} speed={0.4} r={9} color={PAL.orange} o={ramp(tri, 0.9, 1)} />
              </g>
            ))
          : null}
        <Plate cx={plate.x} cy={plate.y} r={plate.r} rim={rim} fish={fish} extras={extras} t={t} />
        {capIn > 0.001 ? (
          <g opacity={capIn}>
            <path d={branch} fill="none" stroke={PAL.charcoal} strokeWidth={4} strokeDasharray="10 9" opacity={1 - k21} />
            <OmegaCapsule id="cap9" cx={cap.x} cy={cap.y} len={cap.len * mix(0.7, 1, capIn)} rad={44 * mix(0.7, 1, capIn) * (cap.len / 210)} rot={-24 + Math.sin(t * 1.2) * 8} label={ramp(t, at(20, 0.6), at(20, 0.9)) * (1 - panelDone)} />
          </g>
        ) : null}
        <TreatmentShield cx={shield.x} cy={shield.y} s={shield.r * 100} p={shieldP} />
        <g opacity={tri}>
          <circle cx={heart.x} cy={heart.y} r={heart.r} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
          <HeartLine cx={heart.x} cy={heart.y + heart.r * 0.08} s={heart.r * 0.66} beat={beat} />
          <BrainNode cx={brain.x} cy={brain.y} r={brain.r} />
        </g>
        {panelR.w > 52 ? (
          panelDone < 1 ? (
            <CardRect r={panelR} radius={20} />
          ) : (
            <SupplementLabel x={PANEL.x} y={PANEL.y} w={PANEL.w} h={PANEL.h} rows={rows} bracket={bracket} t={t} />
          )
        ) : null}
      </svg>
      <Txt x={shield.x - 240} y={shield.y + shield.r * 130} w={480} size={mix(48, 40, k20)} weight={800} opacity={shieldP * (1 - k21)} nowrap>
        علاج الـMS
      </Txt>
      <Txt x={PANEL.x + PANEL.w + 54} y={PANEL.y + 150 + 120 * 2 - 52} w={150} size={38} weight={800} dir="ltr" align="left" opacity={bracket}>
        EPA +<br />DHA
      </Txt>
      <Txt x={PANEL.x} y={PANEL.y + PANEL.h + 14} w={PANEL.w} size={34} weight={700} opacity={bracket} nowrap>
        الكمية لكل جرعة — بدون جرعة مقترحة
      </Txt>
    </>
  );
};

import type React from 'react';
import {DATA, PAL, SOURCES, at} from '../config';
import {OmegaCapsule} from '../art/capsule';
import {CohortTimeline} from '../art/charts';
import {PathPulse, ResearchPin} from '../art/common';
import {Callout, ResearchImage, fullHeight, regionToScreen, viewportRect, type View} from '../art/research';
import {pageDelta} from '../frame';
import {HEART7} from './Neuro';
import {PIN} from './Review';
import {chainViews} from './view';
import {HeartLine, PersonGlyph} from '../../chol/art/objects';
import {EASE, mix, ramp} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';
import {useAbsT} from '../../ms/lib/time';
import {Txt} from '../../ms/ui/primitives';

const Cs = SOURCES.C_MS_2024;
const TL = {x: 120, y: 828, w: 760} as const;
export const NODE_F = {x: 740, y: 1400, r: 80} as const; // fatigue (right = first in RTL)
export const NODE_D = {x: 260, y: 1400, r: 80} as const; // disability
const SUPP = {x: 500, y: 1330, r: 56} as const;
export const LANES16 = {y1: 1330, y2: 1470, x0: 150, x1: 640} as const;
export const ICONS16 = {plate: {x: 800, y: 1320}, heart: {x: 800, y: 1480}} as const;

const Battery: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <rect x={x - 40} y={y - 22} width={74} height={44} rx={8} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={5} />
    <rect x={x + 34} y={y - 9} width={8} height={18} rx={3} fill={PAL.charcoal} />
    <rect x={x - 33} y={y - 15} width={16} height={30} rx={4} fill={PAL.orangeDeep} />
  </g>
);
const Mobility: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <circle cx={x - 6} cy={y - 34} r={10} fill={PAL.charcoal} />
    <path d={`M ${x - 6} ${y - 22} L ${x - 10} ${y + 6} L ${x - 22} ${y + 34} M ${x - 10} ${y + 6} L ${x + 6} ${y + 34} M ${x - 8} ${y - 12} L ${x + 14} ${y - 2}`} stroke={PAL.charcoal} strokeWidth={7} strokeLinecap="round" fill="none" />
    <path d={`M ${x + 22} ${y - 14} L ${x + 30} ${y + 36}`} stroke={PAL.charcoal} strokeWidth={6} strokeLinecap="round" />
  </g>
);

/** Beats 13–16 (p8): MS cohort source → 839 dots / 5 years → outcome nodes → observational association → two general-health pathways. */
export const Cohort: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const d7 = pageDelta('p7', 'p8');
  const inD = `M ${HEART7.x + HEART7.r + d7.x} ${HEART7.y + d7.y} C ${HEART7.x + HEART7.r + d7.x + 260} ${HEART7.y + d7.y}, ${-80} ${700}, ${TL.x - 10} ${700}`;
  const inK = ramp(t, at(12, 0.85), at(13, 0.2));

  const full: View = {x: 120, y: 470, w: 760, vh: fullHeight(Cs, 760), zoom: 1, fu: 0.5, fv: 0.5};
  const title: View = {...full, vh: 300, zoom: 1.6, fu: 0.5, fv: 0.07};
  const cohort: View = {...title, zoom: 1.8, fu: 0.3, fv: 0.58};
  const result: View = {...title, zoom: 1.45, fu: 0.5, fv: 0.84};
  const k1 = ramp(t, at(13, 0.42), at(13, 0.52), EASE.inOut);
  const k2 = ramp(t, at(13, 0.6), at(13, 0.7), EASE.inOut);
  const k3 = ramp(t, at(15, 0), at(15, 0.12), EASE.inOut);
  const v = chainViews([full, title, cohort, result], [k1, k2, k3]);
  const vp = viewportRect(Cs, v);
  const co = (r: {x: number; y: number; w: number; h: number}) => regionToScreen(Cs, v, r);
  const imgIn = ramp(t, at(13, 0.1), at(13, 0.2), EASE.out);

  const tlIn = ramp(t, at(13, 0.52), at(13, 0.6), EASE.out);
  const dots = ramp(t, at(13, 0.55), at(13, 0.92));
  const tlP = ramp(t, at(13, 0.6), at(14, 0.5));
  const outIn = ramp(t, at(14, 0.35), at(14, 0.8), EASE.out);
  const tlEnd = {x: TL.x + 20, y: TL.y + 330};
  const toF = `M ${tlEnd.x} ${tlEnd.y} C ${tlEnd.x} ${tlEnd.y + 120}, ${NODE_F.x} ${NODE_F.y - 200}, ${NODE_F.x} ${NODE_F.y - NODE_F.r}`;
  const toD = `M ${tlEnd.x} ${tlEnd.y} C ${tlEnd.x} ${tlEnd.y + 80}, ${NODE_D.x} ${NODE_D.y - 160}, ${NODE_D.x} ${NODE_D.y - NODE_D.r}`;
  const supp = ramp(t, at(15, 0.05), at(15, 0.3), EASE.out);
  const assoc = ramp(t, at(15, 0.43), at(15, 0.7));
  const lower = ramp(t, at(15, 0.72), at(15, 0.85));
  const fadeNodes = ramp(t, at(16, 0), at(16, 0.15));
  const lanes = ramp(t, at(16, 0.15), at(16, 0.55));
  const laneD = (y: number) => `M ${LANES16.x0} ${y} L ${LANES16.x1} ${y}`;
  const fan = [
    `M ${LANES16.x1} ${LANES16.y1} C ${700} ${LANES16.y1}, ${700} ${ICONS16.plate.y}, ${ICONS16.plate.x - 62} ${ICONS16.plate.y}`,
    `M ${LANES16.x1} ${LANES16.y1} C ${700} ${LANES16.y1}, ${700} ${ICONS16.heart.y}, ${ICONS16.heart.x - 62} ${ICONS16.heart.y}`,
    `M ${LANES16.x1} ${LANES16.y2} C ${700} ${LANES16.y2}, ${700} ${ICONS16.plate.y}, ${ICONS16.plate.x - 62} ${ICONS16.plate.y}`,
    `M ${LANES16.x1} ${LANES16.y2} C ${700} ${LANES16.y2}, ${700} ${ICONS16.heart.y}, ${ICONS16.heart.x - 62} ${ICONS16.heart.y}`,
  ];
  const beat = Math.max(0, Math.sin(t * Math.PI * 2 * 1.1)) ** 6;
  const counter = Math.round(DATA.ms.n * dots);

  const node = (n: {x: number; y: number; r: number}, kind: 'f' | 'd') => (
    <g opacity={outIn * (1 - fadeNodes)} transform={`translate(${n.x} ${n.y}) scale(${mix(0.6, 1, outIn)}) translate(${-n.x} ${-n.y})`}>
      <circle cx={n.x} cy={n.y} r={n.r} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={5} />
      {kind === 'f' ? <Battery x={n.x} y={n.y} /> : <Mobility x={n.x} y={n.y} />}
      {lower > 0.001 ? (
        <g opacity={lower} transform={`translate(${n.x + n.r * 0.72} ${n.y - n.r * 0.72})`}>
          <circle r={26} fill={PAL.charcoal} />
          <path d="M 0 -12 L 0 10 M -9 2 L 0 12 L 9 2" stroke={PAL.offWhite} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      ) : null}
    </g>
  );

  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {inK > 0.001 ? <path d={inD} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(inD, inK)} /> : null}
      </svg>
      <ResearchImage src={Cs} v={v} opacity={imgIn} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <ResearchPin x={PIN.x} y={PIN.y} year="2024" />
        <Callout r={co(Cs.title)} k={ramp(t, at(13, 0.46), at(13, 0.54))} clip={vp} t={t} />
        <Callout r={co(Cs.cohort)} k={ramp(t, at(13, 0.68), at(13, 0.76))} clip={vp} t={t} />
        <Callout r={co(Cs.years)} k={ramp(t, at(13, 0.78), at(13, 0.86))} clip={vp} t={t} />
        <Callout r={co(Cs.result)} k={ramp(t, at(15, 0.12), at(15, 0.24))} clip={vp} t={t} />
        <g transform={`translate(0 ${(1 - tlIn) * 30})`}>
          <CohortTimeline x={TL.x} y={TL.y} w={TL.w} p={tlP} dots={dots} t={t} opacity={tlIn} />
        </g>
        {outIn > 0.001 && fadeNodes < 1
          ? [toF, toD].map((d) => <path key={d} d={d} fill="none" stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" opacity={1 - fadeNodes} {...drawOn(d, outIn)} />)
          : null}
        {node(NODE_F, 'f')}
        {node(NODE_D, 'd')}
        {/* supplement-use marker and dashed association connectors (observational) */}
        {supp > 0.001 && fadeNodes < 1 ? (
          <g opacity={supp * (1 - fadeNodes)}>
            {[NODE_F, NODE_D].map((n) => {
              const d = `M ${SUPP.x + (n.x > SUPP.x ? SUPP.r : -SUPP.r)} ${SUPP.y} L ${n.x + (n.x > SUPP.x ? -n.r : n.r)} ${n.y - 12}`;
              return (
                <g key={n.x}>
                  <path d={d} fill="none" stroke={PAL.charcoal} strokeWidth={4} strokeDasharray="12 10" strokeDashoffset={-t * 40} opacity={assoc} />
                </g>
              );
            })}
            <circle cx={SUPP.x} cy={SUPP.y} r={SUPP.r} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
            <OmegaCapsule id="capms" cx={SUPP.x} cy={SUPP.y - 4} len={74} rad={16} depth={0} />
          </g>
        ) : null}
        {/* beat 16: two parallel general-health pathways */}
        {lanes > 0.001 ? (
          <g>
            {[LANES16.y1, LANES16.y2].map((y) => (
              <path key={y} d={laneD(y)} fill="none" stroke={PAL.charcoal} strokeWidth={6} strokeLinecap="round" {...drawOn(laneD(y), lanes)} />
            ))}
            {fan.map((d, i) => (
              <g key={d}>
                <path d={d} fill="none" stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" {...drawOn(d, ramp(lanes, 0.5, 1))} />
                <PathPulse d={`${laneD(i < 2 ? LANES16.y1 : LANES16.y2)} ${d.replace(/^M [\d.]+ [\d.]+/, '')}`} t={t + i * 0.25} n={1} speed={0.4} r={9} color={PAL.orange} o={ramp(lanes, 0.9, 1)} />
              </g>
            ))}
            <g opacity={ramp(lanes, 0.6, 1)}>
              <circle cx={ICONS16.plate.x} cy={ICONS16.plate.y} r={60} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
              <circle cx={ICONS16.plate.x} cy={ICONS16.plate.y} r={40} fill="none" stroke={PAL.line} strokeWidth={5} />
              <ellipse cx={ICONS16.plate.x} cy={ICONS16.plate.y} rx={26} ry={12} fill={PAL.beige} stroke={PAL.charcoal} strokeWidth={3} />
              <circle cx={ICONS16.heart.x} cy={ICONS16.heart.y} r={60} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
              <HeartLine cx={ICONS16.heart.x} cy={ICONS16.heart.y + 6} s={38} beat={beat} />
            </g>
            <rect x={LANES16.x0 - 10} y={LANES16.y1 - 34} width={110} height={68} rx={34} fill={PAL.charcoal} opacity={lanes} />
            <circle cx={LANES16.x0 + 30} cy={LANES16.y2} r={34} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} opacity={lanes} />
            <PersonGlyph x={LANES16.x0 + 30} y={LANES16.y2 + 24} h={46} opacity={lanes} />
          </g>
        ) : null}
      </svg>
      <div style={{position: 'absolute', left: TL.x + 14, top: TL.y + 60, width: 230, textAlign: 'center', whiteSpace: 'nowrap', opacity: tlIn, fontFamily: 'Cairo', color: PAL.charcoal}}>
        <div dir="ltr" style={{fontSize: 84, fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{counter}</div>
        <div dir="rtl" style={{fontSize: 40, fontWeight: 800}}>مشارك</div>
        <div dir="rtl" style={{fontSize: 30, fontWeight: 700, opacity: 0.8}}>متابعة 5 سنوات</div>
      </div>
      <Txt x={NODE_F.x - 150} y={NODE_F.y + NODE_F.r + 4} w={300} size={42} weight={800} opacity={outIn * (1 - fadeNodes)}>
        الإرهاق
      </Txt>
      <Txt x={NODE_D.x - 150} y={NODE_D.y + NODE_D.r + 4} w={300} size={42} weight={800} opacity={outIn * (1 - fadeNodes)}>
        الإعاقة
      </Txt>
      <Txt x={LANES16.x0 - 10} y={LANES16.y1 - 30} w={110} size={40} weight={800} color={PAL.offWhite} dir="ltr" opacity={lanes}>
        MS
      </Txt>
    </>
  );
};

import type React from 'react';
import {PAL, SOURCES, at} from '../config';
import {MarkerIndicator, QualitativeTGIndicator} from '../art/charts';
import {PathPulse, ResearchPin} from '../art/common';
import {Callout, ResearchImage, fullHeight, regionToScreen, viewportRect, type View} from '../art/research';
import {pageDelta} from '../frame';
import {LANES} from './Membrane';
import {chainViews} from './view';
import {EASE, mix, ramp} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';
import {useAbsT} from '../../ms/lib/time';
import {Txt} from '../../ms/ui/primitives';

export const PIN = {x: 862, y: 452} as const;
const A = SOURCES.A_REVIEW_2024;
const TG = {x: 120, y: 880, w: 760, h: 270} as const;

/** Beat 06 (pins fly out) · Beat 07 (p5): 2024 review → title → TG excerpt → qualitative TG indicator → selected markers. Beat 08: TG arrow → next axis. */
export const Review: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const d4 = pageDelta('p4', 'p5');
  const full: View = {x: 120, y: 470, w: 760, vh: fullHeight(A, 760), zoom: 1, fu: 0.5, fv: 0.5};
  const title: View = {...full, vh: 330, zoom: 1.7, fu: 0.5, fv: 0.06};
  const tgV: View = {...title, fu: 0.72, fv: 0.53};
  const mkV: View = {...title, fu: 0.5, fv: 0.75};
  const k1 = ramp(t, at(7, 0.33), at(7, 0.43), EASE.inOut);
  const k2 = ramp(t, at(7, 0.47), at(7, 0.55), EASE.inOut);
  const k3 = ramp(t, at(7, 0.68), at(7, 0.76), EASE.inOut);
  const v = chainViews([full, title, tgV, mkV], [k1, k2, k3]);
  const imgIn = ramp(t, at(7, 0), at(7, 0.08), EASE.out);
  const vp = viewportRect(A, v);
  const co = (r: {x: number; y: number; w: number; h: number}) => regionToScreen(A, v, r);

  // beat 6: three research pins fly out from the signalling lanes
  const fly = ramp(t, at(6, 0.1), at(6, 0.75), EASE.inOut);
  const targets = [
    {x: PIN.x, y: PIN.y, year: '2024'},
    {x: PIN.x + pageDelta('p6', 'p5').x, y: PIN.y, year: '2025'},
    {x: PIN.x + pageDelta('p8', 'p5').x, y: PIN.y + pageDelta('p8', 'p5').y, year: '2024'},
  ];
  const starts = [-90, 0, 90].map((dy) => ({x: LANES.x1 - 120 + d4.x, y: LANES.y + dy + d4.y}));

  const tgIn = ramp(t, at(7, 0.55), at(7, 0.62), EASE.out);
  const tgP = ramp(t, at(7, 0.6), at(7, 0.74));
  const m1 = ramp(t, at(7, 0.8), at(7, 0.88), EASE.out);
  const m2 = ramp(t, at(7, 0.86), at(7, 0.94), EASE.out);
  const conn = `M ${PIN.x + 20} ${PIN.y + 70} L ${PIN.x + 20} ${TG.y + TG.h / 2}`;
  const infR = co(A.inflammatory);
  const oxR = co(A.oxidative);
  // connectors route around the TG panel (outside its left/right edges) so they never cross the chart or its label
  const infS = {x: infR.x + infR.w, y: infR.y + infR.h / 2};
  const oxS = {x: oxR.x, y: oxR.y + oxR.h / 2};
  const toCards = [
    `M ${infS.x} ${infS.y} C 912 ${infS.y}, 912 ${infS.y}, 912 ${infS.y + 50} L 912 1190 C 912 1240, 700 1220, 700 1270`,
    `M ${oxS.x} ${oxS.y} C 94 ${oxS.y}, 94 ${oxS.y}, 94 ${oxS.y + 50} L 94 1190 C 94 1240, 300 1220, 300 1270`,
  ];
  const toCardsK = ramp(t, at(7, 0.84), at(7, 0.94));

  // beat 8: the TG arrow runs across the board to become the cardio chart axis (page p6)
  const d6 = pageDelta('p6', 'p5');
  const axisEnd = {x: 880 + d6.x, y: 980 + 230};
  const toAxis = `M ${TG.x + TG.w - 60} ${TG.y + TG.h - 60} C ${TG.x + TG.w + 80} ${TG.y + TG.h}, ${980} ${1500}, ${760} ${1500} L ${axisEnd.x + 140} ${1500} C ${axisEnd.x + 40} ${1500}, ${axisEnd.x} ${1420}, ${axisEnd.x} ${axisEnd.y}`;
  const axisK = ramp(t, at(8, 0.05), at(8, 0.95), EASE.inOut);

  return (
    <>
      <ResearchImage src={A} v={v} opacity={imgIn} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {fly > 0.001 && fly < 1
          ? targets.map((tg, i) => {
              const s = starts[i];
              const x = mix(s.x, tg.x, fly);
              const y = mix(s.y, tg.y, fly) - Math.sin(fly * Math.PI) * 260;
              return <ResearchPin key={i} x={x} y={y} year={tg.year} s={mix(0.6, 1, fly)} />;
            })
          : null}
        {fly >= 1 ? <ResearchPin x={PIN.x} y={PIN.y} year="2024" /> : null}
        <path d={conn} stroke={PAL.charcoal} strokeWidth={4} strokeDasharray="8 8" opacity={imgIn} />
        <PathPulse d={conn} t={t} n={1} speed={0.5} r={8} color={PAL.orange} o={imgIn} />
        <Callout r={co(A.title)} k={ramp(t, at(7, 0.38), at(7, 0.45))} clip={vp} t={t} />
        <Callout r={co(A.tg)} k={ramp(t, at(7, 0.55), at(7, 0.62))} clip={vp} t={t} />
        <Callout r={infR} k={ramp(t, at(7, 0.77), at(7, 0.82))} clip={vp} t={t} />
        <Callout r={oxR} k={ramp(t, at(7, 0.81), at(7, 0.86))} clip={vp} t={t} />
        <Callout r={co(A.oxidative2)} k={ramp(t, at(7, 0.84), at(7, 0.88))} clip={vp} t={t} />
        <g transform={`translate(0 ${(1 - tgIn) * 30})`}>
          <QualitativeTGIndicator x={TG.x} y={TG.y} w={TG.w} h={TG.h} p={tgP} t={t} opacity={tgIn} />
        </g>
        {toCardsK > 0.001
          ? toCards.map((d) => (
              <g key={d}>
                <path d={d} fill="none" stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" {...drawOn(d, toCardsK)} />
                <PathPulse d={d} t={t} n={1} speed={0.6} r={8} color={PAL.orange} o={ramp(toCardsK, 0.9, 1)} />
              </g>
            ))
          : null}
        <MarkerIndicator x={510} y={1270} w={370} h={200} p={m1} icon="flame" />
        <MarkerIndicator x={120} y={1270} w={370} h={200} p={m2} icon="spark" />
        {axisK > 0.001 ? <path d={toAxis} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(toAxis, axisK)} /> : null}
      </svg>
      <Txt x={TG.x} y={TG.y + TG.h + 6} w={TG.w} size={38} weight={700} opacity={ramp(tgP, 0.5, 1)}>
        اتجاه توضيحي — بدون نسبة محددة
      </Txt>
      <Txt x={510} y={1270 + 128} w={370} size={38} weight={800} opacity={m1} nowrap>
        مؤشرات التهاب
      </Txt>
      <Txt x={120} y={1270 + 128} w={370} size={38} weight={800} opacity={m2} nowrap>
        إجهاد تأكسدي
      </Txt>
    </>
  );
};

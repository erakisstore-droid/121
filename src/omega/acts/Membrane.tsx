import type React from 'react';
import {PAL, at} from '../config';
import {PathPulse} from '../art/common';
import {CellMembrane, InflammatorySignals, NeuronIcon} from '../art/membrane';
import {pageDelta} from '../frame';
import {SHARED} from './FishSources';
import {EASE, mix, ramp} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';
import {useAbsT} from '../../ms/lib/time';
import {Txt} from '../../ms/ui/primitives';

export const MEM = {x0: 130, x1: 870, y: 1000} as const;

/** Beat 05a (p3): shared fish pathway → neuronal cell membrane (DHA-containing lipids light up). */
export const Membrane: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const d2 = pageDelta('p2', 'p3');
  const inD = `M ${SHARED.x + 400 + d2.x} ${SHARED.y1 + 40} C ${0} ${SHARED.y1 + 40}, ${20} ${MEM.y}, ${MEM.x0 - 20} ${MEM.y}`;
  const inK = ramp(t, at(5, 0), at(5, 0.12));
  const memIn = ramp(t, at(5, 0.06), at(5, 0.18), EASE.out);
  const dha = ramp(t, at(5, 0.15), at(5, 0.45));
  const neuron = ramp(t, at(5, 0.02), at(5, 0.12));
  const downD = `M 495 ${MEM.y + 180} L 495 ${2100 + 520}`;
  const down = ramp(t, at(5, 0.48), at(5, 0.6));
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d={inD} fill="none" stroke={PAL.charcoal} strokeWidth={6} strokeLinecap="round" {...drawOn(inD, inK)} />
        <PathPulse d={inD} t={t} n={3} speed={0.6} r={10} color={PAL.orange} o={inK >= 1 ? 1 - ramp(t, at(5, 0.5), at(5, 0.6)) : 0} />
        <g opacity={neuron}>
          <NeuronIcon x={260} y={600} s={130} />
          <circle cx={560} cy={600} r={34} fill="none" stroke={PAL.charcoal} strokeWidth={4} />
          <path d={`M 540 628 L ${MEM.x0 + 60} ${MEM.y - 160} M 582 626 L ${MEM.x1 - 40} ${MEM.y - 160}`} stroke={PAL.charcoal} strokeWidth={3} strokeDasharray="8 8" />
        </g>
        <g transform={`translate(0 ${(1 - memIn) * 40})`}>
          <CellMembrane x0={MEM.x0} x1={MEM.x1} y={MEM.y} t={t} dha={dha} opacity={memIn} />
        </g>
        {down > 0.001 ? <path d={downD} fill="none" stroke={PAL.charcoal} strokeWidth={6} strokeLinecap="round" {...drawOn(downD, down)} /> : null}
      </svg>
      <Txt x={MEM.x0} y={MEM.y + 200} w={MEM.x1 - MEM.x0} size={42} weight={700} opacity={dha}>
        غشاء الخلية العصبية
      </Txt>
    </>
  );
};

export const REG = {x: 540, y: 620, r: 96} as const;
export const LANES = {x0: 110, x1: 900, y: 1080} as const;

/** Beat 05b (p4): EPA/DHA regulator above inflammatory signalling, which becomes more orderly. Beat 06: lanes → research pins. */
export const Signals: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const sig = ramp(t, at(5, 0.55), at(5, 0.68), EASE.out);
  const reg = ramp(t, at(5, 0.6), at(5, 0.72), EASE.out);
  const order = ramp(t, at(5, 0.75), at(5, 0.95), EASE.inOut);
  const links = [-90, 0, 90].map((dy) => `M ${REG.x} ${REG.y + REG.r} C ${REG.x} ${REG.y + 220}, ${mix(LANES.x0 + 200, LANES.x1 - 200, 0.5 + dy / 300)} ${LANES.y + dy - 140}, ${mix(LANES.x0 + 200, LANES.x1 - 200, 0.5 + dy / 300)} ${LANES.y + dy - 18}`);
  const linkK = ramp(t, at(5, 0.68), at(5, 0.8));
  const fade = 1 - 0.6 * ramp(t, at(6, 0), at(6, 0.3));
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <g opacity={fade}>
          <InflammatorySignals x0={LANES.x0} x1={LANES.x1} y={LANES.y} t={t} order={order} opacity={sig} />
          {links.map((d) => (
            <g key={d}>
              <path d={d} fill="none" stroke={PAL.charcoal} strokeWidth={4} strokeDasharray="10 9" opacity={linkK} />
              <PathPulse d={d} t={t} n={1} speed={0.6} r={9} color={PAL.orange} o={linkK} />
            </g>
          ))}
          <g opacity={reg} transform={`translate(${REG.x} ${REG.y}) scale(${mix(0.7, 1, reg)}) translate(${-REG.x} ${-REG.y})`}>
            <circle cx={REG.x} cy={REG.y} r={REG.r} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={5} />
            {/* balance: regulation, not destruction */}
            <line x1={REG.x - 52} y1={REG.y - 10 + Math.sin(t * 2) * 6 * (1 - order)} x2={REG.x + 52} y2={REG.y - 10 - Math.sin(t * 2) * 6 * (1 - order)} stroke={PAL.charcoal} strokeWidth={7} strokeLinecap="round" />
            <path d={`M ${REG.x} ${REG.y - 10} L ${REG.x - 18} ${REG.y + 44} L ${REG.x + 18} ${REG.y + 44} Z`} fill={PAL.charcoal} />
            <circle cx={REG.x - 52} cy={REG.y + 8} r={14} fill={PAL.orange} stroke={PAL.charcoal} strokeWidth={3} />
            <circle cx={REG.x + 52} cy={REG.y + 8} r={14} fill={PAL.orange} stroke={PAL.charcoal} strokeWidth={3} />
          </g>
        </g>
      </svg>
      <Txt x={REG.x - REG.r - 230} y={REG.y - 40} w={200} size={52} dir="ltr" align="right" opacity={reg * fade}>
        EPA
      </Txt>
      <Txt x={REG.x + REG.r + 30} y={REG.y - 40} w={200} size={52} dir="ltr" align="left" opacity={reg * fade}>
        DHA
      </Txt>
    </>
  );
};

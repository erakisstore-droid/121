import type React from 'react';
import {PAL, at} from '../config';
import {AxonMyelin, BrainSpine, Plate} from '../art/body';
import {PathPulse} from '../art/common';
import {HeartLine, NodeDot} from '../../chol/art/objects';
import {EASE, ramp} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';
import {useAbsT} from '../../ms/lib/time';

export const BRAIN7 = {x: 280, y: 640, s: 0.82} as const;
const AXON = {x0: 470, x1: 880, y: 880} as const;
export const PLATE7 = {x: 300, y: 1360, r: 140} as const;
export const HEART7 = {x: 770, y: 1360, r: 118} as const;

/** Beats 10–12 (p7): brain + spinal cord; axon with myelin and a localized immune-affected region; links to food plate and heart. */
export const Neuro: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const draw = ramp(t, at(10, 0.45), at(10, 1), EASE.out);
  const nerveD = `M ${BRAIN7.x + 18} ${BRAIN7.y + 260} C ${BRAIN7.x + 120} ${BRAIN7.y + 260}, ${AXON.x0 - 120} ${AXON.y}, ${AXON.x0 - 30} ${AXON.y}`;
  const nerve = ramp(t, at(11, 0), at(11, 0.25));
  const axonIn = ramp(t, at(11, 0.15), at(11, 0.35), EASE.out);
  const immune = ramp(t, at(11, 0.5), at(11, 0.85));
  const cordEnd = {x: BRAIN7.x, y: BRAIN7.y + 48 + 520 * BRAIN7.s};
  const toPlate = `M ${cordEnd.x} ${cordEnd.y} C ${cordEnd.x} ${cordEnd.y + 60}, ${PLATE7.x} ${PLATE7.y - PLATE7.r - 80}, ${PLATE7.x} ${PLATE7.y - PLATE7.r - 6}`;
  const toHeart = `M ${AXON.x1 + 30} ${AXON.y} C ${AXON.x1 + 60} ${AXON.y + 200}, ${HEART7.x} ${HEART7.y - HEART7.r - 120}, ${HEART7.x} ${HEART7.y - HEART7.r - 6}`;
  const between = `M ${PLATE7.x + PLATE7.r + 6} ${PLATE7.y} L ${HEART7.x - HEART7.r - 6} ${HEART7.y}`;
  const link = ramp(t, at(12, 0.05), at(12, 0.35));
  const nodes = ramp(t, at(12, 0.15), at(12, 0.35), EASE.out);
  const pulse = ramp(t, at(12, 0.35), at(12, 0.45));
  const beat = Math.max(0, Math.sin(t * Math.PI * 2 * 1.1)) ** 6;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <BrainSpine x={BRAIN7.x} y={BRAIN7.y} s={BRAIN7.s} draw={draw} opacity={ramp(t, at(10, 0.4), at(10, 0.6))} />
      {nerve > 0.001 ? <path d={nerveD} fill="none" stroke={PAL.charcoal} strokeWidth={6} strokeLinecap="round" {...drawOn(nerveD, nerve)} /> : null}
      <g transform={`translate(0 ${(1 - axonIn) * 30})`}>
        <AxonMyelin x0={AXON.x0} x1={AXON.x1} y={AXON.y} t={t} immune={immune} opacity={axonIn} />
      </g>
      {link > 0.001
        ? [toPlate, toHeart, between].map((d) => (
            <g key={d}>
              <path d={d} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(d, link)} />
              <PathPulse d={d} t={t} n={1} speed={0.5} r={10} color={PAL.orange} o={pulse} />
            </g>
          ))
        : null}
      <g opacity={nodes}>
        <Plate cx={PLATE7.x} cy={PLATE7.y} r={PLATE7.r} rim={1} fish={[1, 0, 1]} extras={1} t={t} />
        <circle cx={HEART7.x} cy={HEART7.y} r={HEART7.r} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
        <HeartLine cx={HEART7.x} cy={HEART7.y + 10} s={74} beat={beat} />
        <NodeDot x={PLATE7.x} y={PLATE7.y - PLATE7.r - 6} />
        <NodeDot x={HEART7.x} y={HEART7.y - HEART7.r - 6} />
      </g>
    </svg>
  );
};

import type React from 'react';
import {PAL, at} from '../config';
import {PathPulse} from '../art/common';
import {Fish, type FishKind} from '../art/fish';
import {pageDelta} from '../frame';
import {CHAINS, EMBLEM} from './Intro';
import {EASE, ramp} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';
import {useAbsT} from '../../ms/lib/time';
import {Txt} from '../../ms/ui/primitives';

export const FISH = [
  {kind: 'sardine' as FishKind, label: 'سردين', y: 700},
  {kind: 'mackerel' as FishKind, label: 'ماكريل', y: 990},
  {kind: 'salmon' as FishKind, label: 'سلمون', y: 1290},
];
export const SHARED = {x: 900, y0: 640, y1: 1450} as const;

/** Beat 04 (p2): EPA/DHA chains travel to three fish; nutrient markers flow into a shared pathway. */
export const FishSources: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const d1 = pageDelta('p1', 'p2');
  const epaEnd = {x: EMBLEM.x + EMBLEM.r - 10 + CHAINS.epa.len + d1.x, y: CHAINS.epa.y};
  const dhaEnd = {x: EMBLEM.x + EMBLEM.r + 10 + CHAINS.dha.len + d1.x, y: CHAINS.dha.y};
  const reveal = (i: number) => ramp(t, at(4, 0.08 + i * 0.18), at(4, 0.26 + i * 0.18), EASE.out);
  const links = FISH.map((f, i) => {
    const s = i === 0 ? epaEnd : dhaEnd;
    const d = `M ${s.x} ${s.y} C ${s.x + 260} ${s.y}, ${120} ${f.y}, ${330} ${f.y}`;
    return {d, k: ramp(t, at(4, 0.02 + i * 0.18), at(4, 0.2 + i * 0.18))};
  });
  const shared = `M ${SHARED.x} ${SHARED.y0} L ${SHARED.x} ${SHARED.y1} Q ${SHARED.x} ${SHARED.y1 + 40} ${SHARED.x + 40} ${SHARED.y1 + 40} L ${SHARED.x + 400} ${SHARED.y1 + 40}`;
  const sharedK = ramp(t, at(4, 0.5), at(4, 0.75));
  const feeders = FISH.map((f) => `M ${770} ${f.y} L ${SHARED.x} ${f.y}`);
  const flow = ramp(t, at(4, 0.65), at(4, 0.8));

  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {links.map((l, i) => (l.k > 0.001 ? <path key={i} d={l.d} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(l.d, l.k)} /> : null))}
        {links.map((l, i) => (
          <PathPulse key={`p${i}`} d={l.d} t={t + i * 0.2} n={2} r={9} color={PAL.orange} o={ramp(l.k, 0.9, 1)} />
        ))}
        {sharedK > 0.001 ? (
          <>
            {feeders.map((d) => (
              <path key={d} d={d} fill="none" stroke={PAL.charcoal} strokeWidth={4} opacity={0.8} {...drawOn(d, sharedK)} />
            ))}
            <path d={shared} fill="none" stroke={PAL.charcoal} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" {...drawOn(shared, sharedK)} />
          </>
        ) : null}
        {feeders.map((d, i) => (
          <PathPulse key={`f${i}`} d={`${d} L ${SHARED.x} ${SHARED.y1} L ${SHARED.x + 400} ${SHARED.y1 + 40}`} t={t + i * 0.33} n={2} speed={0.35} r={10} color={PAL.orange} o={flow} />
        ))}
        {FISH.map((f, i) => (
          <Fish key={f.kind} kind={f.kind} x={560 + (1 - reveal(i)) * 200} y={f.y} s={1} t={t} opacity={reveal(i)} />
        ))}
      </svg>
      {FISH.map((f, i) => (
        <Txt key={f.kind} x={90} y={f.y + 70} w={300} size={46} weight={800} opacity={reveal(i)}>
          {f.label}
        </Txt>
      ))}
    </>
  );
};

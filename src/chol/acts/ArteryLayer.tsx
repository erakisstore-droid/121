import type React from 'react';
import {at} from '../config';
import {ArterySection, LdlTag, flowParticles, innerTop} from '../art/Artery';
import {Ldl3D} from '../art/hero';
import {ENTRY, PLAQUE_X, arteryAt, entryProgress} from '../geom';
import {mix, ramp} from '../../ms/lib/anim';
import {useAbsT} from '../../ms/lib/time';

const FLOW = {count: 46, ldlShare: 0.6} as const;

/** The continuous artery backbone (beats 4–16), with LDL tag and wall retention. */
export const ArteryLayer: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const s = arteryAt(t);

  // Beat 4a: follow one labelled LDL particle (chosen deterministically).
  const t0 = at(4, 0);
  const pick = flowParticles(s, t0, FLOW.count, FLOW.ldlShare).find((p) => p.kind === 'ldl' && p.x > 640 && p.x < 820) ?? flowParticles(s, t0, FLOW.count, 1)[0];
  const tracked = flowParticles(s, t, FLOW.count, FLOW.ldlShare)[pick.id];
  const tag = Math.min(ramp(t, at(4, 0.02), at(4, 0.08)), 1 - ramp(t, at(4, 0.3), at(4, 0.36)));

  // Beat 4b: a few particles cross the intima and are retained beneath it.
  const entering = ENTRY.map((e) => {
    const p = entryProgress(t, e.k);
    const x = PLAQUE_X + e.dx;
    const wallY = innerTop(s, x) - (12 + e.v * s.T * 0.45);
    const start = {x: x + 220, y: s.cy - s.R * 0.2};
    const mid = {x: x + 40, y: innerTop(s, x) + 20};
    const q = p < 0.6 ? p / 0.6 : 1;
    const r = p < 0.6 ? 0 : (p - 0.6) / 0.4;
    return {p, x: mix(mix(start.x, mid.x, q), x, r), y: mix(mix(start.y, mid.y, q), wallY, r)};
  });
  const retained = ENTRY.filter((e) => entryProgress(t, e.k) >= 1).map((e) => ({x: PLAQUE_X + e.dx, v: e.v, o: 1, side: 'top' as const}));

  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}} opacity={ramp(t, at(3, 0.22), at(3, 0.4))}>
      <ArterySection s={s} t={t} flow={{...FLOW, speed: 150, opacity: ramp(t, at(3, 0.35), at(3, 0.55))}} retained={retained}>
        {entering.map((e, i) => (e.p > 0.001 && e.p < 1 ? <Ldl3D key={i} x={e.x} y={e.y} r={14} /> : null))}
        {tag > 0.001 && tracked ? (
          <>
            <Ldl3D x={tracked.x} y={tracked.y} r={15} opacity={tag} />
            <LdlTag x={tracked.x} y={tracked.y} opacity={tag} />
          </>
        ) : null}
      </ArterySection>
    </svg>
  );
};

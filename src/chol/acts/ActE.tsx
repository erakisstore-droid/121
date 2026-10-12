import type React from 'react';
import {PAL, at} from '../config';
import {pageDelta} from '../Board';
import {LdlCluster} from '../art/hero';
import {CalendarIcon, Check, DnaNode, FamilyNode, NodeDot} from '../art/objects';
import {CALENDAR, CARE, DNA, NODES, TRACK, trackX} from '../geom';
import {EASE, mix, ramp} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';
import {useAbsT} from '../../ms/lib/time';
import {Txt} from '../../ms/ui/primitives';


const RING_R = 30;
const TILT = (18 * Math.PI) / 180;
const DNA_C = {x: DNA.x, y: (DNA.y0 + DNA.y1) / 2};
/** Lean the helix (bottom-left → top-right), as on the style board. */
const tilt = (p: {x: number; y: number}) => {
  const dx = p.x - DNA_C.x;
  const dy = p.y - DNA_C.y;
  return {x: DNA_C.x + dx * Math.cos(TILT) - dy * Math.sin(TILT), y: DNA_C.y + dx * Math.sin(TILT) + dy * Math.cos(TILT)};
};
const NEAR = {x: 655, y: 1085, w: 245, h: 225} as const;
const YEAR_WORD: Record<number, string> = {1: 'سنة', 2: 'سنتين', 3: 'سنين', 4: 'سنين', 5: 'سنوات'};
const ringX = (j: number) => CALENDAR.x + ((j + 0.5) * CALENDAR.w) / CALENDAR.rings;

/** Strand point: DNA helix (vertical) morphing into the calendar's binding rings. */
const strandPt = (u: number, strand: 0 | 1, ph: number, k: number) => {
  const a = 2 * Math.PI * DNA.turns * u + ph + strand * Math.PI;
  const raw = {x: DNA.x + DNA.amp * Math.sin(a), y: DNA.y0 + (DNA.y1 - DNA.y0) * u};
  const dna = tilt(raw);
  const j = Math.min(CALENDAR.rings - 1, Math.floor(u * CALENDAR.rings));
  const th = (u * CALENDAR.rings - j) * 2 * Math.PI + strand * Math.PI - Math.PI / 2;
  const ring = {x: ringX(j) + Math.cos(th) * RING_R, y: CALENDAR.y + Math.sin(th) * RING_R};
  return {x: mix(dna.x, ring.x, k), y: mix(dna.y, ring.y, k)};
};

/** Beats 12–13 (page p5): DNA with two related nodes and an inherited LDL particle; helix → calendar rings; pages turn to 5 years. */
export const ActE: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const draw = ramp(t, at(12, 0.2), at(12, 0.45));
  const ph = (t - at(12, 0)) * 0.9 * (1 - ramp(t, at(13, 0), at(13, 0.2)));
  const morph = ramp(t, at(13, 0.02), at(13, 0.25), EASE.inOut);
  const n = 96;
  const strand = (s: 0 | 1) =>
    Array.from({length: n + 1}, (_, i) => strandPt((i / n) * draw, s, ph, morph))
      .map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');
  const rungs = Array.from({length: 16}, (_, i) => (i + 0.5) / 16).filter((u) => u <= draw);

  // two related nodes + inherited LDL particle
  const nodeIn = (k: number) => ramp(t, at(12, 0.4 + k * 0.1), at(12, 0.5 + k * 0.1));
  const nodesOut = ramp(t, at(13, 0), at(13, 0.12));
  const linkP = `M ${DNA.x + 110} ${NODES.parent.y} L ${NODES.parent.x - 86} ${NODES.parent.y}`;
  const linkY = `M ${DNA.x + 70} ${NODES.you.y} L ${NODES.you.x - 86} ${NODES.you.y}`;
  const famD = `M ${NODES.parent.x} ${NODES.parent.y + 86} L ${NODES.you.x} ${NODES.you.y - 86}`;
  const inh = ramp(t, at(12, 0.62), at(12, 0.9), EASE.inOut);
  const ldl = {x: NODES.parent.x + 112, y: mix(NODES.parent.y + 40, NODES.you.y - 40, inh)};
  const ldlO = ramp(t, at(12, 0.58), at(12, 0.64)) * (1 - nodesOut);

  // calendar: body opens under the rings, pages turn 1 → 5 years
  const body = ramp(t, at(13, 0.18), at(13, 0.3), EASE.out);
  const flips = [0, 1, 2, 3].map((i) => ramp(t, at(13, 0.32 + i * 0.09), at(13, 0.4 + i * 0.09), EASE.inOut));
  const years = flips.reduce((a, b) => a + b, 0) + 1;
  const page = Math.min(5, Math.floor(years + 1e-6));
  const flipping = flips.findIndex((f) => f > 0 && f < 1);
  const trackIn = ramp(t, at(13, 0.28), at(13, 0.38));
  const nearer = ramp(t, at(13, 0.78), at(13, 0.9));
  const H = CALENDAR.h * body;
  const pageNum = (p: number, o: number) => (
    <g opacity={o}>
      <text x={CALENDAR.x + CALENDAR.w / 2} y={CALENDAR.y + 330} textAnchor="middle" fontFamily="Cairo" fontWeight={800} fontSize={200} fill={PAL.charcoal}>
        {p}
      </text>
    </g>
  );

  // beat 14: the track runs up the board to the care timeline on page p1
  const d1 = pageDelta('p1', 'p5');
  const careY = CARE.y + d1.y;
  const toP1 = `M ${TRACK.xEnd} ${TRACK.y} L 90 ${TRACK.y} C 50 ${TRACK.y} 50 ${TRACK.y - 40} 50 ${TRACK.y - 80} L 50 ${careY + 40} C 50 ${careY} 70 ${careY} 110 ${careY} L ${CARE.x0} ${careY}`;
  const up = ramp(t, at(14, 0), at(14, 0.3), EASE.inOut);
  const upOut = ramp(t, at(15, 0), at(15, 0.2));

  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {up > 0.001 && upOut < 1 ? <path d={toP1} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={1 - upOut} {...drawOn(toP1, up)} /> : null}
        {/* calendar body + pages */}
        {body > 0.001 ? (
          <g>
            <rect x={CALENDAR.x + 16} y={CALENDAR.y + 22} width={CALENDAR.w} height={H} rx={30} fill={PAL.charcoal} opacity={0.14} />
            <path d={`M ${CALENDAR.x + 60} ${CALENDAR.y + H} L ${CALENDAR.x + 110} ${CALENDAR.y + 40} L ${CALENDAR.x + CALENDAR.w - 110} ${CALENDAR.y + 40} L ${CALENDAR.x + CALENDAR.w - 60} ${CALENDAR.y + H} Z`} fill={PAL.beige} opacity={0.6} />
            <rect x={CALENDAR.x} y={CALENDAR.y} width={CALENDAR.w} height={H} rx={30} fill={PAL.beige} stroke={PAL.charcoal} strokeWidth={4} />
            <rect x={CALENDAR.x + 18} y={CALENDAR.y + 30} width={CALENDAR.w - 36} height={Math.max(0, H - 48)} rx={22} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={3} />
            {body > 0.95 ? (
              <>
                {/* next page underneath */}
                {flipping >= 0 ? pageNum(flipping + 2, 1) : pageNum(page, 1)}
                {/* turning page folds up toward the rings */}
                {flipping >= 0 ? (
                  <g>
                    <rect
                      x={CALENDAR.x + 18}
                      y={CALENDAR.y + 30}
                      width={CALENDAR.w - 36}
                      height={(CALENDAR.h - 48) * Math.abs(1 - 2 * flips[flipping])}
                      rx={22}
                      fill={flips[flipping] < 0.5 ? PAL.offWhite : PAL.beige}
                      stroke={PAL.charcoal}
                      strokeWidth={3}
                    />
                    {flips[flipping] < 0.5 ? (
                      <g transform={`translate(0 ${CALENDAR.y + 30}) scale(1 ${1 - 2 * flips[flipping]}) translate(0 ${-(CALENDAR.y + 30)})`}>{pageNum(flipping + 1, 1)}</g>
                    ) : null}
                  </g>
                ) : null}
              </>
            ) : null}
          </g>
        ) : null}
        {/* strands → rings (cream ribbon with orange rungs) */}
        {draw > 0.001 ? (
          <g>
            {morph < 0.999
              ? rungs.map((u) => {
                  const a = strandPt(u, 0, ph, morph);
                  const b = strandPt(u, 1, ph, morph);
                  return <line key={u} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={PAL.orangeDeep} strokeWidth={10} strokeLinecap="round" opacity={1 - morph} />;
                })
              : null}
            {[0, 1].map((k) => (
              <g key={k}>
                <path d={strand(k as 0 | 1)} fill="none" stroke={PAL.charcoal} strokeWidth={mix(24, 10, morph)} strokeLinecap="round" />
                <path d={strand(k as 0 | 1)} fill="none" stroke={k ? PAL.beige : PAL.offWhite} strokeWidth={mix(16, 4, morph)} strokeLinecap="round" />
              </g>
            ))}
            {[0.28, 0.72].map((u, i) => {
              const p = strandPt(u, 0, ph, 0);
              return u <= draw ? <LdlCluster key={u} x={p.x + 30} y={p.y} r={30} opacity={1 - morph} rot={t * 10 + i * 40} /> : null;
            })}
          </g>
        ) : null}
        {/* two related nodes: family + inherited (DNA) — an LDL cluster follows the inherited path */}
        {nodesOut < 1 ? (
          <g opacity={1 - nodesOut}>
            {[linkP, linkY].map((d, i) => (
              <path key={d} d={d} fill="none" stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" {...drawOn(d, nodeIn(i))} />
            ))}
            <NodeDot x={DNA.x + 110} y={NODES.parent.y} o={nodeIn(0)} />
            <NodeDot x={DNA.x + 70} y={NODES.you.y} o={nodeIn(1)} />
            <path d={famD} fill="none" stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" strokeDasharray="10 9" opacity={nodeIn(1)} />
            <FamilyNode cx={NODES.parent.x} cy={NODES.parent.y} r={86} opacity={nodeIn(0)} />
            <DnaNode cx={NODES.you.x} cy={NODES.you.y} r={86} opacity={nodeIn(1)} />
            <LdlCluster x={ldl.x} y={ldl.y} r={30} opacity={ldlO} rot={t * 20} />
          </g>
        ) : null}
        {/* follow-up track: 0 → 5 years, plus an individualized nearer marker */}
        {trackIn > 0.001 ? (
          <g opacity={trackIn}>
            <line x1={TRACK.xStart} y1={TRACK.y} x2={TRACK.xEnd} y2={TRACK.y} stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" />
            {[0, 1, 2, 3, 4, 5].map((y) => (
              <line key={y} x1={trackX(y)} y1={TRACK.y - 12} x2={trackX(y)} y2={TRACK.y + 12} stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" />
            ))}
            <Check cx={trackX(0)} cy={TRACK.y} r={34} />
            {years < 4.99 ? <circle cx={trackX(years - 1)} cy={TRACK.y} r={13} fill={PAL.charcoal} /> : null}
            <Check cx={trackX(5)} cy={TRACK.y} r={34} opacity={ramp(years, 4.9, 5)} />
            {nearer > 0.001 ? (
              <g opacity={nearer}>
                <path d={`M ${trackX(0)} ${TRACK.y - 40} Q ${trackX(1.25)} ${TRACK.y - 110} ${trackX(2.5)} ${TRACK.y - 40}`} fill="none" stroke={PAL.charcoal} strokeWidth={4} strokeDasharray="8 8" />
                <Check cx={trackX(2.5)} cy={TRACK.y} r={30} dashed />
              </g>
            ) : null}
          </g>
        ) : null}
        {nearer > 0.001 ? (
          <g opacity={nearer} transform={`rotate(6 ${NEAR.x + NEAR.w / 2} ${NEAR.y + NEAR.h / 2}) translate(0 ${(1 - nearer) * 40})`}>
            <rect x={NEAR.x + 10} y={NEAR.y + 14} width={NEAR.w} height={NEAR.h} rx={24} fill={PAL.charcoal} opacity={0.14} />
            <rect x={NEAR.x} y={NEAR.y} width={NEAR.w} height={NEAR.h} rx={24} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
            <CalendarIcon cx={NEAR.x + 70} cy={NEAR.y + 72} s={56} />
          </g>
        ) : null}
      </svg>
      <div style={{position: 'absolute', inset: 0, opacity: nearer, rotate: '6deg', transformOrigin: `${NEAR.x + NEAR.w / 2}px ${NEAR.y + NEAR.h / 2}px`, translate: `0 ${(1 - nearer) * 40}px`}}>
        <Txt x={NEAR.x + 10} y={NEAR.y + 104} w={NEAR.w - 20} size={40} weight={800}>
          أقرب حسب الخطورة
        </Txt>
      </div>
      <Txt x={CALENDAR.x} y={CALENDAR.y + 370} w={CALENDAR.w} size={64} weight={800} opacity={body > 0.95 && flipping < 0 ? 1 : 0}>
        {YEAR_WORD[page]}
      </Txt>
    </>
  );
};

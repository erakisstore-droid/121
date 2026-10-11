import type React from 'react';
import {PAL, at} from '../config';
import {LdlDot, LdlTag} from '../art/Artery';
import {Check, Sneaker} from '../art/objects';
import {CAL, DNA, TREE, calCell} from '../geom';
import {EASE, mix, ramp} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';
import {useAbsT} from '../../ms/lib/time';
import {Txt} from '../../ms/ui/primitives';

const Person: React.FC<{x: number; y: number; r: number; o: number; you?: boolean}> = ({x, y, r, o, you}) =>
  o <= 0.001 ? null : (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={you ? 6 : 4} />
      <circle cx={x} cy={y - r * 0.2} r={r * 0.24} fill={PAL.beige} />
      <path d={`M ${x - r * 0.5} ${y + r * 0.55} C ${x - r * 0.45} ${y + r * 0.08}, ${x + r * 0.45} ${y + r * 0.08}, ${x + r * 0.5} ${y + r * 0.55} Z`} fill={PAL.beige} />
    </g>
  );

/** Strand point: DNA (vertical helix) morphing into a calendar-strip edge (horizontal). */
const strandPt = (u: number, strand: 0 | 1, ph: number, k: number) => {
  const a = 2 * Math.PI * DNA.turns * u + ph + strand * Math.PI;
  const dna = {x: DNA.x + DNA.amp * Math.sin(a), y: DNA.y0 + (DNA.y1 - DNA.y0) * u};
  const cal = {x: CAL.x1 - (CAL.x1 - CAL.x0) * u, y: CAL.y + strand * CAL.h};
  return {x: mix(dna.x, cal.x, k), y: mix(dna.y, cal.y, k)};
};

/** Beats 12–13: DNA → family tree with an inherited LDL path; DNA strands become a calendar strip. */
export const ActE: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const draw = ramp(t, at(12, 0.02), at(12, 0.25));
  const ph = (t - at(12, 0)) * 0.9;
  const morph = ramp(t, at(13, 0), at(13, 0.2), EASE.inOut);
  const n = 70;
  const strand = (s: 0 | 1) =>
    Array.from({length: n + 1}, (_, i) => strandPt((i / n) * draw, s, ph, morph))
      .map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');
  const rungs = Array.from({length: 14}, (_, i) => (i + 0.5) / 14).filter((u) => u <= draw);

  // family tree
  const tree = (k: number) => ramp(t, at(12, 0.15 + k * 0.08), at(12, 0.25 + k * 0.08));
  const treeOut = ramp(t, at(13, 0), at(13, 0.12));
  const midG = (TREE.g1[0].x + TREE.g1[1].x) / 2;
  const lines = [
    {d: `M ${TREE.g1[0].x} ${TREE.g1[0].y} L ${TREE.g1[1].x} ${TREE.g1[1].y}`, k: tree(0)},
    {d: `M ${midG} ${TREE.g1[0].y} L ${TREE.parent.x} ${TREE.parent.y}`, k: tree(1)},
    {d: `M ${TREE.parent.x} ${TREE.parent.y} L ${TREE.parent.x} 920 L ${TREE.you.x} 920 L ${TREE.you.x} ${TREE.you.y}`, k: tree(2)},
    {d: `M ${TREE.parent.x} 920 L ${TREE.sib.x} 920 L ${TREE.sib.x} ${TREE.sib.y}`, k: tree(2)},
  ];
  const branches = [
    {d: `M ${DNA.x + 50} ${TREE.g1[0].y} L ${TREE.g1[0].x - 60} ${TREE.g1[0].y}`, k: tree(0)},
    {d: `M ${DNA.x + 50} ${TREE.parent.y} L ${TREE.parent.x - 60} ${TREE.parent.y}`, k: tree(1)},
    {d: `M ${DNA.x + 50} ${TREE.you.y} L ${TREE.you.x - 72} ${TREE.you.y}`, k: tree(2)},
  ];
  // inherited LDL path: grandparent → parent → you
  const inh = ramp(t, at(12, 0.4), at(12, 0.78), EASE.inOut);
  const route = [TREE.g1[0], {x: midG, y: TREE.g1[0].y}, TREE.parent, {x: TREE.parent.x, y: 920}, {x: TREE.you.x, y: 920}, {x: TREE.you.x + 52, y: TREE.you.y - 52}];
  const seg = inh * (route.length - 1);
  const si = Math.min(route.length - 2, Math.floor(seg));
  const sf = seg - si;
  const ldl = {x: mix(route[si].x, route[si + 1].x, sf), y: mix(route[si].y, route[si + 1].y, sf)};
  const ldlO = ramp(t, at(12, 0.36), at(12, 0.42)) * (1 - treeOut);
  const shoe = ramp(t, at(12, 0.75), at(12, 0.88)) * (1 - treeOut);

  // calendar strip
  const calIn = ramp(t, at(13, 0.15), at(13, 0.3));
  const calOut = ramp(t, at(14, 0), at(14, 0.06));
  const cw = (CAL.x1 - CAL.x0) / CAL.cells;
  const m0 = ramp(t, at(13, 0.22), at(13, 0.32));
  const travel = ramp(t, at(13, 0.32), at(13, 0.6), EASE.inOut);
  const m5 = ramp(t, at(13, 0.58), at(13, 0.66));
  const bracket = ramp(t, at(13, 0.6), at(13, 0.72));
  const closer = ramp(t, at(13, 0.78), at(13, 0.9));
  const dnaOpacity = 1 - calOut;

  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {/* strands + rungs (rungs fade while strands become the calendar edges) */}
        <g opacity={dnaOpacity}>
          {calIn > 0.001 ? (
            <g opacity={calIn * (1 - calOut)}>
              <rect x={CAL.x0} y={CAL.y} width={CAL.x1 - CAL.x0} height={CAL.h} rx={18} fill={PAL.offWhite} />
              <rect x={CAL.x0} y={CAL.y} width={CAL.x1 - CAL.x0} height={34} rx={16} fill={PAL.beige} />
              {Array.from({length: CAL.cells - 1}, (_, i) => (
                <line key={i} x1={CAL.x0 + (i + 1) * cw} y1={CAL.y + 34} x2={CAL.x0 + (i + 1) * cw} y2={CAL.y + CAL.h} stroke={PAL.line} strokeWidth={3} />
              ))}
            </g>
          ) : null}
          <path d={strand(0)} fill="none" stroke={PAL.charcoal} strokeWidth={7} strokeLinecap="round" />
          <path d={strand(1)} fill="none" stroke={PAL.charcoal} strokeWidth={7} strokeLinecap="round" />
          {morph < 0.999
            ? rungs.map((u) => {
                const a = strandPt(u, 0, ph, morph);
                const b = strandPt(u, 1, ph, morph);
                return <line key={u} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={PAL.beige} strokeWidth={8} strokeLinecap="round" opacity={1 - morph} />;
              })
            : null}
          {calIn > 0.001 ? (
            <g opacity={calIn * (1 - calOut)}>
              <Check cx={calCell(0)} cy={CAL.y + 88} r={34} opacity={m0} />
              {travel > 0.001 && travel < 1 ? <circle cx={mix(calCell(0), calCell(5), travel)} cy={CAL.y + 88} r={12} fill={PAL.charcoal} /> : null}
              <Check cx={calCell(5)} cy={CAL.y + 88} r={34} opacity={m5} />
              <Check cx={calCell(2)} cy={CAL.y + 88} r={30} opacity={closer * 0.85} dashed />
              {bracket > 0.001 ? (
                <path
                  d={`M ${calCell(0)} ${CAL.y + CAL.h + 18} L ${calCell(0)} ${CAL.y + CAL.h + 40} L ${calCell(5)} ${CAL.y + CAL.h + 40} L ${calCell(5)} ${CAL.y + CAL.h + 18}`}
                  fill="none"
                  stroke={PAL.charcoal}
                  strokeWidth={5}
                  strokeLinejoin="round"
                  {...drawOn(`M ${calCell(0)} ${CAL.y + CAL.h + 18} L ${calCell(0)} ${CAL.y + CAL.h + 40} L ${calCell(5)} ${CAL.y + CAL.h + 40} L ${calCell(5)} ${CAL.y + CAL.h + 18}`, bracket)}
                />
              ) : null}
            </g>
          ) : null}
        </g>
        {/* family tree */}
        {treeOut < 1 ? (
          <g opacity={1 - treeOut}>
            {[...branches, ...lines].map((l, i) => (l.k > 0.001 ? <path key={i} d={l.d} fill="none" stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" {...drawOn(l.d, l.k)} /> : null))}
            <Person x={TREE.g1[0].x} y={TREE.g1[0].y} r={56} o={tree(0)} />
            <Person x={TREE.g1[1].x} y={TREE.g1[1].y} r={56} o={tree(0)} />
            <Person x={TREE.parent.x} y={TREE.parent.y} r={58} o={tree(1)} />
            <Person x={TREE.you.x} y={TREE.you.y} r={68} o={tree(2)} you />
            <Person x={TREE.sib.x} y={TREE.sib.y} r={56} o={tree(2)} />
            <LdlDot x={ldl.x} y={ldl.y} r={14} opacity={ldlO} />
            <LdlTag x={ldl.x} y={ldl.y} opacity={ldlO} />
            <Sneaker cx={TREE.you.x - 10} cy={TREE.you.y + 160} s={72} opacity={shoe} />
          </g>
        ) : null}
      </svg>
      <Txt x={TREE.you.x - 120} y={TREE.you.y + 72} w={240} size={40} weight={800} opacity={tree(2) * (1 - treeOut)}>
        أنت
      </Txt>
      <Txt x={(calCell(0) + calCell(5)) / 2 - 200} y={CAL.y + CAL.h + 50} w={400} size={46} weight={800} opacity={bracket * (1 - calOut)}>
        5 سنوات
      </Txt>
    </>
  );
};

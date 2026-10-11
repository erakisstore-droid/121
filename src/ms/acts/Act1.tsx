import type React from 'react';
import {PAL, at} from '../config';
import {LegsView} from '../diagrams/LegsView';
import {LiftSignal, Node, ToneGauge} from '../diagrams/icons';
import {Floor} from '../figure/draw';
import {strideSpeed} from '../figure/gait';
import {WalkerFigure, dimsFor, walkerPoses} from '../figure/Walker';
import {mix, mixRect, ramp, type Rect} from '../lib/anim';
import {LEG_CARDS, NODES, WALK, pollRowScreen, walkState} from '../lib/geom';
import {curve, drawOn} from '../lib/paths';
import {useAbsT} from '../lib/time';
import {CardRect} from '../ui/primitives';

const SPEED = strideSpeed(dimsFor(WALK.L));

/** Beats 01–03: walking figure → two leg views → two motor-control pathways. */
export const Act1: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const w = walkState(t, SPEED);

  // Beat 1: one hesitant step with a light toe catch (no fall).
  const catchK = Math.exp(-((t - at(1, 0.58)) ** 2) / (2 * 0.3 ** 2));
  const shrink = ramp(t, at(2, 0), at(2, 0.33));
  const vanish = ramp(t, at(3, 0), at(3, 0.25));
  const sc = mix(1, 0.5, shrink);
  const target = {x: mix(w.x, 495, shrink), y: mix(WALK.floorY, 800, shrink) - 90 * vanish};
  const tf = (p: {x: number; y: number}) => ({x: (p.x - w.x) * sc + target.x, y: (p.y - WALK.floorY) * sc + target.y});
  const poses = walkerPoses({x: w.x, floorY: WALK.floorY, phase: w.phase, L: WALK.L, near: {footDrop: 0.85 * catchK}});
  const figOpacity = 1 - vanish;

  // Floor: big line → small figure line → line under the leg views.
  const floorY = mix(mix(WALK.floorY, 800, shrink), NODES.junction.y, ramp(t, at(3, 0.05), at(3, 0.3)));
  const floorFade = 1 - ramp(t, at(4, 0), at(4, 0.15));

  // Beat 2: leg views grow out of the figure.
  const grow = ramp(t, at(2, 0.15), at(2, 0.48));
  const lift = ramp(t, at(3, 0.02), at(3, 0.3));
  const leave = ramp(t, at(4, 0), at(4, 0.15));
  const seed = (x: number): Rect => ({x, y: 740, w: 40, h: 60});
  const cardR = (key: 'stiff' | 'drop'): Rect => {
    const base = mixRect(seed(key === 'stiff' ? 505 : 445), LEG_CARDS[key], grow);
    const up = {...base, y: base.y - LEG_CARDS.up * lift};
    return {...up, y: up.y - 60 * leave};
  };
  const stiffR = cardR('stiff');
  const dropR = cardR('drop');
  const cardsOpacity = Math.min(ramp(t, at(2, 0.12), at(2, 0.3)), 1 - leave);
  const viewPhase = (t - at(2, 0)) / 2.1;

  // Connectors from the small figure's near knee to both views.
  const knee = tf(poses.near.knee);
  const conn = ramp(t, at(2, 0.3), at(2, 0.6)) * (1 - vanish);

  // Beat 3: floor line branches into two pathways ending in motor-control effect nodes.
  const ticks = ramp(t, at(3, 0.25), at(3, 0.4));
  const branch = ramp(t, at(3, 0.35), at(3, 0.65));
  const nodeIn = ramp(t, at(3, 0.55), at(3, 0.75));
  // Beat 4: nodes travel to the matching poll rows and become outline anchors.
  const travel = ramp(t, at(4, 0.05), at(4, 0.3));
  const fadeBranch = ramp(t, at(4, 0.18), at(4, 0.3));
  const rowStart = (row: 'spasticity' | 'footDrop') => {
    const r = pollRowScreen(row, at(4, 0.3));
    return {x: r.x + r.w, y: r.y + r.h / 2};
  };
  const nodeAt = (key: 'stiff' | 'drop') => {
    const a = NODES[key];
    const b = rowStart(key === 'stiff' ? 'spasticity' : 'footDrop');
    return {x: mix(a.x, b.x, travel), y: mix(a.y, b.y, travel)};
  };
  const nStiff = nodeAt('stiff');
  const nDrop = nodeAt('drop');
  const nr = mix(NODES.r, 9, travel) * nodeIn;
  const J = {x: NODES.junction.x, y: floorY};
  const pStiff = curve(J, {x: nStiff.x, y: nStiff.y - nr}, 0.55);
  const pDrop = curve(J, {x: nDrop.x, y: nDrop.y - nr}, 0.55);
  const branchOpacity = 1 - fadeBranch;

  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <Floor x0={90} x1={900} y={floorY} w={5} opacity={floorFade} ticks={shrink > 0.5 && vanish < 1} scroll={w.scroll * sc} />
      {figOpacity > 0.001 ? (
        <g opacity={figOpacity} transform={`translate(${target.x - w.x * sc} ${target.y - WALK.floorY * sc}) scale(${sc})`}>
          <WalkerFigure poses={poses} full phase={w.phase} />
        </g>
      ) : null}
      {conn > 0.001
        ? (['stiff', 'drop'] as const).map((k) => {
            const r = k === 'stiff' ? stiffR : dropR;
            const d = `M ${knee.x} ${knee.y} L ${r.x + r.w / 2} ${r.y}`;
            return <path key={k} d={d} stroke={PAL.charcoal} strokeWidth={3} fill="none" strokeLinecap="round" opacity={1 - vanish} {...drawOn(d, conn)} />;
          })
        : null}
      {/* card bottom ticks to the floor line */}
      {ticks > 0.001 && branchOpacity > 0.001
        ? [stiffR, dropR].map((r, i) => {
            const d = `M ${r.x + r.w / 2} ${r.y + r.h} L ${r.x + r.w / 2} ${floorY}`;
            return <path key={i} d={d} stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" opacity={Math.min(cardsOpacity, branchOpacity)} {...drawOn(d, ticks)} />;
          })
        : null}
      {branch > 0.001 && branchOpacity > 0.001
        ? [pStiff, pDrop].map((d, i) => (
            <path key={i} d={d} stroke={PAL.charcoal} strokeWidth={5} fill="none" strokeLinecap="round" opacity={branchOpacity} {...drawOn(d, branch)} />
          ))
        : null}
      <CardRect r={stiffR} opacity={cardsOpacity} />
      <CardRect r={dropR} opacity={cardsOpacity} />
      <LegsView id="a1-stiff" r={stiffR} phase={viewPhase} near={{stiffness: 1}} muscles={{calf: 1, thigh: 1, tension: 0.8}} opacity={cardsOpacity} hx={0.46} />
      <LegsView id="a1-drop" r={dropR} phase={viewPhase + 0.08} near={{footDrop: 1}} muscles={{front: 0.9}} opacity={cardsOpacity} hx={0.46} />
      {nodeIn > 0.001 && travel < 1 ? (
        <>
          <Node cx={nStiff.x} cy={nStiff.y} s={nr} opacity={1}>
            <ToneGauge cx={nStiff.x} cy={nStiff.y} s={nr} level={mix(0.45, 0.9, ramp(t, at(3, 0.65), at(3, 0.9)))} opacity={1 - travel} />
          </Node>
          <Node cx={nDrop.x} cy={nDrop.y} s={nr} opacity={1}>
            <LiftSignal cx={nDrop.x} cy={nDrop.y} s={nr} strength={0.34} opacity={1 - travel} />
          </Node>
        </>
      ) : null}
    </svg>
  );
};

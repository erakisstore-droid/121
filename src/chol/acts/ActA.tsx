import {getLength, getPointAtLength} from '@remotion/paths';
import type React from 'react';
import {spring, useVideoConfig} from 'remotion';
import {PAL, at} from '../config';
import {HeroTube} from '../art/hero';
import {Heart} from '../art/objects';
import {AGE, ARTERY_BASE, HEART1, TUBE1, ageX} from '../geom';
import {EASE, mix, ramp} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';
import {useAbsT} from '../../ms/lib/time';

type P = {x: number; y: number};
const N = 30;
const seg = (a: P, b: P) => Array.from({length: N}, (_, i) => ({x: mix(a.x, b.x, i / N), y: mix(a.y, b.y, i / N)}));

/** Tube body outline, sampled as 4 segments (left, bottom, right, top) to match the artery rectangle. */
const tubeOutline = (x: number, y: number, w: number, h: number): P[] => {
  const bodyY = y + h * 0.13 * 0.8;
  const bodyH = h - h * 0.13 * 0.8;
  const r = w / 2;
  const bottomArc = Array.from({length: N}, (_, i) => {
    const a = Math.PI - (Math.PI * i) / N;
    return {x: x + r + Math.cos(a) * r, y: bodyY + bodyH - r + Math.sin(a) * r};
  });
  return [...seg({x, y: bodyY}, {x, y: bodyY + bodyH - r}), ...bottomArc, ...seg({x: x + w, y: bodyY + bodyH - r}, {x: x + w, y: bodyY}), ...seg({x: x + w, y: bodyY}, {x, y: bodyY})];
};
const arteryOutline = (): P[] => {
  const {x0, x1, cy, R, T} = ARTERY_BASE;
  const top = cy - R - T;
  const bot = cy + R + T;
  return [...seg({x: x0, y: top}, {x: x0, y: bot}), ...seg({x: x0, y: bot}, {x: x1, y: bot}), ...seg({x: x1, y: bot}, {x: x1, y: top}), ...seg({x: x1, y: top}, {x: x0, y: top})];
};

/** Beats 01–03: tube assembles → outline extends to the heart (pulse) → age timeline → tube outline morphs into the artery. */
export const ActA: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const {fps} = useVideoConfig();
  const T = TUBE1;

  // Beat 1
  const build = spring({frame: Math.round(t * fps), fps, config: {damping: 16, stiffness: 90, mass: 0.9}, durationInFrames: Math.round(0.95 * fps)});
  const level = mix(0, 0.62, ramp(t, at(1, 0.22), at(1, 0.55), EASE.out));
  const label = ramp(t, at(1, 0.45), at(1, 0.65), EASE.out);
  const connD = `M ${T.x + T.w} ${T.y + T.h * 0.35} C ${T.x + T.w + 150} ${T.y + T.h * 0.35}, ${HEART1.x - 250} ${HEART1.y}, ${HEART1.x - 150} ${HEART1.y}`;
  const conn = ramp(t, at(1, 0.3), at(1, 0.6));
  const heartIn = ramp(t, at(1, 0.5), at(1, 0.68), EASE.out);
  const pulseK = ramp(t, at(1, 0.66), at(1, 0.92), (x) => x);
  const L = getLength(connD);
  const pulsePt = pulseK > 0 && pulseK < 1 ? getPointAtLength(connD, pulseK * L) : null;
  const arrive = Math.exp(-((t - at(1, 0.95)) ** 2) / 0.02) + 0.5 * Math.max(0, Math.sin(t * Math.PI * 2 * 1.1)) ** 6;

  // Beat 2: the connector continues down into the age timeline; 20+ marker guides back to the tube
  const tlD = `M ${HEART1.x - 150} ${HEART1.y} L ${HEART1.x - 150} ${AGE.y - 50} Q ${HEART1.x - 150} ${AGE.y} ${HEART1.x - 100} ${AGE.y} L ${AGE.xYoung + 20} ${AGE.y}`;
  const axis = `M ${AGE.xYoung + 20} ${AGE.y} L ${AGE.xOld} ${AGE.y}`;
  const tl = ramp(t, at(2, 0.05), at(2, 0.3));
  const axisK = ramp(t, at(2, 0.25), at(2, 0.55));
  const ageM = mix(12, 20, ramp(t, at(2, 0.45), at(2, 0.7), EASE.out));
  const marker = ramp(t, at(2, 0.4), at(2, 0.52));
  const guideD = `M ${ageX(20)} ${AGE.y - 140} C ${ageX(20)} ${AGE.y - 260}, ${T.x + T.w + 90} ${T.y + T.h + 40}, ${T.x + T.w * 0.5 + 30} ${T.y + T.h + 22}`;
  const guide = ramp(t, at(2, 0.68), at(2, 0.92));
  const tubeNudge = Math.exp(-((t - at(2, 0.95)) ** 2) / 0.03);

  // Beat 3: tube outline morphs into the artery cutaway
  const morph = ramp(t, at(3, 0.02), at(3, 0.3), EASE.inOut);
  const tubeFade = ramp(t, at(3, 0), at(3, 0.08));
  const outlineOut = ramp(t, at(3, 0.32), at(3, 0.42));
  const b1 = ramp(t, at(3, 0), at(3, 0.12));
  const heart = {x: mix(HEART1.x, 800, b1), y: mix(HEART1.y, 600, b1), s: mix(HEART1.s, 70, b1)};
  const a = tubeOutline(T.x, T.y, T.w, T.h);
  const b = arteryOutline();
  const morphPts = a.map((p, i) => `${mix(p.x, b[i].x, morph).toFixed(1)},${mix(p.y, b[i].y, morph).toFixed(1)}`).join(' ');
  const fade2 = 1 - ramp(t, at(3, 0), at(3, 0.1));

  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {conn > 0.001 && fade2 > 0.001 ? <path d={connD} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" opacity={fade2} {...drawOn(connD, conn)} /> : null}
      {pulsePt ? <circle cx={pulsePt.x} cy={pulsePt.y} r={13} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} /> : null}
      {tl > 0.001 && fade2 > 0.001 ? (
        <g opacity={fade2}>
          <path d={tlD} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" {...drawOn(tlD, tl)} />
          <path d={axis} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(axis, axisK)} />
          {[10, 20, 30, 40, 50, 60].map((age, i) => {
            const k = ramp(t, at(2, 0.3 + i * 0.04), at(2, 0.4 + i * 0.04));
            return (
              <g key={age} opacity={k}>
                <line x1={ageX(age)} y1={AGE.y - 14} x2={ageX(age)} y2={AGE.y + 14} stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" />
                <text x={ageX(age)} y={AGE.y + 62} textAnchor="middle" fontFamily="Cairo" fontWeight={700} fontSize={40} fill={PAL.charcoal}>
                  {age}
                </text>
              </g>
            );
          })}
          {marker > 0.001 ? (
            <g opacity={marker} transform={`translate(${ageX(ageM)} ${AGE.y})`}>
              <rect x={-66} y={-140} width={132} height={68} rx={34} fill={PAL.charcoal} />
              <text x={0} y={-92} textAnchor="middle" fontFamily="Cairo" fontWeight={800} fontSize={42} fill={PAL.offWhite}>
                20+
              </text>
              <path d="M -12 -74 L 0 -56 L 12 -74 Z" fill={PAL.charcoal} />
              <circle r={15} fill={PAL.charcoal} />
            </g>
          ) : null}
          {guide > 0.001 ? <path d={guideD} fill="none" stroke={PAL.charcoal} strokeWidth={4} strokeDasharray="2 12" strokeLinecap="round" opacity={0.85 * Math.min(1, guide * 3)} /> : null}
          {guide > 0.001 ? (() => {
            const gp = getPointAtLength(guideD, guide * getLength(guideD));
            return gp ? <circle cx={gp.x} cy={gp.y} r={11} fill={PAL.charcoal} /> : null;
          })() : null}
        </g>
      ) : null}
      {/* morphing outline: tube → artery wall */}
      {morph > 0.001 && outlineOut < 1 ? <polygon points={morphPts} fill={PAL.offWhite} fillOpacity={0.35 * (1 - outlineOut)} stroke={PAL.charcoal} strokeWidth={5} strokeLinejoin="round" opacity={1 - outlineOut} /> : null}
      <g transform={`translate(${T.x + T.w / 2} ${T.y + T.h}) scale(${1 + 0.04 * tubeNudge}) translate(${-(T.x + T.w / 2)} ${-(T.y + T.h)})`}>
        <HeroTube id="tube1" x={T.x} y={T.y} w={T.w} h={T.h} level={level} build={build} label={label} opacity={Math.min(ramp(t, 0, 0.08), 1 - tubeFade)} />
      </g>
      <Heart cx={heart.x} cy={heart.y} s={heart.s} beat={arrive} opacity={heartIn * (1 - ramp(t, at(4, 0), at(4, 0.08)))} />
    </svg>
  );
};

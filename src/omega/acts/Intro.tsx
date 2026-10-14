import type React from 'react';
import {spring, useVideoConfig} from 'remotion';
import {PAL, at} from '../config';
import {OmegaCapsule, circlePoints, dropPoints, polyStr} from '../art/capsule';
import {FattyAcidMotif} from '../art/fatty';
import {PathPulse} from '../art/common';
import {BrainNode, HeartLine, NodeDot} from '../../chol/art/objects';
import {EASE, mix, ramp} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';
import {useAbsT} from '../../ms/lib/time';
import {Txt} from '../../ms/ui/primitives';

export const EMBLEM = {x: 540, y: 860, r: 190} as const;
export const CHAINS = {epa: {y: 700, len: 520}, dha: {y: 880, len: 560}, ala: {y: 1060, len: 260}} as const;
const HEART = {x: 230, y: 1330} as const;
const BRAIN = {x: 850, y: 1330} as const;

/** Beats 01–03 (p1): 3D capsule → droplet → heart & brain paths; droplet → ω-3 emblem; emblem → fatty-acid family. */
export const Intro: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const {fps} = useVideoConfig();

  // Beat 1
  const form = spring({frame: Math.round(t * fps), fps, config: {damping: 15, stiffness: 100}});
  const close = 1.4 * (1 - ramp(t, 0.05, 0.6, EASE.out));
  const open = close + 0.5 * ramp(t, at(1, 0.25), at(1, 0.4)) * (1 - ramp(t, at(2, 0), at(2, 0.2)));
  const drop = ramp(t, at(1, 0.3), at(1, 0.48), EASE.out);
  const dropPos = {x: mix(540, 540, drop), y: mix(860, 640, drop)};
  const toEmblem = ramp(t, at(2, 0), at(2, 0.45), EASE.inOut);
  const dp = {x: mix(dropPos.x, EMBLEM.x, toEmblem), y: mix(dropPos.y, EMBLEM.y, toEmblem)};
  const paths = ramp(t, at(1, 0.45), at(1, 0.72));
  const toHeart = `M ${dp.x - 40} ${dp.y + 30} C ${dp.x - 260} ${dp.y + 120}, ${HEART.x + 40} ${HEART.y - 320}, ${HEART.x} ${HEART.y - 120}`;
  const toBrain = `M ${dp.x + 40} ${dp.y + 30} C ${dp.x + 260} ${dp.y + 120}, ${BRAIN.x - 40} ${BRAIN.y - 320}, ${BRAIN.x} ${BRAIN.y - 120}`;
  const organs = ramp(t, at(1, 0.6), at(1, 0.78));
  const capsuleFlat = ramp(t, at(2, 0), at(2, 0.5));
  const capsuleOut = ramp(t, at(2, 0.25), at(2, 0.6));

  // Beat 2: droplet outline → emblem
  const morph = ramp(t, at(2, 0.1), at(2, 0.6), EASE.inOut);
  const dr = mix(56, EMBLEM.r, morph);
  const shape = dropPoints(dp.x, dp.y, dr).map((p, i) => {
    const c = circlePoints(dp.x, dp.y, dr)[i];
    return {x: mix(p.x, c.x, morph), y: mix(p.y, c.y, morph)};
  });
  const emblemText = ramp(t, at(2, 0.45), at(2, 0.75));

  // Beat 3: fatty-acid family
  const fam = (k: number) => ramp(t, at(3, 0.08 + k * 0.15), at(3, 0.5 + k * 0.15), EASE.out);
  const dim = 1 - 0.55 * ramp(t, at(3, 0), at(3, 0.3));
  const beat = Math.max(0, Math.sin(t * Math.PI * 2 * 1.1)) ** 6;

  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <g opacity={dim}>
          {paths > 0.001 ? (
            <>
              <path d={toHeart} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(toHeart, paths)} />
              <path d={toBrain} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(toBrain, paths)} />
              <PathPulse d={toHeart} t={t} o={ramp(paths, 0.9, 1)} color={PAL.orange} />
              <PathPulse d={toBrain} t={t + 0.3} o={ramp(paths, 0.9, 1)} color={PAL.orange} />
            </>
          ) : null}
          <g opacity={organs}>
            <circle cx={HEART.x} cy={HEART.y} r={112} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
            <HeartLine cx={HEART.x} cy={HEART.y + 10} s={70} beat={beat} />
            <BrainNode cx={BRAIN.x} cy={BRAIN.y} r={112} />
            <NodeDot x={HEART.x} y={HEART.y - 120} />
            <NodeDot x={BRAIN.x} y={BRAIN.y - 120} />
          </g>
        </g>
        <OmegaCapsule id="cap1" cx={540} cy={860} len={500 * mix(0.6, 1, form)} rad={100 * mix(0.6, 1, form)} open={open} depth={1 - capsuleFlat} opacity={Math.min(form * 1.5, 1 - capsuleOut)} />
        {drop > 0.001 ? (
          <polygon points={polyStr(shape)} fill={morph > 0.5 ? PAL.offWhite : PAL.orange} stroke={PAL.charcoal} strokeWidth={morph > 0.02 ? 8 : 4} strokeLinejoin="round" opacity={Math.min(1, drop * 2)} />
        ) : null}
        {emblemText > 0.001 ? (
          <g opacity={emblemText}>
            <circle cx={EMBLEM.x} cy={EMBLEM.y} r={EMBLEM.r - 26} fill="none" stroke={PAL.orange} strokeWidth={14} />
            <text x={EMBLEM.x} y={EMBLEM.y + 52} textAnchor="middle" fontFamily="DejaVu Sans, Cairo, sans-serif" fontWeight={700} fontSize={150} fill={PAL.charcoal}>
              ω-3
            </text>
          </g>
        ) : null}
        {/* fatty-acid family branching from the emblem */}
        <FattyAcidMotif x={EMBLEM.x + EMBLEM.r - 10} y={CHAINS.epa.y} len={CHAINS.epa.len} seg={18} p={fam(0)} kinks={[3, 6, 9, 12, 15]} />
        <FattyAcidMotif x={EMBLEM.x + EMBLEM.r + 10} y={CHAINS.dha.y} len={CHAINS.dha.len} seg={20} p={fam(1)} kinks={[2, 5, 8, 11, 14, 17]} />
        <FattyAcidMotif x={EMBLEM.x + EMBLEM.r - 10} y={CHAINS.ala.y} len={CHAINS.ala.len} seg={10} amp={16} w={5} p={fam(2)} kinks={[3, 6]} opacity={0.75} />
      </svg>
      <Txt x={EMBLEM.x + EMBLEM.r - 40} y={CHAINS.epa.y - 110} w={200} size={58} dir="ltr" align="left" opacity={fam(0)}>
        EPA
      </Txt>
      <Txt x={EMBLEM.x + EMBLEM.r - 20} y={CHAINS.dha.y - 110} w={200} size={58} dir="ltr" align="left" opacity={fam(1)}>
        DHA
      </Txt>
      <Txt x={EMBLEM.x + EMBLEM.r - 40} y={CHAINS.ala.y - 80} w={200} size={38} weight={700} dir="ltr" align="left" opacity={fam(2) * 0.85}>
        ALA
      </Txt>
    </>
  );
};

import type React from 'react';
import {spring, useVideoConfig} from 'remotion';
import {PAL, at} from '../config';
import {ArterySection} from '../art/Artery';
import {BloodTube, Heart} from '../art/objects';
import {AGE, ageX, arteryAt, lensAt} from '../geom';
import {EASE, mix, ramp} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';
import {useAbsT} from '../../ms/lib/time';

export const TUBE_A = {big: {x: 170, y: 560, w: 190, h: 660}, small: {x: 120, y: 470, w: 110, h: 380}} as const;

/** Beats 01–03: tube → heart connector → age timeline → magnifier into the artery. */
export const ActA: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const {fps} = useVideoConfig();

  // Beat 1: tube snaps in, sample rises, connector to a calm heart, label resolves.
  const snap = spring({frame: Math.round(t * fps), fps, config: {damping: 13, stiffness: 140, mass: 0.7}});
  const level = mix(0, 0.62, ramp(t, at(1, 0.12), at(1, 0.5), EASE.out));
  const label = ramp(t, at(1, 0.55), at(1, 0.75));
  const toSmall = ramp(t, at(2, 0), at(2, 0.2));
  const tube = {
    x: mix(TUBE_A.big.x, TUBE_A.small.x, toSmall),
    y: mix(TUBE_A.big.y, TUBE_A.small.y, toSmall) + (1 - snap) * 60,
    w: mix(TUBE_A.big.w, TUBE_A.small.w, toSmall) * mix(0.75, 1, snap),
    h: mix(TUBE_A.big.h, TUBE_A.small.h, toSmall) * mix(0.75, 1, snap),
  };
  const out = ramp(t, at(4, 0), at(4, 0.08));
  const heart = {x: mix(700, 800, toSmall), y: mix(890, 600, toSmall), s: mix(1.75, 0.75, toSmall) * 100};
  const conn = ramp(t, at(1, 0.28), at(1, 0.62));
  const connD = `M ${tube.x + tube.w + 6} ${tube.y + tube.h * 0.55} C ${tube.x + tube.w + 120} ${tube.y + tube.h * 0.55}, ${heart.x - heart.s * 1.6} ${heart.y}, ${heart.x - heart.s * 0.95} ${heart.y}`;
  const connOut = ramp(t, at(2, 0), at(2, 0.12));
  const beat = Math.max(0, Math.sin(t * Math.PI * 2 * 1.1)) ** 4;

  // Beat 2: the label line extends into the age timeline; "20+" marker moves forward.
  const lineStart = {x: tube.x + tube.w * 0.5, y: tube.y + tube.h * 0.6};
  const tl = ramp(t, at(2, 0.1), at(2, 0.45));
  const tlD = `M ${lineStart.x} ${lineStart.y} L ${lineStart.x} ${AGE.y - 60} Q ${lineStart.x} ${AGE.y} ${lineStart.x + 60} ${AGE.y} L ${AGE.xYoung + 20} ${AGE.y}`;
  const axis = `M ${AGE.xYoung + 20} ${AGE.y} L ${AGE.xOld} ${AGE.y}`;
  const axisK = ramp(t, at(2, 0.3), at(2, 0.6));
  const tlOut = ramp(t, at(3, 0), at(3, 0.15));
  const ageM = mix(12, 20, ramp(t, at(2, 0.5), at(2, 0.9), EASE.out));
  const marker = ramp(t, at(2, 0.45), at(2, 0.6));

  // Beat 3: the empty test marker becomes the magnifying window.
  const lens = lensAt(t);
  const art = arteryAt(t);
  const emptyMarker = ramp(t, at(2, 0.35), at(2, 0.55));

  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <defs>
        <clipPath id="ca-lens">
          <circle cx={lens.x} cy={lens.y} r={Math.max(0, lens.r - 6)} />
        </clipPath>
      </defs>
      {/* connector tube → heart */}
      {conn > 0.001 && connOut < 1 ? <path d={connD} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" opacity={1 - connOut} {...drawOn(connD, conn)} /> : null}
      {/* timeline from the label line */}
      {tl > 0.001 && tlOut < 1 ? (
        <g opacity={1 - tlOut}>
          <path d={tlD} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" {...drawOn(tlD, tl)} />
          <path d={axis} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(axis, axisK)} />
          {[10, 20, 30, 40, 50, 60].map((a, i) => {
            const k = ramp(t, at(2, 0.35 + i * 0.04), at(2, 0.45 + i * 0.04));
            return (
              <g key={a} opacity={k}>
                <line x1={ageX(a)} y1={AGE.y - 14} x2={ageX(a)} y2={AGE.y + 14} stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" />
                <text x={ageX(a)} y={AGE.y + 62} textAnchor="middle" fontFamily="Cairo" fontWeight={700} fontSize={40} fill={PAL.charcoal}>
                  {a}
                </text>
              </g>
            );
          })}
          {marker > 0.001 ? (
            <g opacity={marker} transform={`translate(${ageX(ageM)} ${AGE.y})`}>
              <rect x={-62} y={-132} width={124} height={64} rx={32} fill={PAL.charcoal} />
              <text x={0} y={-86} textAnchor="middle" fontFamily="Cairo" fontWeight={800} fontSize={40} fill={PAL.offWhite}>
                20+
              </text>
              <path d="M -12 -70 L 0 -54 L 12 -70 Z" fill={PAL.charcoal} />
              <circle r={14} fill={PAL.charcoal} />
            </g>
          ) : null}
        </g>
      ) : null}
      {/* empty test marker → magnifier */}
      {emptyMarker > 0.001 && lens.r < 1240 ? (
        <g opacity={emptyMarker}>
          {lens.open < 0.02 ? (
            <>
              <line x1={lens.x} y1={lens.y + lens.r} x2={lens.x} y2={AGE.y - 14} stroke={PAL.charcoal} strokeWidth={4} strokeDasharray="8 8" />
              <circle cx={lens.x} cy={lens.y} r={lens.r} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} strokeDasharray="10 9" />
            </>
          ) : (
            <>
              <circle cx={lens.x} cy={lens.y} r={lens.r} fill={PAL.offWhite} opacity={lens.ring} />
              <g clipPath="url(#ca-lens)">
                <ArterySection s={art} t={t} flow={{count: 46, ldlShare: 0.6, opacity: ramp(t, at(3, 0.1), at(3, 0.35))}} />
              </g>
              <circle cx={lens.x} cy={lens.y} r={lens.r} fill="none" stroke={PAL.charcoal} strokeWidth={10} opacity={lens.ring} />
              <line
                opacity={lens.ring}
                x1={lens.x + lens.r * 0.72}
                y1={lens.y + lens.r * 0.72}
                x2={lens.x + lens.r * 0.72 + 70 * lens.open}
                y2={lens.y + lens.r * 0.72 + 70 * lens.open}
                stroke={PAL.charcoal}
                strokeWidth={26}
                strokeLinecap="round"
              />
            </>
          )}
        </g>
      ) : null}
      <BloodTube x={tube.x} y={tube.y} w={tube.w} h={tube.h} level={level} label={label} opacity={Math.min(ramp(t, 0, 0.12), 1 - out)} />
      <Heart cx={heart.x} cy={heart.y} s={heart.s} beat={beat} opacity={ramp(t, at(1, 0.3), at(1, 0.5)) * (1 - out)} />
    </svg>
  );
};

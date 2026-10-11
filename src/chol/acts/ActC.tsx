import type React from 'react';
import {spring, useVideoConfig} from 'remotion';
import {PAL, SOURCES, at} from '../config';
import {BloodTube, Check} from '../art/objects';
import {AGE, CARD_A, MARK19, TL8, TUBE8, ageX, arteryAt} from '../geom';
import {EASE, mix, ramp} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';
import {useAbsT} from '../../ms/lib/time';
import {ImageCard, imageCardHeight} from '../../ms/ui/primitives';

/** Beats 07–08: ruler → underline of ORIGINAL source A; 19+ marker; early test on the age timeline. */
export const ActC: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const {fps} = useVideoConfig();
  const cardH = imageCardHeight(SOURCES.a.w, SOURCES.a.h, CARD_A.w);
  const lineY = CARD_A.y + cardH + 16;

  // ruler (under the full artery) travels up and widens into the card underline
  const s4 = arteryAt(at(6, 1));
  const ry0 = s4.cy + s4.R + s4.T + 52;
  const lift = ramp(t, at(7, 0), at(7, 0.14));
  const ul = {x0: mix(520, CARD_A.x, lift), x1: 900, y: mix(ry0, lineY, lift)};
  const cardK = ramp(t, at(7, 0.1), at(7, 0.22), EASE.out);
  // full screenshot first, then a 2× container zoom that pans along the title
  const zoom = 1 + 1 * ramp(t, at(7, 0.46), at(7, 0.58));
  const fx = mix(0.1, 0.9, ramp(t, at(7, 0.6), at(7, 0.95), EASE.inOut));
  const recede = ramp(t, at(8, 0), at(8, 0.25));
  const cardOpacity = cardK * (1 - recede);
  const cardScale = mix(1, 0.6, recede);

  // 19+ marker pops in, then docks on the age timeline
  const pop = spring({frame: Math.round((t - at(7, 0.18)) * fps), fps, config: {damping: 12, stiffness: 150}});
  const dock = ramp(t, at(8, 0.05), at(8, 0.35));
  const m = {x: mix(MARK19.x, ageX(19), dock), y: mix(MARK19.y, TL8.y, dock), r: mix(MARK19.r, 64, dock) * (t < at(7, 0.18) ? 0 : pop)};
  const tlIn = ramp(t, at(8, 0.05), at(8, 0.3));
  const out = ramp(t, at(9, 0), at(9, 0.2));
  const tubeIn = ramp(t, at(8, 0.2), at(8, 0.4));
  const conn = ramp(t, at(8, 0.35), at(8, 0.55));
  const connD = `M ${TUBE8.x + TUBE8.w / 2} ${TUBE8.y + TUBE8.h + 4} L ${ageX(19)} ${TL8.y - 66}`;
  const check = ramp(t, at(8, 0.55), at(8, 0.7));
  const yx = (a: number) => ageX(a);

  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {lift > 0.001 && recede < 1 ? <line x1={ul.x0} y1={ul.y} x2={ul.x1} y2={ul.y} stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" opacity={1 - recede} /> : null}
        {/* age timeline returns for beat 8 */}
        {tlIn > 0.001 && out < 1 ? (
          <g opacity={tlIn * (1 - out)}>
            <line x1={AGE.xYoung + 20} y1={TL8.y} x2={AGE.xOld} y2={TL8.y} stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" />
            {[10, 20, 30, 40, 50, 60].map((a) => (
              <g key={a}>
                <line x1={yx(a)} y1={TL8.y - 12} x2={yx(a)} y2={TL8.y + 12} stroke={PAL.charcoal} strokeWidth={4} />
                <text x={yx(a)} y={TL8.y + 58} textAnchor="middle" fontFamily="Cairo" fontWeight={700} fontSize={36} fill={PAL.charcoal} opacity={a === 20 ? 0 : 0.8}>
                  {a}
                </text>
              </g>
            ))}
            {/* a later age marker stays faint: no need to wait for it */}
            <circle cx={yx(50)} cy={TL8.y} r={46} fill="none" stroke={PAL.line} strokeWidth={5} strokeDasharray="10 9" />
            <path d={connD} stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(connD, conn)} />
          </g>
        ) : null}
        {m.r > 0.5 && out < 1 ? (
          <g opacity={1 - out}>
            <circle cx={m.x} cy={m.y} r={m.r} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={mix(6, 5, dock)} />
            <text x={m.x} y={m.y + m.r * 0.32} textAnchor="middle" fontFamily="Cairo" fontWeight={800} fontSize={m.r * 0.9} fill={PAL.charcoal}>
              19+
            </text>
            <Check cx={m.x + m.r * 0.78} cy={m.y - m.r * 0.78} r={24} opacity={check} />
          </g>
        ) : null}
        <BloodTube x={TUBE8.x} y={TUBE8.y + (1 - tubeIn) * 40} w={TUBE8.w} h={TUBE8.h} level={0.62} label={1} opacity={tubeIn * (1 - ramp(t, at(9, 0.05), at(9, 0.06)))} />
      </svg>
      {cardOpacity > 0.001 ? (
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${CARD_A.x + CARD_A.w}px ${CARD_A.y}px`, scale: String(cardScale), translate: `0 ${(1 - cardK) * 80}px`}}>
          <ImageCard file={SOURCES.a.file} iw={SOURCES.a.w} ih={SOURCES.a.h} x={CARD_A.x} y={CARD_A.y} w={CARD_A.w} opacity={cardOpacity} zoom={zoom} fx={fx} fy={0.5} />
        </div>
      ) : null}
    </>
  );
};

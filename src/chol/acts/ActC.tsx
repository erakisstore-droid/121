import {getLength, getPointAtLength} from '@remotion/paths';
import type React from 'react';
import {spring, useVideoConfig} from 'remotion';
import {PAL, SOURCES, at} from '../config';
import {pageDelta} from '../Board';
import {HeroTube} from '../art/hero';
import {CARD_A, CARD_A_SMALL, MARK19, MARK19_B, TUBE3, YOUTH, arteryAt} from '../geom';
import {EASE, mix, ramp} from '../../ms/lib/anim';
import {useAbsT} from '../../ms/lib/time';
import {ImageCard, imageCardHeight} from '../../ms/ui/primitives';

/** Beats 07–08 (page p3): youth timeline → source-A underline; 19+ marker; connector to the hero tube. */
export const ActC: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const {fps} = useVideoConfig();
  const d1 = pageDelta('p1', 'p3');
  const fullH = imageCardHeight(SOURCES.a.w, SOURCES.a.h, CARD_A.w);
  const yU0 = YOUTH.y + d1.y;
  const yU1 = CARD_A.y + fullH + 16;

  // thread: artery edge → youth timeline → lifts into the underline of source A
  const lift = ramp(t, at(7, 0), at(7, 0.14), EASE.inOut);
  // source A: full screenshot, then a 2× container zoom panning along its title
  const cardK = ramp(t, at(7, 0.1), at(7, 0.22), EASE.out);
  const zoom = 1 + 1 * ramp(t, at(7, 0.46), at(7, 0.58)) * (1 - ramp(t, at(8, 0), at(8, 0.12)));
  const fx = mix(0.1, 0.9, ramp(t, at(7, 0.6), at(7, 0.95), EASE.inOut));
  const shrink = ramp(t, at(8, 0.05), at(8, 0.3), EASE.inOut);
  const cardW = mix(CARD_A.w, CARD_A_SMALL.w, shrink);
  const cardH = imageCardHeight(SOURCES.a.w, SOURCES.a.h, cardW);
  const yU = mix(mix(yU0, yU1, lift), CARD_A_SMALL.y + cardH + 16, shrink);
  const xEnd = mix(mix(YOUTH.x1 + d1.x, CARD_A.x + CARD_A.w, lift), CARD_A.x + cardW, shrink);

  const s = arteryAt(t);
  const ob = s.cy + s.R + s.T + d1.y;
  const x0 = YOUTH.x0 + d1.x;
  const thread = `M ${x0} ${ob} C ${x0 + 60} ${ob}, ${x0 + 40} ${yU0}, ${x0 + 110} ${yU0} L 40 ${yU0} C 80 ${yU0}, 80 ${yU}, ${CARD_A.x} ${yU} L ${xEnd} ${yU}`;

  // 19+ marker, then a moving connector to the tube, which settles prominently
  const pop = spring({frame: Math.round((t - at(7, 0.32)) * fps), fps, config: {damping: 12, stiffness: 150}});
  const mv = ramp(t, at(8, 0.05), at(8, 0.3), EASE.inOut);
  const m = {x: mix(MARK19.x, MARK19_B.x, mv), y: mix(MARK19.y, MARK19_B.y, mv), r: mix(MARK19.r, MARK19_B.r, mv) * (t < at(7, 0.32) ? 0 : pop)};
  const tubeBuild = ramp(t, at(8, 0.15), at(8, 0.45), EASE.out);
  const connD = `M ${MARK19_B.x + MARK19_B.r} ${MARK19_B.y} C ${MARK19_B.x + 260} ${MARK19_B.y}, ${TUBE3.x - 160} ${TUBE3.y + TUBE3.h * 0.8}, ${TUBE3.x - 8} ${TUBE3.y + TUBE3.h * 0.8}`;
  const conn = ramp(t, at(8, 0.3), at(8, 0.55));
  const pulse = ramp(t, at(8, 0.55), at(8, 0.85), (x) => x);
  const L = getLength(connD);
  const pp = pulse > 0 && pulse < 1 ? getPointAtLength(connD, pulse * L) : null;
  const settle = spring({frame: Math.round((t - at(8, 0.85)) * fps), fps, config: {damping: 10, stiffness: 160}});
  const tubeScale = t < at(8, 0.85) ? 1 : 1 + 0.05 * Math.sin(Math.PI * Math.min(1, settle));
  // beat 9: the label detaches (drawn by the report act)
  const labelOn = 1 - ramp(t, at(9, 0.02), at(9, 0.06));

  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d={thread} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        {m.r > 0.5 ? (
          <g>
            <circle cx={m.x} cy={m.y} r={m.r} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={6} />
            <text x={m.x} y={m.y + m.r * 0.32} textAnchor="middle" fontFamily="Cairo" fontWeight={800} fontSize={m.r * 0.9} fill={PAL.charcoal}>
              19+
            </text>
          </g>
        ) : null}
        {conn > 0.001 ? <path d={connD} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" strokeDasharray="16 12" strokeDashoffset={-t * 60} opacity={Math.min(1, conn * 2)} clipPath="url(#c3-reveal)" /> : null}
        <defs>
          <clipPath id="c3-reveal">
            <rect x={MARK19_B.x} y={0} width={(TUBE3.x - MARK19_B.x) * conn + 20} height={1920} />
          </clipPath>
        </defs>
        {pp ? <circle cx={pp.x} cy={pp.y} r={13} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} /> : null}
        <g transform={`translate(${TUBE3.x + TUBE3.w / 2} ${TUBE3.y + TUBE3.h}) scale(${tubeScale}) translate(${-(TUBE3.x + TUBE3.w / 2)} ${-(TUBE3.y + TUBE3.h)})`}>
          <HeroTube id="tube3" x={TUBE3.x} y={TUBE3.y} w={TUBE3.w} h={TUBE3.h} level={0.62} build={tubeBuild} label={ramp(t, at(8, 0.4), at(8, 0.55))} labelOn={labelOn} opacity={tubeBuild > 0 ? 1 : 0} />
        </g>
      </svg>
      {cardK > 0.001 ? (
        <div style={{position: 'absolute', inset: 0, translate: `0 ${(1 - cardK) * 60}px`, opacity: cardK}}>
          <ImageCard file={SOURCES.a.file} iw={SOURCES.a.w} ih={SOURCES.a.h} x={CARD_A.x} y={CARD_A.y} w={cardW} zoom={zoom} fx={fx} fy={0.5} />
        </div>
      ) : null}
    </>
  );
};

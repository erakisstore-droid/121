import type React from 'react';
import {ASSETS, LAYOUT, PAL, at} from '../config';
import {TopicCardSvg, TopicLabel} from '../diagrams/TopicCard';
import {mix, mixRect, ramp, type Rect} from '../lib/anim';
import {POLL_CARD, pollRowScreen, pollState} from '../lib/geom';
import {drawOn, roundRectPath} from '../lib/paths';
import {useAbsT} from '../lib/time';
import {ImageCard} from '../ui/primitives';

/** Where the topic cards hand over to the CNS pathway leg (beat 6). */
export const PATH_LEG_RECT: Rect = {x: 450, y: 1060, w: 300, h: 480};

/** Beats 04–05 (+ start of 06): original poll → row outlines → two topic cards. */
export const Act2: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const ps = pollState(t);

  const draw = ramp(t, at(4, 0.3), at(4, 0.5));
  const fdOn = ps.fd * (1 - ps.sp);
  const spOn = ps.sp * (1 - ps.back);
  const morph = ramp(t, at(5, 0.08), at(5, 0.38));
  const fill = ramp(t, at(5, 0.3), at(5, 0.45));
  const content = ramp(t, at(5, 0.4), at(5, 0.6));
  const label = ramp(t, at(5, 0.5), at(5, 0.7));
  // beat 6: cards collapse into the pathway leg
  const hand = ramp(t, at(6, 0), at(6, 0.22));
  const handFade = ramp(t, at(6, 0.12), at(6, 0.25));

  const rectFor = (row: 'spasticity' | 'footDrop'): Rect => {
    const rowR = pollRowScreen(row, t);
    const card = row === 'spasticity' ? LAYOUT.topCard : LAYOUT.bottomCard;
    return mixRect(mixRect(rowR, card, morph), PATH_LEG_RECT, hand);
  };
  const sR = rectFor('spasticity');
  const fR = rectFor('footDrop');
  const phase = (t - at(5, 0)) / 2.1;

  const outline = (r: Rect, active: number) => {
    const d = roundRectPath(r.x, r.y, r.w, r.h, mix(12, 30, morph));
    return {
      d,
      stroke: active > 0.5 ? PAL.orangeDeep : PAL.charcoal,
      sw: mix(4, 8, active),
    };
  };
  const oS = outline(sR, spOn);
  const oF = outline(fR, fdOn);
  const cardsOpacity = 1 - handFade;

  return (
    <>
      <ImageCard
        file={ASSETS.poll.file}
        iw={ASSETS.poll.w}
        ih={ASSETS.poll.h}
        x={POLL_CARD.x}
        y={POLL_CARD.y + ps.dy}
        w={POLL_CARD.w}
        opacity={ps.opacity}
        zoom={ps.zoom}
        fx={ps.fx}
        fy={ps.fy}
      />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {fill < 0.999
          ? [oS, oF].map((o, i) => (
              <g key={i} opacity={1 - fill}>
                <path d={o.d} fill="none" stroke={o.stroke} strokeWidth={o.sw} strokeLinejoin="round" {...drawOn(o.d, draw)} />
                {draw < 0.05 ? <circle cx={(i === 0 ? sR : fR).x + (i === 0 ? sR : fR).w} cy={(i === 0 ? sR : fR).y + (i === 0 ? sR : fR).h / 2} r={9} fill={PAL.charcoal} /> : null}
              </g>
            ))
          : null}
        {fill > 0.001 ? (
          <>
            <TopicCardSvg id="a2-s" kind="spasticity" r={sR} phase={phase} opacity={cardsOpacity} fill={fill} content={content * (1 - hand)} />
            <TopicCardSvg id="a2-f" kind="footDrop" r={fR} phase={phase + 0.1} opacity={cardsOpacity} fill={fill} content={content * (1 - hand)} />
          </>
        ) : null}
      </svg>
      <TopicLabel kind="spasticity" r={sR} opacity={label * (1 - ramp(t, at(6, 0), at(6, 0.07)))} />
      <TopicLabel kind="footDrop" r={fR} opacity={label * (1 - ramp(t, at(6, 0), at(6, 0.07)))} />
    </>
  );
};

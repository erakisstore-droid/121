import type React from 'react';
import {PAL} from '../config';
import type {Rect} from '../lib/anim';
import {CardRect, Txt} from '../ui/primitives';
import {LegsView} from './LegsView';

export type Topic = 'spasticity' | 'footDrop';
export const TOPIC_TEXT: Record<Topic, {ar: string; en: string}> = {
  spasticity: {ar: 'التشنج العضلي', en: 'Spasticity'},
  footDrop: {ar: 'سقوط القدم', en: 'Foot Drop'},
};

/** SVG part of a topic card: frame + matching leg view (label is rendered by TopicLabel). */
export const TopicCardSvg: React.FC<{id: string; kind: Topic; r: Rect; phase: number; opacity?: number; fill?: number; content?: number; stroke?: string; sw?: number}> = ({
  id,
  kind,
  r,
  phase,
  opacity = 1,
  fill = 1,
  content = 1,
  stroke,
  sw,
}) => (
  <g opacity={opacity}>
    <CardRect r={r} fillOpacity={fill} stroke={stroke} sw={sw} />
    <LegsView
      id={id}
      r={{x: r.x + 18, y: r.y + 14, w: Math.min(360, r.w * 0.45), h: r.h - 28}}
      phase={phase}
      near={kind === 'spasticity' ? {stiffness: 1} : {footDrop: 1}}
      muscles={kind === 'spasticity' ? {calf: 1, thigh: 1, tension: 0.8} : {front: 0.9}}
      opacity={content}
    />
  </g>
);

export const TopicLabel: React.FC<{kind: Topic; r: Rect; opacity?: number; size?: number}> = ({kind, r, opacity = 1, size = 66}) => (
  <>
    <Txt x={r.x + r.w * 0.44} y={r.y + r.h / 2 - size * 1.0} w={r.w * 0.53} size={size} opacity={opacity} nowrap>
      {TOPIC_TEXT[kind].ar}
    </Txt>
    <Txt x={r.x + r.w * 0.44} y={r.y + r.h / 2 + size * 0.42} w={r.w * 0.53} size={size * 0.6} weight={700} opacity={opacity * 0.85} color={PAL.charcoal} dir="ltr">
      {TOPIC_TEXT[kind].en}
    </Txt>
  </>
);

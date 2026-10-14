import {getLength, getPointAtLength} from '@remotion/paths';
import type React from 'react';
import {PAL} from '../config';
import {FONT_AR} from '../../ms/config';

/** Dots that keep travelling along a path (ongoing motion on connectors). */
export const PathPulse: React.FC<{d: string; t: number; n?: number; speed?: number; r?: number; color?: string; o?: number}> = ({d, t, n = 2, speed = 0.45, r = 10, color = PAL.offWhite, o = 1}) => {
  if (o <= 0.001) return null;
  const L = getLength(d);
  return (
    <g opacity={o}>
      {Array.from({length: n}, (_, i) => {
        const u = (((t * speed + i / n) % 1) + 1) % 1;
        const p = getPointAtLength(d, u * L);
        return p ? <circle key={i} cx={p.x} cy={p.y} r={r} fill={color} stroke={PAL.charcoal} strokeWidth={3.5} /> : null;
      })}
    </g>
  );
};

/** Research marker pin with a year. */
export const ResearchPin: React.FC<{x: number; y: number; year: string; s?: number; o?: number}> = ({x, y, year, s = 1, o = 1}) =>
  o <= 0.001 ? null : (
    <g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M 0 74 L -22 34 A 46 46 0 1 1 22 34 Z" fill={PAL.charcoal} />
      <circle cy={-6} r={36} fill={PAL.offWhite} />
      <text y={6} textAnchor="middle" fontFamily="Cairo" fontWeight={800} fontSize={26} fill={PAL.charcoal}>
        {year}
      </text>
    </g>
  );

/** HTML chip for numbers / short labels (keeps Arabic shaping and LTR numbers intact). */
export const Chip: React.FC<{x: number; y: number; w: number; h: number; main: string; sub?: string; o: number; dir?: 'ltr' | 'rtl'; size?: number; hot?: boolean}> = ({x, y, w, h, main, sub, o, dir = 'ltr', size = 52, hot}) =>
  o <= 0.001 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 24,
        background: hot ? PAL.charcoal : PAL.offWhite,
        border: `4px solid ${PAL.charcoal}`,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: Math.min(1, o * 1.5),
        translate: `0 ${(1 - o) * 24}px`,
        fontFamily: FONT_AR,
        color: hot ? PAL.offWhite : PAL.charcoal,
      }}
    >
      <div dir={dir} style={{fontSize: size, fontWeight: 800, lineHeight: 1.1, whiteSpace: 'nowrap'}}>
        {main}
      </div>
      {sub ? (
        <div dir="rtl" style={{fontSize: 28, fontWeight: 700, lineHeight: 1.2, opacity: 0.85, whiteSpace: 'nowrap'}}>
          {sub}
        </div>
      ) : null}
    </div>
  );

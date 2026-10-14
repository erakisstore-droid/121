import type React from 'react';
import {PAL} from '../config';

export type FishKind = 'sardine' | 'mackerel' | 'salmon';

/** Flat fish silhouettes with gentle tail motion. Faces right unless flip. */
export const Fish: React.FC<{kind: FishKind; x: number; y: number; s: number; t: number; opacity?: number; flip?: boolean}> = ({kind, x, y, s, t, opacity = 1, flip}) => {
  if (opacity <= 0.001) return null;
  const wag = Math.sin(t * 5 + x * 0.01) * 6;
  const L = kind === 'salmon' ? 380 : kind === 'mackerel' ? 340 : 280;
  const H = kind === 'salmon' ? 120 : kind === 'mackerel' ? 92 : 70;
  const body = `M ${-L / 2} 0 C ${-L / 3} ${-H * 0.62}, ${L / 4} ${-H * 0.7}, ${L / 2} 0 C ${L / 4} ${H * 0.62}, ${-L / 3} ${H * 0.55}, ${-L / 2} 0 Z`;
  const tail = `M ${-L / 2 + 8} 0 L ${-L / 2 - H * 0.55} ${-H * 0.5 + wag} Q ${-L / 2 - H * 0.35} ${wag * 0.3} ${-L / 2 - H * 0.55} ${H * 0.5 + wag} Z`;
  const fill = kind === 'salmon' ? PAL.beige : PAL.offWhite;
  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      <path d={tail} fill={fill} stroke={PAL.charcoal} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M ${-L * 0.05} ${-H * 0.6} L ${L * 0.08} ${-H * 0.95} L ${L * 0.18} ${-H * 0.58} Z`} fill={fill} stroke={PAL.charcoal} strokeWidth={5} strokeLinejoin="round" />
      <path d={body} fill={fill} stroke={PAL.charcoal} strokeWidth={5} strokeLinejoin="round" />
      {kind === 'salmon' ? (
        <>
          <path d={`M ${-L * 0.4} ${H * 0.05} C ${-L * 0.1} ${H * 0.28}, ${L * 0.2} ${H * 0.28}, ${L * 0.42} ${H * 0.04}`} fill="none" stroke={PAL.orangeDeep} strokeWidth={8} strokeLinecap="round" />
          {[-0.25, -0.1, 0.05, 0.2].map((k, i) => (
            <circle key={k} cx={L * k} cy={-H * (0.22 + (i % 2) * 0.1)} r={5} fill={PAL.charcoal} />
          ))}
        </>
      ) : null}
      {kind === 'mackerel'
        ? [-0.3, -0.18, -0.06, 0.06, 0.18].map((k) => (
            <path key={k} d={`M ${L * k} ${-H * 0.5} q ${L * 0.03} ${H * 0.15} 0 ${H * 0.3} t 0 ${H * 0.2}`} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" />
          ))
        : null}
      {kind === 'sardine' ? (
        <>
          <path d={`M ${-L * 0.38} ${-H * 0.05} L ${L * 0.36} ${-H * 0.05}`} stroke={PAL.line} strokeWidth={6} strokeLinecap="round" />
          {[-0.2, -0.05, 0.1].map((k) => (
            <circle key={k} cx={L * k} cy={-H * 0.22} r={4} fill={PAL.charcoal} />
          ))}
        </>
      ) : null}
      <path d={`M ${L * 0.26} ${-H * 0.38} Q ${L * 0.2} 0 ${L * 0.26} ${H * 0.36}`} fill="none" stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" />
      <circle cx={L * 0.37} cy={-H * 0.12} r={H * 0.09} fill={PAL.charcoal} />
    </g>
  );
};

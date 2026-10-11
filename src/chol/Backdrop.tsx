import type React from 'react';
import {Img, staticFile} from 'remotion';
import {PAL} from './config';
import {useAbsT} from '../ms/lib/time';

/** Subtle darker-orange background shapes with a very slow, deterministic drift. */
export const Backdrop: React.FC = () => {
  const t = useAbsT();
  const d = Math.sin((t / 63) * Math.PI * 2);
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={-80 + d * 20} cy={430} r={360} fill={PAL.orangeDeep} opacity={0.55} />
        <circle cx={1150 - d * 16} cy={1180} r={420} fill={PAL.orangeDeep} opacity={0.5} />
        <rect x={560} y={1640 + d * 10} width={700} height={420} rx={210} fill={PAL.orangeDeep} opacity={0.45} transform="rotate(-12 900 1850)" />
      </svg>
    </>
  );
};

export const Grain: React.FC = () => (
  <Img src={staticFile('ms/grain.png')} style={{position: 'absolute', inset: 0, width: 1080, height: 1920, opacity: 0.035, mixBlendMode: 'overlay'}} />
);

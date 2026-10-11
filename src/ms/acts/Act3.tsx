import {getLength, getPointAtLength} from '@remotion/paths';
import type React from 'react';
import {PAL, at} from '../config';
import {Brain} from '../diagrams/icons';
import {Leg} from '../figure/draw';
import {legFromAngles} from '../figure/gait';
import {dimsFor} from '../figure/Walker';
import {mix, ramp} from '../lib/anim';
import {NERVE_FRONT, NERVE_MAIN, PATH} from '../lib/geom';
import {drawOn} from '../lib/paths';
import {useAbsT} from '../lib/time';

const MAIN_LEN = getLength(NERVE_MAIN);
export const pathLegPose = () => legFromAngles(PATH.legHip, PATH.hipA, PATH.kneeA, 0, dimsFor(PATH.legL));

const Nerve: React.FC<{d: string; p: number; opacity?: number}> = ({d, p, opacity = 1}) =>
  p <= 0.001 ? null : (
    <g opacity={opacity}>
      <path d={d} fill="none" stroke={PAL.charcoal} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" {...drawOn(d, p)} />
      <path d={d} fill="none" stroke={PAL.offWhite} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" {...drawOn(d, p)} />
    </g>
  );

/** Beats 06–07: brain → spinal cord → leg-muscle pathway, signal pulses, magnified myelin segment. */
export const Act3: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const appear = ramp(t, at(6, 0.02), at(6, 0.18));
  const nerve = ramp(t, at(6, 0.1), at(6, 0.38));
  const out = ramp(t, at(8, 0), at(8, 0.25));
  const pose = pathLegPose();

  // Pulses travel brain → muscle (beat 6) and continue more weakly in beat 7.
  const pulses = [0.4, 0.62, 0.84].map((f) => {
    const s = at(6, f);
    const k = ramp(t, s, s + 0.85, (x) => x);
    return {k, on: t >= s && t <= s + 0.9};
  });
  const arrive = pulses.reduce((m, p) => Math.max(m, p.on ? Math.exp(-((p.k - 1) ** 2) / 0.004) : 0), 0);

  // Beat 7: magnifier, disrupted myelin sleeves, branch split.
  const lensIn = ramp(t, at(7, 0), at(7, 0.25));
  const disrupt = ramp(t, at(7, 0.25), at(7, 0.6));
  const split = ramp(t, at(7, 0.55), at(7, 0.95));
  const L = PATH.lens;
  const sleeves = [-1.5, -0.5, 0.5, 1.5];

  const legOn = t < at(8, 0);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}} opacity={1 - out}>
      <defs>
        <clipPath id="a3-lens">
          <circle cx={L.x} cy={L.y} r={L.r - 3} />
        </clipPath>
      </defs>
      <g opacity={appear}>
        <Brain cx={PATH.brain.x} cy={PATH.brain.y} s={PATH.brain.s} />
        <line x1={PATH.cordTop.x} y1={PATH.cordTop.y} x2={PATH.cordBottom.x} y2={PATH.cordBottom.y} stroke={PAL.charcoal} strokeWidth={44} strokeLinecap="round" />
        <line x1={PATH.cordTop.x} y1={PATH.cordTop.y} x2={PATH.cordBottom.x} y2={PATH.cordBottom.y} stroke={PAL.beige} strokeWidth={36} strokeLinecap="round" />
      </g>
      {legOn ? (
        <g opacity={ramp(t, at(6, 0.05), at(6, 0.2))}>
          <Leg pose={pose} w={PATH.legL * 0.3} muscles={{calf: 1, thigh: 1, front: 0.8, squeeze: arrive * 0.6}} />
          <circle cx={pose.hip.x} cy={pose.hip.y} r={PATH.legL * 0.16} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={3.5} />
        </g>
      ) : null}
      <Nerve d={NERVE_MAIN} p={nerve} />
      <Nerve d={NERVE_FRONT} p={split} />
      {pulses.map((p, i) => {
        if (!p.on) return null;
        const pt = getPointAtLength(NERVE_MAIN, p.k * MAIN_LEN);
        if (!pt) return null;
        return <circle key={i} cx={pt.x} cy={pt.y} r={14} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} opacity={1 - ramp(p.k, 0.92, 1)} />;
      })}
      {lensIn > 0.001 ? (
        <g opacity={lensIn}>
          <circle cx={PATH.lensSpot.x} cy={PATH.lensSpot.y} r={PATH.lensSpot.r} fill="none" stroke={PAL.charcoal} strokeWidth={4} />
          <line x1={PATH.lensSpot.x + 30} y1={PATH.lensSpot.y - 33} x2={L.x - L.r * 0.72} y2={L.y - L.r * 0.7} stroke={PAL.charcoal} strokeWidth={3} />
          <line x1={PATH.lensSpot.x + 30} y1={PATH.lensSpot.y + 33} x2={L.x - L.r * 0.72} y2={L.y + L.r * 0.7} stroke={PAL.charcoal} strokeWidth={3} />
          <g transform={`translate(${L.x} ${L.y}) scale(${mix(0.4, 1, lensIn)}) translate(${-L.x} ${-L.y})`}>
            <circle cx={L.x} cy={L.y} r={L.r} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={5} />
            <g clipPath="url(#a3-lens)">
              <line x1={L.x} y1={L.y - L.r} x2={L.x} y2={L.y + L.r} stroke={PAL.charcoal} strokeWidth={6} />
              {sleeves.map((k, i) => {
                const hit = i === 1 || i === 2 ? disrupt : 0;
                const cy = L.y + k * 70;
                const halves = [-1, 1];
                return (
                  <g key={k}>
                    {halves.map((h) => (
                      <rect
                        key={h}
                        x={L.x - 30 + (h > 0 ? 30 : 0) + h * 9 * hit}
                        y={cy - 29 + h * 4 * hit}
                        width={30}
                        height={58}
                        rx={h > 0 ? 0 : 0}
                        fill={PAL.beige}
                        fillOpacity={1 - 0.55 * hit}
                        stroke={PAL.charcoal}
                        strokeWidth={3}
                        strokeDasharray={hit > 0.3 ? '7 6' : undefined}
                        transform={`rotate(${h * 10 * hit} ${L.x} ${cy})`}
                      />
                    ))}
                    {/* round the sleeve ends when intact */}
                    <rect x={L.x - 30} y={cy - 29} width={60} height={58} rx={16} fill="none" stroke={PAL.charcoal} strokeWidth={3} opacity={1 - hit} />
                  </g>
                );
              })}
              {/* signal crossing the segment slows and weakens at the damaged sleeves */}
              {t > at(7, 0.3) && t < at(7, 1) ? (
                <circle
                  cx={L.x}
                  cy={L.y - L.r + 2 * L.r * ramp(t, at(7, 0.3), at(7, 1), (x) => x * 0.6 + 0.4 * x * x * x)}
                  r={11}
                  fill={PAL.offWhite}
                  stroke={PAL.charcoal}
                  strokeWidth={3.5}
                  opacity={1 - 0.6 * disrupt}
                />
              ) : null}
            </g>
          </g>
        </g>
      ) : null}
      {split > 0.001 ? (
        <>
          <circle cx={578} cy={1405} r={12 * split} fill={PAL.charcoal} />
          <circle cx={640} cy={1400} r={12 * split} fill={PAL.charcoal} />
        </>
      ) : null}
    </svg>
  );
};

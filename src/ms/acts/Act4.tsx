import type React from 'react';
import {PAL, at} from '../config';
import {Scuff} from '../diagrams/icons';
import {Capsule, Floor, Leg} from '../figure/draw';
import {legFromAngles, strideSpeed, type LegMods} from '../figure/gait';
import {WalkerFigure, dimsFor, walkerPoses} from '../figure/Walker';
import {deg, mix, mixRect, ramp, type Rect} from '../lib/anim';
import {FOOTVIEW, GAIT, MUSCLE_PANEL, PATH, SPAS, WINDOW} from '../lib/geom';
import {arcPath} from '../lib/paths';
import {useAbsT} from '../lib/time';
import {CardRect} from '../ui/primitives';


export const gaitPhase = (t: number) => (t - at(11, 0)) / GAIT.cycle + GAIT.p0;
export const gaitMods = (p: number): LegMods => ({footDrop: 1, steppage: ramp(p, 1.05, 1.45)});
const SPEED = strideSpeed(dimsFor(GAIT.L));

/** Toe trajectory (body frame) of the near leg's swing that started at phase s, up to phase e. */
export const toePath = (s: number, e: number, spec: {x: number; floorY: number; L: number}, mods: (p: number) => LegMods) => {
  const pts: string[] = [];
  const n = 28;
  for (let i = 0; i <= n; i++) {
    const p = s + ((e - s) * i) / n;
    const pose = walkerPoses({...spec, phase: p, near: mods(p)}).near;
    pts.push(`${i === 0 ? 'M' : 'L'} ${pose.toe.x.toFixed(1)} ${(pose.toe.y - 6).toFixed(1)}`);
  }
  return pts.join(' ');
};

/** Big schematic muscle used in the spasticity panel. */
const PanelMuscle: React.FC<{r: Rect; tension: number; squeeze: number; opacity: number}> = ({r, tension, squeeze, opacity}) => {
  if (opacity <= 0.001) return null;
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  const len = r.h * 0.62 * (1 - 0.14 * tension - 0.07 * squeeze);
  const wid = r.w * 0.2 * (1 + 0.3 * tension + 0.15 * squeeze);
  const top = cy - len / 2;
  const bot = cy + len / 2;
  const wave = (1 - tension) * 12;
  return (
    <g opacity={opacity}>
      <line x1={cx} y1={r.y + 26} x2={cx} y2={top + 8} stroke={PAL.charcoal} strokeWidth={8} strokeLinecap="round" />
      <line x1={cx} y1={bot - 8} x2={cx} y2={r.y + r.h - 26} stroke={PAL.charcoal} strokeWidth={8} strokeLinecap="round" />
      <path d={`M ${cx} ${top} C ${cx + wid * 1.35} ${top + len * 0.2}, ${cx + wid * 1.35} ${bot - len * 0.2}, ${cx} ${bot} C ${cx - wid * 1.35} ${bot - len * 0.2}, ${cx - wid * 1.35} ${top + len * 0.2}, ${cx} ${top} Z`} fill={PAL.beige} stroke={PAL.charcoal} strokeWidth={4} />
      {[-0.55, -0.27, 0, 0.27, 0.55].map((k) => (
        <path
          key={k}
          d={`M ${cx + k * wid * 1.2} ${top + len * 0.18} q ${wave} ${len * 0.16} 0 ${len * 0.32} t 0 ${len * 0.32}`}
          fill="none"
          stroke={PAL.charcoal}
          strokeWidth={2.5}
          opacity={0.6}
          strokeLinecap="round"
        />
      ))}
      {squeeze > 0.05
        ? [-1, 1].map((sd) => (
            <g key={sd} opacity={squeeze}>
              {[-1, 0, 1].map((i) => (
                <line key={i} x1={cx + sd * (wid * 1.25 + 14)} y1={cy + i * 34} x2={cx + sd * (wid * 1.25 + 40)} y2={cy + i * 44} stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" />
              ))}
            </g>
          ))
        : null}
    </g>
  );
};

/** Beats 08–11: spasticity (muscle tone, restricted arc) → foot drop (ankle view) → slow gait cycle. */
export const Act4: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);

  // ----- Beat 8–9: spasticity leg -----
  const enter = ramp(t, at(8, 0), at(8, 0.35));
  const tighten = ramp(t, at(9, 0.02), at(9, 0.35));
  const squeeze = Math.exp(-((t - at(9, 0.72)) ** 2) / (2 * 0.1 ** 2));
  const amp = mix(27, 8, tighten);
  const kneeK = amp + amp * Math.sin(((t - at(8, 0)) / 1.9) * Math.PI * 2 - Math.PI / 2) + 7 * squeeze;
  const toFoot = ramp(t, at(10, 0), at(10, 0.4));
  const spasHip = {x: mix(PATH.legHip.x, SPAS.hip.x, enter) - 140 * toFoot, y: mix(PATH.legHip.y, SPAS.hip.y, enter)};
  const spasL = mix(PATH.legL, SPAS.L, enter);
  const spasPose = legFromAngles(spasHip, mix(PATH.hipA, SPAS.hipA, enter), mix(PATH.kneeA, kneeK, enter), 0, dimsFor(spasL));
  const spasOpacity = 1 - ramp(t, at(10, 0.05), at(10, 0.3));
  const arcsIn = ramp(t, at(8, 0.55), at(8, 0.9));

  // Muscle panel grows out of the calf branch.
  const calf = {x: spasPose.knee.x + (spasPose.ankle.x - spasPose.knee.x) * 0.42 - 20, y: spasPose.knee.y + (spasPose.ankle.y - spasPose.knee.y) * 0.42};
  const grow = ramp(t, at(8, 0.15), at(8, 0.6));
  const panelR = mixRect(mixRect({x: calf.x - 10, y: calf.y - 10, w: 20, h: 20}, MUSCLE_PANEL, grow), WINDOW, toFoot);
  const panelContent = grow * (1 - ramp(t, at(10, 0), at(10, 0.15)));

  // ----- Beat 10: ankle/foot side view inside the window -----
  const footIn = ramp(t, at(10, 0.15), at(10, 0.45));
  const toGait = ramp(t, at(11, 0), at(11, 0.15));
  const dropA = 28 - 5 * Math.sin(((t - at(10, 0)) / 1.6) * Math.PI * 2);
  const fv = legFromAngles(FOOTVIEW.hip, 0, 0, dropA, dimsFor(FOOTVIEW.L));
  const fvGhost = legFromAngles(FOOTVIEW.hip, 0, 0, -8, dimsFor(FOOTVIEW.L));
  const fvOpacity = footIn * (1 - toGait);

  // The restricted movement arc travels from the knee to the ankle.
  const arcCenter = {x: mix(spasPose.knee.x, fv.ankle.x, toFoot), y: mix(spasPose.knee.y, fv.ankle.y, toFoot)};
  const arcR = mix(SPAS.arcR, FOOTVIEW.arcR, toFoot);
  const footDirA = (a: number) => 90 - a; // foot direction (cos ψ, sin ψ) expressed as a sin/cos angle
  const a0 = mix(SPAS.hipA, footDirA(-8), toFoot);
  const a1 = mix(SPAS.hipA - 2 * amp, footDirA(dropA), toFoot);
  const ghostA1 = SPAS.hipA - 54;

  // ----- Beat 11: slow gait cycle with foot drop, then compensatory knee lift -----
  const gp = gaitPhase(t);
  const gaitSpec = {x: GAIT.x, floorY: GAIT.floorY, L: GAIT.L};
  const gaitPoses = walkerPoses({...gaitSpec, phase: gp, near: gaitMods(gp)});
  const gaitOpacity = toGait * (1 - ramp(t, at(12, 0.05), at(12, 0.35)));
  const swingIdx = Math.floor(gp - 0.62);
  const sStart = swingIdx + 0.62;
  const inSwing = gp - sStart <= 0.38;
  const pathEnd = inSwing ? gp : sStart + 0.38;
  const pathFade = inSwing ? 1 : 1 - ramp(gp, sStart + 0.38, sStart + 0.62);
  const showPath = sStart >= 0.6 && gp > sStart + 0.02;
  const graze = inSwing && gaitPoses.near.toe.y > GAIT.floorY - 2 ? 1 : 0;
  const zoomIn = mix(1.55, 1, ramp(t, at(11, 0), at(11, 0.18)));
  const zc = gaitPoses.near.ankle;

  const windowOpacity = 1 - ramp(t, at(12, 0.1), at(12, 0.4));

  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <defs>
        <clipPath id="a4-win">
          <rect x={panelR.x} y={panelR.y} width={panelR.w} height={panelR.h} rx={30} />
        </clipPath>
      </defs>
      {/* panel / window card */}
      <CardRect r={panelR} opacity={Math.min(ramp(t, at(8, 0.15), at(8, 0.3)), windowOpacity)} />
      {grow > 0.001 && panelContent > 0.001 ? (
        <path
          d={`M ${calf.x} ${calf.y} C ${calf.x + 120} ${calf.y}, ${panelR.x - 60} ${panelR.y + panelR.h / 2}, ${panelR.x} ${panelR.y + panelR.h / 2}`}
          fill="none"
          stroke={PAL.charcoal}
          strokeWidth={4}
          opacity={panelContent * spasOpacity}
        />
      ) : null}
      <PanelMuscle r={panelR} tension={tighten} squeeze={squeeze} opacity={panelContent} />

      {/* spasticity leg with normal (ghost) and restricted knee arcs */}
      {spasOpacity > 0.001 ? (
        <g opacity={spasOpacity}>
          <path d={arcPath(spasPose.knee, SPAS.arcR, SPAS.hipA, ghostA1)} fill="none" stroke={PAL.line} strokeWidth={6} strokeDasharray="14 12" strokeLinecap="round" opacity={arcsIn} />
          <Leg pose={spasPose} w={spasL * 0.3} muscles={{calf: 1, thigh: 1, tension: tighten, squeeze}} />
          <circle cx={spasPose.hip.x} cy={spasPose.hip.y} r={spasL * 0.16} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
        </g>
      ) : null}

      <g clipPath="url(#a4-win)">
        {fvOpacity > 0.001 ? (
          <g opacity={fvOpacity}>
            <Floor x0={WINDOW.x + 40} x1={WINDOW.x + WINDOW.w - 40} y={FOOTVIEW.floorY} />
            {/* normal lifted-foot position for comparison */}
            <g opacity={0.55}>
              <Capsule pts={[fvGhost.heel, fvGhost.ball, fvGhost.toe]} w={FOOTVIEW.L * 0.15} fill={PAL.beige} ol={3} />
            </g>
            <Leg pose={fv} w={FOOTVIEW.L * 0.3} muscles={{front: 1, calf: 0.6}} />
            {/* weak, dashed command to the front-of-shin (lifting) muscle */}
            <path d={`M ${fv.knee.x + 70} ${WINDOW.y} C ${fv.knee.x + 110} ${fv.knee.y}, ${fv.knee.x + 70} ${fv.knee.y + 120}, ${fv.knee.x + 52} ${fv.knee.y + 200}`} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeDasharray="10 12" strokeLinecap="round" opacity={0.75} />
          </g>
        ) : null}
        {gaitOpacity > 0.001 ? (
          <g opacity={gaitOpacity} transform={`translate(${zc.x} ${zc.y}) scale(${zoomIn}) translate(${-zc.x} ${-zc.y})`}>
            <Floor x0={WINDOW.x + 30} x1={WINDOW.x + WINDOW.w - 30} y={GAIT.floorY} ticks scroll={-gp * SPEED} />
            {showPath ? (
              <path d={toePath(sStart, pathEnd, gaitSpec, gaitMods)} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeDasharray="12 10" strokeLinecap="round" opacity={pathFade} />
            ) : null}
            <WalkerFigure poses={gaitPoses} full phase={gp} nearMuscles={{front: 0.9}} />
            <Scuff x={gaitPoses.near.toe.x} y={GAIT.floorY} k={graze} />
          </g>
        ) : null}
      </g>
      {arcsIn > 0.001 && t < at(11, 0.1) ? (
        <g opacity={arcsIn * (1 - ramp(t, at(11, 0), at(11, 0.1)))}>
          <path d={arcPath(arcCenter, arcR, a0, a1)} fill="none" stroke={PAL.charcoal} strokeWidth={10} strokeLinecap="round" />
          {/* end stop: where the movement is limited */}
          <line
            x1={arcCenter.x + Math.sin(deg(a1)) * (arcR - 22)}
            y1={arcCenter.y + Math.cos(deg(a1)) * (arcR - 22)}
            x2={arcCenter.x + Math.sin(deg(a1)) * (arcR + 22)}
            y2={arcCenter.y + Math.cos(deg(a1)) * (arcR + 22)}
            stroke={PAL.charcoal}
            strokeWidth={8}
            strokeLinecap="round"
          />
        </g>
      ) : null}
    </svg>
  );
};

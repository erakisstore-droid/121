import type React from 'react';
import {ASSETS, PAL, at} from '../config';
import {Clinician, Medicine} from '../diagrams/icons';
import {KneeArc, kneeRect} from '../diagrams/KneeArc';
import {AFO, FES} from '../diagrams/Orthotics';
import {Capsule, Floor, Leg} from '../figure/draw';
import {legFromAngles} from '../figure/gait';
import {ik2} from '../figure/ik';
import {WalkerFigure, dimsFor, walkerPoses} from '../figure/Walker';
import {mix, mixRect, ramp, type Rect} from '../lib/anim';
import {DOC_CARD, EX_PANEL, MED_CARD, RESEARCH, TREAT_CARDS} from '../lib/geom';
import {drawOn} from '../lib/paths';
import {useAbsT} from '../lib/time';
import {gaitMods, toePath} from './Act4';
import {CardRect, ImageCard, Txt, imageCardHeight} from '../ui/primitives';

const TREAT_LABELS = {pt: 'علاج طبيعي', brace: 'دعامة / FES', meds: 'أدوية'} as const;

/** Mini icons for the three treatment cards. */
const TreatIcon: React.FC<{kind: keyof typeof TREAT_LABELS; cx: number; cy: number}> = ({kind, cx, cy}) => {
  if (kind === 'meds') return <Medicine cx={cx} cy={cy} s={70} />;
  const pose = legFromAngles({x: cx - 20, y: cy - 95}, 0, 0, kind === 'pt' ? -12 : 0, dimsFor(80));
  return (
    <g>
      <Leg pose={pose} w={26} ol={3} />
      {kind === 'pt' ? (
        <path d={`M ${pose.toe.x + 18} ${pose.toe.y + 10} A 50 50 0 0 0 ${pose.toe.x + 4} ${pose.toe.y - 44}`} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" />
      ) : (
        <AFO pose={pose} w={26} />
      )}
    </g>
  );
};

/** Seated figure doing ankle range-of-motion, then a modest resistance-band push. */
const SeatedExercise: React.FC<{t: number; opacity: number}> = ({t, opacity}) => {
  if (opacity <= 0.001) return null;
  const band = ramp(t, at(13, 0.48), at(13, 0.6));
  const L = 140;
  const hip = {x: 380, y: 722};
  const sh = {x: 368, y: 548};
  const headR = L * 0.25;
  const rom = Math.sin(((t - at(13, 0)) / 1.5) * Math.PI * 2);
  const push = 0.5 - 0.5 * Math.cos(((t - at(13, 0.6)) / 1.6) * Math.PI * 2);
  const kneeA = mix(72, 18, band);
  const ankleA = mix(22 * rom, 28 * push * band, band);
  const pose = legFromAngles(hip, 90, kneeA, ankleA, dimsFor(L));
  const handRest = {x: 470, y: 706};
  const handBand = {x: 540, y: 662};
  const hand = {x: mix(handRest.x, handBand.x, band), y: mix(handRest.y, handBand.y, band)};
  const elbow = ik2(sh, hand, L * 0.78, L * 0.78, -1);
  const w = L * 0.3;
  const floorY = EX_PANEL.y + EX_PANEL.h - 30;
  return (
    <g opacity={opacity}>
      <Floor x0={EX_PANEL.x + 40} x1={EX_PANEL.x + EX_PANEL.w - 40} y={floorY} w={4} />
      {/* stool */}
      <rect x={290} y={hip.y + 14} width={170} height={18} rx={8} fill={PAL.beige} stroke={PAL.charcoal} strokeWidth={3.5} />
      <line x1={310} y1={hip.y + 32} x2={300} y2={floorY} stroke={PAL.charcoal} strokeWidth={6} strokeLinecap="round" />
      <line x1={440} y1={hip.y + 32} x2={450} y2={floorY} stroke={PAL.charcoal} strokeWidth={6} strokeLinecap="round" />
      <Capsule pts={[hip, sh]} w={w * 1.35} fill={PAL.offWhite} ol={4} />
      <circle cx={sh.x + 4} cy={sh.y - headR * 1.45} r={headR} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
      <Leg pose={pose} w={w} muscles={{calf: 0.9, front: 0.6}} />
      {/* ankle range-of-motion arc */}
      <path
        d={`M ${pose.ankle.x + 70} ${pose.ankle.y + 40} A 80 80 0 0 0 ${pose.ankle.x + 64} ${pose.ankle.y - 52}`}
        fill="none"
        stroke={PAL.charcoal}
        strokeWidth={5}
        strokeDasharray="10 9"
        strokeLinecap="round"
        opacity={1 - band}
      />
      {band > 0.01 ? (
        <g opacity={band}>
          {[0, 10].map((o) => (
            <g key={o}>
              <line x1={hand.x} y1={hand.y + o} x2={pose.ball.x + 8} y2={pose.ball.y + o * 0.5} stroke={PAL.charcoal} strokeWidth={11} strokeLinecap="round" />
              <line x1={hand.x} y1={hand.y + o} x2={pose.ball.x + 8} y2={pose.ball.y + o * 0.5} stroke={PAL.beige} strokeWidth={6} strokeLinecap="round" />
            </g>
          ))}
        </g>
      ) : null}
      <Capsule pts={[sh, elbow, hand]} w={w * 0.62} fill={PAL.offWhite} ol={4} />
    </g>
  );
};

/** Beats 12–15: connector → three treatment cards → exercise + paper B → AFO / FES + paper A → clinician + medicine. */
export const Act5: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);

  // ----- Beat 12: clearance arc becomes the connector rail -----
  const rise = ramp(t, at(12, 0), at(12, 0.4));
  const drops = ramp(t, at(12, 0.3), at(12, 0.55));
  const railOut = ramp(t, at(13, 0), at(13, 0.12));
  const p0 = {x: mix(330, 215, rise), y: mix(1400, TREAT_CARDS.railY, rise)};
  const p1 = {x: mix(660, 775, rise), y: mix(1400, TREAT_CARDS.railY, rise)};
  const cp = {x: 495, y: mix(1290, TREAT_CARDS.railY, rise)};
  const rail = `M ${p0.x} ${p0.y} Q ${cp.x} ${cp.y} ${p1.x} ${p1.y}`;
  const keys = ['pt', 'brace', 'meds'] as const;
  const pop = (i: number) => ramp(t, at(12, 0.4 + i * 0.12), at(12, 0.62 + i * 0.12));

  // ----- Beat 13: PT card opens into the exercise panel -----
  const open = ramp(t, at(13, 0), at(13, 0.15));
  const others = 1 - ramp(t, at(13, 0), at(13, 0.1));
  const ptRect = mixRect(TREAT_CARDS.pt, EX_PANEL, open);
  const exOpacity = ramp(t, at(13, 0.08), at(13, 0.2)) * (1 - ramp(t, at(14, 0), at(14, 0.08)));
  const bIn = ramp(t, at(13, 0.3), at(13, 0.45));
  const bOut = ramp(t, at(14, 0), at(14, 0.1));
  const bZoom = 1 + 0.3 * ramp(t, at(13, 0.62), at(13, 0.78)) * (1 - bOut);
  const takeaway = ramp(t, at(13, 0.55), at(13, 0.68)) * (1 - bOut);

  // ----- Beat 14: AFO, then FES, on a walking leg -----
  const gp = (t - at(14, 0)) / 2.2 + 0.3;
  const fesK = ramp(t, at(14, 0.48), at(14, 0.56));
  const afoOpacity = ramp(t, at(14, 0.05), at(14, 0.15)) * (1 - fesK);
  const walkOpacity = ramp(t, at(14, 0.02), at(14, 0.1)) * (1 - ramp(t, at(15, 0.02), at(15, 0.12)));
  const spec = {x: 470, floorY: EX_PANEL.y + EX_PANEL.h - 36, L: 150};
  const supported = () => ({...gaitMods(0), steppage: 0, support: 1});
  const poses = walkerPoses({...spec, phase: gp, near: supported()});
  const swingK = (((gp % 1) + 1) % 1 - 0.58) / 0.16;
  const pulse = swingK > 0 && swingK < 1 ? swingK : 0;
  const swingIdx = Math.floor(gp - 0.62);
  const sStart = swingIdx + 0.62;
  const inSwing = gp - sStart <= 0.38;
  const aIn = ramp(t, at(14, 0.08), at(14, 0.2));

  // ----- Beat 15: paper A → clinician card; stiffness diagram eases slightly -----
  const toDoc = ramp(t, at(15, 0), at(15, 0.14));
  const aCardW = mix(RESEARCH.w, DOC_CARD.w, toDoc);
  const aX = mix(RESEARCH.x + (1 - aIn) * 180, DOC_CARD.x, toDoc);
  const aY = mix(RESEARCH.y, DOC_CARD.y + (DOC_CARD.h - imageCardHeight(ASSETS.paperA.w, ASSETS.paperA.h, DOC_CARD.w)) / 2, toDoc);
  const aOpacity = aIn * (1 - ramp(t, at(15, 0.06), at(15, 0.14)));
  const aZoom = 1 + 0.15 * ramp(t, at(14, 0.72), at(14, 0.86)) * (1 - toDoc);
  const docIn = ramp(t, at(15, 0.08), at(15, 0.18));
  const medIn = ramp(t, at(15, 0.16), at(15, 0.28));
  const kneeIn = ramp(t, at(15, 0.06), at(15, 0.16));
  const ease = ramp(t, at(15, 0.45), at(15, 0.8));

  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <clipPath id="a5-panel">
            <rect x={EX_PANEL.x} y={EX_PANEL.y} width={EX_PANEL.w} height={EX_PANEL.h} rx={30} />
          </clipPath>
        </defs>
        {/* beat 12 rail + drops */}
        {railOut < 1 ? (
          <g opacity={1 - railOut}>
            <path d={rail} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" strokeDasharray={rise < 0.6 ? '12 10' : undefined} opacity={ramp(t, at(12, 0), at(12, 0.08))} />
            {keys.map((k) => {
              const r = TREAT_CARDS[k];
              const d = `M ${r.x + r.w / 2} ${TREAT_CARDS.railY} L ${r.x + r.w / 2} ${r.y}`;
              return <path key={k} d={d} stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(d, drops)} />;
            })}
          </g>
        ) : null}
        {keys.map((k, i) => {
          const base = k === 'pt' ? ptRect : (TREAT_CARDS[k] as Rect);
          const s = pop(i);
          if (s <= 0.001) return null;
          const fade = k === 'pt' ? 1 : others;
          const sc = mix(0.6, 1, s) * (k === 'pt' ? 1 : mix(0.85, 1, others));
          const r = {x: base.x + (base.w * (1 - sc)) / 2, y: base.y + (base.h * (1 - sc)) / 2, w: base.w * sc, h: base.h * sc};
          const iconK = k === 'pt' ? 1 - open : 1;
          return (
            <g key={k} opacity={Math.min(s, fade) * (k === 'pt' ? 1 - ramp(t, at(15, 0.02), at(15, 0.04)) * 0 : 1)}>
              <CardRect r={r} />
              {iconK > 0.01 ? (
                <g opacity={iconK} transform={`translate(${r.x + r.w / 2} ${r.y + r.h * 0.4}) scale(${sc}) translate(${-(base.x + base.w / 2)} ${-(base.y + base.h * 0.4)})`}>
                  <TreatIcon kind={k} cx={base.x + base.w / 2} cy={base.y + base.h * 0.4} />
                </g>
              ) : null}
            </g>
          );
        })}
        <g clipPath="url(#a5-panel)">
          <SeatedExercise t={t} opacity={exOpacity} />
          {walkOpacity > 0.001 ? (
            <g opacity={walkOpacity}>
              <Floor x0={EX_PANEL.x + 30} x1={EX_PANEL.x + EX_PANEL.w - 30} y={spec.floorY} ticks scroll={-gp * 260} w={4} />
              {gp > sStart + 0.02 && sStart > 0 ? (
                <path d={toePath(sStart, inSwing ? gp : sStart + 0.38, spec, supported)} fill="none" stroke={PAL.charcoal} strokeWidth={4} strokeDasharray="10 9" strokeLinecap="round" opacity={inSwing ? 1 : 1 - ramp(gp, sStart + 0.38, sStart + 0.6)} />
              ) : null}
              <WalkerFigure poses={poses} full phase={gp} nearMuscles={{front: 0.8}} />
              <AFO pose={poses.near} w={poses.dims.thigh * 0.3} opacity={afoOpacity} />
              <FES pose={poses.near} w={poses.dims.thigh * 0.3} pulse={pulse} opacity={fesK} />
            </g>
          ) : null}
          <KneeArc r={kneeRect(EX_PANEL)} t={t} amp={mix(8, 13, ease)} tension={mix(1, 0.72, ease)} opacity={kneeIn} />
        </g>
        <CardRect r={MED_CARD} opacity={medIn} />
        <CardRect r={DOC_CARD} opacity={docIn} />
        <Medicine cx={MED_CARD.x + MED_CARD.w / 2} cy={MED_CARD.y + 190} s={115} opacity={medIn} />
        <Clinician cx={DOC_CARD.x + DOC_CARD.w / 2 - 30} cy={DOC_CARD.y + 170} s={150} opacity={docIn} />
      </svg>
      {keys.map((k, i) => {
        const r = TREAT_CARDS[k];
        const o = Math.min(pop(i), k === 'pt' ? 1 - open : others);
        return (
          <Txt key={k} x={r.x + 6} y={r.y + r.h - 96} w={r.w - 12} size={40} weight={700} opacity={o} nowrap>
            {TREAT_LABELS[k]}
          </Txt>
        );
      })}
      <ImageCard file={ASSETS.paperB.file} iw={ASSETS.paperB.w} ih={ASSETS.paperB.h} x={RESEARCH.x + (1 - bIn) * 180 - bOut * 220} y={RESEARCH.y} w={RESEARCH.w} opacity={Math.min(bIn, 1 - bOut)} zoom={bZoom} fx={0} fy={0} />
      <Txt x={90} y={RESEARCH.y + imageCardHeight(ASSETS.paperB.w, ASSETS.paperB.h, RESEARCH.w) + 8} w={810} size={40} weight={700} opacity={takeaway}>
        الإطالة لم تتفوّق على تمارين مدى الحركة
      </Txt>
      <ImageCard file={ASSETS.paperA.file} iw={ASSETS.paperA.w} ih={ASSETS.paperA.h} x={aX} y={aY} w={aCardW} opacity={aOpacity} zoom={aZoom} fx={0} fy={0} />
      <Txt x={DOC_CARD.x} y={DOC_CARD.y + DOC_CARD.h - 112} w={DOC_CARD.w} size={42} weight={700} opacity={docIn}>
        تقييم الطبيب
      </Txt>
      <Txt x={MED_CARD.x} y={MED_CARD.y + MED_CARD.h - 112} w={MED_CARD.w} size={42} weight={700} opacity={medIn} dir="ltr">
        Baclofen
      </Txt>
    </>
  );
};

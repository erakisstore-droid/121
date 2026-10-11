import type React from 'react';
import {PAL, SOURCES, at} from '../config';
import {BloodTube, Stethoscope} from '../art/objects';
import {LabReport} from '../art/Report';
import {ASSESS, CARD_B, LDL_CARD, REPORT, SCALE, TUBE8, TUBE9, reportRowRect} from '../geom';
import {EASE, mix, mixRect, ramp} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';
import {useAbsT} from '../../ms/lib/time';
import {CardRect, ImageCard, Txt} from '../../ms/ui/primitives';

/** Path that the report connector follows; reused by beat 12 as the start of the DNA strand. */
export const ASSESS_PATH = `M ${SCALE.x1 + 20} ${SCALE.y} L 890 ${SCALE.y} L 890 ${ASSESS.y} L ${ASSESS.x + 90} ${ASSESS.y}`;

/** Beats 09–11: tube → connector → lab report → LDL-C ≥190 threshold, source B, medical assessment. */
export const ActD: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);

  // Beat 9: tube moves aside; a connector traces into the report's left edge, which unfolds.
  const move = ramp(t, at(9, 0), at(9, 0.3));
  const tube = {x: mix(TUBE8.x, TUBE9.x, move), y: mix(TUBE8.y, TUBE9.y, move), w: mix(TUBE8.w, TUBE9.w, move), h: mix(TUBE8.h, TUBE9.h, move)};
  const tubeOut = ramp(t, at(11, 0), at(11, 0.1));
  const c1 = `M ${TUBE9.x + TUBE9.w / 2} ${TUBE9.y + TUBE9.h + 4} L ${TUBE9.x + TUBE9.w / 2} ${REPORT.y + REPORT.h} L ${REPORT.x} ${REPORT.y + REPORT.h} L ${REPORT.x} ${REPORT.y + 28}`;
  const trace = ramp(t, at(9, 0.25), at(9, 0.7));
  const unfold = ramp(t, at(9, 0.65), at(10, 0.08), EASE.out);

  // Beat 10: rows in order, LDL-C emphasised.
  const rows = [0, 1, 2, 3].map((i) => ramp(t, at(10, 0.1 + i * 0.14), at(10, 0.22 + i * 0.14)));
  const emph = ramp(t, at(10, 0.72), at(10, 0.85));

  // Beat 11: isolate the LDL row; its line becomes the threshold scale; source B; assessment.
  const iso = ramp(t, at(11, 0), at(11, 0.14), EASE.inOut);
  const reportOut = ramp(t, at(11, 0.02), at(11, 0.12));
  const rowR = mixRect(reportRowRect(1), LDL_CARD, iso);
  const thr = ramp(t, at(11, 0.12), at(11, 0.24));
  const scaleK = ramp(t, at(11, 0.18), at(11, 0.32));
  const bIn = ramp(t, at(11, 0.3), at(11, 0.42));
  // full header first, then a 1.9× container zoom panning along the guideline title
  const bZoom = 1 + 0.9 * ramp(t, at(11, 0.52), at(11, 0.62));
  const bFx = mix(0.04, 0.92, ramp(t, at(11, 0.64), at(11, 0.97), EASE.inOut));
  const assess = ramp(t, at(11, 0.45), at(11, 0.65));
  const out = ramp(t, at(12, 0), at(12, 0.12));
  const tickX = mix(SCALE.x0, SCALE.x1, SCALE.tick);

  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {trace > 0.001 && reportOut < 1 ? <path d={c1} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" opacity={1 - reportOut} {...drawOn(c1, trace)} /> : null}
        <LabReport x={REPORT.x} y={REPORT.y} w={REPORT.w} h={REPORT.h} open={unfold} rows={rows} emph={emph} opacity={1 - reportOut} />
        {iso > 0.001 && out < 1 ? (
          <g opacity={(1 - out) * Math.min(1, iso * 3)}>
            <CardRect r={rowR} />
            <rect x={rowR.x + 14} y={rowR.y + 14} width={12} height={rowR.h - 28} rx={6} fill={PAL.orangeDeep} />
          </g>
        ) : null}
        {/* the row underline becomes the threshold scale */}
        {scaleK > 0.001 && out < 1 ? (
          <g opacity={1 - out}>
            <path d={`M ${SCALE.x0} ${SCALE.y} L ${SCALE.x1} ${SCALE.y}`} stroke={PAL.offWhite} strokeWidth={22} strokeLinecap="round" {...drawOn(`M ${SCALE.x0} ${SCALE.y} L ${SCALE.x1} ${SCALE.y}`, scaleK)} />
            <path d={`M ${tickX} ${SCALE.y} L ${SCALE.x1} ${SCALE.y}`} stroke={PAL.charcoal} strokeWidth={22} strokeLinecap="round" opacity={ramp(scaleK, 0.7, 1)} />
            <line x1={tickX} y1={SCALE.y - 34} x2={tickX} y2={SCALE.y + 26} stroke={PAL.charcoal} strokeWidth={6} strokeLinecap="round" opacity={ramp(scaleK, 0.7, 1)} />
          </g>
        ) : null}
        {assess > 0.001 && out < 1 ? (
          <g opacity={1 - out}>
            <path d={ASSESS_PATH} fill="none" stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" {...drawOn(ASSESS_PATH, assess)} />
            <circle cx={ASSESS.x} cy={ASSESS.y} r={76 * ramp(assess, 0.6, 1)} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
            <Stethoscope cx={ASSESS.x - 4} cy={ASSESS.y + 8} s={60} opacity={ramp(assess, 0.75, 1)} />
          </g>
        ) : null}
        <BloodTube x={tube.x} y={tube.y} w={tube.w} h={tube.h} level={0.62} label={1} opacity={ramp(t, at(9, 0), at(9, 0.01)) * (1 - tubeOut)} />
      </svg>
      {iso > 0.001 && out < 1 ? (
        <>
          <Txt x={rowR.x + 50} y={rowR.y + rowR.h / 2 - mix(30, 52, iso)} w={rowR.w - 70} size={mix(46, 72, iso)} align="left" dir="ltr" opacity={(1 - out) * Math.min(1, iso * 3)} nowrap>
            LDL-C{' '}
            <span style={{opacity: thr, color: PAL.charcoal}}>≥190 mg/dL</span>
          </Txt>
          <Txt x={tickX - 80} y={SCALE.y + 34} w={160} size={40} weight={800} dir="ltr" opacity={ramp(scaleK, 0.75, 1) * (1 - out)}>
            190
          </Txt>
        </>
      ) : null}
      <ImageCard file={SOURCES.b.file} iw={SOURCES.b.w} ih={SOURCES.b.h} x={CARD_B.x + (1 - bIn) * 140} y={CARD_B.y + 70} w={CARD_B.w} opacity={bIn * (1 - out)} zoom={bZoom} fx={bFx} fy={0.38} />
    </>
  );
};

import type React from 'react';
import {PAL, SOURCES, at} from '../config';
import {pageDelta} from '../Board';
import {NodeDot, Stethoscope} from '../art/objects';
import {LabReport} from '../art/Report';
import {LdlCluster, tubeLabelRect} from '../art/hero';
import {ASSESS, CARD_B, DNA, LDL_CARD, REPORT, SCALE, TUBE3, reportRowRect} from '../geom';
import {EASE, mix, mixRect, ramp} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';
import {useAbsT} from '../../ms/lib/time';
import {CardRect, ImageCard, Txt} from '../../ms/ui/primitives';

export const ASSESS_PATH = `M ${SCALE.x1 + 20} ${SCALE.y} L 890 ${SCALE.y} L 890 ${ASSESS.y} L ${ASSESS.x + 80} ${ASSESS.y}`;

/** Beats 09–11 (page p4): tube label → lab report; rows; LDL-C ≥190 threshold; source B; medical assessment.
 *  Beat 12 start: the LDL scale line runs left to become the DNA strand on page p5. */
export const ActD: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const d3 = pageDelta('p3', 'p4');
  const d5 = pageDelta('p5', 'p4');

  // Beat 9: the label leaves the tube and unfolds into the report
  const lab = tubeLabelRect(TUBE3.x, TUBE3.y, TUBE3.w, TUBE3.h);
  const lab4 = {x: lab.x + d3.x, y: lab.y + d3.y, w: lab.w, h: lab.h};
  const travel = ramp(t, at(9, 0.05), at(9, 0.6), EASE.inOut);
  const unfold = ramp(t, at(9, 0.55), at(10, 0.06), EASE.out);
  const midR = {x: REPORT.x + REPORT.w * 0.3, y: REPORT.y + 40, w: REPORT.w * 0.4, h: 160};
  const card = mixRect(mixRect(lab4, midR, travel), REPORT, unfold);
  const labText = 1 - ramp(t, at(9, 0.45), at(9, 0.6));
  const threadD = `M ${TUBE3.x + TUBE3.w / 2 + d3.x} ${TUBE3.y + TUBE3.h + d3.y + 6} L ${TUBE3.x + TUBE3.w / 2 + d3.x} ${REPORT.y - 40} Q ${TUBE3.x + TUBE3.w / 2 + d3.x} ${REPORT.y} ${REPORT.x + REPORT.w * 0.6} ${REPORT.y}`;
  const thread = ramp(t, at(9, 0.05), at(9, 0.6));
  // the travel thread hands over to the report and clears the caption zone
  const threadOut = ramp(t, at(10, 0), at(10, 0.15));

  // Beat 10: rows unfold in order; LDL-C emphasised (blank result fields only)
  const rows = [0, 1, 2, 3].map((i) => ramp(t, at(10, 0.1 + i * 0.14), at(10, 0.22 + i * 0.14)));
  const emph = ramp(t, at(10, 0.72), at(10, 0.85));

  // Beat 11
  const iso = ramp(t, at(11, 0), at(11, 0.14), EASE.inOut);
  const dim = ramp(t, at(11, 0), at(11, 0.1));
  const rowR = mixRect(reportRowRect(1), LDL_CARD, iso);
  const thr = ramp(t, at(11, 0.12), at(11, 0.24));
  const scaleK = ramp(t, at(11, 0.18), at(11, 0.32));
  const bIn = ramp(t, at(11, 0.3), at(11, 0.42));
  const bZoom = 1 + 0.9 * ramp(t, at(11, 0.52), at(11, 0.62)) * (1 - ramp(t, at(12, 0), at(12, 0.1)));
  const bFx = mix(0.04, 0.92, ramp(t, at(11, 0.64), at(11, 0.97), EASE.inOut));
  const assess = ramp(t, at(11, 0.45), at(11, 0.65));
  const tickX = mix(SCALE.x0, SCALE.x1, SCALE.tick);

  // Beat 12: the scale line becomes the DNA strand (on page p5)
  const toDna = `M ${SCALE.x0} ${SCALE.y} L ${DNA.x + d5.x + 80} ${SCALE.y} C ${DNA.x + d5.x + 20} ${SCALE.y}, ${DNA.x + d5.x} ${DNA.y0 + 60}, ${DNA.x + d5.x} ${DNA.y0}`;
  const dnaLine = ramp(t, at(12, 0), at(12, 0.22));

  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {thread > 0.001 && threadOut < 1 ? <path d={threadD} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={1 - threadOut} {...drawOn(threadD, thread)} /> : null}
        {dnaLine > 0.001 ? (
          <>
            <path d={toDna} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(toDna, dnaLine)} />
            <NodeDot x={SCALE.x0} y={SCALE.y} />
          </>
        ) : null}
        {travel > 0.001 && unfold < 1 ? (
          <g>
            <CardRect r={card} radius={mix(8, 28, unfold)} />
            {labText > 0.001 ? (
              <g opacity={labText}>
                <text x={card.x + card.w / 2} y={card.y + card.h * 0.45} textAnchor="middle" fontFamily="Cairo" fontWeight={800} fontSize={Math.min(40, card.w * 0.19)} fill={PAL.charcoal}>
                  Lipid Profile
                </text>
              </g>
            ) : null}
          </g>
        ) : null}
        <LabReport x={REPORT.x} y={REPORT.y} w={REPORT.w} h={REPORT.h} open={unfold >= 1 ? 1 : 0} rows={rows} emph={emph} dim={dim} opacity={1 - iso} />
        {iso > 0.001 ? (
          <g opacity={Math.min(1, iso * 3)}>
            <CardRect r={rowR} />
            <rect x={rowR.x + 14} y={rowR.y + 14} width={12} height={rowR.h - 28} rx={6} fill={PAL.orangeDeep} />
            <LdlCluster x={rowR.x + mix(20, 110, iso)} y={rowR.y + rowR.h / 2} r={mix(24, 68, iso)} opacity={iso} rot={t * 8} />
          </g>
        ) : null}
        {scaleK > 0.001 ? (
          <g>
            <path d={`M ${SCALE.x0} ${SCALE.y} L ${SCALE.x1} ${SCALE.y}`} stroke={PAL.offWhite} strokeWidth={22} strokeLinecap="round" {...drawOn(`M ${SCALE.x0} ${SCALE.y} L ${SCALE.x1} ${SCALE.y}`, scaleK)} />
            <path d={`M ${tickX} ${SCALE.y} L ${SCALE.x1} ${SCALE.y}`} stroke={PAL.charcoal} strokeWidth={22} strokeLinecap="round" opacity={ramp(scaleK, 0.7, 1)} />
            <line x1={tickX} y1={SCALE.y - 34} x2={tickX} y2={SCALE.y + 26} stroke={PAL.charcoal} strokeWidth={6} strokeLinecap="round" opacity={ramp(scaleK, 0.7, 1)} />
          </g>
        ) : null}
        {assess > 0.001 ? (
          <g>
            <path d={ASSESS_PATH} fill="none" stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" {...drawOn(ASSESS_PATH, assess)} />
            <NodeDot x={SCALE.x1 + 20} y={SCALE.y} />
            <circle cx={ASSESS.x} cy={ASSESS.y} r={76 * ramp(assess, 0.6, 1)} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={4} />
            <Stethoscope cx={ASSESS.x - 4} cy={ASSESS.y + 8} s={60} opacity={ramp(assess, 0.75, 1)} />
          </g>
        ) : null}
      </svg>
      {iso > 0.001 ? (
        <>
          <Txt x={rowR.x + mix(50, 200, iso)} y={rowR.y + rowR.h / 2 - mix(30, 46, iso)} w={rowR.w - 220} size={mix(46, 62, iso)} align="left" dir="ltr" opacity={Math.min(1, iso * 3)} nowrap>
            LDL-C <span style={{opacity: thr}}>≥ 190 mg/dL</span>
          </Txt>
          <Txt x={tickX - 80} y={SCALE.y + 34} w={160} size={40} weight={800} dir="ltr" opacity={ramp(scaleK, 0.75, 1)}>
            190
          </Txt>
        </>
      ) : null}
      <ImageCard file={SOURCES.b.file} iw={SOURCES.b.w} ih={SOURCES.b.h} x={CARD_B.x + (1 - bIn) * 140} y={CARD_B.y} w={CARD_B.w} opacity={bIn} zoom={bZoom} fx={bFx} fy={0.38} />
    </>
  );
};

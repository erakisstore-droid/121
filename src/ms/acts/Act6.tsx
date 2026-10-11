import {getLength, getPointAtLength} from '@remotion/paths';
import type React from 'react';
import {LAYOUT, PAL, at} from '../config';
import {Bladder, Clinician, Infection, Medicine, Node, Phone, SupplementJar, Thermometer} from '../diagrams/icons';
import {KneeArc, kneeRect} from '../diagrams/KneeArc';
import {TopicCardSvg, TopicLabel} from '../diagrams/TopicCard';
import {mix, mixRect, ramp, type Rect} from '../lib/anim';
import {BUBBLE, CONTACT, DOC_CARD, DOC_CARD_17, EX_PANEL, MED_CARD, P16, SUPP_CARD, TRIGGER_NODES} from '../lib/geom';
import {drawOn} from '../lib/paths';
import {useAbsT} from '../lib/time';
import {CardRect, Txt} from '../ui/primitives';

const shift = (r: Rect, dx: number, dy: number): Rect => ({...r, x: r.x + dx, y: r.y + dy});

/** Beats 16–19: aggravating factors → supplement discussion → contact your clinician → comment prompt. */
export const Act6: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);

  // ----- Beat 16: three triggers pulse into the stiffness diagram -----
  const toSide = ramp(t, at(16, 0), at(16, 0.15));
  const panel = mixRect(EX_PANEL, P16, toSide);
  const panelOut = ramp(t, at(17, 0), at(17, 0.14));
  const medOut = ramp(t, at(16, 0), at(16, 0.1));
  const nodeIn = (i: number) => ramp(t, at(16, 0.12 + i * 0.2), at(16, 0.22 + i * 0.2));
  const kr = kneeRect(panel);
  const target = {x: kr.x + kr.w / 2 - 22, y: kr.y + kr.h * 0.6};
  const conn = TRIGGER_NODES.map((n, i) => {
    const d = `M ${n.x + 70} ${n.y} C ${n.x + 160} ${n.y}, ${target.x - 120} ${target.y}, ${target.x} ${target.y}`;
    const s = at(16, 0.22 + i * 0.2);
    const k = ramp(t, s, s + 0.55, (x) => x);
    return {d, k, on: t > s && t < s + 0.6, draw: ramp(t, at(16, 0.16 + i * 0.2), at(16, 0.26 + i * 0.2))};
  });
  const hits = conn.reduce((m, c) => m + ramp(c.k, 0.9, 1), 0);
  const squeeze = conn.reduce((m, c) => Math.max(m, c.on ? Math.exp(-((c.k - 1) ** 2) / 0.006) : 0), 0);
  const trigOut = panelOut;

  // ----- Beat 17: supplement card beside the clinician card -----
  const docMove = ramp(t, at(17, 0.05), at(17, 0.25));
  const suppIn = ramp(t, at(17, 0.15), at(17, 0.32));
  const docR18 = ramp(t, at(18, 0.05), at(18, 0.25));
  const suppOut = ramp(t, at(18, 0), at(18, 0.12));

  // ----- Beat 18: symptom cards reconnect to a calm contact card -----
  const topicsIn = ramp(t, at(18, 0.08), at(18, 0.28));
  const links = ramp(t, at(18, 0.25), at(18, 0.4));
  // ----- Beat 19: contact card becomes a comment bubble -----
  const toBubble = ramp(t, at(19, 0), at(19, 0.25));
  const ask = ramp(t, at(19, 0.15), at(19, 0.35));

  const docRect = mixRect(mixRect(DOC_CARD, DOC_CARD_17, docMove), mixRect(CONTACT, BUBBLE, toBubble), docR18);
  const docC = {x: docRect.x + docRect.w / 2, y: docRect.y + docRect.h / 2};
  const clinS = mix(mix(150, 140, docMove), 95, docR18);
  const clinOffset = mix(-30, -70, docR18);
  const iconsOut = toBubble;

  // calm settle: leg views slow to a stop for the final hold
  const te = t < at(19, 0.45) ? t : at(19, 0.45) + 0.45 * (1 - Math.exp(-(t - at(19, 0.45)) / 0.45));
  const phase = (te - at(18, 0)) / 2.6;
  const topR = shift(LAYOUT.topCard, 0, -70 * (1 - topicsIn));
  const botR = shift(LAYOUT.bottomCard, 0, 70 * (1 - topicsIn));
  const bubbleTail = `M ${docRect.x + docRect.w * 0.3} ${docRect.y + docRect.h - 2} L ${docRect.x + docRect.w * 0.24} ${docRect.y + docRect.h + 42} L ${docRect.x + docRect.w * 0.42} ${docRect.y + docRect.h - 2}`;

  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {/* stiffness panel */}
        {panelOut < 1 ? (
          <g opacity={1 - panelOut}>
            <CardRect r={panel} />
            <KneeArc r={kr} t={t} amp={13 - 1.6 * hits} tension={Math.min(1, 0.72 + 0.09 * hits)} squeeze={squeeze * 0.7} />
          </g>
        ) : null}
        {/* medicine card from beat 15 leaves */}
        {medOut < 1 ? (
          <g opacity={1 - medOut}>
            <CardRect r={shift(MED_CARD, -60 * medOut, 0)} />
            <Medicine cx={MED_CARD.x + MED_CARD.w / 2 - 60 * medOut} cy={MED_CARD.y + 190} s={115} />
          </g>
        ) : null}
        {/* triggers */}
        {trigOut < 1
          ? TRIGGER_NODES.map((n, i) => {
              const o = nodeIn(i) * (1 - trigOut);
              const c = conn[i];
              const pt = c.on ? getPointAtLength(c.d, c.k * getLength(c.d)) : null;
              return (
                <g key={i}>
                  {c.draw > 0.001 ? <path d={c.d} fill="none" stroke={PAL.charcoal} strokeWidth={4} strokeLinecap="round" opacity={1 - trigOut} {...drawOn(c.d, c.draw)} /> : null}
                  <Node cx={n.x} cy={n.y} s={70 * mix(0.6, 1, nodeIn(i))} opacity={o}>
                    {i === 0 ? <Thermometer cx={n.x} cy={n.y} s={78} level={mix(0.3, 0.75, ramp(t, at(16, 0.12), at(16, 0.4)))} /> : null}
                    {i === 1 ? <Infection cx={n.x} cy={n.y} s={92} spin={(t - at(16, 0)) * 12} /> : null}
                    {i === 2 ? <Bladder cx={n.x} cy={n.y} s={96} level={mix(0.2, 0.85, ramp(t, at(16, 0.52), at(16, 0.85)))} /> : null}
                  </Node>
                  {pt ? <circle cx={pt.x} cy={pt.y} r={12} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={3.5} opacity={(1 - ramp(c.k, 0.9, 1)) * (1 - trigOut)} /> : null}
                </g>
              );
            })
          : null}
        {/* supplement card: neutral, no product, dose or success animation */}
        {suppIn > 0.001 && suppOut < 1 ? (
          <g opacity={Math.min(suppIn, 1 - suppOut)}>
            <CardRect r={shift(SUPP_CARD, -120 * (1 - suppIn) - 120 * suppOut, 0)} />
            <SupplementJar cx={SUPP_CARD.x + SUPP_CARD.w / 2 - 120 * (1 - suppIn) - 120 * suppOut} cy={SUPP_CARD.y + 190} s={150} />
            {/* "talk it through" dots between the two cards */}
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={473 + i * 22} cy={SUPP_CARD.y + SUPP_CARD.h / 2} r={7} fill={PAL.charcoal} opacity={0.35 + 0.65 * ramp(t, at(17, 0.35 + i * 0.08), at(17, 0.45 + i * 0.08))} />
            ))}
          </g>
        ) : null}
        {/* topic cards return */}
        {topicsIn > 0.001 ? (
          <>
            <TopicCardSvg id="a6-s" kind="spasticity" r={topR} phase={phase} opacity={topicsIn} />
            <TopicCardSvg id="a6-f" kind="footDrop" r={botR} phase={phase + 0.1} opacity={topicsIn} />
            {[`M 495 ${topR.y + topR.h} L 495 ${docRect.y}`, `M 495 ${docRect.y + docRect.h} L 495 ${botR.y}`].map((d, i) => (
              <path key={i} d={d} stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(d, links)} />
            ))}
          </>
        ) : null}
        {/* clinician → contact → comment bubble */}
        {toBubble > 0.001 ? <path d={bubbleTail} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={3.5} strokeLinejoin="round" opacity={toBubble} /> : null}
        <CardRect r={docRect} radius={mix(30, 60, toBubble)} />
        {toBubble > 0.001 ? <path d={bubbleTail.replace(/^M ([\d.]+) ([\d.]+)/, (_m, x, y) => `M ${x} ${Number(y) - 4}`)} fill={PAL.offWhite} opacity={toBubble} /> : null}
        <Clinician cx={docC.x + clinOffset} cy={docRect.y + mix(170, docRect.h * 0.42, docR18)} s={clinS} clipboard={docR18 < 0.5} opacity={1 - iconsOut} />
        <Phone cx={docC.x + 78} cy={docC.y} s={88} opacity={ramp(t, at(18, 0.15), at(18, 0.3)) * (1 - iconsOut)} />
      </svg>
      <Txt x={docRect.x} y={docRect.y + docRect.h - 112} w={docRect.w} size={42} weight={700} opacity={1 - ramp(t, at(18, 0), at(18, 0.06))}>
        تقييم الطبيب
      </Txt>
      {topicsIn > 0.001 ? (
        <>
          <TopicLabel kind="spasticity" r={topR} opacity={topicsIn} />
          <TopicLabel kind="footDrop" r={botR} opacity={topicsIn} />
        </>
      ) : null}
      <Txt x={BUBBLE.x} y={BUBBLE.y + BUBBLE.h / 2 - 54} w={BUBBLE.w} size={76} opacity={ask} rise={(1 - ask) * 16}>
        إيه اللي ساعدك؟
      </Txt>
    </>
  );
};

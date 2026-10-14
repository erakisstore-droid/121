import type React from 'react';
import {DATA, PAL, SOURCES, at} from '../config';
import {HazardRatioPlot, hrX} from '../art/charts';
import {Chip, PathPulse, ResearchPin} from '../art/common';
import {Callout, ResearchImage, fullHeight, regionToScreen, viewportRect, type View} from '../art/research';
import {PIN} from './Review';
import {chainViews} from './view';
import {EASE, ramp} from '../../ms/lib/anim';
import {drawOn} from '../../ms/lib/paths';
import {useAbsT} from '../../ms/lib/time';
import {Txt} from '../../ms/ui/primitives';

const Bs = SOURCES.B_CARDIO_2025;
export const PLOT_Y = 980;

/** Beat 09 (p6): 2025 meta-analysis → title → excerpt → 2025 / 16 RCTs / 127,771 total → exact HR plot → ≈21% relative. Beat 10: connector toward the brain. */
export const Cardio: React.FC<{from: number}> = ({from}) => {
  const t = useAbsT(from);
  const c = DATA.cardio;
  const full: View = {x: 120, y: 470, w: 760, vh: fullHeight(Bs, 760), zoom: 1, fu: 0.5, fv: 0.5};
  const title: View = {...full, vh: 300, zoom: 1.2, fu: 0.5, fv: 0.13};
  const ex: View = {...full, vh: 300, zoom: 2.2, fu: 0.72, fv: 0.6};
  const k1 = ramp(t, at(9, 0.2), at(9, 0.27), EASE.inOut);
  const k2 = ramp(t, at(9, 0.3), at(9, 0.38), EASE.inOut);
  const v = chainViews([full, title, ex], [k1, k2]);
  const vp = viewportRect(Bs, v);
  const co = (r: {x: number; y: number; w: number; h: number}) => regionToScreen(Bs, v, r);
  const imgIn = ramp(t, at(9, 0), at(9, 0.06), EASE.out);
  const chip = (i: number) => ramp(t, at(9, 0.27 + i * 0.06), at(9, 0.33 + i * 0.06), EASE.out);
  const axis = ramp(t, at(9, 0.48), at(9, 0.56));
  const ci = ramp(t, at(9, 0.56), at(9, 0.62));
  const pt = ramp(t, at(9, 0.62), at(9, 0.66), EASE.out);
  const rel = ramp(t, at(9, 0.75), at(9, 0.82), EASE.out);
  const epaR = co(Bs.epa);
  const link = `M ${epaR.x + epaR.w} ${epaR.y + epaR.h / 2} C ${960} ${epaR.y + 120}, ${hrX(c.hr) + 260} ${PLOT_Y + 60}, ${hrX(c.hr) + 26} ${PLOT_Y + 140}`;
  const linkK = ramp(t, at(9, 0.66), at(9, 0.74));
  // beat 10: connector bends down toward the brain area (page p7)
  const toBrain = `M ${hrX(c.hr)} ${PLOT_Y + 160} C ${hrX(c.hr)} ${PLOT_Y + 500}, ${280} ${1700}, ${280} ${2100 + 520}`;
  const toBrainK = ramp(t, at(10, 0), at(10, 0.55), EASE.inOut);

  return (
    <>
      <ResearchImage src={Bs} v={v} opacity={imgIn} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <ResearchPin x={PIN.x} y={PIN.y} year="2025" />
        <Callout r={co(Bs.title)} k={ramp(t, at(9, 0.22), at(9, 0.27))} clip={vp} t={t} />
        <Callout r={co(Bs.total)} k={ramp(t, at(9, 0.38), at(9, 0.43))} clip={vp} t={t} />
        <Callout r={epaR} k={ramp(t, at(9, 0.44), at(9, 0.5))} clip={vp} t={t} />
        <HazardRatioPlot y={PLOT_Y} axis={axis} ci={ci} pt={pt} t={t} opacity={ramp(axis, 0, 0.15)} />
        {linkK > 0.001 ? (
          <>
            <path d={link} fill="none" stroke={PAL.charcoal} strokeWidth={4} strokeDasharray="10 8" opacity={linkK} />
            <PathPulse d={link} t={t} n={1} speed={0.55} r={8} color={PAL.orange} o={linkK} />
          </>
        ) : null}
        {toBrainK > 0.001 ? <path d={toBrain} fill="none" stroke={PAL.charcoal} strokeWidth={5} strokeLinecap="round" {...drawOn(toBrain, toBrainK)} /> : null}
      </svg>
      {/* study facts, revealed in order (127,771 = total meta-analysis population) */}
      <Chip x={640} y={828} w={240} h={130} main={String(c.year)} sub="تحليل تجميعي" o={chip(0)} />
      <Chip x={380} y={828} w={240} h={130} main={`${c.rcts} RCTs`} sub="تجارب عشوائية" o={chip(1)} />
      <Chip x={120} y={828} w={240} h={130} main={c.totalN.toLocaleString('en-US')} sub="إجمالي المشاركين" o={chip(2)} />
      <Txt x={560} y={PLOT_Y + 64} w={330} size={36} weight={800} align="left" dir="ltr" opacity={ci} nowrap>
        {`HR ${c.hr.toFixed(2)}`}
      </Txt>
      <Txt x={560} y={PLOT_Y + 108} w={330} size={32} weight={700} align="left" dir="ltr" opacity={ci} nowrap>
        {`95% CI ${c.lo.toFixed(2)}–${c.hi.toFixed(2)}`}
      </Txt>
      <Txt x={420} y={PLOT_Y + 12} w={480} size={38} weight={800} align="right" opacity={ci} nowrap>
        وفيات القلب والأوعية
      </Txt>
      <Chip x={190} y={PLOT_Y + 360} w={620} h={110} main={`انخفاض نسبي \u2066≈${c.relPct}%\u2069`} o={rel} dir="rtl" size={54} hot />
    </>
  );
};

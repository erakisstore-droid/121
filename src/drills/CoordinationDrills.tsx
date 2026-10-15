import '../ms/fonts';
import {Audio} from '@remotion/media';
import type React from 'react';
import {AbsoluteFill, staticFile, useVideoConfig} from 'remotion';
import {BEATS, DRILLS, PAL, SFX_CUES, STAGE, TOTAL_SECONDS} from './config';
import {Ball, Figure, Shadows} from './Figure';
import {cycleIn, drillIndexAt, poseAt} from './poses';
import {Grain, KineticArabicText} from '../omega/frame';
import {FONT_AR} from '../ms/config';
import {EASE, ramp} from '../ms/lib/anim';
import {useAbsT} from '../ms/lib/time';

const {cx, floor, L, ballR} = STAGE;

/* ---------------- board ---------------- */
const Backdrop: React.FC = () => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <defs>
      <pattern id="cd-grid" width={90} height={90} patternUnits="userSpaceOnUse">
        <path d="M 90 0 L 0 0 0 90" fill="none" stroke={PAL.orangeDeep} strokeWidth={2} />
      </pattern>
    </defs>
    <rect width={1080} height={1920} fill="url(#cd-grid)" opacity={0.55} />
    <circle cx={-40} cy={720} r={300} fill={PAL.orangeDeep} opacity={0.42} />
    <circle cx={1120} cy={1240} r={360} fill={PAL.orangeDeep} opacity={0.42} />
  </svg>
);

/** Court corner in perspective (baseline + sidelines + service box), as in the reference framing. */
const Court: React.FC<{o: number}> = ({o}) => {
  const base = floor + 80;
  const serve = floor - 300;
  const net = floor - 470;
  const line = {stroke: PAL.offWhite, strokeLinecap: 'round' as const, fill: 'none'};
  return (
    <g opacity={o}>
      <path d={`M -60 ${base + 40} L 1140 ${base + 40} L 1140 ${base + 400} L -60 ${base + 400} Z`} fill={PAL.orangeDeep} opacity={0.35} />
      <line x1={-60} y1={base} x2={1140} y2={base} {...line} strokeWidth={10} />
      <line x1={70} y1={base} x2={250} y2={net} {...line} strokeWidth={8} opacity={0.85} />
      <line x1={1010} y1={base} x2={830} y2={net} {...line} strokeWidth={8} opacity={0.85} />
      <line x1={130} y1={serve} x2={950} y2={serve} {...line} strokeWidth={7} opacity={0.75} />
      <line x1={cx} y1={serve} x2={cx} y2={net} {...line} strokeWidth={6} opacity={0.6} />
      <line x1={cx} y1={base} x2={cx} y2={base - 26} {...line} strokeWidth={8} />
      <line x1={-60} y1={net} x2={1140} y2={net} stroke={PAL.charcoal} strokeWidth={4} strokeDasharray="4 14" strokeLinecap="round" opacity={0.35} />
    </g>
  );
};

/* ---------------- accents tied to ball events ---------------- */
const Ripples: React.FC<{t: number}> = ({t}) => (
  <g>
    {SFX_CUES.filter((c) => c.kind === 'bounce' && t >= c.t && t < c.t + 0.5).map((c) => {
      const k = ramp(t, c.t, c.t + 0.5, EASE.out);
      const x = poseAt(c.t).ball.x;
      return <ellipse key={c.t} cx={x} cy={floor + 4} rx={30 + 130 * k} ry={8 + 26 * k} fill="none" stroke={PAL.offWhite} strokeWidth={7 * (1 - k) + 1} opacity={1 - k} />;
    })}
  </g>
);

const CatchBursts: React.FC<{t: number}> = ({t}) => (
  <g>
    {SFX_CUES.filter((c) => c.kind === 'catch' && t >= c.t && t < c.t + 0.32).map((c) => {
      const k = ramp(t, c.t, c.t + 0.32, EASE.out);
      const p = poseAt(c.t).ball;
      return (
        <g key={c.t} opacity={1 - k} stroke={PAL.charcoal} strokeWidth={7} strokeLinecap="round">
          {Array.from({length: 7}, (_, i) => {
            const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
            const r0 = ballR + 14 + 26 * k;
            const r1 = r0 + 22 * (1 - k) + 6;
            return <line key={i} x1={p.x + Math.cos(a) * r0} y1={p.y + Math.sin(a) * r0} x2={p.x + Math.cos(a) * r1} y2={p.y + Math.sin(a) * r1} />;
          })}
        </g>
      );
    })}
  </g>
);

/** Fading dots behind the ball. */
const Trail: React.FC<{t: number}> = ({t}) => (
  <g>
    {Array.from({length: 7}, (_, i) => {
      const dt = (i + 1) * 0.028;
      const p = poseAt(Math.max(0, t - dt));
      const o = (1 - i / 7) * 0.45 * p.ballVis;
      return <circle key={i} cx={p.ball.x} cy={p.ball.y} r={ballR * (0.85 - i * 0.08)} fill={PAL.offWhite} opacity={o} />;
    })}
  </g>
);

/** Drill-specific overlays: focus ring (concentration), timing arc (timing). */
const DrillAccent: React.FC<{t: number}> = ({t}) => {
  const i = drillIndexAt(t);
  const d = DRILLS[i];
  const w = Math.min(ramp(t, d.a, d.a + 0.4), 1 - ramp(t, d.b - 0.3, d.b));
  const pose = poseAt(t);
  if (d.kind === 'underLeg') {
    return (
      <circle
        cx={pose.ball.x}
        cy={pose.ball.y}
        r={ballR + 30}
        fill="none"
        stroke={PAL.charcoal}
        strokeWidth={5}
        strokeDasharray="14 12"
        transform={`rotate(${t * 120} ${pose.ball.x} ${pose.ball.y})`}
        opacity={w * 0.8}
      />
    );
  }
  if (d.kind === 'sideCatch') {
    const {f, dir} = cycleIn(d, t);
    const c = {x: cx + dir * 1.05 * L, y: floor - 1.55 * L};
    const fill = ramp(f, 0.1, 0.85, (x) => x);
    const on = Math.min(ramp(f, 0.05, 0.15), 1 - ramp(f, 0.88, 0.98));
    const R = 74;
    const arc = 2 * Math.PI * R;
    return (
      <g opacity={w * on}>
        <circle cx={c.x} cy={c.y} r={R} fill="none" stroke={PAL.offWhite} strokeWidth={8} opacity={0.5} />
        <circle cx={c.x} cy={c.y} r={R} fill="none" stroke={PAL.charcoal} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${arc * fill} ${arc}`} transform={`rotate(-90 ${c.x} ${c.y})`} />
      </g>
    );
  }
  return null;
};

/* ---------------- HUD ---------------- */
const Headline: React.FC<{t: number}> = ({t}) => (
  <>
    {BEATS.map((b) => {
      if (t < b.a - 0.01 || t > b.b + 0.01) return null;
      const outK = b.b >= TOTAL_SECONDS ? 0 : ramp(t, b.b - 0.16, b.b);
      return (
        <div key={b.a} style={{position: 'absolute', left: 90, top: 236, width: 900, translate: `0 ${-outK * 12}px`}}>
          <KineticArabicText text={b.text} t={t} a={b.a} size={92} o={1 - outK} />
          {b.sub ? (
            <div style={{marginTop: 18}}>
              <KineticArabicText text={b.sub} t={t} a={b.a + (b.subAt ?? 0)} size={56} weight={700} o={(1 - outK) * 0.9} />
            </div>
          ) : null}
        </div>
      );
    })}
  </>
);

const DrillChip: React.FC<{t: number}> = ({t}) => {
  const i = drillIndexAt(t);
  const d = DRILLS[i];
  const k = ramp(t, d.a, d.a + 0.45, EASE.out);
  const reps = d.kind === 'lungeBounce' ? Math.min(2, cycleIn(d, t).n + 1) : 0;
  return (
    <div style={{position: 'absolute', left: 0, top: 590, width: 1080, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
      <div
        dir="rtl"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '10px 30px 12px',
          borderRadius: 999,
          background: PAL.offWhite,
          border: `4px solid ${PAL.charcoal}`,
          fontFamily: FONT_AR,
          color: PAL.charcoal,
          opacity: i === 0 ? ramp(t, 0.15, 0.5) : 1,
          scale: `${0.9 + 0.1 * k}`,
        }}
      >
        <span style={{fontSize: 36, fontWeight: 800, background: PAL.charcoal, color: PAL.offWhite, borderRadius: 999, padding: '0 18px', lineHeight: 1.45}}>
          {`${i + 1}/${DRILLS.length}`}
        </span>
        <span style={{fontSize: 40, fontWeight: 700, opacity: k, unicodeBidi: 'plaintext'}}>{d.label}</span>
        {d.kind === 'lungeBounce' ? (
          <span dir="ltr" style={{fontSize: 36, fontWeight: 800, color: PAL.orange, opacity: k}}>{`×${reps}`}</span>
        ) : null}
      </div>
      <div dir="rtl" style={{display: 'flex', gap: 12}}>
        {DRILLS.map((x, j) => {
          const p = ramp(t, x.a, x.b, (v) => v);
          return (
            <div key={j} style={{width: 74, height: 12, borderRadius: 6, background: PAL.orangeDeep, overflow: 'hidden', border: `3px solid ${PAL.charcoal}`}}>
              <div style={{width: `${p * 100}%`, height: '100%', background: PAL.charcoal, marginRight: 0, marginLeft: 'auto'}} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------- audio ---------------- */
const SRC = {bounce: 'drills/bounce.wav', catch: 'drills/catch.wav', whoosh: 'audio/whoosh.wav', pop: 'audio/pop.wav'} as const;
const Sfx: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <>
      {SFX_CUES.map((c, i) => (
        <Audio
          key={i}
          name={`SFX ${c.kind} ${c.t.toFixed(2)}s`}
          from={Math.max(0, Math.round((c.t - (c.kind === 'whoosh' ? 0.15 : 0)) * fps))}
          premountFor={fps}
          src={staticFile(SRC[c.kind])}
          volume={c.volume}
        />
      ))}
    </>
  );
};

/** Silent (SFX-only) tennis coordination drills short in the house style. */
export const CoordinationDrills: React.FC = () => {
  const t = useAbsT();
  const pose = poseAt(t);
  const intro = ramp(t, 0, 0.5, EASE.out);
  const drill = DRILLS[drillIndexAt(t)];
  // subtle continuous push-in plus a small punch on every headline change
  const punch = BEATS.slice(1).reduce((acc, b) => acc + (t >= b.a ? 0.018 * (1 - ramp(t, b.a, b.a + 0.5, EASE.out)) : 0), 0);
  const zoom = (0.94 + 0.06 * intro) * (1 + 0.04 * (t / TOTAL_SECONDS) + punch);
  const ghostO = drill.kind === 'sweep' ? ramp(t, drill.a, drill.a + 0.5) : 0;
  const spin = t * 540;
  return (
    <AbsoluteFill style={{backgroundColor: PAL.orange, overflow: 'hidden'}}>
      <Backdrop />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <g transform={`translate(${cx} ${floor - 2 * L}) scale(${zoom}) translate(${-cx} ${-(floor - 2 * L)})`} opacity={intro}>
          <Court o={1} />
          <Ripples t={t} />
          <Shadows pose={pose} />
          {ghostO > 0
            ? [0.24, 0.16, 0.08].map((dt, i) => <Figure key={dt} pose={poseAt(t - dt)} ghost opacity={ghostO * (0.18 + i * 0.1)} />)
            : null}
          {pose.ballBehind ? (
            <>
              <Trail t={t} />
              <Ball p={pose.ball} vis={pose.ballVis} spin={spin} />
            </>
          ) : null}
          <Figure pose={pose} />
          {pose.ballBehind ? null : (
            <>
              <Trail t={t} />
              <Ball p={pose.ball} vis={pose.ballVis} spin={spin} />
            </>
          )}
          <DrillAccent t={t} />
          <CatchBursts t={t} />
        </g>
      </svg>
      <Headline t={t} />
      <DrillChip t={t} />
      <Grain />
      <Sfx />
    </AbsoluteFill>
  );
};

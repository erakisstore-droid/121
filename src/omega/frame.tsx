import {Audio} from '@remotion/media';
import type React from 'react';
import {Img, staticFile, useVideoConfig} from 'remotion';
import {BEATS, CAMERA, CAPTIONS, PAGES, PAL, SFX_CUES, SFX_ENABLED, TOTAL_SECONDS, at, type PageKey} from './config';
import {FONT_AR} from '../ms/config';
import {EASE, mix, ramp} from '../ms/lib/anim';
import {useAbsT} from '../ms/lib/time';

/* ---------------- camera ---------------- */
export const cameraAt = (t: number) => {
  let i = 0;
  while (i < CAMERA.length - 2 && t >= CAMERA[i + 1][0]) i++;
  const [t0, x0, y0, z0] = CAMERA[i];
  const [t1, x1, y1, z1] = CAMERA[i + 1];
  const k = t1 <= t0 ? 1 : EASE.inOut(Math.min(1, Math.max(0, (t - t0) / (t1 - t0))));
  return {x: mix(x0, x1, k), y: mix(y0, y1, k), zoom: mix(z0, z1, k)};
};

/* ---------------- board ---------------- */
export const BoardBackdrop: React.FC = () => (
  <svg width={6400} height={8400} style={{position: 'absolute', left: -1400, top: -1400, overflow: 'visible'}}>
    <defs>
      <pattern id="om-grid" width={90} height={90} patternUnits="userSpaceOnUse">
        <path d="M 90 0 L 0 0 0 90" fill="none" stroke={PAL.orangeDeep} strokeWidth={2} />
      </pattern>
    </defs>
    <rect x={0} y={0} width={6400} height={8400} fill="url(#om-grid)" opacity={0.55} />
    {[
      [1400 - 60, 1400 + 420, 360],
      [1400 + 2300, 1400 + 1300, 420],
      [1400 + 1100, 1400 + 3200, 380],
      [1400 + 200, 1400 + 5500, 400],
      [1400 + 3300, 1400 + 5200, 420],
    ].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill={PAL.orangeDeep} opacity={0.42} />
    ))}
  </svg>
);

export const Page: React.FC<{k: PageKey; children: React.ReactNode}> = ({k, children}) => (
  <div style={{position: 'absolute', left: PAGES[k].x, top: PAGES[k].y, width: 1080, height: 1920, overflow: 'visible'}}>{children}</div>
);
/** Add to coordinates in page `from` to express them in page `to`. */
export const pageDelta = (from: PageKey, to: PageKey) => ({x: PAGES[from].x - PAGES[to].x, y: PAGES[from].y - PAGES[to].y});

/* ---------------- kinetic Arabic text ---------------- */
const isLatin = (s: string) => /^[\x20-\x7E≈—•–]+$/.test(s);

/** Whole words rise in reading order; `|` forces a line break. Words are never split. */
export const KineticArabicText: React.FC<{text: string; t: number; a: number; size: number; weight?: number; o?: number; color?: string}> = ({
  text,
  t,
  a,
  size,
  weight = 800,
  o = 1,
  color = PAL.charcoal,
}) => {
  const lines = text.split('|');
  if (lines.length > 1) {
    let n = 0;
    return (
      <div>
        {lines.map((l) => {
          const start = a + n * 0.07;
          n += l.split(' ').length;
          return <KineticArabicText key={l} text={l} t={t} a={start} size={size} weight={weight} o={o} color={color} />;
        })}
      </div>
    );
  }
  // keep runs of Latin/number tokens together (e.g. "EPA + DHA") so bidi order stays correct;
  // a run starts and ends on an alphanumeric token, so a lone "•" or "—" stays its own word
  const raw = text.split(' ');
  const alnum = (w: string) => isLatin(w) && /[A-Za-z0-9]/.test(w);
  const words: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    if (!alnum(raw[i])) {
      words.push(raw[i]);
      continue;
    }
    let end = i;
    for (let k = i + 1; k < raw.length && isLatin(raw[k]); k++) if (alnum(raw[k])) end = k;
    words.push(raw.slice(i, end + 1).join(' '));
    i = end;
  }
  return (
    <div
      dir={isLatin(text) ? 'ltr' : 'rtl'}
      style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: size * 0.26, fontFamily: FONT_AR, fontSize: size, fontWeight: weight, lineHeight: 1.18, color, opacity: o}}
    >
      {words.map((w, i) => {
        const k = ramp(t, a + i * 0.07, a + i * 0.07 + 0.3, EASE.out);
        return (
          <span key={`${w}-${i}`} dir={isLatin(w) ? 'ltr' : 'rtl'} style={{display: 'inline-block', whiteSpace: 'nowrap', opacity: k, translate: `0 ${(1 - k) * size * 0.35}px`, unicodeBidi: 'isolate'}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

type Span = {text: string; sub?: string; a: number; b: number};
const spans: Span[] = BEATS.flatMap((beat) => {
  const lines = CAPTIONS[beat.id] ?? [];
  return lines.map((l, i) => {
    const a = beat.start + (beat.end - beat.start) * (l.from ?? 0);
    const next = lines[i + 1];
    const b = next ? beat.start + (beat.end - beat.start) * (next.from ?? 0) : beat.end;
    return {text: l.text, sub: l.sub, a, b};
  });
});

/** Screen-space headlines (y ≈ 250–460). */
export const Captions: React.FC = () => {
  const t = useAbsT();
  return (
    <>
      {spans.map((s) => {
        if (t < s.a - 0.01 || t > s.b + 0.01) return null;
        const outK = s.b >= TOTAL_SECONDS ? 0 : ramp(t, s.b - 0.18, s.b);
        const longest = Math.max(...s.text.split('|').map((l) => l.length));
        const twoLines = s.text.includes('|');
        const size = twoLines && s.sub ? Math.min(64, longest > 20 ? 62 : 64) : longest > 20 ? 66 : longest > 14 ? 78 : 88;
        return (
          <div key={`${s.a}-${s.text}`} style={{position: 'absolute', left: 90, top: 250, width: 810, translate: `0 ${-outK * 10}px`}}>
            <KineticArabicText text={s.text} t={t} a={s.a} size={size} o={1 - outK} />
            {s.sub ? (
              <div style={{marginTop: 6}}>
                <KineticArabicText text={s.sub} t={t} a={s.a + 0.25} size={44} weight={700} o={(1 - outK) * 0.92} />
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
};

/* ---------------- audio + texture ---------------- */
export const Sfx: React.FC = () => {
  const {fps} = useVideoConfig();
  if (!SFX_ENABLED) return null;
  return (
    <>
      {SFX_CUES.map((c, i) => (
        <Audio
          key={i}
          name={`SFX ${c.kind} b${c.beat}`}
          from={Math.max(0, Math.round((at(c.beat, c.f) - (c.kind === 'whoosh' ? 0.12 : 0)) * fps))}
          premountFor={fps}
          src={staticFile(c.kind === 'whoosh' ? 'audio/whoosh.wav' : 'audio/pop.wav')}
          volume={c.volume}
        />
      ))}
    </>
  );
};

export const Grain: React.FC = () => (
  <Img src={staticFile('ms/grain.png')} style={{position: 'absolute', inset: 0, width: 1080, height: 1920, opacity: 0.035, mixBlendMode: 'overlay'}} />
);

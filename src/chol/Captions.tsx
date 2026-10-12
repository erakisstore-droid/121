import type React from 'react';
import {BEATS, CAPTIONS, PAL, TOTAL_SECONDS} from './config';
import {EASE, ramp} from '../ms/lib/anim';
import {useAbsT} from '../ms/lib/time';
import {FONT_AR} from '../ms/config';

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
const isLatin = (s: string) => /^[\x20-\x7E]+$/.test(s);

/** Kinetic key phrase: whole words rise in reading order (words are never split). */
const Words: React.FC<{text: string; t: number; a: number; size: number; weight: number; o: number}> = ({text, t, a, size, weight, o}) => {
  const lines = text.split('|');
  if (lines.length > 1) {
    let offset = 0;
    return (
      <div>
        {lines.map((l) => {
          const start = a + offset * 0.07;
          offset += l.split(' ').length;
          return <Words key={l} text={l} t={t} a={start} size={size} weight={weight} o={o} />;
        })}
      </div>
    );
  }
  const words = text.split(' ');
  const dir = isLatin(text) ? 'ltr' : 'rtl';
  return (
    <div
      dir={dir}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: size * 0.26,
        rowGap: size * 0.05,
        fontFamily: FONT_AR,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.18,
        color: PAL.charcoal,
        opacity: o,
      }}
    >
      {words.map((w, i) => {
        const k = ramp(t, a + i * 0.07, a + i * 0.07 + 0.32, EASE.out);
        return (
          <span key={`${w}-${i}`} style={{display: 'inline-block', whiteSpace: 'nowrap', opacity: k, translate: `0 ${(1 - k) * size * 0.35}px`}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Large short key phrases in the top zone (y ≈ 250–450), screen space. */
export const Captions: React.FC = () => {
  const t = useAbsT();
  return (
    <>
      {spans.map((s) => {
        if (t < s.a - 0.01 || t > s.b + 0.01) return null;
        // the final phrase holds to the last frame
        const outK = s.b >= TOTAL_SECONDS ? 0 : ramp(t, s.b - 0.2, s.b);
        const longest = Math.max(...s.text.split('|').map((l) => l.length));
        const size = longest > 20 ? 70 : longest > 14 ? 80 : 90;
        return (
          <div key={`${s.a}-${s.text}`} style={{position: 'absolute', left: 90, top: 258, width: 810, translate: `0 ${-outK * 10}px`}}>
            <Words text={s.text} t={t} a={s.a} size={size} weight={800} o={1 - outK} />
            {s.sub ? (
              <div style={{marginTop: 6}}>
                <Words text={s.sub} t={t} a={s.a + 0.2} size={46} weight={700} o={(1 - outK) * 0.9} />
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
};

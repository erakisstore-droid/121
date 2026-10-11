import type React from 'react';
import {BEATS, CAPTIONS, PAL} from '../config';
import {EASE, ramp} from '../lib/anim';
import {useAbsT} from '../lib/time';
import {Txt} from './primitives';

type Span = {text: string; sub?: string; dir?: 'rtl' | 'ltr'; a: number; b: number};

const spans: Span[] = BEATS.flatMap((beat) => {
  const lines = CAPTIONS[beat.id] ?? [];
  return lines.map((l, i) => {
    const a = beat.start + (beat.end - beat.start) * (l.from ?? 0);
    const next = lines[i + 1];
    const b = next ? beat.start + (beat.end - beat.start) * (next.from ?? 0) : beat.end;
    return {text: l.text, sub: l.sub, dir: l.dir, a, b};
  });
});

/** Screen-space key phrases in the top zone (y ≈ 250–450), synced to the beat timeline. */
export const Captions: React.FC = () => {
  const t = useAbsT();
  return (
    <>
      {spans.map((s) => {
        if (t < s.a - 0.01 || t > s.b + 0.01) return null;
        const inK = ramp(t, s.a, s.a + 0.35, EASE.out);
        const outK = ramp(t, s.b - 0.22, s.b);
        const o = Math.min(inK, 1 - outK);
        return (
          <div key={`${s.a}-${s.text}`}>
            <Txt x={90} y={262} w={810} size={s.text.length > 20 ? 62 : 70} opacity={o} rise={(1 - inK) * 24 - outK * 10} dir={s.dir ?? 'rtl'}>
              {s.text}
            </Txt>
            {s.sub ? (
              <Txt x={90} y={368} w={810} size={44} weight={700} color={PAL.charcoal} opacity={o * 0.9} rise={(1 - inK) * 30} dir="rtl">
                {s.sub}
              </Txt>
            ) : null}
          </div>
        );
      })}
    </>
  );
};

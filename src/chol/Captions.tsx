import type React from 'react';
import {BEATS, CAPTIONS, PAL} from './config';
import {EASE, ramp} from '../ms/lib/anim';
import {useAbsT} from '../ms/lib/time';
import {Txt} from '../ms/ui/primitives';

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

/** Large short key phrases in the top zone (y ≈ 250–450). */
export const Captions: React.FC = () => {
  const t = useAbsT();
  return (
    <>
      {spans.map((s) => {
        if (t < s.a - 0.01 || t > s.b + 0.01) return null;
        const inK = ramp(t, s.a, s.a + 0.3, EASE.out);
        const outK = ramp(t, s.b - 0.22, s.b);
        const o = Math.min(inK, 1 - outK);
        const size = s.text.length > 22 ? 62 : 74;
        return (
          <div key={`${s.a}-${s.text}`}>
            <Txt x={90} y={258} w={810} size={size} opacity={o} rise={(1 - inK) * 22 - outK * 8} dir={isLatin(s.text) ? 'ltr' : 'rtl'}>
              {s.text}
            </Txt>
            {s.sub ? (
              <Txt x={90} y={368} w={810} size={46} weight={700} color={PAL.charcoal} opacity={o * 0.9} rise={(1 - inK) * 26}>
                {s.sub}
              </Txt>
            ) : null}
          </div>
        );
      })}
    </>
  );
};

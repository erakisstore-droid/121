import {Audio} from '@remotion/media';
import type React from 'react';
import {staticFile, useVideoConfig} from 'remotion';
import {SFX_CUES, SFX_ENABLED, at} from '../config';

/** Separate SFX layer (no music, no voice). Whooshes lead the movement slightly. */
export const Sfx: React.FC = () => {
  const {fps} = useVideoConfig();
  if (!SFX_ENABLED) return null;
  return (
    <>
      {SFX_CUES.map((c, i) => {
        const lead = c.kind === 'whoosh' ? 0.12 : 0;
        const from = Math.max(0, Math.round((at(c.beat, c.f) - lead) * fps));
        return (
          <Audio
            key={i}
            name={`SFX ${c.kind} b${c.beat}`}
            from={from}
            premountFor={fps}
            src={staticFile(c.kind === 'whoosh' ? 'audio/whoosh.wav' : 'audio/pop.wav')}
            volume={c.volume}
          />
        );
      })}
    </>
  );
};

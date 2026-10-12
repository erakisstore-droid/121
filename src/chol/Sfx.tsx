import {Audio} from '@remotion/media';
import type React from 'react';
import {staticFile, useVideoConfig} from 'remotion';
import {SFX_CUES, SFX_ENABLED, at} from './config';

/** Separate subtle SFX layer (no music, no voice). */
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

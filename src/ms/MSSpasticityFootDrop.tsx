import './fonts';
import type React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useVideoConfig} from 'remotion';
import {PAL, at, beatEnd, beatStart} from './config';
import {Act1} from './acts/Act1';
import {Act2} from './acts/Act2';
import {Act3} from './acts/Act3';
import {Act4} from './acts/Act4';
import {Act5} from './acts/Act5';
import {Act6} from './acts/Act6';
import {cameraAt} from './lib/camera';
import {useAbsT} from './lib/time';
import {Captions} from './ui/Captions';
import {Sfx} from './ui/Sfx';

/** Mounts an act only while it can be visible; acts read absolute time. */
const Act: React.FC<{a: number; b: number; name: string; C: React.FC<{from: number}>}> = ({a, b, name, C}) => {
  const {fps} = useVideoConfig();
  const from = Math.max(0, Math.round(a * fps));
  return (
    <Sequence name={name} from={from} durationInFrames={Math.round(b * fps) - from} layout="none">
      <C from={from} />
    </Sequence>
  );
};

export const MSSpasticityFootDrop: React.FC = () => {
  const t = useAbsT();
  const cam = cameraAt(t);
  return (
    <AbsoluteFill style={{backgroundColor: PAL.orange, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transformOrigin: '0 0',
          transform: `translate(${cam.anchor.x - cam.focus.x * cam.zoom}px, ${cam.anchor.y - cam.focus.y * cam.zoom}px) scale(${cam.zoom})`,
        }}
      >
        <Act name="01–03 Walk → leg views → pathways" a={beatStart(1)} b={at(4, 0.32)} C={Act1} />
        <Act name="04–05 Poll → topic cards" a={beatStart(4)} b={at(6, 0.3)} C={Act2} />
        <Act name="06–07 CNS pathway" a={beatStart(6)} b={at(8, 0.3)} C={Act3} />
        <Act name="08–11 Spasticity → foot drop → gait" a={beatStart(8)} b={at(12, 0.4)} C={Act4} />
        <Act name="12–15 Treatments" a={beatStart(12)} b={beatStart(16)} C={Act5} />
        <Act name="16–19 Triggers → clinician → comment" a={beatStart(16)} b={beatEnd(19)} C={Act6} />
      </AbsoluteFill>
      <Captions />
      <Sfx />
      <Img src={staticFile('ms/grain.png')} style={{position: 'absolute', inset: 0, width: 1080, height: 1920, opacity: 0.06, mixBlendMode: 'overlay'}} />
    </AbsoluteFill>
  );
};

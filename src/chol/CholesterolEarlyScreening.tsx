import '../ms/fonts';
import type React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {PAL, TOTAL_SECONDS, at} from './config';
import {ActA} from './acts/ActA';
import {ActB} from './acts/ActB';
import {ActC} from './acts/ActC';
import {ActD} from './acts/ActD';
import {ActE} from './acts/ActE';
import {ActF} from './acts/ActF';
import {ArteryLayer} from './acts/ArteryLayer';
import {Backdrop, Grain} from './Backdrop';
import {Captions} from './Captions';
import {cameraAt} from './camera';
import {useAbsT} from '../ms/lib/time';

const Act: React.FC<{a: number; b: number; name: string; C: React.FC<{from: number}>}> = ({a, b, name, C}) => {
  const {fps} = useVideoConfig();
  const from = Math.max(0, Math.round(a * fps));
  return (
    <Sequence name={name} from={from} durationInFrames={Math.round(b * fps) - from} layout="none">
      <C from={from} />
    </Sequence>
  );
};

export const CholesterolEarlyScreening: React.FC = () => {
  const t = useAbsT();
  const cam = cameraAt(t);
  return (
    <AbsoluteFill style={{backgroundColor: PAL.orange, overflow: 'hidden'}}>
      <Backdrop />
      <AbsoluteFill
        style={{
          transformOrigin: '0 0',
          transform: `translate(${cam.anchor.x - cam.focus.x * cam.zoom}px, ${cam.anchor.y - cam.focus.y * cam.zoom}px) scale(${cam.zoom})`,
        }}
      >
        <Act name="01–03 Tube → timeline → lens" a={0} b={at(4, 0.1)} C={ActA} />
        <Act name="Artery backbone" a={at(4, 0.09)} b={TOTAL_SECONDS} C={ArteryLayer} />
        <Act name="04–06 Plaque, branches, rewind" a={at(4, 0.3)} b={at(7, 0.2)} C={ActB} />
        <Act name="07–08 Source A, 19+, early test" a={at(7, 0)} b={at(9, 0.2)} C={ActC} />
        <Act name="09–11 Report, LDL-C ≥190, source B" a={at(9, 0)} b={at(12, 0.2)} C={ActD} />
        <Act name="12–13 Inherited LDL, calendar" a={at(12, 0)} b={at(14, 0.2)} C={ActE} />
        <Act name="14–16 Prevention, comment prompt" a={at(14, 0)} b={TOTAL_SECONDS} C={ActF} />
      </AbsoluteFill>
      <Captions />
      <Grain />
    </AbsoluteFill>
  );
};

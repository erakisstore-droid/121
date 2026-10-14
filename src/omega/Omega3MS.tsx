import '../ms/fonts';
import type React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {PAL, TOTAL_SECONDS, at} from './config';
import {BoardBackdrop, Captions, Grain, Page, Sfx, cameraAt} from './frame';
import {FishSources} from './acts/FishSources';
import {Intro} from './acts/Intro';
import {Membrane, Signals} from './acts/Membrane';
import {Review} from './acts/Review';
import {Cardio} from './acts/Cardio';
import {Neuro} from './acts/Neuro';
import {Cohort} from './acts/Cohort';
import {Food} from './acts/Food';
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

/** One continuous take across a connected educational board (camera keyframes in config.ts). */
export const Omega3MS: React.FC = () => {
  const t = useAbsT();
  const cam = cameraAt(t);
  return (
    <AbsoluteFill style={{backgroundColor: PAL.orange, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1, height: 1, transformOrigin: '0 0', transform: `translate(${540 - cam.x * cam.zoom}px, ${960 - cam.y * cam.zoom}px) scale(${cam.zoom})`}}>
        <BoardBackdrop />
        <Page k="p1">
          <Act name="01–03 Capsule → ω-3 → fatty acids" a={0} b={at(7, 0)} C={Intro} />
        </Page>
        <Page k="p2">
          <Act name="04 Fish sources" a={at(4, 0)} b={at(7, 0)} C={FishSources} />
        </Page>
        <Page k="p3">
          <Act name="05a Cell membrane" a={at(5, 0)} b={at(7, 0)} C={Membrane} />
        </Page>
        <Page k="p4">
          <Act name="05b Inflammatory regulation · 06 pins" a={at(5, 0.5)} b={at(8, 0)} C={Signals} />
        </Page>
        <Page k="p5">
          <Act name="06–08 2024 review, TG, markers" a={at(6, 0)} b={at(10, 0)} C={Review} />
        </Page>
        <Page k="p6">
          <Act name="09–10 2025 meta-analysis, HR plot" a={at(9, 0)} b={at(13, 0)} C={Cardio} />
        </Page>
        <Page k="p7">
          <Act name="10–12 Brain, spinal cord, MS" a={at(10, 0)} b={at(14, 0)} C={Neuro} />
        </Page>
        <Page k="p8">
          <Act name="13–16 MS cohort" a={at(12, 0.8)} b={at(18, 0)} C={Cohort} />
        </Page>
        <Page k="p9">
          <Act name="17–21 Food, supplements, label" a={at(17, 0)} b={TOTAL_SECONDS} C={Food} />
        </Page>
      </div>
      <Captions />
      <Grain />
      <Sfx />
    </AbsoluteFill>
  );
};

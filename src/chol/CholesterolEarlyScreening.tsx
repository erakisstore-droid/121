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
import {BoardBackdrop, Page} from './Board';
import {Grain} from './Backdrop';
import {Captions} from './Captions';
import {Sfx} from './Sfx';
import {cameraAt} from './camera';
import {useAbsT} from '../ms/lib/time';

/** Mounts an act while it is on the board; acts read absolute time. */
const Act: React.FC<{a: number; b: number; name: string; C: React.FC<{from: number}>}> = ({a, b, name, C}) => {
  const {fps} = useVideoConfig();
  const from = Math.max(0, Math.round(a * fps));
  return (
    <Sequence name={name} from={from} durationInFrames={Math.round(b * fps) - from} layout="none">
      <C from={from} />
    </Sequence>
  );
};

/**
 * One continuous take across an infinite educational board. Pages hold the
 * diagrams; the camera (CAMERA keyframes in config.ts) travels between them.
 */
export const CholesterolEarlyScreening: React.FC = () => {
  const t = useAbsT();
  const cam = cameraAt(t);
  return (
    <AbsoluteFill style={{backgroundColor: PAL.orange, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1,
          height: 1,
          transformOrigin: '0 0',
          transform: `translate(${540 - cam.x * cam.zoom}px, ${960 - cam.y * cam.zoom}px) scale(${cam.zoom})`,
        }}
      >
        <BoardBackdrop />
        <Page k="p1">
          <Act name="Artery backbone" a={at(3, 0.15)} b={TOTAL_SECONDS} C={ArteryLayer} />
          <Act name="01–03 Tube → heart → timeline → artery" a={0} b={at(4, 0.1)} C={ActA} />
          <Act name="04–06 Retention, plaque, risk, youth timeline" a={at(4, 0.3)} b={at(7, 0.02)} C={ActB} />
          <Act name="14–16 Prevention → comment bubble" a={at(14, 0)} b={TOTAL_SECONDS} C={ActF} />
        </Page>
        <Page k="p3">
          <Act name="07–08 Source A, 19+, tube" a={at(7, 0)} b={TOTAL_SECONDS} C={ActC} />
        </Page>
        <Page k="p4">
          <Act name="09–11 Report, LDL-C ≥ 190, source B" a={at(9, 0)} b={TOTAL_SECONDS} C={ActD} />
        </Page>
        <Page k="p5">
          <Act name="12–13 DNA → calendar" a={at(12, 0)} b={TOTAL_SECONDS} C={ActE} />
        </Page>
      </div>
      <Captions />
      <Grain />
      <Sfx />
    </AbsoluteFill>
  );
};

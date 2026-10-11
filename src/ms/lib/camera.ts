import {at} from '../config';
import {dimsFor} from '../figure/Walker';
import {strideSpeed} from '../figure/gait';
import {WALK, walkState} from './geom';
import {mix, ramp} from './anim';

const SPEED = strideSpeed(dimsFor(WALK.L));

/**
 * Restrained board camera: returns zoom and the board point kept at a screen anchor.
 * Mostly identity with gentle drift; pushes in on the legs (beat 1) and on the
 * CNS segment (beat 7).
 */
export const cameraAt = (t: number) => {
  // beat 1 push-in on the lower legs, released during beat 2
  const legIn = ramp(t, at(1, 0.55), at(1, 1)) * (1 - ramp(t, at(2, 0), at(2, 0.3)));
  const fx = walkState(Math.min(t, at(2, 0.3)), SPEED).x + 20;
  // beat 7 push-in on the magnified CNS segment
  const cns = ramp(t, at(7, 0), at(7, 0.35)) * (1 - ramp(t, at(7, 0.8), at(8, 0.25)));
  // slow breathing drift so held states never feel frozen
  const drift = 0.012 * Math.sin((t / 9) * Math.PI * 2);
  const zoom = 1 + drift + 1.25 * legIn + 0.22 * cns;
  const focus = {
    x: mix(mix(540, fx, legIn), 600, cns),
    y: mix(mix(960, 1180, legIn), 900, cns),
  };
  const anchor = {x: mix(540, 495, Math.max(legIn, cns)), y: mix(960, mix(1090, 900, cns), Math.max(legIn, cns))};
  return {zoom, focus, anchor};
};

import {at} from './config';
import {PLAQUE_X} from './geom';
import {mix, ramp} from '../ms/lib/anim';

/** Board camera: gentle drift, plus a push-in on the artery wall in beat 4. */
export const cameraAt = (t: number) => {
  const wall = ramp(t, at(4, 0.28), at(4, 0.45)) * (1 - ramp(t, at(4, 0.72), at(4, 0.92)));
  const drift = 0.008 * Math.sin((t / 11) * Math.PI * 2);
  return {
    zoom: 1 + drift + 0.65 * wall,
    focus: {x: mix(540, PLAQUE_X, wall), y: mix(960, 880, wall)},
    anchor: {x: mix(540, 495, wall), y: mix(960, 900, wall)},
  };
};

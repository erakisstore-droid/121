import {CAMERA} from './config';
import {EASE, mix} from '../ms/lib/anim';

/** Interpolates the centralized CAMERA keyframes (eased between neighbours). */
export const cameraAt = (t: number) => {
  let i = 0;
  while (i < CAMERA.length - 2 && t >= CAMERA[i + 1][0]) i++;
  const [t0, x0, y0, z0] = CAMERA[i];
  const [t1, x1, y1, z1] = CAMERA[i + 1];
  const k = t1 <= t0 ? 1 : EASE.inOut(Math.min(1, Math.max(0, (t - t0) / (t1 - t0))));
  return {x: mix(x0, x1, k), y: mix(y0, y1, k), zoom: mix(z0, z1, k)};
};

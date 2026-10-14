import type {View} from '../art/research';
import {mix} from '../../ms/lib/anim';

/** Blend two research-image views. */
export const mixView = (a: View, b: View, k: number): View => ({
  x: mix(a.x, b.x, k),
  y: mix(a.y, b.y, k),
  w: mix(a.w, b.w, k),
  vh: mix(a.vh, b.vh, k),
  zoom: mix(a.zoom, b.zoom, k),
  fu: mix(a.fu, b.fu, k),
  fv: mix(a.fv, b.fv, k),
});
/** Chain views through eased weights: views[0] → views[1] (k[0]) → views[2] (k[1]) … */
export const chainViews = (views: View[], ks: number[]) => views.slice(1).reduce((acc, v, i) => mixView(acc, v, ks[i] ?? 0), views[0]);

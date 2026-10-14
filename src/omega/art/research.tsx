import type React from 'react';
import {Img, staticFile} from 'remotion';
import {PAL} from '../config';
import type {Rect} from '../../ms/lib/anim';
import {drawOn, roundRectPath} from '../../ms/lib/paths';

export type View = {x: number; y: number; w: number; vh: number; zoom: number; fu: number; fv: number};
type Src = {file: string; w: number; h: number};
const PAD = 14;

/** Image placement inside the viewport (clamped so no empty space shows). */
const place = (src: Src, v: View) => {
  const vw = v.w - PAD * 2;
  const S = (vw / src.w) * v.zoom;
  const iw = src.w * S;
  const ih = src.h * S;
  const clamp = (val: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, val));
  const ix = iw <= vw ? (vw - iw) / 2 : clamp(vw / 2 - v.fu * iw, vw - iw, 0);
  const vh = Math.min(v.vh, ih);
  const iy = ih <= vh ? (vh - ih) / 2 : clamp(vh / 2 - v.fv * ih, vh - ih, 0);
  return {S, ix, iy, vw, vh};
};

/** Full height of the viewport for the full (zoom 1) view. */
export const fullHeight = (src: Src, w: number) => ((w - PAD * 2) * src.h) / src.w;

/** Screen rect of an image-pixel region within the current view. */
export const regionToScreen = (src: Src, v: View, r: Rect): Rect => {
  const p = place(src, v);
  return {x: v.x + PAD + p.ix + r.x * p.S, y: v.y + PAD + p.iy + r.y * p.S, w: r.w * p.S, h: r.h * p.S};
};

/**
 * Original research screenshot in a cream card. The image is never edited: the
 * viewport (container) crops, zooms and pans to frame the title or an excerpt.
 */
export const ResearchImage: React.FC<{src: Src; v: View; opacity?: number}> = ({src, v, opacity = 1}) => {
  if (opacity <= 0.001) return null;
  const p = place(src, v);
  return (
    <div style={{position: 'absolute', left: v.x, top: v.y, width: v.w, height: p.vh + PAD * 2, opacity}}>
      <div style={{position: 'absolute', left: 10, top: 14, width: v.w, height: p.vh + PAD * 2, borderRadius: 26, background: PAL.charcoal, opacity: 0.14}} />
      <div style={{position: 'absolute', inset: 0, background: PAL.offWhite, border: `4px solid ${PAL.charcoal}`, borderRadius: 26, boxSizing: 'border-box'}} />
      <div style={{position: 'absolute', left: PAD, top: PAD, width: p.vw, height: p.vh, overflow: 'hidden', borderRadius: 10}}>
        <Img src={staticFile(src.file)} style={{position: 'absolute', left: p.ix, top: p.iy, width: src.w * p.S, height: src.h * p.S, maxWidth: 'none'}} />
      </div>
    </div>
  );
};

/** Separate highlight layer drawn over (not into) the screenshot. */
export const Callout: React.FC<{r: Rect; k: number; clip?: Rect; t?: number}> = ({r, k, clip, t = 0}) => {
  if (k <= 0.001) return null;
  const pad = 6;
  const d = roundRectPath(r.x - pad, r.y - pad, r.w + pad * 2, r.h + pad * 2, 10);
  const id = `co-${Math.round(r.x)}-${Math.round(r.y)}`;
  return (
    <g>
      {clip ? (
        <defs>
          <clipPath id={id}>
            <rect x={clip.x} y={clip.y} width={clip.w} height={clip.h} />
          </clipPath>
        </defs>
      ) : null}
      <g clipPath={clip ? `url(#${id})` : undefined}>
        <path d={d} fill={PAL.orange} fillOpacity={0.12 * k} stroke={PAL.orangeDeep} strokeWidth={6} strokeLinejoin="round" {...drawOn(d, k)} />
        {k >= 1 ? <circle cx={r.x + r.w + pad} cy={r.y + r.h / 2} r={8 + Math.sin(t * 4) * 2} fill={PAL.orangeDeep} /> : null}
      </g>
    </g>
  );
};

export const viewportRect = (src: Src, v: View): Rect => {
  const p = place(src, v);
  return {x: v.x + PAD, y: v.y + PAD, w: p.vw, h: p.vh};
};

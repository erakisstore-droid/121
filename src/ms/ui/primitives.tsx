import type React from 'react';
import {Img, staticFile} from 'remotion';
import {FONT_AR, PAL} from '../config';
import type {Rect} from '../lib/anim';

/** Off-white rounded card with a thin charcoal outline (SVG). */
export const CardRect: React.FC<{r: Rect; opacity?: number; fillOpacity?: number; radius?: number; stroke?: string; sw?: number}> = ({
  r,
  opacity = 1,
  fillOpacity = 1,
  radius = 30,
  stroke = PAL.charcoal,
  sw = 3.5,
}) =>
  opacity <= 0.001 ? null : (
    <rect
      x={r.x}
      y={r.y}
      width={Math.max(0, r.w)}
      height={Math.max(0, r.h)}
      rx={Math.min(radius, r.w / 2, r.h / 2)}
      fill={PAL.offWhite}
      fillOpacity={fillOpacity}
      stroke={stroke}
      strokeWidth={sw}
      opacity={opacity}
    />
  );

type TextProps = {
  x: number;
  y: number;
  w: number;
  size: number;
  weight?: number;
  color?: string;
  align?: 'center' | 'right' | 'left';
  opacity?: number;
  dir?: 'rtl' | 'ltr';
  rise?: number;
  nowrap?: boolean;
  children: React.ReactNode;
};

/** Absolutely positioned text block (HTML, so Arabic shaping/RTL is handled by the browser). */
export const Txt: React.FC<TextProps> = ({x, y, w, size, weight = 800, color = PAL.charcoal, align = 'center', opacity = 1, dir = 'rtl', rise = 0, nowrap = false, children}) =>
  opacity <= 0.001 ? null : (
    <div
      dir={dir}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        fontFamily: FONT_AR,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.3,
        color,
        textAlign: align,
        opacity,
        translate: `0 ${rise}px`,
        textWrap: 'balance',
        whiteSpace: nowrap ? 'nowrap' : undefined,
      }}
    >
      {children}
    </div>
  );

/**
 * Original screenshot inside a cream card. The image is never edited: only the
 * container window may zoom (scale around a focus point) to emphasise a region.
 */
export const ImageCard: React.FC<{
  file: string;
  iw: number;
  ih: number;
  x: number;
  y: number;
  w: number;
  opacity?: number;
  zoom?: number;
  fx?: number;
  fy?: number;
  pad?: number;
}> = ({file, iw, ih, x, y, w, opacity = 1, zoom = 1, fx = 0.5, fy = 0.5, pad = 14}) => {
  if (opacity <= 0.001) return null;
  const ww = w - pad * 2;
  const wh = (ww * ih) / iw;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: wh + pad * 2,
        background: PAL.offWhite,
        border: `3.5px solid ${PAL.charcoal}`,
        borderRadius: 26,
        padding: pad - 3.5,
        boxSizing: 'border-box',
        opacity,
      }}
    >
      <div style={{width: ww, height: wh, overflow: 'hidden', borderRadius: 10, position: 'relative'}}>
        <Img
          src={staticFile(file)}
          style={{
            width: ww,
            height: wh,
            display: 'block',
            transformOrigin: `${fx * 100}% ${fy * 100}%`,
            scale: String(zoom),
          }}
        />
      </div>
    </div>
  );
};

export const imageCardHeight = (iw: number, ih: number, w: number, pad = 14) => ((w - pad * 2) * ih) / iw + pad * 2;

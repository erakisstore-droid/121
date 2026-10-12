import type React from 'react';
import {random} from 'remotion';
import {ART, PAL} from '../config';

/**
 * Stylized-3D hero laboratory tube: matte cylinder shading, soft contact shadow,
 * shaded cap and sample. `build` (0–1) assembles it: body rises, cap drops, label slides.
 */
export const HeroTube: React.FC<{
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  level: number;
  build?: number;
  label?: number;
  opacity?: number;
  /** label rect visibility (0 when the label has detached to become the report) */
  labelOn?: number;
}> = ({id, x, y, w, h, level, build = 1, label = 1, opacity = 1, labelOn = 1}) => {
  if (opacity <= 0.001) return null;
  const capH = h * 0.13;
  const bodyY = y + capH * 0.8;
  const bodyH = h - capH * 0.8;
  const r = w / 2;
  const grow = Math.min(1, build * 1.6);
  const capDrop = Math.max(0, Math.min(1, (build - 0.45) / 0.4));
  const bh = bodyH * grow;
  const by = bodyY + bodyH - bh;
  const body = `M ${x} ${by} L ${x} ${by + Math.max(0, bh - r)} A ${r} ${r} 0 0 0 ${x + w} ${by + Math.max(0, bh - r)} L ${x + w} ${by} Z`;
  const fillTop = bodyY + bodyH - (bodyH - 20) * level;
  const sw = Math.max(3, w * 0.025);
  const lw = w * 0.8;
  const ly = bodyY + bodyH * 0.2;
  const lh = bodyH * 0.32;
  const fs = Math.max(10, w * 0.16);
  return (
    <g opacity={opacity}>
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={PAL.beige} />
          <stop offset="0.35" stopColor={PAL.offWhite} />
          <stop offset="0.7" stopColor={PAL.offWhite} />
          <stop offset="1" stopColor={PAL.beige} />
        </linearGradient>
        <linearGradient id={`${id}-liq`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={PAL.orangeDeep} />
          <stop offset="0.45" stopColor={PAL.orange} />
          <stop offset="1" stopColor={PAL.orangeDeep} />
        </linearGradient>
        <linearGradient id={`${id}-cap`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={PAL.charcoal} />
          <stop offset="0.35" stopColor={ART.cap} />
          <stop offset="0.6" stopColor="#55575A" />
          <stop offset="1" stopColor={PAL.charcoal} />
        </linearGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop offset="0" stopColor={PAL.charcoal} stopOpacity={0.22} />
          <stop offset="1" stopColor={PAL.charcoal} stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <path d={body} />
        </clipPath>
      </defs>
      {/* cream disc behind the tube (style board) */}
      <circle cx={x + w / 2} cy={y + h * 0.62} r={w * 1.25} fill={PAL.beige} opacity={0.55 * grow} />
      <ellipse cx={x + w / 2} cy={y + h + 16} rx={w * 0.9} ry={w * 0.16} fill={`url(#${id}-shadow)`} opacity={grow} />
      <path d={body} fill={`url(#${id}-glass)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <rect x={x - 10} y={fillTop} width={w + 20} height={bodyH + 30} fill={`url(#${id}-liq)`} />
        <ellipse cx={x + w / 2} cy={fillTop} rx={w / 2} ry={w * 0.08} fill={PAL.orange} stroke={PAL.charcoal} strokeWidth={2.5} opacity={level > 0.02 ? 1 : 0} />
        <rect x={x + w * 0.16} y={by + 18} width={w * 0.07} height={bh * 0.8} rx={w * 0.035} fill={PAL.offWhite} opacity={0.75} />
      </g>
      <path d={body} fill="none" stroke={PAL.charcoal} strokeWidth={sw} />
      {capDrop > 0.001 ? (
        <g transform={`translate(0 ${-(1 - capDrop) * h * 0.08})`} opacity={capDrop}>
          <rect x={x - w * 0.08} y={y - capH * 0.15} width={w * 1.16} height={capH * 1.15} rx={w * 0.1} fill={`url(#${id}-cap)`} stroke={PAL.charcoal} strokeWidth={sw} />
          {Array.from({length: 9}, (_, i) => (
            <line key={i} x1={x - w * 0.02 + (i * w * 1.04) / 8} y1={y + capH * 0.05} x2={x - w * 0.02 + (i * w * 1.04) / 8} y2={y + capH * 0.85} stroke="#5F6164" strokeWidth={Math.max(2, w * 0.015)} strokeLinecap="round" />
          ))}
        </g>
      ) : null}
      {label > 0.001 && labelOn > 0.001 ? (
        <g opacity={label * labelOn} transform={`translate(${(1 - label) * w * 0.6} 0)`}>
          <rect x={x + (w - lw) / 2} y={ly} width={lw} height={lh} rx={8} fill={PAL.offWhite} stroke={PAL.charcoal} strokeWidth={3} />
          {/* blood-drop mark + blank lines (no invented text or values) */}
          <path
            d={`M ${x + w / 2} ${ly + lh * 0.1} C ${x + w / 2 + fs * 0.9} ${ly + lh * 0.32}, ${x + w / 2 + fs * 0.75} ${ly + lh * 0.52}, ${x + w / 2} ${ly + lh * 0.52} C ${x + w / 2 - fs * 0.75} ${ly + lh * 0.52}, ${x + w / 2 - fs * 0.9} ${ly + lh * 0.32}, ${x + w / 2} ${ly + lh * 0.1} Z`}
            fill={PAL.orangeDeep}
          />
          {[0.64, 0.76, 0.88].map((k, i) => (
            <line key={k} x1={x + w * 0.24} y1={ly + lh * k} x2={x + w * (i === 2 ? 0.6 : 0.76)} y2={ly + lh * k} stroke={PAL.line} strokeWidth={Math.max(3, w * 0.03)} strokeLinecap="round" />
          ))}
        </g>
      ) : null}
    </g>
  );
};

/** Geometry of the tube label (used when it unfolds into the report). */
export const tubeLabelRect = (x: number, y: number, w: number, h: number) => {
  const capH = h * 0.13;
  const bodyY = y + capH * 0.8;
  const bodyH = h - capH * 0.8;
  return {x: x + w * 0.1, y: bodyY + bodyH * 0.2, w: w * 0.8, h: bodyH * 0.32};
};

/** Matte LDL particle with soft depth (used sparingly for hero particles). */
export const Ldl3D: React.FC<{x: number; y: number; r?: number; opacity?: number}> = ({x, y, r = 14, opacity = 1}) =>
  opacity <= 0.001 ? null : (
    <g opacity={opacity}>
      <defs>
        <radialGradient id="ldl3d" cx="0.36" cy="0.32" r="0.75">
          <stop offset="0" stopColor={PAL.offWhite} />
          <stop offset="0.55" stopColor={PAL.beige} />
          <stop offset="1" stopColor={PAL.orangeDeep} stopOpacity={0.55} />
        </radialGradient>
      </defs>
      <ellipse cx={x + r * 0.15} cy={y + r * 1.05} rx={r * 0.9} ry={r * 0.25} fill={PAL.charcoal} opacity={0.12} />
      <circle cx={x} cy={y} r={r} fill="url(#ldl3d)" stroke={PAL.charcoal} strokeWidth={3} />
    </g>
  );

const BUMPS = Array.from({length: 22}, (_, i) => {
  const a = random(`lb-a-${i}`) * Math.PI * 2;
  const d = Math.sqrt(random(`lb-d-${i}`)) * 0.78;
  return {x: Math.cos(a) * d, y: Math.sin(a) * d, r: 0.2 + random(`lb-r-${i}`) * 0.1};
}).sort((p, q) => p.y - q.y);

/** Stylized-3D LDL cluster ("raspberry" sphere) for hero moments. */
export const LdlCluster: React.FC<{x: number; y: number; r: number; opacity?: number; rot?: number}> = ({x, y, r, opacity = 1, rot = 0}) =>
  opacity <= 0.001 ? null : (
    <g opacity={opacity}>
      <defs>
        <radialGradient id="ldlc-core" cx="0.4" cy="0.38" r="0.7">
          <stop offset="0" stopColor={ART.plaque} />
          <stop offset="0.6" stopColor={PAL.orange} />
          <stop offset="1" stopColor={PAL.orangeDeep} />
        </radialGradient>
        <radialGradient id="ldlc-bump" cx="0.35" cy="0.32" r="0.75">
          <stop offset="0" stopColor={PAL.offWhite} />
          <stop offset="0.45" stopColor={ART.plaque} />
          <stop offset="1" stopColor={PAL.orangeDeep} />
        </radialGradient>
      </defs>
      <ellipse cx={x + r * 0.1} cy={y + r * 1.02} rx={r * 0.85} ry={r * 0.18} fill={PAL.charcoal} opacity={0.14} />
      <circle cx={x} cy={y} r={r} fill="url(#ldlc-core)" />
      <g transform={`rotate(${rot} ${x} ${y})`}>
        {BUMPS.map((b, i) => (
          <circle key={i} cx={x + b.x * r} cy={y + b.y * r} r={b.r * r} fill="url(#ldlc-bump)" />
        ))}
      </g>
    </g>
  );

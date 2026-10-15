/**
 * CoordinationDrills: tennis coordination drills as a silent motion-graphics short
 * (TikTok 1080×1920, 60 fps, SFX only). Motion analysed from the reference reel:
 * one static take, a player runs six ball drills while the headline changes.
 *
 * BEATS = headline timeline (seconds, matches the reference). DRILLS = motion
 * timeline; each drill fits a whole number of cycles so the ball is in a hand at
 * every drill boundary. SFX are derived from the same cycle events.
 */
import {PAL} from '../omega/config';

export {PAL};
export const D_VIDEO = {width: 1080, height: 1920, fps: 60} as const;

export const TOTAL_SECONDS = 18;
export const totalFrames = (fps: number) => Math.round(TOTAL_SECONDS * fps);

/** Stage geometry (page pixels). L = thigh length; the figure is ≈ 4.2 L tall. */
export const STAGE = {cx: 540, floor: 1570, L: 180, ballR: 26} as const;

export type DrillKind = 'between' | 'underLeg' | 'juggle' | 'lungeBounce' | 'sideCatch' | 'sweep';
export type DrillEvent = {readonly f: number; readonly kind: 'bounce' | 'catch'};
export type Drill = {
  readonly kind: DrillKind;
  readonly a: number;
  readonly b: number;
  /** Seconds per cycle (one ball hand-off). */
  readonly period: number;
  readonly label: string;
  readonly events: readonly DrillEvent[];
};

export const DRILLS: readonly Drill[] = [
  {kind: 'between', a: 0, b: 4.6, period: 0.92, label: 'تنطيط بين الرجلين', events: [{f: 0.45, kind: 'bounce'}, {f: 1, kind: 'catch'}]},
  {kind: 'underLeg', a: 4.6, b: 7.1, period: 1.25, label: 'تمرير تحت الركبة', events: [{f: 0.62, kind: 'catch'}]},
  {kind: 'juggle', a: 7.1, b: 9.4, period: 0.575, label: 'تبديل بين الإيدين', events: [{f: 1, kind: 'catch'}]},
  {kind: 'lungeBounce', a: 9.4, b: 12.4, period: 1.5, label: 'طعنة جانبية + تنطيط', events: [{f: 0.35, kind: 'bounce'}, {f: 1, kind: 'catch'}]},
  {kind: 'sideCatch', a: 12.4, b: 14.4, period: 1, label: 'Split step + مسكة', events: [{f: 0.55, kind: 'bounce'}, {f: 0.85, kind: 'catch'}]},
  {kind: 'sweep', a: 14.4, b: TOTAL_SECONDS, period: 1.8, label: 'طعنة عميقة ناعمة', events: [{f: 0.45, kind: 'bounce'}, {f: 0.8, kind: 'catch'}]},
];

/** Headlines (`|` = line break). `sub` appears `subAt` seconds after the beat starts. */
export type Beat = {readonly a: number; readonly b: number; readonly text: string; readonly sub?: string; readonly subAt?: number};
export const BEATS: readonly Beat[] = [
  {a: 0, b: 3, text: 'بدأت تعمل|التمارين دي', sub: 'ولاحظت إن…', subAt: 1},
  {a: 3, b: 4.6, text: 'التوافق الحركي|اتحسّن'},
  {a: 4.6, b: 7.1, text: 'تركيزك|بقى أحسن'},
  {a: 7.1, b: 9.4, text: 'رد فعلك|بقى أسرع'},
  {a: 9.4, b: 12.4, text: 'أداؤك بقى|أكتر ثباتًا'},
  {a: 12.4, b: 14.4, text: 'التوقيت عندك|اتظبط'},
  {a: 14.4, b: TOTAL_SECONDS, text: 'حركتك بقت|أسلس'},
];

/** Pose cross-fade at each drill boundary (seconds). */
export const BLEND = 0.35;

export type Cue = {t: number; kind: 'bounce' | 'catch' | 'whoosh' | 'pop'; volume: number};

/** Every SFX time, computed from the same cycles that move the ball. */
export const SFX_CUES: readonly Cue[] = [
  {t: 0.02, kind: 'pop' as const, volume: 0.35},
  ...BEATS.slice(1).map((b) => ({t: b.a, kind: 'whoosh' as const, volume: 0.32})),
  ...DRILLS.flatMap((d) => {
    const n = Math.round((d.b - d.a) / d.period);
    return Array.from({length: n}, (_, i) =>
      d.events.map((e) => ({t: d.a + (i + e.f) * d.period, kind: e.kind, volume: e.kind === 'bounce' ? 0.75 : 0.55})),
    ).flat();
  }).filter((c) => c.t < TOTAL_SECONDS - 0.05),
];

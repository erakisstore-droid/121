import { Easing, interpolate, spring, type SpringConfig } from "remotion";

/**
 * Animation helpers. Every helper takes the current frame and fps so motion
 * stays correct when the frame rate changes. Timing arguments are in seconds.
 */

export const EASE = {
  /** Fast start, long soft landing. Great default for entrances. */
  outExpo: Easing.bezier(0.16, 1, 0.3, 1),
  /** Symmetric, for moves between two resting states. */
  inOutCubic: Easing.bezier(0.65, 0, 0.35, 1),
  /** Accelerating, for exits. */
  inCubic: Easing.bezier(0.32, 0, 0.67, 0),
  /** Physically based, no overshoot. */
  springSoft: Easing.spring({ damping: 200 }),
} as const;

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** 0 → 1 progress between `start` and `start + duration` (seconds). */
export const progress = (
  frame: number,
  fps: number,
  start: number,
  duration: number,
  easing: (t: number) => number = EASE.outExpo,
): number =>
  interpolate(frame, [start * fps, (start + duration) * fps], [0, 1], {
    ...CLAMP,
    easing,
  });

/** Spring-driven 0 → 1 (may overshoot slightly depending on config). */
export const springIn = (
  frame: number,
  fps: number,
  delaySeconds = 0,
  config: Partial<SpringConfig> = { damping: 14, stiffness: 120, mass: 0.8 },
): number => spring({ frame, fps, delay: delaySeconds * fps, config });

/** Opacity that fades in at the start and out at the end of a clip of `durationInFrames`. */
export const fadeInOut = (
  frame: number,
  fps: number,
  durationInFrames: number,
  fadeSeconds = 0.4,
): number =>
  interpolate(
    frame,
    [
      0,
      fadeSeconds * fps,
      durationInFrames - fadeSeconds * fps,
      durationInFrames,
    ],
    [0, 1, 1, 0],
    CLAMP,
  );

/** Delay in seconds for the item at `index` in a staggered group. */
export const stagger = (index: number, step = 0.08, base = 0): number =>
  base + index * step;

/** Linear mix between two numbers. */
export const mix = (from: number, to: number, t: number): number =>
  from + (to - from) * t;

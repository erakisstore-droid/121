/**
 * Single source of truth for video format and timing.
 *
 * Change WIDTH / HEIGHT / FPS here and every composition, scene and
 * animation adapts: all timing in this project is authored in seconds and
 * converted to frames with the active fps, and layouts scale with the canvas.
 */
export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

/** The design reference resolution. Sizes in components are authored for it. */
export const DESIGN = {
  width: 1920,
  height: 1080,
} as const;

/**
 * Timeline of the Showcase composition, in seconds.
 * The total duration is derived from these values (see showcaseDurationInFrames).
 */
export const SHOWCASE_TIMING = {
  intro: 3.5,
  features: 4.5,
  stats: 4,
  outro: 3.5,
  /** Length of each transition between scenes. Transitions overlap scenes. */
  transitionLength: 0.6,
} as const;

/** Converts seconds to a whole number of frames at the given fps. */
export const sec = (seconds: number, fps: number): number =>
  Math.round(seconds * fps);

export const showcaseDurationInFrames = (fps: number): number => {
  const { intro, features, stats, outro, transitionLength } = SHOWCASE_TIMING;
  const scenes = [intro, features, stats, outro].map((s) => sec(s, fps));
  const transitions = 3 * sec(transitionLength, fps);
  return scenes.reduce((a, b) => a + b, 0) - transitions;
};

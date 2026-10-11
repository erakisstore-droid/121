import { useVideoConfig } from "remotion";
import { DESIGN } from "../config/video";

/**
 * Returns a factor that scales sizes authored for the 1920×1080 design
 * reference to the current canvas. It is based on the short edge, so a
 * 1080×1920 vertical video keeps the same text size as 1920×1080, while
 * 1280×720 scales everything down and 3840×2160 scales it up.
 */
export const useScale = (): number => {
  const { width, height } = useVideoConfig();
  return Math.min(width, height) / Math.min(DESIGN.width, DESIGN.height);
};

/** True when the canvas is taller than it is wide (e.g. 1080×1920). */
export const useIsPortrait = (): boolean => {
  const { width, height } = useVideoConfig();
  return height > width;
};

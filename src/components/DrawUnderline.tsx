import type React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE } from "../lib/animation";
import { useScale } from "../lib/layout";

type DrawUnderlineProps = {
  readonly color: string;
  /** Width in px at the 1920×1080 design reference. */
  readonly width: number;
  /** Seconds after mount when the stroke starts drawing. */
  readonly delaySeconds?: number;
  readonly drawSeconds?: number;
};

/** A hand-drawn style swoosh that draws itself on using stroke-dashoffset. */
export const DrawUnderline: React.FC<DrawUnderlineProps> = ({
  color,
  width,
  delaySeconds = 0,
  drawSeconds = 0.8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = useScale();
  const p = interpolate(
    frame,
    [delaySeconds * fps, (delaySeconds + drawSeconds) * fps],
    [0, 1],
    { ...CLAMP, easing: EASE.inOutCubic },
  );

  return (
    <svg
      width={width * scale}
      height={40 * scale}
      viewBox="0 0 600 40"
      preserveAspectRatio="none"
      style={{ overflow: "visible" }}
    >
      <path
        d="M 4 28 C 120 8, 260 6, 380 16 S 540 30, 596 12"
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - p}
      />
    </svg>
  );
};

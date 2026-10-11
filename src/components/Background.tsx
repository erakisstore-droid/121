import type React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../config/theme";

type Orb = {
  readonly color: string;
  readonly x: number; // % of width
  readonly y: number; // % of height
  readonly size: number; // % of the short edge
  readonly speed: number; // cycles per 10 seconds
  readonly phase: number;
};

const ORBS: readonly Orb[] = [
  { color: COLORS.primary, x: 20, y: 30, size: 70, speed: 1, phase: 0 },
  { color: COLORS.secondary, x: 80, y: 70, size: 60, speed: 0.8, phase: 2 },
  { color: COLORS.accent, x: 65, y: 15, size: 40, speed: 1.3, phase: 4 },
];

type BackgroundProps = {
  /** 0–1, how visible the dot grid is. */
  readonly gridOpacity?: number;
};

/**
 * Deep gradient backdrop with slowly drifting light orbs and a subtle dot grid.
 * Motion depends only on the frame, so it renders identically every time.
 */
export const Background: React.FC<BackgroundProps> = ({
  gridOpacity = 0.35,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const shortEdge = Math.min(width, height);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${COLORS.backgroundAlt} 0%, ${COLORS.background} 70%)`,
        overflow: "hidden",
      }}
    >
      {ORBS.map((orb) => {
        const angle = ((t * orb.speed) / 10) * Math.PI * 2 + orb.phase;
        const size = (orb.size / 100) * shortEdge;
        return (
          <div
            key={orb.color}
            style={{
              position: "absolute",
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 65%)`,
              opacity: 0.35,
              filter: `blur(${shortEdge * 0.04}px)`,
              translate: `${-size / 2 + Math.cos(angle) * shortEdge * 0.05}px ${
                -size / 2 + Math.sin(angle) * shortEdge * 0.04
              }px`,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          opacity: gridOpacity,
          backgroundImage: `radial-gradient(${COLORS.surfaceBorder} 1.5px, transparent 1.5px)`,
          backgroundSize: `${shortEdge * 0.045}px ${shortEdge * 0.045}px`,
          backgroundPosition: `${-t * 6}px ${-t * 10}px`,
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
    </AbsoluteFill>
  );
};

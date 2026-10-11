import type React from "react";
import { Circle, Rect, Star, Triangle } from "@remotion/shapes";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../config/theme";
import { springIn } from "../lib/animation";
import { useScale } from "../lib/layout";

type FloatingShapesProps = {
  /** Seconds before the first shape pops in. */
  readonly delaySeconds?: number;
};

type ShapeSpec = {
  readonly kind: "circle" | "triangle" | "rect" | "star";
  readonly x: number; // % of width
  readonly y: number; // % of height
  readonly size: number; // px at design reference
  readonly color: string;
  readonly filled: boolean;
  readonly spin: number; // degrees per second
};

const SHAPES: readonly ShapeSpec[] = [
  {
    kind: "circle",
    x: 12,
    y: 22,
    size: 70,
    color: COLORS.secondary,
    filled: false,
    spin: 0,
  },
  {
    kind: "triangle",
    x: 86,
    y: 26,
    size: 90,
    color: COLORS.accent,
    filled: true,
    spin: 18,
  },
  {
    kind: "rect",
    x: 16,
    y: 76,
    size: 64,
    color: COLORS.highlight,
    filled: true,
    spin: -24,
  },
  {
    kind: "star",
    x: 82,
    y: 78,
    size: 80,
    color: COLORS.primary,
    filled: true,
    spin: 30,
  },
  {
    kind: "circle",
    x: 70,
    y: 12,
    size: 24,
    color: COLORS.highlight,
    filled: true,
    spin: 0,
  },
  {
    kind: "rect",
    x: 30,
    y: 10,
    size: 32,
    color: COLORS.secondary,
    filled: false,
    spin: 40,
  },
];

/**
 * Geometric accents from @remotion/shapes that spring in one after another,
 * then float and rotate gently.
 */
export const FloatingShapes: React.FC<FloatingShapesProps> = ({
  delaySeconds = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = useScale();
  const t = frame / fps;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {SHAPES.map((shape, i) => {
        const enter = springIn(frame, fps, delaySeconds + i * 0.09);
        const size = shape.size * scale;
        const strokeWidth = 5 * scale;
        const paint = shape.filled
          ? { fill: shape.color }
          : { fill: "none", stroke: shape.color, strokeWidth };
        const common = { ...paint, showInTimeline: false } as const;
        const node =
          shape.kind === "circle" ? (
            <Circle radius={size / 2} {...common} />
          ) : shape.kind === "triangle" ? (
            <Triangle
              length={size}
              direction="up"
              cornerRadius={6 * scale}
              {...common}
            />
          ) : shape.kind === "rect" ? (
            <Rect
              width={size}
              height={size}
              cornerRadius={8 * scale}
              {...common}
            />
          ) : (
            <Star
              points={5}
              innerRadius={size * 0.24}
              outerRadius={size / 2}
              cornerRadius={4 * scale}
              {...common}
            />
          );

        return (
          <div
            key={`${shape.kind}-${shape.x}-${shape.y}`}
            style={{
              position: "absolute",
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              translate: `-50% calc(-50% + ${Math.sin(t * 1.4 + i) * 14 * scale}px)`,
              scale: String(enter),
              rotate: `${shape.spin * t + (1 - enter) * -90}deg`,
              opacity: 0.9,
              filter: `drop-shadow(0 0 ${18 * scale}px ${shape.color}66)`,
            }}
          >
            {node}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

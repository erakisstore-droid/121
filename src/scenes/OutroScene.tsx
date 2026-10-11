import type React from "react";
import { Circle, Rect, Triangle } from "@remotion/shapes";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { Background } from "../components/Background";
import { COLORS, FONTS } from "../config/theme";
import { springIn } from "../lib/animation";
import { useScale } from "../lib/layout";

type OutroSceneProps = {
  readonly title: string;
  readonly command: string;
  readonly style?: React.CSSProperties;
};

/** Three shapes fly in and lock into a logo mark, then the call to action appears. */
const OutroSceneInner: React.FC<OutroSceneProps> = ({
  title,
  command,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = useScale();
  const size = 90 * scale;
  const gap = 26 * scale;

  // Each piece springs in with a short stagger.
  const pieces = [0, 0.12, 0.24].map((delay) =>
    springIn(frame, fps, delay, { damping: 15, stiffness: 120 }),
  );

  // The logo mark settles, then "breathes" once it has locked together.
  const lock = springIn(frame, fps, 0.9, { damping: 10, stiffness: 180 });
  const piece = (
    i: number,
    fromX: number,
    fromY: number,
    fromRotate: number,
  ): React.CSSProperties => ({
    translate: `${(1 - pieces[i]) * fromX * scale}px ${(1 - pieces[i]) * fromY * scale}px`,
    rotate: `${(1 - pieces[i]) * fromRotate}deg`,
  });

  return (
    <AbsoluteFill style={{ fontFamily: FONTS.body, ...style }}>
      <Background gridOpacity={0.3} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 56 * scale,
          padding: `${100 * scale}px ${80 * scale}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap,
            scale: String(1 + 0.08 * Math.sin(lock * Math.PI)),
          }}
        >
          <div style={piece(0, -900, 0, -180)}>
            <Circle
              radius={size / 2}
              fill={COLORS.secondary}
              showInTimeline={false}
            />
          </div>
          <div style={piece(1, 0, -600, 180)}>
            <Triangle
              length={size * 1.1}
              direction="up"
              cornerRadius={8 * scale}
              fill={COLORS.highlight}
              showInTimeline={false}
            />
          </div>
          <div style={piece(2, 900, 0, -180)}>
            <Rect
              width={size}
              height={size}
              cornerRadius={14 * scale}
              fill={COLORS.accent}
              showInTimeline={false}
            />
          </div>
        </div>
        <AnimatedTitle
          name="Title"
          from={0.8 * fps}
          premountFor={fps}
          fontSize={120}
          color={COLORS.text}
          highlightWord="yours"
          highlightColor={COLORS.accent}
          staggerSeconds={0.1}
          style={{ position: "relative" }}
        >
          {title}
        </AnimatedTitle>
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 40 * scale,
            color: COLORS.text,
            padding: `${18 * scale}px ${36 * scale}px`,
            borderRadius: 16 * scale,
            background: COLORS.surface,
            border: `${1.5 * scale}px solid ${COLORS.surfaceBorder}`,
            opacity: interpolate(frame, [1.5 * fps, 2 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [1.5 * fps, 2.2 * fps],
              ["0px 20px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          <span style={{ color: COLORS.secondary }}>$</span> {command}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const outroSceneSchema = {
  title: {
    type: "text-content",
    default: "Now make it yours.",
    description: "Title",
  },
  command: {
    type: "text-content",
    default: "npm run dev",
    description: "Command",
  },
} as const satisfies InteractivitySchema;

export const OutroScene = Interactive.withSchema({
  Component: OutroSceneInner,
  componentName: "<OutroScene>",
  schema: outroSceneSchema,
  wrapInSequence: true,
});

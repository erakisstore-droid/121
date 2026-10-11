import type React from "react";
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
import { DrawUnderline } from "../components/DrawUnderline";
import { FloatingShapes } from "../components/FloatingShapes";
import { Kicker } from "../components/Kicker";
import { COLORS, FONTS } from "../config/theme";
import { useScale } from "../lib/layout";

type IntroSceneProps = {
  readonly kicker: string;
  readonly title: string;
  readonly highlightWord: string;
  readonly subtitle: string;
  readonly style?: React.CSSProperties;
};

const IntroSceneInner: React.FC<IntroSceneProps> = ({
  kicker,
  title,
  highlightWord,
  subtitle,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = useScale();

  return (
    <AbsoluteFill style={{ fontFamily: FONTS.body, ...style }}>
      <Background />
      <FloatingShapes delaySeconds={0.3} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 36 * scale,
          padding: `${100 * scale}px ${120 * scale}px`,
          // Slow push-in over the whole scene for a cinematic feel.
          scale: interpolate(frame, [0, 4 * fps], [1, 1.04], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Kicker
          name="Kicker"
          premountFor={fps}
          accentColor={COLORS.secondary}
          style={{
            position: "relative",
            opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [0, 0.8 * fps],
              ["0px 30px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          {kicker}
        </Kicker>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <AnimatedTitle
            name="Title"
            from={0.25 * fps}
            premountFor={fps}
            fontSize={132}
            color={COLORS.text}
            highlightWord={highlightWord}
            highlightColor={COLORS.secondary}
            staggerSeconds={0.09}
            style={{ position: "relative", maxWidth: 1500 * scale }}
          >
            {title}
          </AnimatedTitle>
          <DrawUnderline color={COLORS.accent} width={520} delaySeconds={1.1} />
        </div>
        <div
          style={{
            fontSize: 44 * scale,
            color: COLORS.textMuted,
            textAlign: "center",
            textWrap: "balance",
            opacity: interpolate(frame, [1.4 * fps, 2 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [1.4 * fps, 2.2 * fps],
              ["0px 24px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          {subtitle}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const introSceneSchema = {
  kicker: {
    type: "text-content",
    default: "Remotion · Motion graphics",
    description: "Kicker",
  },
  title: {
    type: "text-content",
    default: "Motion graphics, written in code",
    description: "Title",
  },
  highlightWord: {
    type: "text-content",
    default: "code",
    description: "Highlighted word",
  },
  subtitle: {
    type: "text-content",
    default: "React components in. Polished MP4 out.",
    description: "Subtitle",
  },
} as const satisfies InteractivitySchema;

export const IntroScene = Interactive.withSchema({
  Component: IntroSceneInner,
  componentName: "<IntroScene>",
  schema: introSceneSchema,
  wrapInSequence: true,
});

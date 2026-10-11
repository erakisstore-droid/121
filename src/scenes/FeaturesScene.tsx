import type React from "react";
import {
  AbsoluteFill,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { Background } from "../components/Background";
import { FeatureCard } from "../components/FeatureCard";
import { Kicker } from "../components/Kicker";
import { COLORS, FONTS } from "../config/theme";
import { useIsPortrait, useScale } from "../lib/layout";

type FeaturesSceneProps = {
  readonly kicker: string;
  readonly title: string;
  readonly style?: React.CSSProperties;
};

const FeaturesSceneInner: React.FC<FeaturesSceneProps> = ({
  kicker,
  title,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = useScale();
  const portrait = useIsPortrait();

  return (
    <AbsoluteFill style={{ fontFamily: FONTS.body, ...style }}>
      <Background gridOpacity={0.25} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 64 * scale,
          padding: `${100 * scale}px ${80 * scale}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28 * scale,
          }}
        >
          <Kicker
            name="Kicker"
            premountFor={fps}
            accentColor={COLORS.highlight}
            style={{
              position: "relative",
              opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {kicker}
          </Kicker>
          <AnimatedTitle
            name="Title"
            from={0.1 * fps}
            premountFor={fps}
            fontSize={96}
            color={COLORS.text}
            highlightWord="animate"
            highlightColor={COLORS.highlight}
            staggerSeconds={0.12}
            style={{ position: "relative" }}
          >
            {title}
          </AnimatedTitle>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: portrait ? "column" : "row",
            gap: 40 * scale,
            alignItems: "stretch",
          }}
        >
          <FeatureCard
            name="Card: Compose"
            from={0.6 * fps}
            premountFor={fps}
            title="Compose"
            description="Scenes are React components you can reuse and nest."
            accentColor={COLORS.secondary}
            icon="circle"
            style={{ position: "relative" }}
          />
          <FeatureCard
            name="Card: Animate"
            from={0.75 * fps}
            premountFor={fps}
            title="Animate"
            description="Every property is a function of the current frame."
            accentColor={COLORS.highlight}
            icon="triangle"
            style={{ position: "relative" }}
          />
          <FeatureCard
            name="Card: Render"
            from={0.9 * fps}
            premountFor={fps}
            title="Render"
            description="Export frame-perfect MP4s from the CLI or Studio."
            accentColor={COLORS.accent}
            icon="star"
            style={{ position: "relative" }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const featuresSceneSchema = {
  kicker: {
    type: "text-content",
    default: "Reusable building blocks",
    description: "Kicker",
  },
  title: {
    type: "text-content",
    default: "Compose. Animate. Render.",
    description: "Title",
  },
} as const satisfies InteractivitySchema;

export const FeaturesScene = Interactive.withSchema({
  Component: FeaturesSceneInner,
  componentName: "<FeaturesScene>",
  schema: featuresSceneSchema,
  wrapInSequence: true,
});

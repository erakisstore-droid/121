import type React from "react";
import {
  AbsoluteFill,
  Interactive,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { Background } from "../components/Background";
import { StatRing } from "../components/StatRing";
import { COLORS, FONTS } from "../config/theme";
import { useIsPortrait, useScale } from "../lib/layout";

type StatsSceneProps = {
  readonly title: string;
  readonly style?: React.CSSProperties;
};

/**
 * Counters that read the live composition config, so the numbers on screen
 * always match the format you render (change fps/size and they update).
 */
const StatsSceneInner: React.FC<StatsSceneProps> = ({ title, style }) => {
  const { fps, width, height } = useVideoConfig();
  const scale = useScale();
  const portrait = useIsPortrait();

  return (
    <AbsoluteFill style={{ fontFamily: FONTS.body, ...style }}>
      <Background gridOpacity={0.2} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 80 * scale,
          padding: `${100 * scale}px ${80 * scale}px`,
        }}
      >
        <AnimatedTitle
          name="Title"
          premountFor={fps}
          fontSize={92}
          color={COLORS.text}
          highlightWord="frame"
          highlightColor={COLORS.secondary}
          staggerSeconds={0.07}
          style={{ position: "relative" }}
        >
          {title}
        </AnimatedTitle>
        <div
          style={{
            display: "flex",
            flexDirection: portrait ? "column" : "row",
            gap: (portrait ? 60 : 140) * scale,
          }}
        >
          <StatRing
            name="Stat: fps"
            from={0.5 * fps}
            premountFor={fps}
            value={fps}
            suffix="fps"
            label="Frame rate"
            fill={fps / 60}
            accentColor={COLORS.secondary}
            style={{ position: "relative" }}
          />
          <StatRing
            name="Stat: resolution"
            from={0.7 * fps}
            premountFor={fps}
            value={Math.min(width, height)}
            suffix="p"
            label={`${width}×${height}`}
            fill={Math.min(1, Math.min(width, height) / 2160)}
            accentColor={COLORS.primary}
            style={{ position: "relative" }}
          />
          <StatRing
            name="Stat: React"
            from={0.9 * fps}
            premountFor={fps}
            value={100}
            suffix="%"
            label="React"
            fill={1}
            accentColor={COLORS.accent}
            style={{ position: "relative" }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const statsSceneSchema = {
  title: {
    type: "text-content",
    default: "Every frame is a React render",
    description: "Title",
  },
} as const satisfies InteractivitySchema;

export const StatsScene = Interactive.withSchema({
  Component: StatsSceneInner,
  componentName: "<StatsScene>",
  schema: statsSceneSchema,
  wrapInSequence: true,
});

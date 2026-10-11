import type React from "react";
import { Circle, Star, Triangle } from "@remotion/shapes";
import {
  Interactive,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { COLORS, FONTS } from "../config/theme";
import { progress, springIn } from "../lib/animation";
import { useScale } from "../lib/layout";

type FeatureCardProps = {
  readonly title: string;
  readonly description: string;
  readonly accentColor: string;
  readonly icon: "circle" | "triangle" | "star";
  readonly style?: React.CSSProperties;
};

/**
 * Glassmorphism card with an animated shape icon. Its own entrance (lift,
 * scale, accent bar growth) is driven by its local frame, so it can be
 * placed anywhere with `from` and stays self-contained.
 */
const FeatureCardInner: React.FC<FeatureCardProps> = ({
  title,
  description,
  accentColor,
  icon,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = useScale();
  const enter = springIn(frame, fps, 0, { damping: 16, stiffness: 110 });
  const bar = progress(frame, fps, 0.25, 0.8);
  const iconSize = 64 * scale;
  const iconRotate = (frame / fps) * 25;
  const iconProps = { fill: accentColor, showInTimeline: false } as const;

  return (
    <Interactive.Div style={{ display: "flex", ...style }}>
      <div
        style={{
          width: 460 * scale,
          padding: 44 * scale,
          borderRadius: 32 * scale,
          background: `linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))`,
          border: `${1.5 * scale}px solid ${COLORS.surfaceBorder}`,
          boxShadow: `0 ${30 * scale}px ${80 * scale}px rgba(0,0,0,0.35)`,
          display: "flex",
          flexDirection: "column",
          gap: 22 * scale,
          opacity: Math.min(1, enter * 1.5),
          translate: `0 ${(1 - enter) * 120 * scale}px`,
          scale: String(0.9 + 0.1 * enter),
        }}
      >
        <div
          style={{
            width: iconSize * 1.6,
            height: iconSize * 1.6,
            borderRadius: 20 * scale,
            backgroundColor: `${accentColor}22`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{ rotate: icon === "circle" ? "0deg" : `${iconRotate}deg` }}
          >
            {icon === "circle" ? (
              <Circle
                radius={(iconSize / 2) * (0.85 + 0.15 * Math.sin(frame / 6))}
                {...iconProps}
              />
            ) : icon === "triangle" ? (
              <Triangle
                length={iconSize}
                direction="up"
                cornerRadius={6 * scale}
                {...iconProps}
              />
            ) : (
              <Star
                points={5}
                innerRadius={iconSize * 0.22}
                outerRadius={iconSize / 2}
                cornerRadius={3 * scale}
                {...iconProps}
              />
            )}
          </div>
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 700,
            fontSize: 50 * scale,
            color: COLORS.text,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            height: 6 * scale,
            width: `${bar * 40}%`,
            borderRadius: 3 * scale,
            backgroundColor: accentColor,
          }}
        />
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 30 * scale,
            lineHeight: 1.4,
            color: COLORS.textMuted,
          }}
        >
          {description}
        </div>
      </div>
    </Interactive.Div>
  );
};

const featureCardSchema = {
  title: { type: "text-content", default: "Feature", description: "Title" },
  description: {
    type: "text-content",
    default: "Description",
    description: "Description",
  },
  accentColor: {
    type: "color",
    default: COLORS.primary,
    description: "Accent color",
  },
  icon: {
    type: "enum",
    default: "circle",
    description: "Icon",
    variants: { circle: {}, triangle: {}, star: {} },
  },
} as const satisfies InteractivitySchema;

export const FeatureCard = Interactive.withSchema({
  Component: FeatureCardInner,
  componentName: "<FeatureCard>",
  schema: featureCardSchema,
  wrapInSequence: true,
});

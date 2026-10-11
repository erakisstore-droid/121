import type React from "react";
import { Fragment } from "react";
import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { COLORS, FONTS } from "../config/theme";
import { CLAMP, EASE } from "../lib/animation";
import { useScale } from "../lib/layout";

type AnimatedTitleProps = {
  readonly children: string;
  /** Font size in px at the 1920×1080 design reference. */
  readonly fontSize: number;
  readonly color: string;
  /** Words matching this (case-insensitive) are painted with the highlight color. */
  readonly highlightWord: string;
  readonly highlightColor: string;
  /** Seconds between each word's entrance. */
  readonly staggerSeconds: number;
  readonly style?: React.CSSProperties;
};

/**
 * Headline that reveals word by word: each word rises out of a mask with a
 * slight rotation and blur, staggered over time.
 */
const AnimatedTitleInner: React.FC<AnimatedTitleProps> = ({
  children,
  fontSize,
  color,
  highlightWord,
  highlightColor,
  staggerSeconds,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = useScale();
  const words = children.split(" ");

  return (
    <Interactive.Div
      style={{
        // Balanced wrapping keeps multi-line titles even (no lonely last word).
        textWrap: "balance",
        fontFamily: FONTS.display,
        fontWeight: 700,
        fontSize: fontSize * scale,
        lineHeight: 1.05,
        letterSpacing: "-0.03em",
        color,
        textAlign: "center",
        ...style,
      }}
    >
      {words.map((word, i) => {
        const start = i * staggerSeconds * fps;
        const p = interpolate(frame, [start, start + 0.7 * fps], [0, 1], {
          ...CLAMP,
          easing: EASE.outExpo,
        });
        const isHighlight =
          highlightWord.length > 0 &&
          word.toLowerCase().replace(/[^a-z0-9]/g, "") ===
            highlightWord.toLowerCase();
        return (
          <Fragment key={`${word}-${i}`}>
            {i > 0 ? " " : null}
            <span
              style={{
                display: "inline-block",
                overflow: "hidden",
                padding: "0.06em 0",
                verticalAlign: "top",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  translate: `0 ${(1 - p) * 110}%`,
                  rotate: `${(1 - p) * 6}deg`,
                  filter: `blur(${(1 - p) * 8 * scale}px)`,
                  color: isHighlight ? highlightColor : undefined,
                }}
              >
                {word}
              </span>
            </span>
          </Fragment>
        );
      })}
    </Interactive.Div>
  );
};

const animatedTitleSchema = {
  children: { type: "text-content", default: "Title", description: "Text" },
  fontSize: {
    type: "number",
    default: 120,
    min: 10,
    max: 400,
    step: 1,
    description: "Font size (at 1080p)",
    hiddenFromList: false,
  },
  color: { type: "color", default: COLORS.text, description: "Color" },
  highlightWord: {
    type: "text-content",
    default: "",
    description: "Highlighted word",
  },
  highlightColor: {
    type: "color",
    default: COLORS.secondary,
    description: "Highlight color",
  },
  staggerSeconds: {
    type: "number",
    default: 0.08,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Word stagger (s)",
    hiddenFromList: false,
    keyframable: false,
  },
} as const satisfies InteractivitySchema;

export const AnimatedTitle = Interactive.withSchema({
  Component: AnimatedTitleInner,
  componentName: "<AnimatedTitle>",
  schema: animatedTitleSchema,
  wrapInSequence: true,
});

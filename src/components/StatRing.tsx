import type React from "react";
import { Circle, Pie } from "@remotion/shapes";
import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { COLORS, FONTS } from "../config/theme";
import { CLAMP, EASE, springIn } from "../lib/animation";
import { useScale } from "../lib/layout";

type StatRingProps = {
  /** Final number the counter lands on. */
  readonly value: number;
  readonly suffix: string;
  readonly label: string;
  /** 0–1, how much of the ring is filled at the end. */
  readonly fill: number;
  readonly accentColor: string;
  readonly style?: React.CSSProperties;
};

/** Progress ring that sweeps in while a number counts up in its center. */
const StatRingInner: React.FC<StatRingProps> = ({
  value,
  suffix,
  label,
  fill,
  accentColor,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = useScale();
  const radius = 150 * scale;
  const stroke = 18 * scale;
  const count = interpolate(frame, [0.1 * fps, 1.6 * fps], [0, 1], {
    ...CLAMP,
    easing: EASE.outExpo,
  });
  const pop = springIn(frame, fps, 0, { damping: 13, stiffness: 140 });

  return (
    <Interactive.Div style={{ display: "flex", ...style }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30 * scale,
          scale: String(pop),
        }}
      >
        <div
          style={{
            position: "relative",
            width: radius * 2,
            height: radius * 2,
          }}
        >
          <div style={{ position: "absolute", inset: 0 }}>
            <Circle
              radius={radius - stroke / 2}
              fill="none"
              stroke={COLORS.surfaceBorder}
              strokeWidth={stroke}
              showInTimeline={false}
              style={{ translate: `${stroke / 2}px ${stroke / 2}px` }}
            />
          </div>
          <div style={{ position: "absolute", inset: 0 }}>
            <Pie
              radius={radius - stroke / 2}
              progress={Math.max(0.0001, fill * count)}
              closePath={false}
              rotation={-Math.PI / 2}
              fill="none"
              stroke={accentColor}
              strokeWidth={stroke}
              strokeLinecap="round"
              showInTimeline={false}
              style={{
                translate: `${stroke / 2}px ${stroke / 2}px`,
                filter: `drop-shadow(0 0 ${14 * scale}px ${accentColor})`,
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONTS.display,
              fontWeight: 700,
              fontSize: 68 * scale,
              color: COLORS.text,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(value * count).toLocaleString("en-US")}
            <span
              style={{
                fontSize: 34 * scale,
                color: accentColor,
                marginLeft: 4 * scale,
              }}
            >
              {suffix}
            </span>
          </div>
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontWeight: 500,
            fontSize: 34 * scale,
            color: COLORS.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          {label}
        </div>
      </div>
    </Interactive.Div>
  );
};

const statRingSchema = {
  value: {
    type: "number",
    default: 100,
    description: "Value",
    hiddenFromList: false,
  },
  suffix: { type: "text-content", default: "", description: "Suffix" },
  label: { type: "text-content", default: "Label", description: "Label" },
  fill: {
    type: "number",
    default: 0.75,
    min: 0,
    max: 1,
    step: 0.01,
    description: "Ring fill",
    hiddenFromList: false,
  },
  accentColor: {
    type: "color",
    default: COLORS.secondary,
    description: "Accent color",
  },
} as const satisfies InteractivitySchema;

export const StatRing = Interactive.withSchema({
  Component: StatRingInner,
  componentName: "<StatRing>",
  schema: statRingSchema,
  wrapInSequence: true,
});

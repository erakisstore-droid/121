import type React from "react";
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

type KickerProps = {
  readonly children: string;
  readonly accentColor: string;
  readonly style?: React.CSSProperties;
};

/** Small uppercase label in a glass pill, with a pulsing accent dot and letter-spacing reveal. */
const KickerInner: React.FC<KickerProps> = ({
  children,
  accentColor,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = useScale();
  const pulse = 0.6 + 0.4 * Math.sin((frame / fps) * Math.PI * 2);

  return (
    <Interactive.Div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 16 * scale,
        padding: `${14 * scale}px ${28 * scale}px`,
        borderRadius: 999,
        background: COLORS.surface,
        border: `${1.5 * scale}px solid ${COLORS.surfaceBorder}`,
        fontFamily: FONTS.body,
        fontWeight: 500,
        fontSize: 28 * scale,
        textTransform: "uppercase",
        color: COLORS.textMuted,
        letterSpacing: `${interpolate(frame, [0, 1 * fps], [0.5, 0.18], {
          ...CLAMP,
          easing: EASE.outExpo,
        })}em`,
        ...style,
      }}
    >
      <div
        style={{
          width: 14 * scale,
          height: 14 * scale,
          borderRadius: "50%",
          backgroundColor: accentColor,
          boxShadow: `0 0 ${20 * pulse * scale}px ${accentColor}`,
        }}
      />
      {children}
    </Interactive.Div>
  );
};

const kickerSchema = {
  children: { type: "text-content", default: "Label", description: "Text" },
  accentColor: {
    type: "color",
    default: COLORS.secondary,
    description: "Accent color",
  },
} as const satisfies InteractivitySchema;

export const Kicker = Interactive.withSchema({
  Component: KickerInner,
  componentName: "<Kicker>",
  schema: kickerSchema,
  wrapInSequence: true,
});

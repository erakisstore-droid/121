import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * Fonts are self-hosted in public/fonts (SIL Open Font License), so renders
 * work offline and look identical on every machine. loadFont() delays
 * rendering until each file is ready. To add a weight or family, drop the
 * .woff2 into public/fonts and add a line below.
 */
const FONT_FILES = [
  { family: "Inter", weight: "400", file: "fonts/Inter-400.woff2" },
  { family: "Inter", weight: "500", file: "fonts/Inter-500.woff2" },
  { family: "Inter", weight: "700", file: "fonts/Inter-700.woff2" },
  {
    family: "Space Grotesk",
    weight: "500",
    file: "fonts/SpaceGrotesk-500.woff2",
  },
  {
    family: "Space Grotesk",
    weight: "700",
    file: "fonts/SpaceGrotesk-700.woff2",
  },
] as const;

for (const font of FONT_FILES) {
  loadFont({
    family: font.family,
    weight: font.weight,
    url: staticFile(font.file),
  });
}

export const FONTS = {
  body: '"Inter", system-ui, sans-serif',
  display: '"Space Grotesk", "Inter", system-ui, sans-serif',
} as const;

export const COLORS = {
  background: "#0B0D17",
  backgroundAlt: "#141833",
  surface: "rgba(255, 255, 255, 0.06)",
  surfaceBorder: "rgba(255, 255, 255, 0.12)",
  text: "#F5F7FF",
  textMuted: "#A3ACCB",
  primary: "#6C5CE7",
  secondary: "#00D2D3",
  accent: "#FF6B81",
  highlight: "#FECA57",
} as const;

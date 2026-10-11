#!/usr/bin/env node
/**
 * Scaffolds a new composition and registers it in src/Root.tsx.
 *
 *   npm run new -- MyPromo
 *   npm run new -- MyPromo --seconds=8
 *
 * Creates src/compositions/MyPromo.tsx from a working starter (background,
 * animated title, subtitle) and adds a <Composition id="MyPromo"> using the
 * format from src/config/video.ts.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--"));
const secondsArg = args.find((a) => a.startsWith("--seconds="));
const seconds = secondsArg ? Number(secondsArg.split("=")[1]) : 5;

const fail = (msg) => {
  console.error(`✖ ${msg}`);
  console.error("Usage: npm run new -- <PascalCaseName> [--seconds=5]");
  process.exit(1);
};

if (!name) fail("Missing composition name.");
if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
  fail(`"${name}" must be PascalCase letters/digits, e.g. ProductLaunch.`);
}
if (!Number.isFinite(seconds) || seconds <= 0)
  fail("--seconds must be a positive number.");

const file = join(root, "src", "compositions", `${name}.tsx`);
const rootFile = join(root, "src", "Root.tsx");
if (existsSync(file)) fail(`${relative(root, file)} already exists.`);

const rootSource = readFileSync(rootFile, "utf8");
if (rootSource.includes(`id="${name}"`))
  fail(`A composition with id "${name}" is already registered.`);
const marker = "      {/* @new-compositions";
if (!rootSource.includes(marker))
  fail("Could not find the @new-compositions marker in src/Root.tsx.");

const template = `import type React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedTitle } from "../components/AnimatedTitle";
import { Background } from "../components/Background";
import { COLORS, FONTS } from "../config/theme";
import { useScale } from "../lib/layout";

/**
 * ${name}: replace this starter with your own scenes.
 * Duration and format are set where it is registered in src/Root.tsx.
 */
export const ${name}: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = useScale();

  return (
    <AbsoluteFill style={{ fontFamily: FONTS.body }}>
      <Background />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 32 * scale,
          padding: \`\${100 * scale}px \${120 * scale}px\`,
        }}
      >
        <AnimatedTitle
          name="Title"
          premountFor={fps}
          fontSize={120}
          color={COLORS.text}
          highlightWord=""
          highlightColor={COLORS.secondary}
          staggerSeconds={0.08}
          style={{ position: "relative" }}
        >
          ${name.replace(/([a-z0-9])([A-Z])/g, "$1 $2")}
        </AnimatedTitle>
        <div
          style={{
            fontSize: 44 * scale,
            color: COLORS.textMuted,
            opacity: interpolate(frame, [0.8 * fps, 1.4 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [0.8 * fps, 1.6 * fps],
              ["0px 24px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          Edit src/compositions/${name}.tsx
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
`;

const registration = `      <Composition
        id="${name}"
        component={${name}}
        width={VIDEO.width}
        height={VIDEO.height}
        fps={VIDEO.fps}
        durationInFrames={sec(${seconds}, VIDEO.fps)}
      />
`;

const importLine = `import { ${name} } from "./compositions/${name}";\n`;
// Insert the import after the last existing import statement.
const lastImport = rootSource.lastIndexOf("\nimport ");
const endOfLastImport = rootSource.indexOf(";\n", lastImport) + 2;
let nextRoot =
  rootSource.slice(0, endOfLastImport) +
  importLine +
  rootSource.slice(endOfLastImport);
nextRoot = nextRoot.replace(marker, `${registration}\n${marker}`);

writeFileSync(file, template);
writeFileSync(rootFile, nextRoot);

console.log(`✔ Created ${relative(root, file)}`);
console.log(
  `✔ Registered <Composition id="${name}"> (${seconds}s) in src/Root.tsx`,
);
console.log("");
console.log("Next:");
console.log(
  `  npm run dev                                   # open "${name}" in Remotion Studio`,
);
console.log(`  npx remotion render ${name} out/${name}.mp4   # export an MP4`);

# AGENTS.md: working on this Remotion project

This repo makes **programmatic motion-graphics videos** with
[Remotion](https://www.remotion.dev/docs) **4.0.534** (React 19, TypeScript).
Every frame is a React render, and videos are exported to MP4 with headless Chrome + FFmpeg.

Official Remotion Agent Skills are installed in `.agents/skills/` (symlinked
into `.claude/skills/` for Claude Code). Load **`remotion-best-practices`**
first. It routes to `remotion-markup` (animation, media, fonts, transitions),
`remotion-create`, `remotion-studio`, `remotion-render` and the rest. Those
skills are the source of truth for Remotion APIs, and this file covers the
conventions of *this* project.

## Project map

```
src/
  index.ts                 registerRoot(). Do not edit.
  Root.tsx                 Registers every <Composition> (Studio sidebar)
  config/
    video.ts               VIDEO (width/height/fps), SHOWCASE_TIMING (seconds), sec()
    theme.ts               COLORS palette + FONTS (self-hosted, loaded here)
  lib/
    animation.ts           EASE presets, CLAMP, progress(), springIn(), fadeInOut(), stagger()
    layout.ts              useScale() (resolution-independent sizing), useIsPortrait()
  components/              Reusable building blocks
    AnimatedTitle.tsx      Word-by-word masked headline reveal (interactive)
    Kicker.tsx             Uppercase pill label (interactive)
    FeatureCard.tsx        Glass card with animated shape icon (interactive)
    StatRing.tsx           Count-up number inside a progress ring (interactive)
    Background.tsx         Gradient + drifting orbs + dot grid
    FloatingShapes.tsx     @remotion/shapes accents that spring in and float
    DrawUnderline.tsx      Self-drawing SVG stroke
  scenes/                  Full-frame scenes (Intro, Features, Stats, Outro)
  compositions/
    Showcase.tsx           Sample video: TransitionSeries + music + SFX
public/
  audio/                   music-bed.mp3, whoosh.wav, pop.wav (original, generated with FFmpeg)
  fonts/                   Inter + Space Grotesk .woff2 (SIL OFL, licenses alongside)
  (images, video)          Add more assets here, e.g. public/images/logo.png
scripts/new-composition.mjs  `npm run new -- Name` scaffolder
out/                       Render output (git-ignored)
```

## MSSpasticityFootDrop (medical explainer, 1080×1920, 60 fps, 70 s)

- Source: `src/ms/`. Timing is one shared sentence timeline: `BEATS` in
  `src/ms/config.ts` (19 beats, seconds). All motion is expressed as fractions of
  these beats via `at(beat, fraction)`, so retiming a beat to the narration moves
  its visuals with it. Key phrases: `CAPTIONS`. SFX cues: `SFX_CUES` / `SFX_ENABLED`.
- Acts (`src/ms/acts/Act1–6.tsx`) read absolute time and hand objects to each
  other at beat boundaries; shared geometry lives in `src/ms/lib/geom.ts`.
- Original attached screenshots are in `public/ms/asset-*.png` (byte-identical
  copies; only the container zooms). Arabic font: Cairo (`public/ms/fonts`, OFL).
- Render: `npx remotion render MSSpasticityFootDrop renders/ms-spasticity-foot-drop-70s.mp4 --crf=18`

## CholesterolEarlyScreening (medical explainer, 1080×1920, 60 fps, 63 s)

- Source: `src/chol/`. One take across an infinite board: `PAGES` (1080×1920 design
  areas placed on the board) and `CAMERA` keyframes live in `src/chol/config.ts`
  with `BEATS` (16 beats), `CAPTIONS` (`|` = line break) and `SFX_CUES`.
- Acts draw in page-local coordinates (`Board.tsx` → `<Page>`; `pageDelta()` for
  threads that cross pages). `art/Artery.tsx` is the reusable artery section,
  `art/hero.tsx` the stylized-3D tube and LDL particle; layout in `geom.ts`.
- Original sources: `public/chol/source-*.png` (byte-identical; only the container zooms/pans).
- Render: `npx remotion render CholesterolEarlyScreening renders/cholesterol-screening-63s.mp4 --crf=18`

## Commands

| Task | Command |
| --- | --- |
| Install | `npm install` |
| Open Studio (preview) | `npm run dev` (http://localhost:3000) |
| New composition | `npm run new -- ProductLaunch --seconds=8` |
| Render sample MP4 | `npm run render` → `out/showcase.mp4` |
| Render any composition | `npx remotion render <Id> out/<id>.mp4` |
| Inspect frames as images | `npm run frames` or `npx remotion render <Id> out/frames --frames=0,45,90 --image-format=jpeg` |
| One still | `npx remotion still <Id> out/still.png --frame=60` |
| List compositions | `npx remotion compositions` |
| Lint + typecheck | `npm run lint` |
| Upgrade Remotion | `npm run upgrade` (keeps all `@remotion/*` versions in lockstep) |

Add Remotion packages only with `npx remotion add <pkg>` (e.g. `@remotion/lottie`,
`@remotion/google-fonts`, `zod`). It pins the exact matching version. **Never**
mix `@remotion/*` versions.

## Golden rules

1. **Animate only from the frame.** Use `useCurrentFrame()` + `interpolate()` /
   `spring()`. CSS `transition`, `animation`, `@keyframes`, Tailwind `animate-*`,
   `setTimeout` and `Math.random()` all break rendering. Use `random('seed')` from
   `remotion` for deterministic randomness.
2. **Author time in seconds, convert with fps.** Inside components:
   `const {fps} = useVideoConfig();` then `from={0.5 * fps}`,
   `interpolate(frame, [0, 0.8 * fps], ...)`. In config, use `sec(seconds, fps)`.
   Never hard-code frame numbers that assume 30 fps.
3. **Size with `useScale()`.** Pixel sizes are authored for 1920×1080 and multiplied
   by `useScale()`, so any resolution works. Use `useIsPortrait()` to switch rows
   to columns for vertical video. Keep key text ≥ 80px from the sides and ≥ 100px
   from the top and bottom, with headlines ≥ 84px and supporting text ≥ 44px at 1080p.
4. **Always clamp** (`extrapolateLeft/Right: 'clamp'`, or spread `CLAMP`) unless
   overshoot is intended.
5. **Premount timed things:** `premountFor={fps}` on `<Sequence>`,
   `<TransitionSeries.Sequence>`, `<Audio>`, interactive components with `from`.
6. **Assets** go in `public/` and are referenced with `staticFile('audio/x.mp3')`.
   Media: `<Audio>` / `<Video>` from `@remotion/media`, images with `<Img>` from `remotion`.
7. **Fonts** are loaded once in `src/config/theme.ts`. Use `FONTS.display` (Space
   Grotesk, headlines) and `FONTS.body` (Inter). To add a font, drop a `.woff2` into
   `public/fonts/` and add a line to `FONT_FILES`.
8. **Colors** come from `COLORS` in `theme.ts`. Do not scatter hex codes.
9. Prefer `scale`, `translate`, `rotate` CSS properties over `transform` strings, and
   keep `interpolate()` calls inline in `style` so Studio can edit keyframes.

## Changing resolution, frame rate, duration

- **Everything at once:** edit `VIDEO` in `src/config/video.ts`
  (e.g. `{width: 1080, height: 1920, fps: 60}` for vertical 60 fps). Layout, timing and
  audio sync adapt automatically.
- **Sample video length:** edit `SHOWCASE_TIMING` (seconds per scene and transition).
  The `Showcase` duration is computed from it (`showcaseDurationInFrames`).
- **One-off render override, no code change:**
  `npx remotion render Showcase out/vertical.mp4 --width=1080 --height=1920`.
  Avoid `--fps` overrides for `Showcase`. The frame count is derived from
  `VIDEO.fps`, so change fps in `video.ts` instead.

## How to create a new video

1. `npm run new -- MyVideo --seconds=8`. This creates `src/compositions/MyVideo.tsx`
   and registers `<Composition id="MyVideo">` in `src/Root.tsx`, above the
   `@new-compositions` marker (keep that marker).
2. `npm run dev` and open `MyVideo` in Studio. Keep Studio open while editing.
3. Build scenes from `src/components/`. For multiple scenes, follow the pattern in
   `compositions/Showcase.tsx`:
   - one component per scene in `src/scenes/` (full-frame `AbsoluteFill`),
   - chain them with `<TransitionSeries>`, with `durationInFrames` computed from
     seconds × fps,
   - register each scene as its own composition inside `<Folder name="Scenes">` so it
     can be previewed on its own timeline (connected composition).
4. Total duration with transitions = sum(scenes) − sum(transitions). Derive it in
   code and do not hand-compute it.

### Scene template

```tsx
import type React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {AnimatedTitle} from '../components/AnimatedTitle';
import {Background} from '../components/Background';
import {COLORS, FONTS} from '../config/theme';
import {CLAMP, EASE} from '../lib/animation';
import {useScale} from '../lib/layout';

export const MyScene: React.FC = () => {
  const frame = useCurrentFrame(); // 0 = start of this scene
  const {fps} = useVideoConfig();
  const scale = useScale();

  return (
    <AbsoluteFill style={{fontFamily: FONTS.body}}>
      <Background />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <AnimatedTitle
          name="Title"
          from={0.2 * fps}
          premountFor={fps}
          fontSize={120}
          color={COLORS.text}
          highlightWord="faster"
          highlightColor={COLORS.secondary}
          staggerSeconds={0.08}
          style={{position: 'relative'}}
        >
          Ship videos faster
        </AnimatedTitle>
        <div
          style={{
            fontSize: 44 * scale,
            color: COLORS.textMuted,
            opacity: interpolate(frame, [1 * fps, 1.5 * fps], [0, 1], CLAMP),
            translate: interpolate(frame, [1 * fps, 1.8 * fps], ['0px 24px', '0px 0px'], {
              ...CLAMP,
              easing: EASE.outExpo,
            }),
          }}
        >
          Supporting line
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

## Animating typography

- Headlines: `<AnimatedTitle>` (word stagger, mask rise, blur-in, highlight word).
- Per-letter effects: split the string into characters and offset each one by
  `i * 0.03 * fps`. Wrap each in `display: 'inline-block'`.
- Count-ups: `Math.round(value * progress)` with `fontVariantNumeric: 'tabular-nums'`
  so digits don't jitter (see `StatRing`).
- Use `textWrap: 'balance'` for multi-line titles. For fitting text to a box, see the
  `remotion-markup` skill → `measuring-text.md` (`@remotion/layout-utils`).
- Easing: `EASE.outExpo` for entrances, `EASE.inCubic` for exits,
  `Easing.spring({damping: 200})` for soft physical motion, and
  `spring({frame, fps, config})` (`springIn()`) for bouncy pops.

## Animating graphics

- Shapes: `@remotion/shapes` (`Circle`, `Rect`, `Triangle`, `Star`, `Pie`, `Polygon`, …).
  Pass `showInTimeline={false}` for decorative shapes inside a component.
- Line drawing: SVG `<path pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p}>`
  (see `DrawUnderline`).
- Progress arcs: `<Pie closePath={false} progress={p} rotation={-Math.PI / 2}>` with a stroke.
- Scene transitions: `@remotion/transitions` (`fade`, `slide`, `wipe`, `flip`,
  `clockWipe`, …) with `linearTiming({durationInFrames, easing})` or `springTiming`.

## Synchronizing audio

- `<Audio src={staticFile('audio/music-bed.mp3')} volume={...} />` from `@remotion/media`.
  Volume can be keyframed with `interpolate(frame, ...)`.
- Place sound effects with `from={frameOfEvent - lead}`. Compute `frameOfEvent` from
  the **same timing values** that drive the visuals (see `cut1/cut2/cut3` in
  `Showcase.tsx`), so changing durations keeps audio in sync. A whoosh needs ~0.15 s of lead.
- Trim with `trimBefore` / `durationInFrames`, loop with `loop`, speed with `playbackRate`.
- Duration from an audio file: `remotion-multimedia` skill → `get-audio-duration.md`,
  used inside `calculateMetadata`.
- Captions / voiceover: `remotion-captions` skill, `remotion-markup` → `voiceover.md`.

## Interactive components (Studio editing)

Reusable components are built with `Interactive.withSchema({wrapInSequence: true})`
so their props are editable in Studio and they accept `from`, `durationInFrames`,
`name`, `premountFor` directly (no extra `<Sequence>`). Rules:

- The inner component must accept `style` and spread it onto its `Interactive.Div` root.
- Keep the component's own entrance animation on an **inner** element, so a
  `style.translate/scale/opacity` set in Studio doesn't override it.
- `number` schema fields need `hiddenFromList: false` in this Remotion version.
- Register the exported component itself (not the `*Inner`) as a composition to
  preview it in isolation (`Elements` folder in `Root.tsx`).

## Verify before you finish

1. `npm run lint` must pass (ESLint with the Remotion rules + `tsc`).
2. Render a few frames and look at them: `npx remotion render <Id> out/frames --frames=...`.
3. Render the MP4 and check it: `ffprobe out/<id>.mp4` (expect h264 + aac, correct size/fps/frames).

## Environment notes

- Rendering downloads Chrome Headless Shell on first use. If that download is blocked
  (offline/CI), pass an existing Chromium with `--browser-executable=/path/to/chrome`.
- Fonts and audio are local, so renders need no network access after `npm install`.
- `out/` is git-ignored. Don't commit renders.

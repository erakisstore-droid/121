# Remotion Motion Graphics

Programmatic motion-graphics videos with [Remotion](https://www.remotion.dev/docs)
**4.0.534**, React 19 and TypeScript. The project is set up for AI coding agents:
it includes the official Remotion Agent Skills and project rules in [`AGENTS.md`](AGENTS.md).

The sample composition **`Showcase`** is 1920×1080, 30 fps and 13.7 s long. It has four
scenes (animated typography, `@remotion/shapes` graphics, glass cards, count-up rings)
joined by slide, wipe and fade transitions, with a music bed and sound effects
synced to the cuts.

## Requirements

- Node.js (tested with 22, see `.nvmrc`) and npm
- On first render Remotion downloads Chrome Headless Shell automatically.
  Linux needs [a few system libraries](https://www.remotion.dev/docs/miscellaneous/linux-dependencies).

## Quick start

```bash
npm install            # install dependencies
npm run dev            # open Remotion Studio at http://localhost:3000
npm run render         # export out/showcase.mp4
```

## Commands

| What | Command |
| --- | --- |
| Preview in Remotion Studio | `npm run dev` |
| Create a new composition | `npm run new -- MyVideo --seconds=8` |
| Render the sample to MP4 | `npm run render` |
| Render any composition | `npx remotion render <CompositionId> out/<name>.mp4` |
| Render a still image | `npx remotion still Showcase out/frame.png --frame=60` |
| Render selected frames | `npm run frames` |
| List compositions | `npx remotion compositions` |
| Lint + typecheck | `npm run lint` |
| Upgrade Remotion | `npm run upgrade` |

Useful render flags: `--codec=h264|h265|prores|vp9|gif`, `--crf=18` (quality),
`--width=1080 --height=1920` (override size), `--frames=0-89` (range), `--muted`.
Full list: <https://www.remotion.dev/docs/cli/render>.

## Change format and duration

All format settings live in [`src/config/video.ts`](src/config/video.ts):

```ts
export const VIDEO = {width: 1920, height: 1080, fps: 30};
export const SHOWCASE_TIMING = {intro: 3.5, features: 4.5, stats: 4, outro: 3.5, transitionLength: 0.6};
```

Timing is written in seconds and layouts scale with the canvas, so changing
these values (e.g. to 1080×1920 at 60 fps) keeps animations, transitions and audio sync intact.

## Structure

```
src/config      video format, timing, colors, fonts
src/lib         animation + layout helpers
src/components  reusable animated elements
src/scenes      full-frame scenes
src/compositions  videos assembled from scenes
public/         audio, fonts, images (use staticFile())
```

See [`AGENTS.md`](AGENTS.md) for conventions on scenes, typography, graphics, audio
sync, previewing and rendering.

## Assets and licenses

- `public/fonts`: Inter and Space Grotesk, SIL Open Font License 1.1 (license files included).
- `public/audio`: original tones and noise generated with FFmpeg for this project.
- Remotion is free for individuals and teams of up to 3. Larger companies need a
  [company license](https://www.remotion.pro/license).

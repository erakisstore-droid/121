import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import type React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SHOWCASE_TIMING, sec } from "../config/video";
import { EASE } from "../lib/animation";
import { FeaturesScene } from "../scenes/FeaturesScene";
import { IntroScene } from "../scenes/IntroScene";
import { OutroScene } from "../scenes/OutroScene";
import { StatsScene } from "../scenes/StatsScene";

/**
 * The sample video: four scenes joined by slide, wipe and fade transitions,
 * with a music bed and sound effects synchronized to the cuts.
 *
 * Scene and transition lengths come from SHOWCASE_TIMING (seconds) in
 * src/config/video.ts. The composition duration in Root.tsx is derived from
 * the same values, so the two can never drift apart.
 */
export const Showcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const intro = sec(SHOWCASE_TIMING.intro, fps);
  const features = sec(SHOWCASE_TIMING.features, fps);
  const stats = sec(SHOWCASE_TIMING.stats, fps);
  const outro = sec(SHOWCASE_TIMING.outro, fps);
  const transition = sec(SHOWCASE_TIMING.transitionLength, fps);

  // Absolute frame at which each transition starts. Transitions overlap the
  // two scenes they join, so every transition shortens the timeline.
  const cut1 = intro - transition;
  const cut2 = cut1 + features - transition;
  const cut3 = cut2 + stats - transition;
  // The whoosh peaks ~0.3s in, so start it slightly before each cut.
  const whooshLead = Math.round(0.15 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <TransitionSeries name="Scenes">
        <TransitionSeries.Sequence
          name="Intro"
          durationInFrames={intro}
          premountFor={fps}
        >
          <IntroScene
            kicker="Remotion · Motion graphics"
            title="Motion graphics, written in code"
            highlightWord="code"
            subtitle="React components in. Polished MP4 out."
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({
            durationInFrames: transition,
            easing: EASE.inOutCubic,
          })}
        />
        <TransitionSeries.Sequence
          name="Features"
          durationInFrames={features}
          premountFor={fps}
        >
          <FeaturesScene
            kicker="Reusable building blocks"
            title="Compose. Animate. Render."
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom-left" })}
          timing={linearTiming({
            durationInFrames: transition,
            easing: EASE.inOutCubic,
          })}
        />
        <TransitionSeries.Sequence
          name="Stats"
          durationInFrames={stats}
          premountFor={fps}
        >
          <StatsScene title="Every frame is a React render" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({
            durationInFrames: transition,
            easing: EASE.inOutCubic,
          })}
        />
        <TransitionSeries.Sequence
          name="Outro"
          durationInFrames={outro}
          premountFor={fps}
        >
          <OutroScene title="Now make it yours." command="npm run dev" />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Fade to black over the final half second. */}
      <AbsoluteFill
        style={{
          backgroundColor: "black",
          pointerEvents: "none",
          opacity: interpolate(
            frame,
            [durationInFrames - 0.5 * fps, durationInFrames - 1],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      />

      {/* Music bed: fades in, then out with the picture. */}
      <Audio
        name="Music bed"
        src={staticFile("audio/music-bed.mp3")}
        volume={interpolate(
          frame,
          [0, 1 * fps, durationInFrames - 1.5 * fps, durationInFrames - 1],
          [0, 0.55, 0.55, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.65, 0, 0.35, 1),
          },
        )}
      />
      {/* Sound effects locked to the transitions and key beats. */}
      <Audio
        name="Whoosh 1"
        from={cut1 - whooshLead}
        premountFor={fps}
        src={staticFile("audio/whoosh.wav")}
        volume={0.7}
      />
      <Audio
        name="Whoosh 2"
        from={cut2 - whooshLead}
        premountFor={fps}
        src={staticFile("audio/whoosh.wav")}
        volume={0.7}
      />
      <Audio
        name="Whoosh 3"
        from={cut3 - whooshLead}
        premountFor={fps}
        src={staticFile("audio/whoosh.wav")}
        volume={0.5}
      />
      <Audio
        name="Pop: title"
        from={Math.round(0.3 * fps)}
        premountFor={fps}
        src={staticFile("audio/pop.wav")}
        volume={0.6}
      />
      <Audio
        name="Pop: logo"
        from={cut3 + Math.round(0.9 * fps)}
        premountFor={fps}
        src={staticFile("audio/pop.wav")}
        volume={0.6}
      />
    </AbsoluteFill>
  );
};

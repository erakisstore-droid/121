import { Composition, Folder } from "remotion";
import { AnimatedTitle } from "./components/AnimatedTitle";
import { FeatureCard } from "./components/FeatureCard";
import { StatRing } from "./components/StatRing";
import { Showcase } from "./compositions/Showcase";
import { COLORS } from "./config/theme";
import {
  SHOWCASE_TIMING,
  VIDEO,
  sec,
  showcaseDurationInFrames,
} from "./config/video";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { IntroScene } from "./scenes/IntroScene";
import { OutroScene } from "./scenes/OutroScene";
import { StatsScene } from "./scenes/StatsScene";
import { MSSpasticityFootDrop } from "./ms/MSSpasticityFootDrop";
import { MS_VIDEO, totalFrames } from "./ms/config";
import { CholesterolEarlyScreening } from "./chol/CholesterolEarlyScreening";
import { CH_VIDEO, totalFrames as cholFrames } from "./chol/config";

/**
 * Registers every composition shown in Remotion Studio.
 *
 * Format (width, height, fps) comes from VIDEO in src/config/video.ts.
 * Durations are authored in seconds and converted with `sec()`.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main sample video: render with `npm run render` */}
      <Composition
        id="Showcase"
        component={Showcase}
        width={VIDEO.width}
        height={VIDEO.height}
        fps={VIDEO.fps}
        durationInFrames={showcaseDurationInFrames(VIDEO.fps)}
      />

      {/* Each scene as a connected composition, previewable on its own timeline. */}
      <Folder name="Scenes">
        <Composition
          id="Intro"
          component={IntroScene}
          width={VIDEO.width}
          height={VIDEO.height}
          fps={VIDEO.fps}
          durationInFrames={sec(SHOWCASE_TIMING.intro, VIDEO.fps)}
          defaultProps={{
            kicker: "Remotion · Motion graphics",
            title: "Motion graphics, written in code",
            highlightWord: "code",
            subtitle: "React components in. Polished MP4 out.",
          }}
        />
        <Composition
          id="Features"
          component={FeaturesScene}
          width={VIDEO.width}
          height={VIDEO.height}
          fps={VIDEO.fps}
          durationInFrames={sec(SHOWCASE_TIMING.features, VIDEO.fps)}
          defaultProps={{
            kicker: "Reusable building blocks",
            title: "Compose. Animate. Render.",
          }}
        />
        <Composition
          id="Stats"
          component={StatsScene}
          width={VIDEO.width}
          height={VIDEO.height}
          fps={VIDEO.fps}
          durationInFrames={sec(SHOWCASE_TIMING.stats, VIDEO.fps)}
          defaultProps={{ title: "Every frame is a React render" }}
        />
        <Composition
          id="Outro"
          component={OutroScene}
          width={VIDEO.width}
          height={VIDEO.height}
          fps={VIDEO.fps}
          durationInFrames={sec(SHOWCASE_TIMING.outro, VIDEO.fps)}
          defaultProps={{ title: "Now make it yours.", command: "npm run dev" }}
        />
      </Folder>

      {/* Reusable elements, for designing them in isolation. */}
      <Folder name="Elements">
        <Composition
          id="AnimatedTitle"
          component={AnimatedTitle}
          width={VIDEO.width}
          height={VIDEO.height}
          fps={VIDEO.fps}
          durationInFrames={sec(2, VIDEO.fps)}
          defaultProps={{
            children: "Animated typography",
            fontSize: 120,
            color: COLORS.text,
            highlightWord: "typography",
            highlightColor: COLORS.secondary,
            staggerSeconds: 0.1,
            style: {
              position: "absolute",
              inset: 0,
              alignContent: "center",
              backgroundColor: COLORS.background,
            },
          }}
        />
        <Composition
          id="FeatureCard"
          component={FeatureCard}
          width={VIDEO.width}
          height={VIDEO.height}
          fps={VIDEO.fps}
          durationInFrames={sec(2, VIDEO.fps)}
          defaultProps={{
            title: "Animate",
            description: "Every property is a function of the current frame.",
            accentColor: COLORS.highlight,
            icon: "triangle" as const,
            style: {
              position: "absolute",
              inset: 0,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: COLORS.background,
            },
          }}
        />
        <Composition
          id="StatRing"
          component={StatRing}
          width={VIDEO.width}
          height={VIDEO.height}
          fps={VIDEO.fps}
          durationInFrames={sec(2, VIDEO.fps)}
          defaultProps={{
            value: 30,
            suffix: "fps",
            label: "Frame rate",
            fill: 0.5,
            accentColor: COLORS.secondary,
            style: {
              position: "absolute",
              inset: 0,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: COLORS.background,
            },
          }}
        />
      </Folder>

      {/* Medical explainer: 1080×1920, 60 fps, 70 s. Timing lives in src/ms/config.ts */}
      <Composition
        id="MSSpasticityFootDrop"
        component={MSSpasticityFootDrop}
        width={MS_VIDEO.width}
        height={MS_VIDEO.height}
        fps={MS_VIDEO.fps}
        durationInFrames={totalFrames(MS_VIDEO.fps)}
      />

      {/* Medical explainer: 1080×1920, 60 fps, 63 s. Timing lives in src/chol/config.ts */}
      <Composition
        id="CholesterolEarlyScreening"
        component={CholesterolEarlyScreening}
        width={CH_VIDEO.width}
        height={CH_VIDEO.height}
        fps={CH_VIDEO.fps}
        durationInFrames={cholFrames(CH_VIDEO.fps)}
      />

      {/* @new-compositions: `npm run new -- <Name>` inserts registrations above this line. */}
    </>
  );
};

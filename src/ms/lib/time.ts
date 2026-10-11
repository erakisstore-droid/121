import {useCurrentFrame, useVideoConfig} from 'remotion';

/** Absolute timeline seconds inside a <Sequence from={fromFrame}>. */
export const useAbsT = (fromFrame = 0) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (frame + fromFrame) / fps;
};

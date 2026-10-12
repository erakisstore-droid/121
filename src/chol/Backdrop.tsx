import type React from 'react';
import {Img, staticFile} from 'remotion';

export const Grain: React.FC = () => (
  <Img src={staticFile('ms/grain.png')} style={{position: 'absolute', inset: 0, width: 1080, height: 1920, opacity: 0.035, mixBlendMode: 'overlay'}} />
);

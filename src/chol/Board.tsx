import type React from 'react';
import {PAGES, PAL, type PageKey} from './config';

/** World-space board backdrop: subtle darker-orange dot grid and soft shapes. */
export const BoardBackdrop: React.FC = () => (
  <svg width={5600} height={7200} style={{position: 'absolute', left: -1800, top: -1600, overflow: 'visible'}}>
    <defs>
      <pattern id="board-dots" width={90} height={90} patternUnits="userSpaceOnUse">
        <path d="M 90 0 L 0 0 0 90" fill="none" stroke={PAL.orangeDeep} strokeWidth={2} />
      </pattern>
    </defs>
    <rect x={0} y={0} width={5600} height={7200} fill="url(#board-dots)" opacity={0.6} />
    <circle cx={1800 - 80} cy={1600 + 430} r={360} fill={PAL.orangeDeep} opacity={0.5} />
    <circle cx={1800 + 1150} cy={1600 + 1200} r={420} fill={PAL.orangeDeep} opacity={0.45} />
    <rect x={1800 + 1500} y={1600 + 2500} width={900} height={520} rx={260} fill={PAL.orangeDeep} opacity={0.4} transform={`rotate(-10 ${1800 + 1900} ${1600 + 2760})`} />
    <circle cx={1800 + 200} cy={1600 + 3900} r={380} fill={PAL.orangeDeep} opacity={0.4} />
  </svg>
);

/** A 1080×1920 design area placed on the board. Children use local page coordinates. */
export const Page: React.FC<{k: PageKey; children: React.ReactNode}> = ({k, children}) => (
  <div style={{position: 'absolute', left: PAGES[k].x, top: PAGES[k].y, width: 1080, height: 1920, overflow: 'visible'}}>{children}</div>
);

/** Offset between two pages (add to coordinates of `from` to express them in `to`). */
export const pageDelta = (from: PageKey, to: PageKey) => ({x: PAGES[from].x - PAGES[to].x, y: PAGES[from].y - PAGES[to].y});

/**
 * MSSpasticityFootDrop: format, palette, layout and the shared sentence timeline.
 * Edit BEATS (seconds) to re-sync with the separately recorded narration.
 * Every animation is expressed relative to these beat boundaries.
 */
export const MS_VIDEO = {width: 1080, height: 1920, fps: 60} as const;

export const PAL = {
  orange: '#FF7A00',
  orangeDeep: '#F57C00',
  charcoal: '#252525',
  offWhite: '#F7F5F0',
  beige: '#E9C7A6',
  line: '#D9D9D9',
} as const;

/** Essential content must stay inside this rectangle. */
export const SAFE = {x0: 90, x1: 900, y0: 240, y1: 1560, cx: 495} as const;

export const FONT_AR = '"Cairo", sans-serif';

export type Beat = {readonly id: number; readonly start: number; readonly end: number};

/** 19 spoken sentences / headings. Seconds. Must be contiguous. */
export const BEATS: readonly Beat[] = [
  {id: 1, start: 0, end: 3},
  {id: 2, start: 3, end: 6},
  {id: 3, start: 6, end: 9},
  {id: 4, start: 9, end: 13},
  {id: 5, start: 13, end: 16},
  {id: 6, start: 16, end: 20},
  {id: 7, start: 20, end: 22},
  {id: 8, start: 22, end: 24},
  {id: 9, start: 24, end: 28},
  {id: 10, start: 28, end: 30},
  {id: 11, start: 30, end: 36},
  {id: 12, start: 36, end: 38},
  {id: 13, start: 38, end: 43},
  {id: 14, start: 43, end: 50},
  {id: 15, start: 50, end: 55},
  {id: 16, start: 55, end: 59},
  {id: 17, start: 59, end: 63},
  {id: 18, start: 63, end: 67},
  {id: 19, start: 67, end: 70},
];

export const TOTAL_SECONDS = BEATS[BEATS.length - 1].end;
export const totalFrames = (fps: number) => Math.round(TOTAL_SECONDS * fps);

/** Absolute seconds at fraction `f` (0–1) of beat `id`. */
export const at = (id: number, f = 0): number => {
  const b = BEATS[id - 1];
  return b.start + (b.end - b.start) * f;
};
export const beatStart = (id: number) => BEATS[id - 1].start;
export const beatEnd = (id: number) => BEATS[id - 1].end;

/** On-screen key phrases per beat. `from` = fraction of the beat where a line takes over. */
export type CaptionLine = {readonly text: string; readonly sub?: string; readonly from?: number; readonly dir?: 'rtl' | 'ltr'};
export const CAPTIONS: Record<number, readonly CaptionLine[]> = {
  1: [{text: 'رجلك بتخونك؟'}],
  2: [{text: 'شدّ؟ ولا احتكاك بالأرض؟'}],
  3: [{text: 'أسباب مختلفة'}],
  4: [{text: 'اختياراتكم في التصويت'}],
  6: [{text: 'إشارات تتحكم في الحركة'}],
  8: [{text: 'التشنج العضلي', sub: 'Spasticity'}],
  9: [{text: 'تيبّس / انقباضات'}],
  10: [{text: 'سقوط القدم', sub: 'Foot Drop'}],
  11: [{text: 'صعوبة رفع مقدمة القدم'}],
  12: [{text: 'إيه اللي ممكن يساعد؟'}],
  13: [{text: 'علاج طبيعي حسب حالتك'}],
  14: [{text: 'دعامة AFO'}, {text: 'تحفيز وظيفي FES', from: 0.5}],
  15: [{text: 'Baclofen\u200F — بتقييم الطبيب'}],
  16: [{text: 'عوامل ممكن تزود التشنج'}],
  17: [{text: 'Magnesium glycinate', sub: 'ناقش احتياجك مع طبيبك', dir: 'ltr'}],
  18: [{text: 'مش بالضرورة تطوّر المرض'}, {text: 'الجديد أو الزيادة: بلّغ طبيبك', from: 0.5}],
};

/** Original attached assets (unaltered copies). */
export const ASSETS = {
  // A: PMID 30974955 (FES vs AFO for foot drop)
  paperA: {file: 'ms/asset-a-fes-afo-pmid30974955.png', w: 845, h: 673},
  // B: PMID 38140847 (stretching not essential for MS spasticity)
  paperB: {file: 'ms/asset-b-stretching-pmid38140847.png', w: 813, h: 591},
  // C: MS my story Facebook poll
  poll: {file: 'ms/asset-c-ms-my-story-poll.png', w: 745, h: 765},
} as const;

/** Row boxes inside the poll screenshot (image pixels). */
export const POLL_ROWS = {
  spasticity: {x: 18, y: 341, w: 701, h: 61}, // التشنج العضلي 13%
  footDrop: {x: 18, y: 412, w: 701, h: 61}, // سقوط القدم 15%
} as const;

/** Shared card rectangles reused by several beats. */
export const LAYOUT = {
  topCard: {x: 90, y: 470, w: 810, h: 380},
  bottomCard: {x: 90, y: 1170, w: 810, h: 380},
  middleSlot: {x: 90, y: 880, w: 810, h: 260},
} as const;

/**
 * Optional subtle sound effects, kept separate from visuals so they can be
 * retimed or disabled (set SFX_ENABLED = false). Times are [beat, fraction].
 */
export const SFX_ENABLED = true;
export const SFX_CUES: readonly {beat: number; f: number; kind: 'whoosh' | 'click'; volume: number}[] = [
  {beat: 2, f: 0, kind: 'whoosh', volume: 0.18},
  {beat: 4, f: 0, kind: 'whoosh', volume: 0.18},
  {beat: 4, f: 0.5, kind: 'click', volume: 0.14},
  {beat: 4, f: 0.75, kind: 'click', volume: 0.14},
  {beat: 5, f: 0.08, kind: 'whoosh', volume: 0.15},
  {beat: 6, f: 0, kind: 'whoosh', volume: 0.15},
  {beat: 8, f: 0, kind: 'whoosh', volume: 0.15},
  {beat: 10, f: 0, kind: 'whoosh', volume: 0.15},
  {beat: 12, f: 0.4, kind: 'click', volume: 0.12},
  {beat: 12, f: 0.52, kind: 'click', volume: 0.12},
  {beat: 12, f: 0.64, kind: 'click', volume: 0.12},
  {beat: 13, f: 0, kind: 'whoosh', volume: 0.15},
  {beat: 14, f: 0, kind: 'whoosh', volume: 0.15},
  {beat: 15, f: 0, kind: 'whoosh', volume: 0.15},
  {beat: 16, f: 0, kind: 'whoosh', volume: 0.15},
  {beat: 17, f: 0, kind: 'whoosh', volume: 0.15},
  {beat: 18, f: 0, kind: 'whoosh', volume: 0.15},
  {beat: 19, f: 0, kind: 'whoosh', volume: 0.15},
];

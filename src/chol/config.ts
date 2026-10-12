/**
 * CholesterolEarlyScreening: format, palette and the shared sentence timeline.
 * Retime BEATS (seconds) to match the separately recorded narration; every
 * animation is expressed as a fraction of its beat via at(beat, fraction).
 */
export const CH_VIDEO = {width: 1080, height: 1920, fps: 60} as const;

export const PAL = {
  orange: '#FF7A00',
  orangeDeep: '#F57C00',
  charcoal: '#252525',
  offWhite: '#F7F5F0',
  beige: '#E9C7A6',
  line: '#D9D9D9',
} as const;

export type Beat = {readonly id: number; readonly start: number; readonly end: number};
export const BEATS: readonly Beat[] = [
  {id: 1, start: 0, end: 3},
  {id: 2, start: 3, end: 6},
  {id: 3, start: 6, end: 10},
  {id: 4, start: 10, end: 17},
  {id: 5, start: 17, end: 22},
  {id: 6, start: 22, end: 25},
  {id: 7, start: 25, end: 30},
  {id: 8, start: 30, end: 33},
  {id: 9, start: 33, end: 35},
  {id: 10, start: 35, end: 40},
  {id: 11, start: 40, end: 45},
  {id: 12, start: 45, end: 49},
  {id: 13, start: 49, end: 53},
  {id: 14, start: 53, end: 58},
  {id: 15, start: 58, end: 60},
  {id: 16, start: 60, end: 63},
];
export const TOTAL_SECONDS = BEATS[BEATS.length - 1].end;
export const totalFrames = (fps: number) => Math.round(TOTAL_SECONDS * fps);
export const at = (id: number, f = 0) => {
  const b = BEATS[id - 1];
  return b.start + (b.end - b.start) * f;
};

/** Key phrases (not narration subtitles). `from` = fraction of the beat; `|` forces a line break. */
export type CaptionLine = {readonly text: string; readonly sub?: string; readonly from?: number};
export const CAPTIONS: Record<number, readonly CaptionLine[]> = {
  1: [{text: 'التحليل ده ممكن|ينقذ حياتك!'}],
  2: [{text: 'عدّيت العشرين؟'}],
  3: [{text: 'مرتفع… من غير أعراض'}],
  4: [{text: 'LDL'}, {text: 'لويحات داخل جدار الشريان', from: 0.36}],
  5: [{text: 'خطر أعلى للقلب والمخ'}],
  6: [{text: 'ممكن تبدأ بدري'}],
  7: [{text: 'الفحص من سن 19'}],
  8: [{text: 'اعرف مستواك بدري'}],
  9: [{text: 'تعمل إيه؟'}],
  10: [{text: 'تحليل دهون الدم', sub: 'Lipid Profile'}],
  11: [{text: 'ارتفاع شديد —|تقييم وعلاج طبي'}],
  12: [{text: 'ممكن يكون وراثي'}],
  13: [{text: 'غالبًا كل 5 سنين', sub: 'أقرب حسب الخطورة'}],
  14: [{text: 'اكتشاف بدري…|حماية على المدى الطويل'}],
};

/** Original attachments (byte-identical copies; only their containers move). */
export const SOURCES = {
  // A: AHA Professional Heart Daily, "Top Things to Know", updated March 13, 2026
  a: {file: 'chol/source-a-aha-top-things-dyslipidemia-2026.png', w: 1435, h: 755},
  // B: JACC header of the same 2026 multisociety dyslipidemia guideline
  b: {file: 'chol/source-b-jacc-dyslipidemia-guideline-2026.png', w: 1180, h: 386},
} as const;

/**
 * Infinite-canvas board. Each "page" is a 1080×1920 design area placed on one
 * large board; the camera travels between them. World = page offset + local.
 */
export const PAGES = {
  p1: {x: 0, y: 0}, // tube, artery, prevention, comment bubble
  p3: {x: 1250, y: 0}, // source A dashboard, 19+, tube
  p4: {x: 1250, y: 2100}, // lab report, threshold, source B
  p5: {x: 0, y: 2100}, // DNA, calendar
} as const;
export type PageKey = keyof typeof PAGES;
export const pageCenter = (k: PageKey) => ({x: PAGES[k].x + 540, y: PAGES[k].y + 960});

/** Camera keyframes in world coordinates: [time (s), centre x, centre y, zoom]. */
export type CamKey = readonly [number, number, number, number];
const c1 = pageCenter('p1');
const c3 = pageCenter('p3');
const c4 = pageCenter('p4');
const c5 = pageCenter('p5');
export const CAMERA: readonly CamKey[] = [
  [0, c1.x, c1.y + 20, 1.02],
  [at(1, 1), c1.x, c1.y, 1],
  [at(3, 1), c1.x, c1.y, 1],
  // beat 4: push in on the wall while particles are retained, then release
  [at(4, 0.28), c1.x, c1.y, 1],
  [at(4, 0.45), 470, 880, 1.65],
  [at(4, 0.72), 470, 880, 1.65],
  [at(4, 0.92), c1.x, c1.y, 1],
  [at(5, 1), c1.x, c1.y, 1],
  // beat 6: follow the timeline toward younger ages (to the right)
  [at(6, 0.15), c1.x + 60, c1.y + 60, 0.95],
  [at(6, 1), 1450, 1150, 0.8],
  // beat 7: reveal the wider dashboard, then settle on source A
  [at(7, 0.12), 1200, 1350, 0.5],
  [at(7, 0.3), c3.x, c3.y, 1],
  [at(8, 1), c3.x, c3.y, 1],
  // beat 9: travel down to the report area
  [at(9, 0.25), c3.x, (c3.y + c4.y) / 2, 0.72],
  [at(9, 0.6), c4.x, c4.y, 1],
  [at(11, 1), c4.x, c4.y, 1],
  // beat 12: follow the LDL line left to the DNA area
  [at(12, 0.12), (c4.x + c5.x) / 2, c4.y, 0.7],
  [at(12, 0.3), c5.x, c5.y, 1],
  [at(13, 1), c5.x, c5.y, 1],
  // beat 14: the calendar path leads back up to the tube and artery
  [at(14, 0.12), c5.x - 40, (c5.y + c1.y) / 2, 0.66],
  [at(14, 0.28), c1.x, c1.y, 1],
  [at(15, 1), c1.x, c1.y, 1],
  // beat 16: resolve to a calm, balanced view of the connected board
  [at(16, 0.35), c1.x + 10, c1.y + 40, 0.92],
  [TOTAL_SECONDS, c1.x + 10, c1.y + 40, 0.92],
];

/** Optional subtle SFX (separate layer; set SFX_ENABLED = false to mute). */
export const SFX_ENABLED = true;
export const SFX_CUES: readonly {beat: number; f: number; kind: 'whoosh' | 'click'; volume: number}[] = [
  {beat: 1, f: 0.05, kind: 'click', volume: 0.12},
  {beat: 3, f: 0.05, kind: 'whoosh', volume: 0.14},
  {beat: 4, f: 0.3, kind: 'whoosh', volume: 0.12},
  {beat: 6, f: 0.1, kind: 'whoosh', volume: 0.14},
  {beat: 7, f: 0.05, kind: 'whoosh', volume: 0.14},
  {beat: 7, f: 0.2, kind: 'click', volume: 0.12},
  {beat: 9, f: 0.05, kind: 'whoosh', volume: 0.14},
  {beat: 10, f: 0.1, kind: 'click', volume: 0.1},
  {beat: 10, f: 0.24, kind: 'click', volume: 0.1},
  {beat: 10, f: 0.38, kind: 'click', volume: 0.1},
  {beat: 10, f: 0.52, kind: 'click', volume: 0.1},
  {beat: 11, f: 0.12, kind: 'click', volume: 0.12},
  {beat: 12, f: 0.05, kind: 'whoosh', volume: 0.14},
  {beat: 13, f: 0.25, kind: 'click', volume: 0.08},
  {beat: 13, f: 0.35, kind: 'click', volume: 0.08},
  {beat: 13, f: 0.45, kind: 'click', volume: 0.08},
  {beat: 13, f: 0.55, kind: 'click', volume: 0.08},
  {beat: 14, f: 0.05, kind: 'whoosh', volume: 0.14},
  {beat: 15, f: 0.05, kind: 'click', volume: 0.12},
];

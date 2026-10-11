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

/** Key phrases (not narration subtitles). `from` = fraction of the beat. */
export type CaptionLine = {readonly text: string; readonly sub?: string; readonly from?: number};
export const CAPTIONS: Record<number, readonly CaptionLine[]> = {
  1: [{text: 'تحليل بسيط… فرق كبير'}],
  2: [{text: 'عدّيت العشرين؟'}],
  3: [{text: 'مرتفع… من غير أعراض'}],
  4: [{text: 'LDL'}, {text: 'لويحات داخل جدار الشريان', from: 0.36}],
  5: [{text: 'خطر أعلى للقلب والمخ'}],
  6: [{text: 'ممكن تبدأ بدري'}],
  7: [{text: 'الفحص من سن 19'}],
  8: [{text: 'اعرف مستواك بدري'}],
  9: [{text: 'تعمل إيه؟'}],
  10: [{text: 'Lipid Profile', sub: 'تحليل دهون الدم'}],
  11: [{text: 'ارتفاع شديد — تقييم وعلاج طبي'}],
  12: [{text: 'ممكن يكون وراثي'}],
  13: [{text: 'غالبًا كل 5 سنين', sub: 'أقرب حسب الخطورة'}],
  14: [{text: 'اكتشاف بدري… حماية على المدى الطويل'}],
};

/** Original attachments (byte-identical copies; only their containers move). */
export const SOURCES = {
  // A: AHA Professional Heart Daily, "Top Things to Know", updated March 13, 2026
  a: {file: 'chol/source-a-aha-top-things-dyslipidemia-2026.png', w: 1435, h: 755},
  // B: JACC header of the same 2026 multisociety dyslipidemia guideline
  b: {file: 'chol/source-b-jacc-dyslipidemia-guideline-2026.png', w: 1180, h: 386},
} as const;

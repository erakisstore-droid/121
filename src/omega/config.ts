/**
 * Omega3MS: one source of truth for format, palette, timeline, board layout,
 * camera, chart data and source-asset roles. Retime BEATS to the narration;
 * all motion uses at(beat, fraction).
 */
export const O_VIDEO = {width: 1080, height: 1920, fps: 60} as const;

export const PAL = {
  orange: '#FF7A00',
  orangeDeep: '#F57C00',
  charcoal: '#252525',
  offWhite: '#F7F5F0',
  beige: '#E9C7A6',
  line: '#D9D9D9',
} as const;

export type Beat = {readonly id: number; readonly start: number; readonly end: number};
const B = (id: number, start: number, end: number): Beat => ({id, start, end});
export const BEATS: readonly Beat[] = [
  B(1, 0, 4), B(2, 4, 6), B(3, 6, 9), B(4, 9, 14), B(5, 14, 22), B(6, 22, 24), B(7, 24, 33),
  B(8, 33, 35), B(9, 35, 47), B(10, 47, 50), B(11, 50, 54), B(12, 54, 58), B(13, 58, 63),
  B(14, 63, 65), B(15, 65, 72), B(16, 72, 75), B(17, 75, 77), B(18, 77, 81), B(19, 81, 84),
  B(20, 84, 87), B(21, 87, 90),
];
export const TOTAL_SECONDS = BEATS[BEATS.length - 1].end;
export const totalFrames = (fps: number) => Math.round(TOTAL_SECONDS * fps);
export const at = (id: number, f = 0) => {
  const b = BEATS[id - 1];
  return b.start + (b.end - b.start) * f;
};

/** Key phrases (not narration). `from` = beat fraction; `|` = line break; `sub` = secondary line. */
export type CaptionLine = {readonly text: string; readonly sub?: string; readonly from?: number};
export const CAPTIONS: Record<number, readonly CaptionLine[]> = {
  1: [{text: 'دهون مهمة|للقلب والمخ'}],
  2: [{text: 'أوميجا 3'}],
  3: [{text: 'مجموعة أحماض دهنية'}],
  4: [{text: 'EPA + DHA'}],
  5: [{text: 'DHA —|أغشية الخلايا العصبية'}, {text: 'تنظيم العمليات|الالتهابية', from: 0.5}],
  6: [{text: 'الأبحاث بتقول إيه؟'}],
  7: [{text: '2024 —|مراجعة تجارب عشوائية'}, {text: 'خفض الدهون الثلاثية', sub: 'تأثيرات على بعض المؤشرات', from: 0.45}],
  8: [{text: 'وفيه نتيجة تانية…'}],
  9: [{text: '2025 —|تحليل تجارب سريرية', sub: 'EPA نقي — ضمن التجارب'}],
  10: [{text: 'وعلاقته بالـMS؟'}],
  11: [{text: 'الجهاز العصبي المركزي'}],
  12: [{text: 'تغذية +|صحة القلب والمخ'}],
  13: [{text: '839 مشاركًا • 5 سنوات', sub: 'دراسة متابعة رصدية'}],
  14: [{text: 'الإرهاق والإعاقة'}],
  15: [{text: 'ارتباط بمسارات أقل|في الإرهاق والإعاقة', sub: 'ارتباط رصدي — لا يثبت السببية'}],
  16: [{text: 'الصحة العامة|تهم الجميع'}],
  17: [{text: 'ناخدها منين؟'}],
  18: [{text: 'أسماك دهنية', sub: 'مكملات حسب الاحتياج'}],
  19: [{text: 'مش بديل|لعلاج الـMS'}],
  20: [{text: 'ضمن أكل متوازن'}],
  21: [{text: 'اقرأ EPA + DHA|لكل جرعة', sub: 'مش رقم زيت السمك لوحده'}],
};

/** Chart values live here only. */
export const DATA = {
  tg: {label: 'اتجاه توضيحي — بدون نسبة محددة'},
  cardio: {year: 2025, rcts: 16, totalN: 127771, hr: 0.79, lo: 0.67, hi: 0.94, axis: [0.5, 1.5] as const, ref: 1, relPct: 21},
  ms: {n: 839, years: 5, year: 2024},
} as const;

/** Original uploads bound to their narrative roles (byte-identical copies). Regions are image pixels. */
export const SOURCES = {
  A_REVIEW_2024: {
    file: 'omega/source-a-review-2024-pmid39403396.webp',
    upload: 'image(20261014-180158).png',
    w: 683,
    h: 795,
    title: {x: 26, y: 16, w: 620, h: 82},
    tg: {x: 252, y: 408, w: 414, h: 28},
    oxidative: {x: 322, y: 564, w: 346, h: 27},
    oxidative2: {x: 26, y: 590, w: 248, h: 27},
    inflammatory: {x: 276, y: 590, w: 384, h: 27},
  },
  B_CARDIO_2025: {
    file: 'omega/source-b-cardio-2025-pmid40974959.png',
    upload: 'image(20261014-180154-1).png',
    w: 847,
    h: 764,
    title: {x: 12, y: 70, w: 820, h: 58},
    total: {x: 448, y: 435, w: 324, h: 22},
    epa: {x: 448, y: 457, w: 324, h: 22},
    row: {x: 430, y: 527, w: 320, h: 16},
  },
  C_MS_2024: {
    file: 'omega/source-c-ms-2024-pmid38636270.webp',
    upload: 'image(20261014-180154).png',
    w: 636,
    h: 665,
    title: {x: 2, y: 6, w: 600, h: 92},
    cohort: {x: 2, y: 350, w: 300, h: 24},
    years: {x: 2, y: 410, w: 380, h: 24},
    result: {x: 2, y: 533, w: 625, h: 52},
  },
} as const;

/** Infinite board: 1080×1920 design pages placed on one canvas. */
export const PAGES = {
  p1: {x: 0, y: 0}, // capsule, omega-3 emblem, fatty-acid family
  p2: {x: 1250, y: 0}, // fish sources
  p3: {x: 2500, y: 0}, // neuronal cell membrane
  p4: {x: 2500, y: 2100}, // inflammatory signalling regulation
  p5: {x: 1250, y: 2100}, // 2024 review
  p6: {x: 0, y: 2100}, // 2025 cardiovascular meta-analysis
  p7: {x: 0, y: 4200}, // brain, spinal cord, MS
  p8: {x: 1250, y: 4200}, // MS cohort
  p9: {x: 2500, y: 4200}, // food plate, supplements, label
} as const;
export type PageKey = keyof typeof PAGES;
export const pc = (k: PageKey) => ({x: PAGES[k].x + 540, y: PAGES[k].y + 960});
const mid = (a: PageKey, b: PageKey) => ({x: (pc(a).x + pc(b).x) / 2, y: (pc(a).y + pc(b).y) / 2});

/** Camera keyframes: [time, centre x, centre y, zoom] in world coordinates. */
export type CamKey = readonly [number, number, number, number];
const K = (t: number, p: {x: number; y: number}, z: number, dx = 0, dy = 0): CamKey => [t, p.x + dx, p.y + dy, z];
export const CAMERA: readonly CamKey[] = [
  K(0, pc('p1'), 1.05, 0, 30),
  K(at(1, 0.4), pc('p1'), 1),
  K(at(3, 0.8), pc('p1'), 1),
  K(at(4, 0.08), mid('p1', 'p2'), 0.78),
  K(at(4, 0.2), pc('p2'), 1),
  K(at(4, 0.92), pc('p2'), 1),
  K(at(5, 0.05), mid('p2', 'p3'), 0.78),
  K(at(5, 0.15), pc('p3'), 1),
  K(at(5, 0.46), pc('p3'), 1),
  K(at(5, 0.56), mid('p3', 'p4'), 0.8),
  K(at(5, 0.64), pc('p4'), 1),
  K(at(5, 1), pc('p4'), 1),
  K(at(6, 0.4), mid('p4', 'p5'), 0.55, -200, -300),
  K(at(6, 1), pc('p5'), 1),
  K(at(7, 1), pc('p5'), 1),
  K(at(8, 0.4), mid('p5', 'p6'), 0.76),
  K(at(8, 1), pc('p6'), 1),
  K(at(9, 1), pc('p6'), 1),
  K(at(10, 0.35), mid('p6', 'p7'), 0.76),
  K(at(10, 0.9), pc('p7'), 1),
  K(at(12, 0.85), pc('p7'), 1),
  K(at(13, 0.08), mid('p7', 'p8'), 0.78),
  K(at(13, 0.2), pc('p8'), 1),
  K(at(16, 1), pc('p8'), 1),
  K(at(17, 0.3), mid('p8', 'p9'), 0.78),
  K(at(17, 0.75), pc('p9'), 1),
  K(at(20, 1), pc('p9'), 1),
  K(at(21, 0.35), pc('p9'), 1.03, 0, 30),
  K(TOTAL_SECONDS, pc('p9'), 1.03, 0, 30),
];

/** Optional subtle SFX (separate layer). */
export const SFX_ENABLED = true;
export const SFX_CUES: readonly {beat: number; f: number; kind: 'whoosh' | 'click'; volume: number}[] = [
  {beat: 1, f: 0.05, kind: 'click', volume: 0.12},
  {beat: 4, f: 0.02, kind: 'whoosh', volume: 0.13},
  {beat: 5, f: 0.02, kind: 'whoosh', volume: 0.13},
  {beat: 5, f: 0.5, kind: 'whoosh', volume: 0.11},
  {beat: 6, f: 0.1, kind: 'whoosh', volume: 0.13},
  {beat: 7, f: 0.35, kind: 'click', volume: 0.1},
  {beat: 8, f: 0.1, kind: 'whoosh', volume: 0.13},
  {beat: 9, f: 0.28, kind: 'click', volume: 0.1},
  {beat: 9, f: 0.55, kind: 'click', volume: 0.1},
  {beat: 10, f: 0.1, kind: 'whoosh', volume: 0.13},
  {beat: 13, f: 0.02, kind: 'whoosh', volume: 0.13},
  {beat: 15, f: 0.45, kind: 'click', volume: 0.1},
  {beat: 17, f: 0.1, kind: 'whoosh', volume: 0.13},
  {beat: 19, f: 0.1, kind: 'click', volume: 0.12},
  {beat: 21, f: 0.1, kind: 'click', volume: 0.12},
];

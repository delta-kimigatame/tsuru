import { COLOR_PALLET } from "../config/pallet";
import {
  PIANOROLL_CONFIG,
  PIANOROLL_VIDEO_HORIZONTAL_ZOOM_STEPS,
  PIANOROLL_VIDEO_ICON_CONFIG,
  PIANOROLL_VIDEO_LAYOUT_CONFIG,
  PIANOROLL_VIDEO_LAYOUTS,
  PIANOROLL_VIDEO_SCROLL_CONFIG,
  PIANOROLL_VIDEO_TEXT_CONFIG,
  PIANOROLL_VIDEO_VERTICAL_ZOOM_STEPS,
} from "../config/pianoroll";
import type { Note } from "../lib/Note";
import { noteNumToTone } from "./Notenum";
import { makeTimeAxis } from "./interp";

export type PianorollVideoLayout = (typeof PIANOROLL_VIDEO_LAYOUTS)[number];
export const VOICE_COLOR_LEGEND_POSITIONS = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
] as const;
export type VoiceColorLegendPosition =
  (typeof VOICE_COLOR_LEGEND_POSITIONS)[number];

export interface PianorollVideoOptions {
  enabled: boolean;
  /** ピアノロール描画の更新FPS（30/15/10/5）。動画自体のFPSとは独立。 */
  pianorollFps?: number;
  /** 現在再生ノート情報オーバーレイを描画するか。デフォルト true */
  renderCurrentNoteInfo?: boolean;
  layout: PianorollVideoLayout;
  notes: Note[];
  notesLeftMs: number[];
  colorTheme: string;
  themeMode: "light" | "dark";
  horizontalZoom: number;
  verticalZoom: number;
  tone: number;
  isMinor: boolean;
  voiceIconImage?: HTMLImageElement | null;
  /** プレビュー用縮小率。固定マージン値をスケールするために使用。デフォルト 1 */
  layoutScale?: number;
  /** 左端の鍵盤を表示するか。デフォルト true */
  showKeyboard?: boolean;
  /** グリッド背景を表示するか。デフォルト true */
  showBackground?: boolean;
  /** voiceColor で色分けするか。デフォルト false */
  voiceColorEnabled?: boolean;
  /** voiceColor ごとの色上書き。未指定キーはデフォルト計算色を使用 */
  voiceColorMap?: Record<string, string>;
  /** voiceColor 凡例を表示するか。voiceColorEnabled=true のときのみ有効 */
  voiceColorLegendEnabled?: boolean;
  /** voiceColor 凡例の表示位置 */
  voiceColorLegendPosition?: VoiceColorLegendPosition;
  /** voiceColor 凡例の X 位置（%）。0=左端, 100=右端 */
  voiceColorLegendXPercent?: number;
  /** voiceColor 凡例の Y 位置（%）。0=上端, 100=下端 */
  voiceColorLegendYPercent?: number;
  /** voiceColor 凡例のサイズ倍率。デフォルト 1 */
  voiceColorLegendScale?: number;
  /** 現在再生中ノート情報を表示するか。デフォルト false */
  currentNoteInfoEnabled?: boolean;
  /** 現在再生中ノート情報で子音速度を表示するか。デフォルト true */
  currentNoteInfoShowVelocity?: boolean;
  /** 現在再生中ノート情報でフラグを表示するか。デフォルト true */
  currentNoteInfoShowFlags?: boolean;
  /** 現在再生中ノート情報で音量を表示するか。デフォルト true */
  currentNoteInfoShowIntensity?: boolean;
  /** 現在再生中ノート情報の表示位置 */
  currentNoteInfoPosition?: VoiceColorLegendPosition;
  /** 現在再生中ノート情報の X 位置（%）。0=左端, 100=右端 */
  currentNoteInfoXPercent?: number;
  /** 現在再生中ノート情報の Y 位置（%）。0=上端, 100=下端 */
  currentNoteInfoYPercent?: number;
  /** 現在再生中ノート情報のサイズ倍率。デフォルト 1 */
  currentNoteInfoScale?: number;
  /** 現在再生中ノート情報の子音速度ラベル（i18n 済み文字列） */
  currentNoteInfoVelocityLabel?: string;
  /** 現在再生中ノート情報のフラグラベル（i18n 済み文字列） */
  currentNoteInfoFlagsLabel?: string;
  /** 現在再生中ノート情報の音量ラベル（i18n 済み文字列） */
  currentNoteInfoIntensityLabel?: string;
  /** フラグのフォールバック値（note.flags が存在しない場合に使用） */
  ustFlags?: string;
}

export interface PianorollRenderState {
  yOffset: number;
}

export const VERTICAL_ZOOM_STEPS: number[] =
  PIANOROLL_VIDEO_VERTICAL_ZOOM_STEPS;
export const HORIZONTAL_ZOOM_STEPS: number[] =
  PIANOROLL_VIDEO_HORIZONTAL_ZOOM_STEPS;

export const getOneStepSmallerZoom = (
  currentZoom: number,
  steps: number[],
): number => {
  const smaller = steps.filter((step) => step < currentZoom);
  return smaller.length === 0 ? currentZoom : smaller[smaller.length - 1];
};

interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type ThemeColors = (typeof COLOR_PALLET)[keyof typeof COLOR_PALLET]["light"];

type Rgb = { r: number; g: number; b: number };
type Hsl = { h: number; s: number; l: number };

const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));

const parseHexColor = (hex: string): Rgb => {
  const clean = hex.replace("#", "");
  const valid = /^[0-9a-fA-F]{6}$/.test(clean) ? clean : "000000";
  return {
    r: parseInt(valid.slice(0, 2), 16),
    g: parseInt(valid.slice(2, 4), 16),
    b: parseInt(valid.slice(4, 6), 16),
  };
};

const rgbToHex = ({ r, g, b }: Rgb): string => {
  const toHex = (v: number) =>
    clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const rgbToHsl = ({ r, g, b }: Rgb): Hsl => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h, s: s * 100, l: l * 100 };
};

const hslToRgb = ({ h, s, l }: Hsl): Rgb => {
  const hh = ((h % 360) + 360) % 360;
  const ss = clamp(s, 0, 100) / 100;
  const ll = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - c / 2;

  let rn = 0;
  let gn = 0;
  let bn = 0;
  if (hh < 60) {
    rn = c;
    gn = x;
  } else if (hh < 120) {
    rn = x;
    gn = c;
  } else if (hh < 180) {
    gn = c;
    bn = x;
  } else if (hh < 240) {
    gn = x;
    bn = c;
  } else if (hh < 300) {
    rn = x;
    bn = c;
  } else {
    rn = c;
    bn = x;
  }

  return {
    r: (rn + m) * 255,
    g: (gn + m) * 255,
    b: (bn + m) * 255,
  };
};

const relativeLuminance = ({ r, g, b }: Rgb): number => {
  const toLinear = (v: number): number => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
};

const contrastRatio = (a: Rgb, b: Rgb): number => {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const buildPianorollVoiceColorMap = (
  notes: Note[],
  paletteNoteHex: string,
  paletteBackgroundHex: string,
): Map<string, string> => {
  const map = new Map<string, string>();
  const baseHsl = rgbToHsl(parseHexColor(paletteNoteHex));
  const bgRgb = parseHexColor(paletteBackgroundHex);

  const usedKeys = Array.from(
    new Set((notes ?? []).map((note) => note.voiceColor ?? "")),
  ).sort((a, b) => a.localeCompare(b));

  if (usedKeys.length === 0) {
    map.set("", paletteNoteHex);
    return map;
  }

  const defaultIndex = usedKeys.indexOf("");
  const denominator = Math.max(1, usedKeys.length);

  for (let i = 0; i < usedKeys.length; i++) {
    const key = usedKeys[i];
    if (key === "") {
      map.set(key, paletteNoteHex);
      continue;
    }

    const hash = hashString(key);
    const sequenceIndex = defaultIndex >= 0 && i > defaultIndex ? i - 1 : i;
    const hueStep = (360 / denominator) * sequenceIndex;
    const hueJitter = (hash % 23) - 11;
    const satJitter = ((hash >>> 8) % 17) - 8;
    const lightJitter = ((hash >>> 16) % 13) - 6;

    const candidateHsl: Hsl = {
      h: (baseHsl.h + hueStep + hueJitter + 360) % 360,
      s: clamp(baseHsl.s + satJitter, 38, 92),
      l: clamp(baseHsl.l + lightJitter, 28, 78),
    };

    const minimumContrast = 2.4;
    const direction =
      relativeLuminance(parseHexColor(paletteNoteHex)) >
      relativeLuminance(bgRgb)
        ? 1
        : -1;
    let adjustedHsl = { ...candidateHsl };
    let adjustedRgb = hslToRgb(adjustedHsl);

    for (let n = 0; n < 6; n++) {
      if (contrastRatio(adjustedRgb, bgRgb) >= minimumContrast) break;
      adjustedHsl.l = clamp(adjustedHsl.l + direction * 5, 20, 85);
      adjustedRgb = hslToRgb(adjustedHsl);
    }

    map.set(key, rgbToHex(adjustedRgb));
  }

  if (!map.has("")) {
    map.set("", paletteNoteHex);
  }

  return map;
};

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const resolveVoiceColorRenderMap = (
  opts: PianorollVideoOptions,
  paletteNoteHex: string,
  paletteBackgroundHex: string,
): Map<string, string> | null => {
  if (opts.voiceColorEnabled !== true) return null;

  const map = buildPianorollVoiceColorMap(
    opts.notes,
    paletteNoteHex,
    paletteBackgroundHex,
  );
  const overrideMap = opts.voiceColorMap ?? {};
  for (const [key, value] of Object.entries(overrideMap)) {
    if (!HEX_COLOR_RE.test(value)) continue;
    map.set(key, value);
  }
  if (!map.has("")) {
    map.set("", paletteNoteHex);
  }
  return map;
};

const getToneMapWidth = (layoutScale?: number): number => {
  return Math.max(
    1,
    Math.round(PIANOROLL_CONFIG.TONEMAP_WIDTH * (layoutScale ?? 1)),
  );
};

const resolveLayoutRect = (
  canvasWidth: number,
  canvasHeight: number,
  layout: PianorollVideoLayout,
  scale: number = 1,
): LayoutRect => {
  if (layout === "full") {
    return { x: 0, y: 0, width: canvasWidth, height: canvasHeight };
  }

  if (layout === "portraitMiddleThird") {
    const height = Math.round(
      canvasHeight *
        PIANOROLL_VIDEO_LAYOUT_CONFIG.portraitMiddleThirdHeightRatio,
    );
    return {
      x: 0,
      y: Math.round((canvasHeight - height) / 2),
      width: canvasWidth,
      height,
    };
  }

  if (layout === "portraitSafeArea") {
    const left = Math.round(
      PIANOROLL_VIDEO_LAYOUT_CONFIG.portraitSafeAreaLeft * scale,
    );
    const top = Math.round(
      PIANOROLL_VIDEO_LAYOUT_CONFIG.portraitSafeAreaTop * scale,
    );
    const right = Math.round(
      PIANOROLL_VIDEO_LAYOUT_CONFIG.portraitSafeAreaRight * scale,
    );
    const bottom = Math.round(
      PIANOROLL_VIDEO_LAYOUT_CONFIG.portraitSafeAreaBottom * scale,
    );
    return {
      x: left,
      y: top,
      width: Math.max(1, canvasWidth - left - right),
      height: Math.max(1, canvasHeight - top - bottom),
    };
  }

  const margin = Math.round(
    PIANOROLL_VIDEO_LAYOUT_CONFIG.landscapeMargin * scale,
  );
  return {
    x: margin,
    y: margin,
    width: Math.max(
      1,
      Math.round(
        canvasWidth * PIANOROLL_VIDEO_LAYOUT_CONFIG.landscapeWidthRatio,
      ),
    ),
    height: Math.max(
      1,
      Math.round(
        canvasHeight * PIANOROLL_VIDEO_LAYOUT_CONFIG.landscapeHeightRatio,
      ),
    ),
  };
};

const msToPoint = (
  ms: number,
  tempo: number,
  horizontalZoom: number,
): number => {
  const pixelPerTick = PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom;
  const msPerTick = 60000 / (tempo * 480);
  return ms * (pixelPerTick / msPerTick);
};

const notenumToPoint = (notenum: number, verticalZoom: number): number => {
  return (
    PIANOROLL_CONFIG.KEY_HEIGHT * (107 - notenum) * verticalZoom +
    (PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom) / 2
  );
};

const deciToneToPoint = (deciTone: number, verticalZoom: number): number => {
  return (PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom * deciTone) / 10;
};

const getNotesLeftTicks = (notes: Note[]): number[] => {
  let acc = 0;
  return notes.map((n) => {
    const current = acc;
    acc += n.length;
    return current;
  });
};

const getCurrentNoteIndexByMs = (
  tMs: number,
  notes: Note[],
  notesLeftMs: number[],
): number => {
  if (notes.length === 0 || notesLeftMs.length !== notes.length) return -1;
  for (let i = 0; i < notes.length; i++) {
    const startMs = notesLeftMs[i];
    const endMs = startMs + notes[i].msLength;
    if (tMs >= startMs && tMs < endMs) return i;
  }
  return -1;
};

const getCurrentHeadX = (
  tMs: number,
  notes: Note[],
  notesLeftMs: number[],
  notesLeftTicks: number[],
  horizontalZoom: number,
): number => {
  if (notes.length === 0) return 0;
  if (notesLeftMs.length !== notes.length) {
    return (
      notesLeftTicks[notesLeftTicks.length - 1] *
      PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
      horizontalZoom
    );
  }

  const lastIndex = notes.length - 1;
  const lastEndMs = notesLeftMs[lastIndex] + notes[lastIndex].msLength;
  if (tMs <= notesLeftMs[0]) return 0;
  if (tMs >= lastEndMs) {
    return (
      (notesLeftTicks[lastIndex] + notes[lastIndex].length) *
      PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
      horizontalZoom
    );
  }

  let targetIndex = 0;
  for (let i = 0; i < notes.length; i++) {
    const startMs = notesLeftMs[i];
    const endMs = startMs + notes[i].msLength;
    if (tMs >= startMs && tMs < endMs) {
      targetIndex = i;
      break;
    }
  }

  const localMs = tMs - notesLeftMs[targetIndex];
  return (
    notesLeftTicks[targetIndex] *
      PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
      horizontalZoom +
    msToPoint(localMs, notes[targetIndex].tempo, horizontalZoom)
  );
};

/**
 * 画面右半分に登場するノートが画面外に出る場合のみスクロール目標を返す。
 * シークバーより左のノートは見切れ許容。
 * スクロールによって右半分のいずれかのノートが見切れる場合はスクロールしない。
 */
const getTargetYOffset = (
  currentYOffset: number,
  noteAreaWidth: number,
  scrollX: number,
  seekbarLocalX: number,
  layoutHeight: number,
  notes: Note[],
  notesLeftTicks: number[],
  horizontalZoom: number,
  verticalZoom: number,
): number => {
  void seekbarLocalX;
  const totalHeight = PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom;
  const maxOffset = Math.max(0, totalHeight - layoutHeight);

  if (notes.length === 0) {
    return clamp(totalHeight / 2 - layoutHeight / 2, 0, maxOffset);
  }

  const margin = layoutHeight * PIANOROLL_VIDEO_SCROLL_CONFIG.marginRatio;
  // 画面中央から右端までを「右半分」として扱う
  const rightHalfLeft =
    scrollX + noteAreaWidth * PIANOROLL_VIDEO_SCROLL_CONFIG.rightHalfStartRatio;
  const rightHalfRight = scrollX + noteAreaWidth;

  // 右半分ノートをすべて画面内に収める yOffset の許容区間 [minAllowed, maxAllowed] を求める。
  // noteY が [yOffset + margin, yOffset + layoutHeight - margin] に入る必要があるため、
  // yOffset は [noteY - (layoutHeight - margin), noteY - margin] を満たす。
  let minAllowed = -Infinity;
  let maxAllowed = Infinity;
  let anyOffscreen = false;
  let anyRightHalfNote = false;

  for (let i = 0; i < notes.length; i++) {
    const noteX =
      notesLeftTicks[i] * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom;
    if (noteX < rightHalfLeft || noteX > rightHalfRight) continue;
    anyRightHalfNote = true;
    const noteY = notenumToPoint(notes[i].notenum, verticalZoom);
    if (
      noteY < currentYOffset + margin ||
      noteY > currentYOffset + layoutHeight - margin
    ) {
      anyOffscreen = true;
    }

    const lower = noteY - (layoutHeight - margin);
    const upper = noteY - margin;
    if (lower > minAllowed) minAllowed = lower;
    if (upper < maxAllowed) maxAllowed = upper;
  }

  if (!anyRightHalfNote) return currentYOffset;
  if (!anyOffscreen) return currentYOffset;

  const feasibleMin = clamp(minAllowed, 0, maxOffset);
  const feasibleMax = clamp(maxAllowed, 0, maxOffset);
  // 収まる範囲が存在しない場合は、無理に動かすと別ノートを見切らせるので据え置き。
  if (feasibleMin > feasibleMax) return currentYOffset;

  // 最小スクロール量: 現在 yOffset に最も近い端へ寄せる。
  const proposedYOffset = clamp(currentYOffset, feasibleMin, feasibleMax);

  // スクロール後に右半分のノートがすべて画面内に収まるかチェック
  for (let i = 0; i < notes.length; i++) {
    const noteX =
      notesLeftTicks[i] * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom;
    if (noteX < rightHalfLeft || noteX > rightHalfRight) continue;
    const noteY = notenumToPoint(notes[i].notenum, verticalZoom);
    if (
      noteY < proposedYOffset + margin ||
      noteY > proposedYOffset + layoutHeight - margin
    ) {
      // スクロール後も見切れるノートがある場合はスクロールしない
      return currentYOffset;
    }
  }

  return proposedYOffset;
};

/** ノートエリアのグリッド背景（鍵盤カラー・水平・垂直セパレータ）を描画。鍵盤テキストは含まない。 */
const drawNoteAreaBackground = (
  ctx: CanvasRenderingContext2D,
  rect: LayoutRect,
  noteAreaX: number,
  noteAreaWidth: number,
  scrollX: number,
  yOffset: number,
  opts: PianorollVideoOptions,
  totalTickLength: number,
): void => {
  const palette =
    COLOR_PALLET[opts.colorTheme]?.[opts.themeMode] ??
    COLOR_PALLET.default.light;
  const keyHeightPx = PIANOROLL_CONFIG.KEY_HEIGHT * opts.verticalZoom;

  for (let i = 0; i < PIANOROLL_CONFIG.KEY_COUNT; i++) {
    const y = rect.y + i * keyHeightPx - yOffset;
    if (y > rect.y + rect.height || y + keyHeightPx < rect.y) continue;

    const scaleOffset = opts.tone + (opts.isMinor ? 3 : 0);
    const isBlack = PIANOROLL_CONFIG.BLACK_KEY_REMAINDERS.includes(
      (i + scaleOffset) % 12,
    );

    ctx.fillStyle = isBlack ? palette.blackKey : palette.whiteKey;
    ctx.fillRect(noteAreaX, y, noteAreaWidth, keyHeightPx);

    ctx.strokeStyle = palette.horizontalSeparator;
    ctx.lineWidth =
      (i + opts.tone) % 12 === 0
        ? PIANOROLL_CONFIG.HORIZONTAL_SEPARATOR_WIDTH_OCTAVE
        : PIANOROLL_CONFIG.HORIZONTAL_SEPARATOR_WIDTH;
    ctx.beginPath();
    ctx.moveTo(noteAreaX, y);
    ctx.lineTo(noteAreaX + noteAreaWidth, y);
    ctx.stroke();
  }

  const extraTicks = 480 * PIANOROLL_CONFIG.EXTRA_BEATS_COUNT;
  for (let tick = 0; tick <= totalTickLength + extraTicks; tick += 480) {
    const x =
      noteAreaX +
      tick * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * opts.horizontalZoom -
      scrollX;
    if (x < noteAreaX || x > noteAreaX + noteAreaWidth) continue;
    ctx.strokeStyle = palette.verticalSeparator;
    ctx.lineWidth =
      tick % 1920 === 0
        ? PIANOROLL_CONFIG.VERTICAL_SEPARATOR_WIDTH_MEASURE
        : PIANOROLL_CONFIG.VERTICAL_SEPARATOR_WIDTH;
    ctx.beginPath();
    ctx.moveTo(x, rect.y);
    ctx.lineTo(x, rect.y + rect.height);
    ctx.stroke();
  }
};

/** 鍵盤（トーンマップストリップ）をノートの上に描画。 */
const drawKeyboard = (
  ctx: CanvasRenderingContext2D,
  rect: LayoutRect,
  yOffset: number,
  opts: PianorollVideoOptions,
): void => {
  const palette =
    COLOR_PALLET[opts.colorTheme]?.[opts.themeMode] ??
    COLOR_PALLET.default.light;
  const keyHeightPx = PIANOROLL_CONFIG.KEY_HEIGHT * opts.verticalZoom;
  const layoutScale = opts.layoutScale ?? 1;
  const toneMapWidth = getToneMapWidth(layoutScale);
  const keyboardBaseFontSize = Math.max(
    PIANOROLL_VIDEO_TEXT_CONFIG.keyboardFontMinSize,
    Math.round(
      PIANOROLL_CONFIG.LYRIC_FONT_SIZE *
        PIANOROLL_VIDEO_TEXT_CONFIG.keyboardFontScale,
    ),
  );
  const keyboardFontSize = Math.max(
    1,
    Math.round(keyboardBaseFontSize * layoutScale),
  );
  const keyboardTextOffsetX = Math.max(
    1,
    Math.round(
      PIANOROLL_VIDEO_TEXT_CONFIG.keyboardToneTextOffsetX * layoutScale,
    ),
  );

  for (let i = 0; i < PIANOROLL_CONFIG.KEY_COUNT; i++) {
    const y = rect.y + i * keyHeightPx - yOffset;
    if (y > rect.y + rect.height || y + keyHeightPx < rect.y) continue;

    const scaleOffset = opts.tone + (opts.isMinor ? 3 : 0);
    const isBlack = PIANOROLL_CONFIG.BLACK_KEY_REMAINDERS.includes(
      (i + scaleOffset) % 12,
    );

    ctx.fillStyle = isBlack ? palette.tonemapBlackKey : palette.tonemapWhiteKey;
    ctx.fillRect(rect.x, y, toneMapWidth, keyHeightPx);

    ctx.fillStyle = palette.lyric;
    ctx.font = `${keyboardFontSize}px ${PIANOROLL_VIDEO_TEXT_CONFIG.fontFamily}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(
      noteNumToTone(107 - i),
      rect.x + keyboardTextOffsetX,
      y + keyHeightPx / 2,
    );
  }
};

const drawNotesAndPitch = (
  ctx: CanvasRenderingContext2D,
  rect: LayoutRect,
  noteAreaX: number,
  scrollX: number,
  yOffset: number,
  opts: PianorollVideoOptions,
  notesLeftTicks: number[],
  voiceColorMap: Map<string, string> | null,
): void => {
  const palette =
    COLOR_PALLET[opts.colorTheme]?.[opts.themeMode] ??
    COLOR_PALLET.default.light;
  const noteHeight = PIANOROLL_CONFIG.KEY_HEIGHT * opts.verticalZoom;
  const textScale = opts.layoutScale ?? 1;
  const lyricFontSize = Math.max(
    1,
    Math.min(
      Math.round(PIANOROLL_CONFIG.LYRIC_FONT_SIZE * textScale),
      Math.floor(noteHeight * 0.75),
    ),
  );
  const tempoFontSize = Math.max(
    1,
    Math.min(
      Math.round(PIANOROLL_CONFIG.TEMPO_FONT_SIZE * textScale),
      Math.floor(lyricFontSize * 0.8),
    ),
  );
  const lyricPaddingLeft = Math.max(
    1,
    Math.round(PIANOROLL_CONFIG.LYRIC_PADDING_LEFT * textScale),
  );
  const tempoTextOffsetX = Math.max(
    1,
    Math.round(PIANOROLL_VIDEO_TEXT_CONFIG.tempoTextOffsetX * textScale),
  );

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `${lyricFontSize}px ${PIANOROLL_VIDEO_TEXT_CONFIG.fontFamily}`;

  opts.notes.forEach((note, index) => {
    const x =
      noteAreaX +
      notesLeftTicks[index] *
        PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
        opts.horizontalZoom -
      scrollX;
    const y =
      rect.y +
      PIANOROLL_CONFIG.KEY_HEIGHT * (107 - note.notenum) * opts.verticalZoom -
      yOffset;
    const width =
      note.length * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * opts.horizontalZoom;

    if (x + width < noteAreaX || x > rect.x + rect.width) return;
    if (y + noteHeight < rect.y || y > rect.y + rect.height) return;

    const noteFill =
      note.lyric === "R"
        ? palette.restNote
        : (voiceColorMap?.get(note.voiceColor ?? "") ??
          voiceColorMap?.get("") ??
          palette.note);
    ctx.fillStyle = noteFill;
    ctx.strokeStyle = palette.noteBorder;
    ctx.lineWidth = PIANOROLL_CONFIG.NOTES_BORDER_WIDTH;
    ctx.fillRect(x, y, width, noteHeight);
    ctx.strokeRect(x, y, width, noteHeight);

    ctx.fillStyle = palette.lyric;
    ctx.fillText(note.lyric, x + lyricPaddingLeft, y + noteHeight / 2);

    if (note.atFilename === "" && note.lyric !== "R") {
      ctx.fillStyle = palette.attention;
      ctx.fillText(
        PIANOROLL_VIDEO_TEXT_CONFIG.missingOtoMarker,
        x + lyricPaddingLeft,
        y + noteHeight * PIANOROLL_VIDEO_TEXT_CONFIG.missingOtoMarkerYRatio,
      );
    }

    if (index === 0 || note.hasTempo) {
      ctx.fillStyle = palette.tempo;
      ctx.font = `${tempoFontSize}px ${PIANOROLL_VIDEO_TEXT_CONFIG.fontFamily}`;
      ctx.fillText(
        `bpm=${note.tempo.toFixed(2)}`,
        x + tempoTextOffsetX,
        y + noteHeight * PIANOROLL_VIDEO_TEXT_CONFIG.tempoTextYRatio,
      );
      ctx.font = `${lyricFontSize}px ${PIANOROLL_VIDEO_TEXT_CONFIG.fontFamily}`;
    }

    if (!note.label) return;
    ctx.fillStyle = palette.tempo;
    ctx.font = `${tempoFontSize}px ${PIANOROLL_VIDEO_TEXT_CONFIG.fontFamily}`;
    ctx.fillText(
      note.label,
      x + tempoTextOffsetX,
      y + noteHeight * PIANOROLL_VIDEO_TEXT_CONFIG.labelTextYRatio,
    );
    ctx.font = `${lyricFontSize}px ${PIANOROLL_VIDEO_TEXT_CONFIG.fontFamily}`;
  });

  ctx.strokeStyle = palette.pitch;
  ctx.lineWidth = 1;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  opts.notes.forEach((note, index) => {
    if (note.lyric === "R" || !note.pbs) return;
    const offset = note.pbs.time ?? 0;
    if (note.msLength - offset <= offset) return;

    const leftOffsetX =
      notesLeftTicks[index] *
      PIANOROLL_CONFIG.NOTES_WIDTH_RATE *
      opts.horizontalZoom;
    const timeAxis = makeTimeAxis(
      note.pitchSpan,
      offset / 1000,
      (note.msLength - offset) / 1000,
    );
    const interpPitches = note.getInterpPitch(note, timeAxis, offset / 1000);
    const vibratoPitches = note.getVibratoPitches(note, timeAxis, offset);
    for (let i = 0; i < interpPitches.length; i++) {
      interpPitches[i] += vibratoPitches[i];
    }
    if (timeAxis.length === 0 || interpPitches.length === 0) return;

    let drew = false;
    ctx.beginPath();
    for (let i = 0; i < timeAxis.length; i++) {
      const x =
        noteAreaX +
        leftOffsetX +
        msToPoint(timeAxis[i] * 1000, note.tempo, opts.horizontalZoom) -
        scrollX;
      const y =
        rect.y +
        notenumToPoint(note.notenum, opts.verticalZoom) -
        deciToneToPoint(interpPitches[i] / 10, opts.verticalZoom) -
        yOffset;
      if (!drew) {
        ctx.moveTo(x, y);
        drew = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
    if (drew) ctx.stroke();
  });
};

const drawVoiceColorLegend = (
  ctx: CanvasRenderingContext2D,
  rect: LayoutRect,
  opts: PianorollVideoOptions,
  voiceColorMap: Map<string, string> | null,
): void => {
  if (opts.voiceColorEnabled !== true) return;
  if (opts.voiceColorLegendEnabled !== true) return;
  if (!voiceColorMap || voiceColorMap.size === 0) return;

  const voiceColors = Array.from(
    new Set((opts.notes ?? []).map((note) => note.voiceColor ?? "")),
  ).sort((a, b) => a.localeCompare(b));
  if (voiceColors.length === 0) return;

  const scale =
    clamp(opts.voiceColorLegendScale ?? 1, 0.2, 5) * (opts.layoutScale ?? 1);
  const fontSize = Math.max(1, Math.round(12 * scale));
  const markerSize = Math.max(1, Math.round(12 * scale));
  const rowGap = Math.max(1, Math.round(4 * scale));
  const padX = Math.max(1, Math.round(8 * scale));
  const padY = Math.max(1, Math.round(6 * scale));
  const markerGap = Math.max(1, Math.round(8 * scale));
  const margin = Math.max(1, Math.round(10 * scale));

  ctx.save();
  ctx.font = `${fontSize}px ${PIANOROLL_VIDEO_TEXT_CONFIG.fontFamily}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";

  const labels = voiceColors.map((key) => (key === "" ? "Default" : key));
  let maxLabelWidth = 0;
  for (const label of labels) {
    maxLabelWidth = Math.max(maxLabelWidth, ctx.measureText(label).width);
  }

  const rowHeight = Math.max(markerSize, fontSize);
  const contentWidth = markerSize + markerGap + maxLabelWidth;
  const contentHeight =
    rowHeight * voiceColors.length +
    rowGap * Math.max(0, voiceColors.length - 1);
  const legendW = Math.ceil(contentWidth + padX * 2);
  const legendH = Math.ceil(contentHeight + padY * 2);

  const hasPercentPosition =
    opts.voiceColorLegendXPercent !== undefined ||
    opts.voiceColorLegendYPercent !== undefined;
  const x = hasPercentPosition
    ? (() => {
        const xMax = Math.max(rect.x, rect.x + rect.width - legendW);
        return clamp(
          rect.x +
            (rect.width * clamp(opts.voiceColorLegendXPercent ?? 0, 0, 100)) /
              100,
          rect.x,
          xMax,
        );
      })()
    : (() => {
        const position = opts.voiceColorLegendPosition ?? "topRight";
        return position === "topLeft" || position === "bottomLeft"
          ? rect.x + margin
          : rect.x + rect.width - legendW - margin;
      })();
  const y = hasPercentPosition
    ? (() => {
        const yMax = Math.max(rect.y, rect.y + rect.height - legendH);
        return clamp(
          rect.y +
            (rect.height * clamp(opts.voiceColorLegendYPercent ?? 0, 0, 100)) /
              100,
          rect.y,
          yMax,
        );
      })()
    : (() => {
        const position = opts.voiceColorLegendPosition ?? "topRight";
        return position === "topLeft" || position === "topRight"
          ? rect.y + margin
          : rect.y + rect.height - legendH - margin;
      })();

  ctx.fillStyle =
    opts.themeMode === "dark"
      ? "rgba(0, 0, 0, 0.55)"
      : "rgba(255, 255, 255, 0.78)";
  ctx.strokeStyle =
    opts.themeMode === "dark"
      ? "rgba(255, 255, 255, 0.35)"
      : "rgba(0, 0, 0, 0.25)";
  ctx.lineWidth = 1;
  ctx.fillRect(x, y, legendW, legendH);
  ctx.strokeRect(x, y, legendW, legendH);

  const palette =
    COLOR_PALLET[opts.colorTheme]?.[opts.themeMode] ??
    COLOR_PALLET.default.light;
  ctx.fillStyle = palette.lyric;

  for (let i = 0; i < voiceColors.length; i++) {
    const key = voiceColors[i];
    const label = labels[i];
    const rowTop = y + padY + i * (rowHeight + rowGap);
    const markerY = rowTop + (rowHeight - markerSize) / 2;
    const textY = rowTop + rowHeight / 2;

    ctx.fillStyle =
      voiceColorMap.get(key) ?? voiceColorMap.get("") ?? palette.note;
    ctx.fillRect(x + padX, markerY, markerSize, markerSize);
    ctx.strokeStyle = palette.noteBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + padX, markerY, markerSize, markerSize);

    ctx.fillStyle = palette.lyric;
    ctx.fillText(label, x + padX + markerSize + markerGap, textY);
  }

  ctx.restore();
};

const drawCurrentNoteInfoOverlay = (
  ctx: CanvasRenderingContext2D,
  rect: LayoutRect,
  opts: PianorollVideoOptions,
  currentNoteIndex: number,
  palette: ThemeColors,
): void => {
  if (opts.currentNoteInfoEnabled !== true) return;
  if (currentNoteIndex < 0 || !opts.notes) return;

  const note = opts.notes[currentNoteIndex];
  if (!note) return;

  // サイズスケール：currentNoteInfoScale を独立して使用、その上で layoutScale を適用
  const scale =
    clamp(opts.currentNoteInfoScale ?? 1, 0.2, 5) * (opts.layoutScale ?? 1);
  const fontSize = Math.max(1, Math.round(12 * scale));
  const rowGap = Math.max(1, Math.round(4 * scale));
  const padX = Math.max(1, Math.round(8 * scale));
  const padY = Math.max(1, Math.round(6 * scale));
  const margin = Math.max(1, Math.round(10 * scale));

  // 表示する情報行を構築
  const infoLines: string[] = [];
  const velocityLabel = opts.currentNoteInfoVelocityLabel ?? "Velocity";
  const flagsLabel = opts.currentNoteInfoFlagsLabel ?? "Flags";
  const intensityLabel = opts.currentNoteInfoIntensityLabel ?? "Intensity";
  if (opts.currentNoteInfoShowVelocity !== false) {
    const velocity = note.velocity ?? 100;
    infoLines.push(`${velocityLabel}: ${velocity}`);
  }
  if (opts.currentNoteInfoShowFlags !== false) {
    const flags = note.flags || opts.ustFlags || "";
    infoLines.push(`${flagsLabel}: ${flags}`);
  }
  if (opts.currentNoteInfoShowIntensity !== false) {
    const intensity = note.intensity ?? 100;
    infoLines.push(`${intensityLabel}: ${intensity}`);
  }

  if (infoLines.length === 0) return;

  ctx.save();
  ctx.font = `${fontSize}px ${PIANOROLL_VIDEO_TEXT_CONFIG.fontFamily}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";

  // テキスト寸法を計算
  const textMetrics = infoLines.map((line) => ctx.measureText(line));
  const maxWidth = Math.max(...textMetrics.map((m) => m.width));
  const rowHeight = fontSize;
  const totalHeight =
    infoLines.length * rowHeight + (infoLines.length - 1) * rowGap;

  // ボックス寸法
  const boxWidth = maxWidth + padX * 2;
  const boxHeight = totalHeight + padY * 2;

  // 位置（x%/y% 指定があれば優先。未指定時は既存の4位置指定を使用）
  const hasPercentPosition =
    opts.currentNoteInfoXPercent !== undefined ||
    opts.currentNoteInfoYPercent !== undefined;
  const x = hasPercentPosition
    ? (() => {
        const xMax = Math.max(rect.x, rect.x + rect.width - boxWidth);
        return clamp(
          rect.x +
            (rect.width * clamp(opts.currentNoteInfoXPercent ?? 0, 0, 100)) /
              100,
          rect.x,
          xMax,
        );
      })()
    : (() => {
        const position = opts.currentNoteInfoPosition ?? "bottomLeft";
        return position === "topLeft" || position === "bottomLeft"
          ? rect.x + margin
          : rect.x + rect.width - boxWidth - margin;
      })();
  const y = hasPercentPosition
    ? (() => {
        const yMax = Math.max(rect.y, rect.y + rect.height - boxHeight);
        return clamp(
          rect.y +
            (rect.height * clamp(opts.currentNoteInfoYPercent ?? 0, 0, 100)) /
              100,
          rect.y,
          yMax,
        );
      })()
    : (() => {
        const position = opts.currentNoteInfoPosition ?? "bottomLeft";
        return position === "topLeft" || position === "topRight"
          ? rect.y + margin
          : rect.y + rect.height - boxHeight - margin;
      })();

  // ボックスを描画（凡例と同じテーマ依存の色）
  ctx.fillStyle =
    opts.themeMode === "dark"
      ? "rgba(0, 0, 0, 0.55)"
      : "rgba(255, 255, 255, 0.78)";
  ctx.fillRect(x, y, boxWidth, boxHeight);
  ctx.strokeStyle =
    opts.themeMode === "dark"
      ? "rgba(255, 255, 255, 0.35)"
      : "rgba(0, 0, 0, 0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, boxWidth, boxHeight);

  // テキストを描画
  ctx.fillStyle = palette.lyric;
  for (let i = 0; i < infoLines.length; i++) {
    const textY = y + padY + i * (rowHeight + rowGap) + rowHeight / 2;
    ctx.fillText(infoLines[i], x + padX, textY);
  }

  ctx.restore();
};

export const drawPianorollCurrentNoteInfo = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  currentMs: number,
  options: PianorollVideoOptions,
): void => {
  if (!options.enabled) return;
  if (options.renderCurrentNoteInfo === false) return;
  if (options.currentNoteInfoEnabled !== true) return;

  const rect = resolveLayoutRect(
    canvasWidth,
    canvasHeight,
    options.layout,
    options.layoutScale ?? 1,
  );
  const palette =
    COLOR_PALLET[options.colorTheme]?.[options.themeMode] ??
    COLOR_PALLET.default.light;
  const currentNoteIndex = getCurrentNoteIndexByMs(
    currentMs,
    options.notes,
    options.notesLeftMs,
  );
  drawCurrentNoteInfoOverlay(ctx, rect, options, currentNoteIndex, palette);
};

const drawSeekbarAndIcon = (
  ctx: CanvasRenderingContext2D,
  rect: LayoutRect,
  noteAreaX: number,
  noteAreaWidth: number,
  seekbarX: number,
  opts: PianorollVideoOptions,
): void => {
  const palette =
    COLOR_PALLET[opts.colorTheme]?.[opts.themeMode] ??
    COLOR_PALLET.default.light;

  ctx.strokeStyle = palette.seekBar;
  ctx.lineWidth = PIANOROLL_CONFIG.SEEKBAR_WIDTH;
  ctx.beginPath();
  ctx.moveTo(noteAreaX + seekbarX, rect.y);
  ctx.lineTo(noteAreaX + seekbarX, rect.y + rect.height);
  ctx.stroke();

  if (!opts.voiceIconImage) return;
  const iconSize = Math.round(
    PIANOROLL_VIDEO_ICON_CONFIG.size * (opts.layoutScale ?? 1),
  );
  const iconX =
    rect.x +
    Math.round(PIANOROLL_VIDEO_ICON_CONFIG.padding * (opts.layoutScale ?? 1));
  const iconY =
    rect.y +
    Math.round(PIANOROLL_VIDEO_ICON_CONFIG.padding * (opts.layoutScale ?? 1));
  const iconBgPadding = Math.round(
    PIANOROLL_VIDEO_ICON_CONFIG.backgroundPadding * (opts.layoutScale ?? 1),
  );
  ctx.save();
  ctx.fillStyle = PIANOROLL_VIDEO_ICON_CONFIG.backgroundColor;
  ctx.fillRect(
    iconX - iconBgPadding,
    iconY - iconBgPadding,
    iconSize + iconBgPadding * 2,
    iconSize + iconBgPadding * 2,
  );
  ctx.drawImage(opts.voiceIconImage, iconX, iconY, iconSize, iconSize);
  ctx.restore();
};

export const drawPianorollVideoFrame = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  currentMs: number,
  options: PianorollVideoOptions,
  previousState?: PianorollRenderState,
): PianorollRenderState => {
  if (!options.enabled) {
    return previousState ?? { yOffset: 0 };
  }

  const rect = resolveLayoutRect(
    canvasWidth,
    canvasHeight,
    options.layout,
    options.layoutScale ?? 1,
  );
  const keyboardVisible = options.showKeyboard ?? true;
  const backgroundVisible = options.showBackground ?? true;
  const toneMapWidth = keyboardVisible
    ? getToneMapWidth(options.layoutScale)
    : 0;
  const noteAreaX = rect.x + toneMapWidth;
  const noteAreaWidth = Math.max(1, rect.width - toneMapWidth);
  const notesLeftTicks = getNotesLeftTicks(options.notes);
  const totalTickLength = options.notes.reduce((sum, n) => sum + n.length, 0);

  const currentHeadX = getCurrentHeadX(
    currentMs,
    options.notes,
    options.notesLeftMs,
    notesLeftTicks,
    options.horizontalZoom,
  );
  const centerX = noteAreaWidth / 2;
  const seekbarX = Math.min(currentHeadX, centerX);
  const scrollX = Math.max(0, currentHeadX - centerX);

  const prevYOffset =
    previousState?.yOffset ??
    (() => {
      // 初期値: 最初のノートを中心に
      const totalH = PIANOROLL_CONFIG.TOTAL_HEIGHT * options.verticalZoom;
      const firstY =
        options.notes.length > 0
          ? notenumToPoint(options.notes[0].notenum, options.verticalZoom)
          : totalH / 2;
      return clamp(
        firstY - rect.height / 2,
        0,
        Math.max(0, totalH - rect.height),
      );
    })();

  const targetYOffset = getTargetYOffset(
    prevYOffset,
    noteAreaWidth,
    scrollX,
    seekbarX,
    rect.height,
    options.notes,
    notesLeftTicks,
    options.horizontalZoom,
    options.verticalZoom,
  );
  const smoothYOffset =
    prevYOffset +
    (targetYOffset - prevYOffset) *
      PIANOROLL_VIDEO_SCROLL_CONFIG.yOffsetLerpFactor;

  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.clip();

  const palette =
    COLOR_PALLET[options.colorTheme]?.[options.themeMode] ??
    COLOR_PALLET.default.light;
  const voiceColorMap = resolveVoiceColorRenderMap(
    options,
    palette.note,
    palette.whiteKey,
  );

  if (backgroundVisible) {
    drawNoteAreaBackground(
      ctx,
      rect,
      noteAreaX,
      noteAreaWidth,
      scrollX,
      smoothYOffset,
      options,
      totalTickLength,
    );
  }
  drawNotesAndPitch(
    ctx,
    rect,
    noteAreaX,
    scrollX,
    smoothYOffset,
    options,
    notesLeftTicks,
    voiceColorMap,
  );
  if (keyboardVisible) {
    drawKeyboard(ctx, rect, smoothYOffset, options);
  }
  drawVoiceColorLegend(ctx, rect, options, voiceColorMap);
  const currentNoteIndex = getCurrentNoteIndexByMs(
    currentMs,
    options.notes,
    options.notesLeftMs,
  );
  if (options.renderCurrentNoteInfo !== false) {
    drawCurrentNoteInfoOverlay(ctx, rect, options, currentNoteIndex, palette);
  }
  drawSeekbarAndIcon(ctx, rect, noteAreaX, noteAreaWidth, seekbarX, options);

  ctx.restore();
  return { yOffset: smoothYOffset };
};

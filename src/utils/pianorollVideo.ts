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

export interface PianorollVideoOptions {
  enabled: boolean;
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

const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));

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
): void => {
  const palette =
    COLOR_PALLET[opts.colorTheme]?.[opts.themeMode] ??
    COLOR_PALLET.default.light;
  const noteHeight = PIANOROLL_CONFIG.KEY_HEIGHT * opts.verticalZoom;

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `${PIANOROLL_CONFIG.LYRIC_FONT_SIZE}px ${PIANOROLL_VIDEO_TEXT_CONFIG.fontFamily}`;

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

    ctx.fillStyle = note.lyric === "R" ? palette.restNote : palette.note;
    ctx.strokeStyle = palette.noteBorder;
    ctx.lineWidth = PIANOROLL_CONFIG.NOTES_BORDER_WIDTH;
    ctx.fillRect(x, y, width, noteHeight);
    ctx.strokeRect(x, y, width, noteHeight);

    ctx.fillStyle = palette.lyric;
    ctx.fillText(
      note.lyric,
      x + PIANOROLL_CONFIG.LYRIC_PADDING_LEFT,
      y + noteHeight / 2,
    );

    if (note.atFilename === "" && note.lyric !== "R") {
      ctx.fillStyle = palette.attention;
      ctx.fillText(
        PIANOROLL_VIDEO_TEXT_CONFIG.missingOtoMarker,
        x + PIANOROLL_CONFIG.LYRIC_PADDING_LEFT,
        y + noteHeight * PIANOROLL_VIDEO_TEXT_CONFIG.missingOtoMarkerYRatio,
      );
    }

    if (index === 0 || note.hasTempo) {
      ctx.fillStyle = palette.tempo;
      ctx.font = `${PIANOROLL_CONFIG.TEMPO_FONT_SIZE}px ${PIANOROLL_VIDEO_TEXT_CONFIG.fontFamily}`;
      ctx.fillText(
        `bpm=${note.tempo.toFixed(2)}`,
        x + PIANOROLL_VIDEO_TEXT_CONFIG.tempoTextOffsetX,
        y + noteHeight * PIANOROLL_VIDEO_TEXT_CONFIG.tempoTextYRatio,
      );
      ctx.font = `${PIANOROLL_CONFIG.LYRIC_FONT_SIZE}px ${PIANOROLL_VIDEO_TEXT_CONFIG.fontFamily}`;
    }

    if (!note.label) return;
    ctx.fillStyle = palette.tempo;
    ctx.font = `${PIANOROLL_CONFIG.TEMPO_FONT_SIZE}px ${PIANOROLL_VIDEO_TEXT_CONFIG.fontFamily}`;
    ctx.fillText(
      note.label,
      x + PIANOROLL_VIDEO_TEXT_CONFIG.tempoTextOffsetX,
      y + noteHeight * PIANOROLL_VIDEO_TEXT_CONFIG.labelTextYRatio,
    );
    ctx.font = `${PIANOROLL_CONFIG.LYRIC_FONT_SIZE}px ${PIANOROLL_VIDEO_TEXT_CONFIG.fontFamily}`;
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
  const toneMapWidth = getToneMapWidth(options.layoutScale);
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
  drawNotesAndPitch(
    ctx,
    rect,
    noteAreaX,
    scrollX,
    smoothYOffset,
    options,
    notesLeftTicks,
  );
  drawKeyboard(ctx, rect, smoothYOffset, options);
  drawSeekbarAndIcon(ctx, rect, noteAreaX, noteAreaWidth, seekbarX, options);

  ctx.restore();
  return { yOffset: smoothYOffset };
};

/**
 * 音声波形エフェクト描画ユーティリティ
 *
 * - 入力: モノラル Float32 サンプル列 ([-1, 1])
 * - 描画方式: オシロスコープ型 / オシロスコープ円形型
 * - 描画メソッド: 折れ線 / 補間曲線 / 塗りつぶし / 点列
 */

import { WaveAnalyse } from "utauwav";

export type WaveformType =
  | "oscilloscope"
  | "oscilloscope-circular"
  | "fft-horizontal"
  | "fft-circular"
  | "fft-icon-horizontal"
  | "fft-icon-vertical"
  | "fft-icon-horizontal-mirror"
  | "fft-icon-vertical-mirror"
  | "fft-icon-circular";
export type WaveformDrawMethod = "polyline" | "curve" | "fill" | "dots";
export type WaveformFftShape =
  | "barBottom"
  | "barCenter"
  | "gauge"
  | "circle"
  | "circleFill"
  | "polyline"
  | "curve"
  | "fill";
export type WaveformFftGaugeShape = "bar" | "square" | "circle";
export type WaveformColorMode =
  | "solid"
  | "lightness"
  | "saturation"
  | "hueVertical"
  | "hueHorizontal";

export const WAVEFORM_TYPES: WaveformType[] = [
  "oscilloscope",
  "oscilloscope-circular",
  "fft-horizontal",
  "fft-circular",
  "fft-icon-horizontal",
  "fft-icon-vertical",
  "fft-icon-horizontal-mirror",
  "fft-icon-vertical-mirror",
  "fft-icon-circular",
];
export const WAVEFORM_DRAW_METHODS: WaveformDrawMethod[] = [
  "polyline",
  "curve",
  "fill",
  "dots",
];
export const WAVEFORM_FFT_SHAPES: WaveformFftShape[] = [
  "barBottom",
  "barCenter",
  "gauge",
  "circle",
  "circleFill",
  "polyline",
  "curve",
  "fill",
];
export const WAVEFORM_FFT_GAUGE_SHAPES: WaveformFftGaugeShape[] = [
  "bar",
  "square",
  "circle",
];
export const WAVEFORM_COLOR_MODES: WaveformColorMode[] = [
  "solid",
  "lightness",
  "saturation",
  "hueVertical",
  "hueHorizontal",
];

/** FFT アイコングリッド専用: グリフ形状 */
export type WaveformFftIconShape =
  | "circle"
  | "square"
  | "diamond"
  | "triangle"
  | "star"
  | "heart"
  | "teardrop";
export const WAVEFORM_FFT_ICON_SHAPES: WaveformFftIconShape[] = [
  "circle",
  "square",
  "diamond",
  "triangle",
  "star",
  "heart",
  "teardrop",
];

/** FFT アイコングリッド専用: 強さ表現モード */
export type WaveformFftIconStrengthMode =
  | "glow"
  | "lightness"
  | "saturation"
  | "hue-by-power"
  | "band-hue-glow";
export const WAVEFORM_FFT_ICON_STRENGTH_MODES: WaveformFftIconStrengthMode[] = [
  "glow",
  "lightness",
  "saturation",
  "hue-by-power",
  "band-hue-glow",
];

export interface WaveformEffectOptions {
  enabled: boolean;
  type: WaveformType;
  drawMethod: WaveformDrawMethod;
  /** 描画色 "#rrggbb" */
  color: string;
  /** 色モード */
  colorMode: WaveformColorMode;
  /** 不透明度 0–100 */
  opacity: number;
  /** 中心 X 位置（キャンバス幅基準 %）*/
  xPercent: number;
  /** 中心 Y 位置（キャンバス高さ基準 %）*/
  yPercent: number;
  /** 回転角度（度）*/
  rotation: number;
  /**
   * 通常型: 全体幅（キャンバス幅基準 %）
   * 円形型: 基準半径（min(W,H)/2 基準 %）
   */
  widthPercent: number;
  /**
   * 通常型: 振幅の半分の高さ（キャンバス高さ基準 %）
   * 円形型: 振幅の半径増分（min(W,H)/2 基準 %）
   */
  heightPercent: number;
  /** 円形型のみ: 起点角度（度、0=3時方向）*/
  startAngle: number;
  /** 円形型のみ: 回転速度（度/秒）*/
  rotationSpeed: number;
  /** サンプル窓サイズ（フレームあたりの表示サンプル数）*/
  windowSize: number;
  /** 線の太さ（px） */
  strokeWidthPx: number;
  /** FFT時の描画形状 */
  fftShape: WaveformFftShape;
  /** FFTゲージ時の形状 */
  fftGaugeShape: WaveformFftGaugeShape;
  /** FFTゲージの分解能（0=自動） */
  fftGaugeSegments: number;
  /** FFT表示バンド数 */
  fftBinCount: number;
  /** FFTサイズ */
  fftSize: number;
  /** FFT アイコングリッド: グリフ形状 */
  fftIconShape: WaveformFftIconShape;
  /** FFT アイコングリッド: 強さ表現モード */
  fftIconStrengthMode: WaveformFftIconStrengthMode;
  /** FFT アイコングリッド: アイコンサイズ比率（%、100=最大） */
  fftIconSizePercent: number;
}

export interface WaveformFftCache {
  groupedFrames: Float32Array[];
  hopSize: number;
  sampleRate: number;
  fftSize: number;
  binCount: number;
}

// ---------------------------------------------------------------------------
// WAV 解析
// ---------------------------------------------------------------------------

/**
 * 標準 WAV ArrayBuffer（ステレオ 16bit PCM, 44100Hz）から
 * モノラル Float32 サンプル列を抽出する。
 * L/R の平均でモノラル化する。
 */
export function extractMonoSamplesFromWav(
  wavBuffer: ArrayBuffer,
): Float32Array {
  const view = new DataView(wavBuffer);

  // "data" チャンクを探す
  let dataOffset = 12; // RIFF ヘッダ 12 バイトの後から検索
  while (dataOffset + 8 <= wavBuffer.byteLength) {
    const id = String.fromCharCode(
      view.getUint8(dataOffset),
      view.getUint8(dataOffset + 1),
      view.getUint8(dataOffset + 2),
      view.getUint8(dataOffset + 3),
    );
    const chunkSize = view.getUint32(dataOffset + 4, true);
    dataOffset += 8;
    if (id === "data") break;
    dataOffset += chunkSize;
  }

  // ステレオ 16bit: 1 サンプルペア = 4 バイト (L: 2byte + R: 2byte)
  const numPairs = Math.floor((wavBuffer.byteLength - dataOffset) / 4);
  const mono = new Float32Array(numPairs);
  for (let i = 0; i < numPairs; i++) {
    const l = view.getInt16(dataOffset + i * 4, true) / 32768;
    const r = view.getInt16(dataOffset + i * 4 + 2, true) / 32768;
    mono[i] = (l + r) * 0.5;
  }
  return mono;
}

// ---------------------------------------------------------------------------
// チープ波形生成（プレビュー用）
// ---------------------------------------------------------------------------

/**
 * チープ波形（周波数スイープ）を生成する。
 * 開始周波数から終了周波数へ線形に周波数が変化する波形。
 * FFTとオシロスコープ両方の視覚化に適している。
 */
export function generateChirpWave(
  startHz: number,
  endHz: number,
  durationSec: number,
  sampleRate: number,
): Float32Array {
  const len = Math.ceil(durationSec * sampleRate);
  const out = new Float32Array(len);
  const freqRate = (endHz - startHz) / durationSec; // Hz/sec

  for (let i = 0; i < len; i++) {
    const t = i / sampleRate;
    const freq = startHz + freqRate * t;
    const angFreq = (2 * Math.PI * freq) / sampleRate;
    out[i] = Math.sin(angFreq * i);
  }
  return out;
}

// ---------------------------------------------------------------------------
// フレーム描画
// ---------------------------------------------------------------------------

/**
 * 現在時刻に対応するサンプル窓を monoSamples から抽出する。
 * 範囲外は 0 で補填する。
 */
function extractWindowSamples(
  monoSamples: Float32Array,
  currentTimeSec: number,
  sampleRate: number,
  windowSize: number,
): Float32Array {
  const centerIdx = Math.floor(currentTimeSec * sampleRate);
  const half = Math.floor(windowSize / 2);
  const result = new Float32Array(windowSize);
  for (let i = 0; i < windowSize; i++) {
    const idx = centerIdx - half + i;
    if (idx >= 0 && idx < monoSamples.length) {
      result[i] = monoSamples[idx];
    }
  }
  return result;
}

export function buildWaveformFftCache(
  monoSamples: Float32Array,
  sampleRate: number,
  fftSize: number,
  fftBinCount: number,
): WaveformFftCache {
  const wa = new WaveAnalyse();
  const hopSize = Math.max(16, Math.floor(fftSize / 2));
  const spectrogram = wa.Spectrogram(
    Array.from(monoSamples),
    fftSize,
    "hanning",
    hopSize,
  );
  const groupedFrames = Array.from(spectrogram, (frame) =>
    groupFftFrame(frame, fftBinCount),
  );
  return {
    groupedFrames,
    hopSize,
    sampleRate,
    fftSize,
    binCount: fftBinCount,
  };
}

function extractFftBins(
  monoSamples: Float32Array,
  currentTimeSec: number,
  sampleRate: number,
  fftSize: number,
  fftBinCount: number,
  fftCache?: WaveformFftCache | null,
): Float32Array {
  if (
    fftCache &&
    fftCache.fftSize === fftSize &&
    fftCache.binCount === fftBinCount &&
    fftCache.groupedFrames.length > 0
  ) {
    const frameIndex = Math.max(
      0,
      Math.min(
        fftCache.groupedFrames.length - 1,
        Math.round((currentTimeSec * fftCache.sampleRate) / fftCache.hopSize),
      ),
    );
    return fftCache.groupedFrames[frameIndex];
  }

  const wa = new WaveAnalyse();
  const window = extractWindowSamples(
    monoSamples,
    currentTimeSec,
    sampleRate,
    fftSize,
  );
  const spectrogram = wa.Spectrogram(
    Array.from(window),
    fftSize,
    "hanning",
    fftSize,
  );
  return groupFftFrame(spectrogram[0] ?? [], fftBinCount);
}

function groupFftFrame(
  frame: ArrayLike<number>,
  fftBinCount: number,
): Float32Array {
  const usableStart = Math.min(1, Math.max(0, frame.length - 1));
  const usableCount = Math.max(1, frame.length - usableStart);
  const grouped = new Float32Array(fftBinCount);

  for (let groupIndex = 0; groupIndex < fftBinCount; groupIndex++) {
    const start =
      usableStart + Math.floor((groupIndex * usableCount) / fftBinCount);
    const end =
      usableStart + Math.floor(((groupIndex + 1) * usableCount) / fftBinCount);
    const actualEnd = Math.max(start + 1, end);
    let sum = 0;
    let count = 0;
    for (let i = start; i < actualEnd && i < frame.length; i++) {
      const value = Number(frame[i] ?? 0);
      sum += Math.pow(10, value / 5);
      count++;
    }
    grouped[groupIndex] = count > 0 ? sum / count : 0;
  }

  let max = 0;
  for (const value of grouped) {
    if (value > max) max = value;
  }
  if (max <= 0) return grouped;

  for (let i = 0; i < grouped.length; i++) {
    grouped[i] = Math.sqrt(grouped[i] / max);
  }
  return grouped;
}

/**
 * 波形エフェクトをキャンバスに描画する。
 *
 * @param monoSamples - モノラル Float32 サンプル列。null の場合はゼロ（無音）として描画。
 * @param currentTimeSec - 現在の再生時刻（秒）。Wave preview の rAF ループでは経過時間を渡す。
 * @param sampleRate - サンプルレート（デフォルト 44100）
 */
export function drawWaveformEffect(
  ctx: CanvasRenderingContext2D,
  monoSamples: Float32Array | null,
  options: WaveformEffectOptions,
  canvasW: number,
  canvasH: number,
  currentTimeSec: number,
  sampleRate: number = 44100,
  renderScale: number = 1,
  fftCache?: WaveformFftCache | null,
): void {
  if (!options.enabled) return;

  ctx.save();
  ctx.globalAlpha = options.opacity / 100;

  if (options.type === "oscilloscope") {
    const samples = monoSamples
      ? extractWindowSamples(
          monoSamples,
          currentTimeSec,
          sampleRate,
          options.windowSize,
        )
      : new Float32Array(options.windowSize);
    drawOscilloscope(ctx, samples, options, canvasW, canvasH, renderScale);
  } else if (options.type === "oscilloscope-circular") {
    const samples = monoSamples
      ? extractWindowSamples(
          monoSamples,
          currentTimeSec,
          sampleRate,
          options.windowSize,
        )
      : new Float32Array(options.windowSize);
    drawOscilloscopeCircular(
      ctx,
      samples,
      options,
      canvasW,
      canvasH,
      currentTimeSec,
      renderScale,
    );
  } else {
    const fftBins = monoSamples
      ? extractFftBins(
          monoSamples,
          currentTimeSec,
          sampleRate,
          options.fftSize,
          options.fftBinCount,
          fftCache,
        )
      : new Float32Array(options.fftBinCount);
    if (options.type === "fft-horizontal") {
      drawFftHorizontal(ctx, fftBins, options, canvasW, canvasH, renderScale);
    } else if (options.type === "fft-icon-horizontal") {
      drawFftIconHorizontal(
        ctx,
        fftBins,
        options,
        canvasW,
        canvasH,
        renderScale,
      );
    } else if (options.type === "fft-icon-vertical") {
      drawFftIconVertical(ctx, fftBins, options, canvasW, canvasH, renderScale);
    } else if (options.type === "fft-icon-horizontal-mirror") {
      drawFftIconHorizontalMirror(
        ctx,
        fftBins,
        options,
        canvasW,
        canvasH,
        renderScale,
      );
    } else if (options.type === "fft-icon-vertical-mirror") {
      drawFftIconVerticalMirror(
        ctx,
        fftBins,
        options,
        canvasW,
        canvasH,
        renderScale,
      );
    } else if (options.type === "fft-icon-circular") {
      drawFftIconCircular(
        ctx,
        fftBins,
        options,
        canvasW,
        canvasH,
        currentTimeSec,
        renderScale,
      );
    } else {
      drawFftCircular(
        ctx,
        fftBins,
        options,
        canvasW,
        canvasH,
        currentTimeSec,
        renderScale,
      );
    }
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 通常型オシロスコープ
// ---------------------------------------------------------------------------

function drawOscilloscope(
  ctx: CanvasRenderingContext2D,
  samples: Float32Array,
  options: WaveformEffectOptions,
  canvasW: number,
  canvasH: number,
  renderScale: number,
): void {
  const cx = (canvasW * options.xPercent) / 100;
  const cy = (canvasH * options.yPercent) / 100;
  const halfW = (canvasW * options.widthPercent) / 100 / 2;
  const halfH = (canvasH * options.heightPercent) / 100 / 2;
  const n = samples.length;
  if (n < 2) return;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((options.rotation * Math.PI) / 180);
  ctx.strokeStyle = options.color;
  ctx.fillStyle = options.color;
  ctx.lineWidth = scaledStrokeWidthPx(options.strokeWidthPx, renderScale);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    pts.push({
      x: -halfW + (i / (n - 1)) * halfW * 2,
      y: -samples[i] * halfH,
    });
  }

  switch (options.drawMethod) {
    case "polyline":
      if (options.colorMode === "solid") {
        drawPolyline(ctx, pts, false);
      } else {
        drawPolylineGradient(ctx, pts, samples, options, false);
      }
      break;
    case "curve":
      if (options.colorMode === "solid") {
        drawCurve(ctx, pts);
      } else {
        drawPolylineGradient(ctx, pts, samples, options, false);
      }
      break;
    case "fill":
      if (options.colorMode === "solid") {
        drawFill(ctx, pts);
      } else {
        drawFillGradient(ctx, pts, options, false, 0, halfH);
      }
      break;
    case "dots":
      drawDots(ctx, pts, samples, options, renderScale, false);
      break;
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 円形型オシロスコープ
// ---------------------------------------------------------------------------

function drawOscilloscopeCircular(
  ctx: CanvasRenderingContext2D,
  samples: Float32Array,
  options: WaveformEffectOptions,
  canvasW: number,
  canvasH: number,
  currentTimeSec: number,
  renderScale: number,
): void {
  const cx = (canvasW * options.xPercent) / 100;
  const cy = (canvasH * options.yPercent) / 100;
  const refSize = Math.min(canvasW, canvasH);
  const baseR = (refSize * options.widthPercent) / 100 / 2;
  const ampR = (refSize * options.heightPercent) / 100 / 2;
  const n = samples.length;
  if (n < 2) return;

  const startAngleDeg =
    options.startAngle + options.rotationSpeed * currentTimeSec;
  const startAngleRad = (startAngleDeg * Math.PI) / 180;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = options.color;
  ctx.fillStyle = options.color;
  ctx.lineWidth = scaledStrokeWidthPx(options.strokeWidthPx, renderScale);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const angle = startAngleRad + (i / n) * 2 * Math.PI;
    const r = baseR + samples[i] * ampR;
    pts.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
  }

  switch (options.drawMethod) {
    case "polyline":
      if (options.colorMode === "solid") {
        drawPolyline(ctx, pts, true);
      } else {
        drawPolylineGradient(ctx, pts, samples, options, true);
      }
      break;
    case "curve":
      if (options.colorMode === "solid") {
        drawCurveCircular(ctx, pts);
      } else {
        drawPolylineGradient(ctx, pts, samples, options, true);
      }
      break;
    case "fill":
      if (options.colorMode === "solid") {
        drawFillCircular(ctx, pts, baseR);
      } else {
        drawFillGradient(ctx, pts, options, true, baseR);
      }
      break;
    case "dots":
      drawDots(ctx, pts, samples, options, renderScale, true);
      break;
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// FFT 型オーディオビジュアライザ
// ---------------------------------------------------------------------------

function drawFftHorizontal(
  ctx: CanvasRenderingContext2D,
  fftBins: Float32Array,
  options: WaveformEffectOptions,
  canvasW: number,
  canvasH: number,
  renderScale: number,
): void {
  const cx = (canvasW * options.xPercent) / 100;
  const cy = (canvasH * options.yPercent) / 100;
  const halfW = (canvasW * options.widthPercent) / 100 / 2;
  const halfH = (canvasH * options.heightPercent) / 100 / 2;
  if (fftBins.length < 1) return;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((options.rotation * Math.PI) / 180);
  ctx.strokeStyle = options.color;
  ctx.fillStyle = options.color;
  ctx.lineWidth = scaledStrokeWidthPx(options.strokeWidthPx, renderScale);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const pts = buildHorizontalFftPoints(fftBins, halfW, halfH);
  // 色相グラデーション用に位置ベースのサンプル値を生成（振幅ではなく周波数位置→色相）
  const fftPosSamples = Float32Array.from(
    { length: fftBins.length },
    (_, i) => (i / Math.max(1, fftBins.length - 1)) * 2 - 1,
  );
  const fftAmpSamples = Float32Array.from(fftBins, (value) =>
    fftValueToSigned(value),
  );
  const baseHsl = hexToHsl(options.color);

  switch (options.fftShape) {
    case "barBottom":
      drawFftBarsHorizontal(
        ctx,
        fftBins,
        halfW,
        halfH,
        options,
        renderScale,
        baseHsl,
        false,
      );
      break;
    case "barCenter":
      drawFftBarsHorizontal(
        ctx,
        fftBins,
        halfW,
        halfH,
        options,
        renderScale,
        baseHsl,
        true,
      );
      break;
    case "gauge":
      drawFftGaugeHorizontal(
        ctx,
        fftBins,
        halfW,
        halfH,
        options,
        renderScale,
        baseHsl,
      );
      break;
    case "circle":
      drawFftCirclesHorizontal(
        ctx,
        fftBins,
        halfW,
        halfH,
        options,
        renderScale,
        baseHsl,
        false,
      );
      break;
    case "circleFill":
      drawFftCirclesHorizontal(
        ctx,
        fftBins,
        halfW,
        halfH,
        options,
        renderScale,
        baseHsl,
        true,
      );
      break;
    case "polyline":
      if (options.colorMode === "solid") {
        drawPolyline(ctx, pts, false);
      } else {
        drawPolylineGradient(ctx, pts, fftPosSamples, options, false);
      }
      break;
    case "curve":
      if (options.colorMode === "solid") {
        drawCurve(ctx, pts);
      } else {
        drawPolylineGradient(ctx, pts, fftPosSamples, options, false);
      }
      break;
    case "fill":
      if (options.colorMode === "solid") {
        drawFill(ctx, pts);
      } else {
        // halfH=0 を渡してグラデーション範囲を pts の実際の y 範囲に合わせる（FFT bins は y≤0 のみ）
        drawFillGradient(ctx, pts, options, false, 0, 0);
      }
      break;
  }

  ctx.restore();
}

function drawFftCircular(
  ctx: CanvasRenderingContext2D,
  fftBins: Float32Array,
  options: WaveformEffectOptions,
  canvasW: number,
  canvasH: number,
  currentTimeSec: number,
  renderScale: number,
): void {
  const cx = (canvasW * options.xPercent) / 100;
  const cy = (canvasH * options.yPercent) / 100;
  const refSize = Math.min(canvasW, canvasH);
  const baseR = (refSize * options.widthPercent) / 100 / 2;
  const ampR = (refSize * options.heightPercent) / 100 / 2;
  if (fftBins.length < 1) return;

  const startAngleDeg =
    options.startAngle + options.rotationSpeed * currentTimeSec;
  const startAngleRad = (startAngleDeg * Math.PI) / 180;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = options.color;
  ctx.fillStyle = options.color;
  ctx.lineWidth = scaledStrokeWidthPx(options.strokeWidthPx, renderScale);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const pts = buildCircularFftPoints(fftBins, baseR, ampR, startAngleRad);
  const fftPosSamples = Float32Array.from(
    { length: fftBins.length },
    (_, i) => (i / Math.max(1, fftBins.length - 1)) * 2 - 1,
  );
  const baseHsl = hexToHsl(options.color);

  switch (options.fftShape) {
    case "barBottom":
      drawFftBarsCircular(
        ctx,
        fftBins,
        baseR,
        ampR,
        startAngleRad,
        options,
        renderScale,
        baseHsl,
        false,
      );
      break;
    case "barCenter":
      drawFftBarsCircular(
        ctx,
        fftBins,
        baseR,
        ampR,
        startAngleRad,
        options,
        renderScale,
        baseHsl,
        true,
      );
      break;
    case "gauge":
      drawFftGaugeCircular(
        ctx,
        fftBins,
        baseR,
        ampR,
        startAngleRad,
        options,
        renderScale,
        baseHsl,
      );
      break;
    case "circle":
      drawFftCirclesCircular(
        ctx,
        fftBins,
        baseR,
        ampR,
        startAngleRad,
        options,
        renderScale,
        baseHsl,
        false,
      );
      break;
    case "circleFill":
      drawFftCirclesCircular(
        ctx,
        fftBins,
        baseR,
        ampR,
        startAngleRad,
        options,
        renderScale,
        baseHsl,
        true,
      );
      break;
    case "polyline":
      if (options.colorMode === "solid") {
        drawPolyline(ctx, pts, true);
      } else {
        drawPolylineGradient(ctx, pts, fftPosSamples, options, true);
      }
      break;
    case "curve":
      if (options.colorMode === "solid") {
        drawCurveCircular(ctx, pts);
      } else {
        drawPolylineGradient(ctx, pts, fftPosSamples, options, true);
      }
      break;
    case "fill":
      if (options.colorMode === "solid") {
        drawFillCircular(ctx, pts, baseR);
      } else {
        drawFillGradient(ctx, pts, options, true, baseR, 0, startAngleRad);
      }
      break;
  }

  ctx.restore();
}

function buildHorizontalFftPoints(
  fftBins: Float32Array,
  halfW: number,
  halfH: number,
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const denom = Math.max(1, fftBins.length - 1);
  for (let i = 0; i < fftBins.length; i++) {
    pts.push({
      x: -halfW + (i / denom) * halfW * 2,
      y: -clamp01(fftBins[i]) * halfH,
    });
  }
  return pts;
}

function buildCircularFftPoints(
  fftBins: Float32Array,
  baseR: number,
  ampR: number,
  startAngleRad: number,
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < fftBins.length; i++) {
    const angle = startAngleRad + (i / fftBins.length) * 2 * Math.PI;
    const r = baseR + clamp01(fftBins[i]) * ampR;
    pts.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
  }
  return pts;
}

function drawFftBarsHorizontal(
  ctx: CanvasRenderingContext2D,
  fftBins: Float32Array,
  halfW: number,
  halfH: number,
  options: WaveformEffectOptions,
  renderScale: number,
  baseHsl: Hsl,
  centered: boolean,
): void {
  const fullW = halfW * 2;
  const bandW = fullW / fftBins.length;
  const barW = Math.max(1, bandW * 0.8);
  ctx.save();
  for (let i = 0; i < fftBins.length; i++) {
    const value = clamp01(fftBins[i]);
    const cx = -halfW + bandW * (i + 0.5);
    const h = Math.max(1, value * halfH);
    ctx.fillStyle = getFftBinColor(
      options,
      baseHsl,
      value,
      i,
      fftBins.length,
      false,
    );
    if (centered) {
      ctx.fillRect(cx - barW / 2, -h / 2, barW, h);
    } else {
      ctx.fillRect(cx - barW / 2, -h, barW, h);
    }
  }
  ctx.restore();
}

function drawFftBarsCircular(
  ctx: CanvasRenderingContext2D,
  fftBins: Float32Array,
  baseR: number,
  ampR: number,
  startAngleRad: number,
  options: WaveformEffectOptions,
  renderScale: number,
  baseHsl: Hsl,
  centered: boolean,
): void {
  const slotAngle = (2 * Math.PI) / fftBins.length;
  const circumference = 2 * Math.PI * Math.max(baseR, 1);
  const slot = circumference / fftBins.length;
  const barAngle = slotAngle * 0.8;
  ctx.save();
  for (let i = 0; i < fftBins.length; i++) {
    const value = clamp01(fftBins[i]);
    const angle = startAngleRad + (i / fftBins.length) * 2 * Math.PI;
    const radial = Math.max(1, value * ampR);
    const inner = centered ? Math.max(0, baseR - radial / 2) : baseR;
    const outer = centered ? baseR + radial / 2 : baseR + radial;
    ctx.fillStyle = getFftBinColor(
      options,
      baseHsl,
      value,
      i,
      fftBins.length,
      true,
    );
    // 矩形バーを扇形ではなく直線セグメントとして描画（角ばった外観）
    ctx.save();
    ctx.rotate(angle);
    const halfW = Math.min(slot * 0.4, Math.max(1, (inner * barAngle) / 2));
    ctx.fillRect(-halfW, inner, halfW * 2, radial);
    ctx.restore();
  }
  ctx.restore();
}

function drawFftGaugeHorizontal(
  ctx: CanvasRenderingContext2D,
  fftBins: Float32Array,
  halfW: number,
  halfH: number,
  options: WaveformEffectOptions,
  renderScale: number,
  baseHsl: Hsl,
): void {
  const fullW = halfW * 2;
  const bandW = fullW / fftBins.length;
  const gap = Math.max(1 * renderScale, 2 * renderScale);
  const maxSegments = Math.max(
    1,
    options.fftGaugeSegments > 0 ? options.fftGaugeSegments : 5,
  );

  // ゲージ全体の高さを maxSegments で分割
  const totalHeight = 2 * halfH;
  const segmentSizeBase =
    (totalHeight - gap * Math.max(0, maxSegments - 1)) / maxSegments;
  const segmentSize = Math.max(2 * renderScale, segmentSizeBase);

  // bar のみ minorSize（x方向の幅）、square/circle は segmentSize との小さい方を採用
  const minorSizeBar = Math.max(1 * renderScale, bandW * 0.6);
  const minorSizeSquareCircle = Math.min(bandW * 0.6, segmentSize);

  for (let i = 0; i < fftBins.length; i++) {
    const value = clamp01(fftBins[i]);
    const filledSegments = Math.max(0, Math.round(value * maxSegments));
    const x = -halfW + bandW * (i + 0.5);
    for (let s = 0; s < filledSegments; s++) {
      const segFrac = maxSegments > 1 ? s / (maxSegments - 1) : 1;
      ctx.fillStyle = getFftSegmentColor(
        options,
        baseHsl,
        segFrac,
        i,
        fftBins.length,
        false,
      );
      const minorSize =
        options.fftGaugeShape === "bar" ? minorSizeBar : minorSizeSquareCircle;
      const y = -(segmentSize / 2 + s * (segmentSize + gap));
      drawFftGaugeGlyph(
        ctx,
        options.fftGaugeShape,
        x,
        y,
        segmentSize,
        minorSize,
        0,
      );
    }
  }
}

function drawFftGaugeCircular(
  ctx: CanvasRenderingContext2D,
  fftBins: Float32Array,
  baseR: number,
  ampR: number,
  startAngleRad: number,
  options: WaveformEffectOptions,
  renderScale: number,
  baseHsl: Hsl,
): void {
  const gap = Math.max(1 * renderScale, 2 * renderScale);
  const maxSegments = Math.max(
    1,
    options.fftGaugeSegments > 0 ? options.fftGaugeSegments : 5,
  );

  // ゲージ全体の半径を maxSegments で分割
  const totalRadius = ampR;
  const segmentSizeBase =
    (totalRadius - gap * Math.max(0, maxSegments - 1)) / maxSegments;
  const segmentSize = Math.max(2 * renderScale, segmentSizeBase);

  // 円周上のスロット幅
  const circumference = 2 * Math.PI * Math.max(baseR, 1);
  const slotWidth = circumference / fftBins.length;

  // bar のみ minorSize（角度方向の幅）
  // square/circle は slotWidth との小さい方を採用
  const minorSizeBar = Math.max(1 * renderScale, slotWidth * 0.5);
  const minorSizeSquareCircle = Math.min(slotWidth * 0.5, segmentSize);

  for (let i = 0; i < fftBins.length; i++) {
    const value = clamp01(fftBins[i]);
    const filledSegments = Math.max(0, Math.round(value * maxSegments));
    const angle = startAngleRad + (i / fftBins.length) * 2 * Math.PI;
    for (let s = 0; s < filledSegments; s++) {
      const segFrac = maxSegments > 1 ? s / (maxSegments - 1) : 1;
      ctx.fillStyle = getFftSegmentColor(
        options,
        baseHsl,
        segFrac,
        i,
        fftBins.length,
        true,
      );
      const minorSize =
        options.fftGaugeShape === "bar" ? minorSizeBar : minorSizeSquareCircle;
      const r = baseR + segmentSize / 2 + s * (segmentSize + gap);
      drawFftGaugeGlyph(
        ctx,
        options.fftGaugeShape,
        Math.cos(angle) * r,
        Math.sin(angle) * r,
        segmentSize,
        minorSize,
        angle - Math.PI / 2,
      );
    }
  }
}

function drawFftGaugeGlyph(
  ctx: CanvasRenderingContext2D,
  shape: WaveformFftGaugeShape,
  x: number,
  y: number,
  size: number,
  minorSize: number,
  rotation: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  switch (shape) {
    case "bar":
      ctx.fillRect(-minorSize / 2, -size / 2, minorSize, size);
      break;
    case "square":
      ctx.fillRect(-size / 2, -size / 2, size, size);
      break;
    case "circle":
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
      ctx.fill();
      break;
  }
  ctx.restore();
}

function drawFftCirclesHorizontal(
  ctx: CanvasRenderingContext2D,
  fftBins: Float32Array,
  halfW: number,
  halfH: number,
  options: WaveformEffectOptions,
  renderScale: number,
  baseHsl: Hsl,
  filled: boolean,
): void {
  const fullW = halfW * 2;
  const bandW = fullW / fftBins.length;
  ctx.save();
  ctx.lineWidth = scaledStrokeWidthPx(options.strokeWidthPx, renderScale);
  for (let i = 0; i < fftBins.length; i++) {
    const value = clamp01(fftBins[i]);
    const x = -halfW + bandW * (i + 0.5);
    const radius = Math.max(renderScale, value * halfH * 0.35);
    const color = getFftBinColor(
      options,
      baseHsl,
      value,
      i,
      fftBins.length,
      false,
    );
    ctx.beginPath();
    ctx.arc(x, 0, radius, 0, 2 * Math.PI);
    if (filled) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawFftCirclesCircular(
  ctx: CanvasRenderingContext2D,
  fftBins: Float32Array,
  baseR: number,
  ampR: number,
  startAngleRad: number,
  options: WaveformEffectOptions,
  renderScale: number,
  baseHsl: Hsl,
  filled: boolean,
): void {
  ctx.save();
  ctx.lineWidth = scaledStrokeWidthPx(options.strokeWidthPx, renderScale);
  for (let i = 0; i < fftBins.length; i++) {
    const value = clamp01(fftBins[i]);
    const angle = startAngleRad + (i / fftBins.length) * 2 * Math.PI;
    const x = Math.cos(angle) * baseR;
    const y = Math.sin(angle) * baseR;
    const radius = Math.max(renderScale, value * ampR * 0.35);
    const color = getFftBinColor(
      options,
      baseHsl,
      value,
      i,
      fftBins.length,
      true,
    );
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    if (filled) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  }
  ctx.restore();
}

function getFftBinColor(
  options: WaveformEffectOptions,
  baseHsl: Hsl,
  value: number,
  index: number,
  total: number,
  close: boolean,
): string {
  const tH = normalizedHorizontal(index, total, close);
  // hueHorizontal ではバンド位置のみで色相を決定（振幅に依存しない）
  const sample =
    options.colorMode === "hueHorizontal" ? 0 : fftValueToSigned(value);
  return sampleColorToCss(options.colorMode, baseHsl, sample, tH);
}

/**
 * ゲージセグメント用: segFrac(0=底/1=頂点)ベースで色を決定。
 * hueHorizontal ではバンド位置のみで色を決定（全セグメント同色）。
 */
function getFftSegmentColor(
  options: WaveformEffectOptions,
  baseHsl: Hsl,
  segFrac: number,
  index: number,
  total: number,
  close: boolean,
): string {
  const tH = normalizedHorizontal(index, total, close);
  // hueHorizontal: バンド固有の色（強さ無関係）
  const sample = options.colorMode === "hueHorizontal" ? 0 : segFrac * 2 - 1;
  return sampleColorToCss(options.colorMode, baseHsl, sample, tH);
}

function fftValueToSigned(value: number): number {
  return clamp01(value) * 2 - 1;
}

// ---------------------------------------------------------------------------
// 描画プリミティブ
// ---------------------------------------------------------------------------

function drawPolyline(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  close: boolean,
): void {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  if (close) ctx.closePath();
  ctx.stroke();
}

/** 二次ベジェによる補間曲線（通常型） */
function drawCurve(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
): void {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
  }
  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
  ctx.stroke();
}

/** 二次ベジェによる補間曲線（円形型・閉じた曲線）*/
function drawCurveCircular(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
): void {
  if (pts.length < 2) return;
  ctx.beginPath();
  const mid0x = (pts[pts.length - 1].x + pts[0].x) / 2;
  const mid0y = (pts[pts.length - 1].y + pts[0].y) / 2;
  ctx.moveTo(mid0x, mid0y);
  for (let i = 0; i < pts.length; i++) {
    const next = pts[(i + 1) % pts.length];
    const mx = (pts[i].x + next.x) / 2;
    const my = (pts[i].y + next.y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
  }
  ctx.closePath();
  ctx.stroke();
}

/** 塗りつぶし（通常型: ゼロライン基準で閉じる）*/
function drawFill(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
): void {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, 0);
  for (const p of pts) {
    ctx.lineTo(p.x, p.y);
  }
  ctx.lineTo(pts[pts.length - 1].x, 0);
  ctx.closePath();
  ctx.fill();
}

/** 塗りつぶし（円形型: 波形外縁 evenodd で基底円を抜く）*/
function drawFillCircular(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  baseR = 0,
): void {
  if (pts.length < 2) return;
  ctx.beginPath();
  // 外側パス: 波形ポイントを時計回りに閉じる
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.closePath();
  // 内側パス: 基底円を反時計回りに追加 → evenodd で抜き穴になる
  if (baseR > 0) {
    ctx.arc(0, 0, baseR, 0, 2 * Math.PI, true);
  }
  ctx.fill("evenodd");
}

/** 点列 */
function drawDots(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  samples: Float32Array,
  options: WaveformEffectOptions,
  renderScale: number,
  close: boolean,
): void {
  if (pts.length < 2) return;
  const size = scaledStrokeWidthPx(options.strokeWidthPx, renderScale);
  const baseHsl = hexToHsl(options.color);

  // 点の形よりも「途切れた線」に見えることを優先し、
  // 短い線分を間引いて描く。
  ctx.save();
  ctx.lineWidth = size;
  ctx.lineCap = "round";
  const stride = 2;
  for (let i = 0; i < pts.length - 1; i += stride) {
    const p0 = pts[i];
    const p1 = pts[i + 1] ?? p0;
    const sample = samples[Math.min(i, samples.length - 1)] ?? 0;
    ctx.strokeStyle = sampleColorToCss(
      options.colorMode,
      baseHsl,
      sample,
      normalizedHorizontal(i, pts.length, close),
    );
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy);
    if (len <= 0.0001) continue;
    const segLen = Math.min(size, len);
    const ux = dx / len;
    const uy = dy / len;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p0.x + ux * segLen, p0.y + uy * segLen);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPolylineGradient(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  samples: Float32Array,
  options: WaveformEffectOptions,
  close: boolean,
): void {
  if (pts.length < 2) return;
  const baseHsl = hexToHsl(options.color);
  const segCount = close ? pts.length : pts.length - 1;
  for (let i = 0; i < segCount; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % pts.length];
    const sample = samples[Math.min(i, samples.length - 1)] ?? 0;
    ctx.strokeStyle = sampleColorToCss(
      options.colorMode,
      baseHsl,
      sample,
      normalizedHorizontal(i, pts.length, close),
    );
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }
}

function drawFillGradient(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  options: WaveformEffectOptions,
  isCircular = false,
  baseR = 0,
  halfH = 0,
  startAngleRad = 0,
): void {
  if (pts.length < 2) return;
  const baseHsl = hexToHsl(options.color);
  let minX = Infinity;
  let maxX = -Infinity;
  let ptsMinY = Infinity;
  let ptsMaxY = -Infinity;
  let maxR = 0;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < ptsMinY) ptsMinY = p.y;
    if (p.y > ptsMaxY) ptsMaxY = p.y;
    const r = Math.hypot(p.x, p.y);
    if (r > maxR) maxR = r;
  }

  // 非円形 fill は y=0 ベースラインを常にグラデーション中央に置く。
  // pts の y 範囲のみを使うと、信号が片側に偏ったときベースライン付近が
  // グラデーション外に出て暗色へ張り付く。
  const gradBottom = halfH > 0 ? halfH : ptsMaxY;
  const gradTop = halfH > 0 ? -halfH : ptsMinY;

  // 円形 hueHorizontal はコニックグラデーション（周波数=角度に沿って色相変化）
  // 円形 hueVertical は放射状グラデーション（半径方向に色相変化）
  // 通常は線形グラデーション
  const isConicHue = isCircular && options.colorMode === "hueHorizontal";
  const grad: CanvasGradient = isConicHue
    ? (
        ctx as CanvasRenderingContext2D & {
          createConicGradient(
            startAngle: number,
            x: number,
            y: number,
          ): CanvasGradient;
        }
      ).createConicGradient(startAngleRad, 0, 0)
    : isCircular
      ? ctx.createRadialGradient(0, 0, baseR, 0, 0, maxR || 1)
      : options.colorMode === "hueHorizontal"
        ? ctx.createLinearGradient(minX, 0, maxX, 0)
        : ctx.createLinearGradient(0, gradBottom, 0, gradTop);

  if (
    options.colorMode === "hueVertical" ||
    options.colorMode === "hueHorizontal"
  ) {
    // baseHsl.h を起点（低周波数）としてスペクトル順に色相を展開
    const h0 = baseHsl.h;
    grad.addColorStop(0, hslToCss(h0, baseHsl.s, baseHsl.l));
    grad.addColorStop(0.17, hslToCss(h0 + 60, baseHsl.s, baseHsl.l));
    grad.addColorStop(0.33, hslToCss(h0 + 120, baseHsl.s, baseHsl.l));
    grad.addColorStop(0.5, hslToCss(h0 + 180, baseHsl.s, baseHsl.l));
    grad.addColorStop(0.67, hslToCss(h0 + 240, baseHsl.s, baseHsl.l));
    grad.addColorStop(0.83, hslToCss(h0 + 300, baseHsl.s, baseHsl.l));
    grad.addColorStop(1, hslToCss(h0 + 360, baseHsl.s, baseHsl.l));
  } else if (options.colorMode === "lightness") {
    const l0 = Math.round(baseHsl.l * 0.5);
    const l1 = Math.min(100, baseHsl.l * 2);
    grad.addColorStop(0, hslToCss(baseHsl.h, baseHsl.s, l0));
    grad.addColorStop(0.5, hslToCss(baseHsl.h, baseHsl.s, baseHsl.l));
    grad.addColorStop(1, hslToCss(baseHsl.h, baseHsl.s, l1));
  } else if (options.colorMode === "saturation") {
    const s0 = Math.round(baseHsl.s * 0.5);
    const s1 = Math.min(100, baseHsl.s * 2);
    grad.addColorStop(0, hslToCss(baseHsl.h, s0, baseHsl.l));
    grad.addColorStop(0.5, hslToCss(baseHsl.h, baseHsl.s, baseHsl.l));
    grad.addColorStop(1, hslToCss(baseHsl.h, s1, baseHsl.l));
  }

  ctx.save();
  ctx.fillStyle = grad;
  if (isCircular) {
    drawFillCircular(ctx, pts, baseR);
  } else {
    drawFill(ctx, pts);
  }
  ctx.restore();
}

function clampPx(v: number): number {
  return Math.max(1, Math.min(4, v));
}

function scaledStrokeWidthPx(
  strokeWidthPx: number,
  renderScale: number,
): number {
  return Math.max(0.25, clampPx(strokeWidthPx) * renderScale);
}

function normalizedHorizontal(
  index: number,
  total: number,
  close: boolean,
): number {
  const denom = close ? total : Math.max(1, total - 1);
  return (((index % denom) + denom) % denom) / denom;
}

type Hsl = { h: number; s: number; l: number };

function sampleColorToCss(
  mode: WaveformColorMode,
  base: Hsl,
  sample: number,
  tHorizontal: number,
): string {
  const s = clampSigned(sample);
  if (mode === "solid") return hslToCss(base.h, base.s, base.l);
  if (mode === "lightness") {
    const l = lerp(10, 90, (s + 1) / 2);
    return hslToCss(base.h, base.s, l);
  }
  if (mode === "saturation") {
    const sat0 = Math.round(base.s * 0.5);
    const sat1 = Math.min(100, base.s * 2);
    const sat = lerp(sat0, sat1, (s + 1) / 2);
    return hslToCss(base.h, sat, base.l);
  }
  if (mode === "hueVertical") {
    return hslToCss(((s + 1) * 180) % 360, base.s, base.l);
  }
  return hslToCss((tHorizontal * 360) % 360, base.s, base.l);
}

function hexToHsl(hex: string): Hsl {
  const clean = hex.replace("#", "");
  const valid = /^[0-9a-fA-F]{6}$/.test(clean) ? clean : "000000";
  const r = parseInt(valid.slice(0, 2), 16) / 255;
  const g = parseInt(valid.slice(2, 4), 16) / 255;
  const b = parseInt(valid.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const sat = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h, s: sat * 100, l: l * 100 };
}

function hslToCss(h: number, s: number, l: number): string {
  return `hsl(${wrap360(h).toFixed(1)} ${clamp01(s / 100) * 100}% ${clamp01(l / 100) * 100}%)`;
}

function wrap360(v: number): number {
  return ((v % 360) + 360) % 360;
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function clampSigned(v: number): number {
  return Math.min(1, Math.max(-1, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ---------------------------------------------------------------------------
// FFT アイコングリッド描画
// ---------------------------------------------------------------------------

/** 正規化パワー・バンド情報から色とグロウ量を計算する（アイコングリッド専用）*/
function computeFftIconVisual(
  mode: WaveformFftIconStrengthMode,
  baseHsl: Hsl,
  normalizedPower: number,
  bandIndex: number,
  totalBands: number,
  renderScale: number,
): { color: string; glowPx: number } {
  const p = clamp01(normalizedPower);
  switch (mode) {
    case "glow":
      return {
        color: hslToCss(baseHsl.h, baseHsl.s, baseHsl.l),
        glowPx: p * 20 * renderScale,
      };
    case "lightness": {
      const l = lerp(20, 90, p);
      return { color: hslToCss(baseHsl.h, baseHsl.s, l), glowPx: 0 };
    }
    case "saturation": {
      const s = lerp(0, 100, p);
      return { color: hslToCss(baseHsl.h, s, baseHsl.l), glowPx: 0 };
    }
    case "hue-by-power": {
      // blue(240°) → green(120°) → red(0°)
      const hue = lerp(240, 0, p);
      return { color: hslToCss(hue, baseHsl.s, baseHsl.l), glowPx: 0 };
    }
    case "band-hue-glow": {
      const hue = baseHsl.h + (bandIndex / Math.max(1, totalBands)) * 360;
      return {
        color: hslToCss(hue, baseHsl.s, baseHsl.l),
        glowPx: p * 20 * renderScale,
      };
    }
  }
}

/**
 * (0,0) 中心・半径 r のグリフパスを描画する（fill/stroke は呼び出し元で行う）。
 * ctx.beginPath() は内部で呼ぶ。
 */
function drawFftIconGlyph(
  ctx: CanvasRenderingContext2D,
  shape: WaveformFftIconShape,
  r: number,
): void {
  ctx.beginPath();
  switch (shape) {
    case "circle":
      ctx.arc(0, 0, r, 0, 2 * Math.PI);
      break;
    case "square":
      ctx.rect(-r, -r, r * 2, r * 2);
      break;
    case "diamond":
      ctx.moveTo(0, -r);
      ctx.lineTo(r, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r, 0);
      ctx.closePath();
      break;
    case "triangle": {
      // 重心中心の正三角形（外接円半径 r）
      const hx = (r * Math.sqrt(3)) / 2;
      ctx.moveTo(0, -r);
      ctx.lineTo(hx, r * 0.5);
      ctx.lineTo(-hx, r * 0.5);
      ctx.closePath();
      break;
    }
    case "star": {
      const innerR = r * 0.4;
      const pts = 5;
      for (let i = 0; i < pts * 2; i++) {
        const angle = (i * Math.PI) / pts - Math.PI / 2;
        const rr = i % 2 === 0 ? r : innerR;
        if (i === 0) ctx.moveTo(Math.cos(angle) * rr, Math.sin(angle) * rr);
        else ctx.lineTo(Math.cos(angle) * rr, Math.sin(angle) * rr);
      }
      ctx.closePath();
      break;
    }
    case "heart": {
      // ハート形: 上部ふくらみ→底端
      const top = -r * 0.3;
      const tip = r;
      const hw = r * 0.95;
      const hh = r * 0.6;
      ctx.moveTo(0, top);
      ctx.bezierCurveTo(-hw, top - hh, -hw * 1.1, tip * 0.2, 0, tip);
      ctx.bezierCurveTo(hw * 1.1, tip * 0.2, hw, top - hh, 0, top);
      ctx.closePath();
      break;
    }
    case "teardrop": {
      // 雫型: 先端が上、丸みが下
      const topPt = -r;
      const botR = r * 0.55;
      ctx.arc(0, r - botR, botR, 0, 2 * Math.PI);
      ctx.moveTo(-botR * 0.55, r - botR * 0.4);
      ctx.quadraticCurveTo(-r * 0.35, -r * 0.3, 0, topPt);
      ctx.quadraticCurveTo(r * 0.35, -r * 0.3, botR * 0.55, r - botR * 0.4);
      ctx.closePath();
      break;
    }
  }
}

/** 単一グリフを指定座標に描画する */
function drawFftIconAt(
  ctx: CanvasRenderingContext2D,
  shape: WaveformFftIconShape,
  cx: number,
  cy: number,
  r: number,
  color: string,
  glowPx: number,
): void {
  if (r <= 0) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  if (glowPx > 0) {
    ctx.shadowBlur = glowPx;
    ctx.shadowColor = color;
  }
  drawFftIconGlyph(ctx, shape, r);
  ctx.fill();
  ctx.restore();
}

/** FFT アイコングリッド: 横一列 */
function drawFftIconHorizontal(
  ctx: CanvasRenderingContext2D,
  fftBins: Float32Array,
  options: WaveformEffectOptions,
  canvasW: number,
  canvasH: number,
  renderScale: number,
): void {
  const N = fftBins.length;
  if (N === 0) return;
  const cx = (canvasW * options.xPercent) / 100;
  const cy = (canvasH * options.yPercent) / 100;
  const totalW = (canvasW * options.widthPercent) / 100;
  const spacing = totalW / N;
  const maxR = spacing * 0.5;
  const r = maxR * clamp01(options.fftIconSizePercent / 100);
  const baseHsl = hexToHsl(options.color);
  const shape = options.fftIconShape;
  const mode = options.fftIconStrengthMode;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((options.rotation * Math.PI) / 180);
  for (let i = 0; i < N; i++) {
    const iconCx = (i + 0.5) * spacing - totalW / 2;
    const visual = computeFftIconVisual(
      mode,
      baseHsl,
      clamp01(fftBins[i]),
      i,
      N,
      renderScale,
    );
    drawFftIconAt(ctx, shape, iconCx, 0, r, visual.color, visual.glowPx);
  }
  ctx.restore();
}

/** FFT アイコングリッド: 縦一列 */
function drawFftIconVertical(
  ctx: CanvasRenderingContext2D,
  fftBins: Float32Array,
  options: WaveformEffectOptions,
  canvasW: number,
  canvasH: number,
  renderScale: number,
): void {
  const N = fftBins.length;
  if (N === 0) return;
  const cx = (canvasW * options.xPercent) / 100;
  const cy = (canvasH * options.yPercent) / 100;
  const totalH = (canvasH * options.heightPercent) / 100;
  const spacing = totalH / N;
  const maxR = spacing * 0.5;
  const r = maxR * clamp01(options.fftIconSizePercent / 100);
  const baseHsl = hexToHsl(options.color);
  const shape = options.fftIconShape;
  const mode = options.fftIconStrengthMode;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((options.rotation * Math.PI) / 180);
  for (let i = 0; i < N; i++) {
    const iconCy = (i + 0.5) * spacing - totalH / 2;
    const visual = computeFftIconVisual(
      mode,
      baseHsl,
      clamp01(fftBins[i]),
      i,
      N,
      renderScale,
    );
    drawFftIconAt(ctx, shape, 0, iconCy, r, visual.color, visual.glowPx);
  }
  ctx.restore();
}

/**
 * FFT アイコングリッド: 横ミラー（上辺・下辺に一列ずつ）
 * rotation は無視する。
 * widthPercent: 列の全幅（キャンバス幅基準 %）
 * yPercent: 上行のY位置（キャンバス高さ基準 %）。下行は canvasH - topY に対称配置。
 */
function drawFftIconHorizontalMirror(
  ctx: CanvasRenderingContext2D,
  fftBins: Float32Array,
  options: WaveformEffectOptions,
  canvasW: number,
  canvasH: number,
  renderScale: number,
): void {
  const N = fftBins.length;
  if (N === 0) return;
  const totalW = (canvasW * options.widthPercent) / 100;
  const topY = (canvasH * options.yPercent) / 100;
  const bottomY = canvasH - topY;
  const startX = (canvasW - totalW) / 2;
  const spacing = totalW / N;
  const maxR = Math.min(spacing * 0.5, Math.max(1, topY * 0.8));
  const r = maxR * clamp01(options.fftIconSizePercent / 100);
  const baseHsl = hexToHsl(options.color);
  const shape = options.fftIconShape;
  const mode = options.fftIconStrengthMode;
  for (let i = 0; i < N; i++) {
    const iconX = startX + (i + 0.5) * spacing;
    const visual = computeFftIconVisual(
      mode,
      baseHsl,
      clamp01(fftBins[i]),
      i,
      N,
      renderScale,
    );
    drawFftIconAt(ctx, shape, iconX, topY, r, visual.color, visual.glowPx);
    drawFftIconAt(ctx, shape, iconX, bottomY, r, visual.color, visual.glowPx);
  }
}

/**
 * FFT アイコングリッド: 縦ミラー（左辺・右辺に一列ずつ）
 * rotation は無視する。
 * heightPercent: 列の全高さ（キャンバス高さ基準 %）
 * xPercent: 左列のX位置（キャンバス幅基準 %）。右列は canvasW - leftX に対称配置。
 */
function drawFftIconVerticalMirror(
  ctx: CanvasRenderingContext2D,
  fftBins: Float32Array,
  options: WaveformEffectOptions,
  canvasW: number,
  canvasH: number,
  renderScale: number,
): void {
  const N = fftBins.length;
  if (N === 0) return;
  const totalH = (canvasH * options.heightPercent) / 100;
  const leftX = (canvasW * options.xPercent) / 100;
  const rightX = canvasW - leftX;
  const startY = (canvasH - totalH) / 2;
  const spacing = totalH / N;
  const maxR = Math.min(spacing * 0.5, Math.max(1, leftX * 0.8));
  const r = maxR * clamp01(options.fftIconSizePercent / 100);
  const baseHsl = hexToHsl(options.color);
  const shape = options.fftIconShape;
  const mode = options.fftIconStrengthMode;
  for (let i = 0; i < N; i++) {
    const iconY = startY + (i + 0.5) * spacing;
    const visual = computeFftIconVisual(
      mode,
      baseHsl,
      clamp01(fftBins[i]),
      i,
      N,
      renderScale,
    );
    drawFftIconAt(ctx, shape, leftX, iconY, r, visual.color, visual.glowPx);
    drawFftIconAt(ctx, shape, rightX, iconY, r, visual.color, visual.glowPx);
  }
}

/** FFT アイコングリッド: 円形配置 */
function drawFftIconCircular(
  ctx: CanvasRenderingContext2D,
  fftBins: Float32Array,
  options: WaveformEffectOptions,
  canvasW: number,
  canvasH: number,
  currentTimeSec: number,
  renderScale: number,
): void {
  const N = fftBins.length;
  if (N === 0) return;
  const cx = (canvasW * options.xPercent) / 100;
  const cy = (canvasH * options.yPercent) / 100;
  const R = (Math.min(canvasW, canvasH) / 2) * (options.widthPercent / 100);
  const anglePerBin = (2 * Math.PI) / N;
  const arcHalfChord = R * Math.sin(anglePerBin / 2);
  const maxR = Math.min(
    arcHalfChord * 0.9,
    (canvasH * options.heightPercent) / 100 / 4,
  );
  const r = maxR * clamp01(options.fftIconSizePercent / 100);
  const baseOffsetRad =
    (options.startAngle * Math.PI) / 180 +
    (options.rotationSpeed * currentTimeSec * Math.PI) / 180 +
    (options.rotation * Math.PI) / 180;
  const baseHsl = hexToHsl(options.color);
  const shape = options.fftIconShape;
  const mode = options.fftIconStrengthMode;
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < N; i++) {
    const angle = baseOffsetRad + i * anglePerBin;
    const iconCx = R * Math.cos(angle);
    const iconCy = R * Math.sin(angle);
    const visual = computeFftIconVisual(
      mode,
      baseHsl,
      clamp01(fftBins[i]),
      i,
      N,
      renderScale,
    );
    drawFftIconAt(ctx, shape, iconCx, iconCy, r, visual.color, visual.glowPx);
  }
  ctx.restore();
}

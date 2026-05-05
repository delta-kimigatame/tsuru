/**
 * 音声波形エフェクト描画ユーティリティ
 *
 * - 入力: モノラル Float32 サンプル列 ([-1, 1])
 * - 描画方式: オシロスコープ型 / オシロスコープ円形型
 * - 描画メソッド: 折れ線 / 補間曲線 / 塗りつぶし / 点列
 */

export type WaveformType = "oscilloscope" | "oscilloscope-circular";
export type WaveformDrawMethod = "polyline" | "curve" | "fill" | "dots";
export type WaveformColorMode =
  | "solid"
  | "lightness"
  | "saturation"
  | "hueVertical"
  | "hueHorizontal";

export const WAVEFORM_TYPES: WaveformType[] = [
  "oscilloscope",
  "oscilloscope-circular",
];
export const WAVEFORM_DRAW_METHODS: WaveformDrawMethod[] = [
  "polyline",
  "curve",
  "fill",
  "dots",
];
export const WAVEFORM_COLOR_MODES: WaveformColorMode[] = [
  "solid",
  "lightness",
  "saturation",
  "hueVertical",
  "hueHorizontal",
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
// サイン波生成（プレビュー用）
// ---------------------------------------------------------------------------

/** 440Hz 正弦波 Float32 サンプル列を生成する（プレビューアニメーション用）*/
export function generateSineWave(
  hz: number,
  durationSec: number,
  sampleRate: number,
): Float32Array {
  const len = Math.ceil(durationSec * sampleRate);
  const out = new Float32Array(len);
  const angFreq = (2 * Math.PI * hz) / sampleRate;
  for (let i = 0; i < len; i++) {
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
): void {
  if (!options.enabled) return;

  const samples = monoSamples
    ? extractWindowSamples(
        monoSamples,
        currentTimeSec,
        sampleRate,
        options.windowSize,
      )
    : new Float32Array(options.windowSize); // ゼロ配列 = 無音（フラットライン）

  ctx.save();
  ctx.globalAlpha = options.opacity / 100;

  if (options.type === "oscilloscope") {
    drawOscilloscope(ctx, samples, options, canvasW, canvasH, renderScale);
  } else {
    drawOscilloscopeCircular(
      ctx,
      samples,
      options,
      canvasW,
      canvasH,
      currentTimeSec,
      renderScale,
    );
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

  // 円形モードは放射状グラデーション(基底円縁→波形外縁)、通常は線形グラデーション
  const grad: CanvasGradient = isCircular
    ? ctx.createRadialGradient(0, 0, baseR, 0, 0, maxR || 1)
    : options.colorMode === "hueHorizontal"
      ? ctx.createLinearGradient(minX, 0, maxX, 0)
      : ctx.createLinearGradient(0, gradBottom, 0, gradTop);

  if (
    options.colorMode === "hueVertical" ||
    options.colorMode === "hueHorizontal"
  ) {
    grad.addColorStop(0, hslToCss(0, baseHsl.s, baseHsl.l));
    grad.addColorStop(0.17, hslToCss(60, baseHsl.s, baseHsl.l));
    grad.addColorStop(0.33, hslToCss(120, baseHsl.s, baseHsl.l));
    grad.addColorStop(0.5, hslToCss(180, baseHsl.s, baseHsl.l));
    grad.addColorStop(0.67, hslToCss(240, baseHsl.s, baseHsl.l));
    grad.addColorStop(0.83, hslToCss(300, baseHsl.s, baseHsl.l));
    grad.addColorStop(1, hslToCss(360, baseHsl.s, baseHsl.l));
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

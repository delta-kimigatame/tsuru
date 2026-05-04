/**
 * 音声波形エフェクト描画ユーティリティ
 *
 * - 入力: モノラル Float32 サンプル列 ([-1, 1])
 * - 描画方式: オシロスコープ型 / オシロスコープ円形型
 * - 描画メソッド: 折れ線 / 補間曲線 / 塗りつぶし / 点列
 */

export type WaveformType = "oscilloscope" | "oscilloscope-circular";
export type WaveformDrawMethod = "polyline" | "curve" | "fill" | "dots";

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

export interface WaveformEffectOptions {
  enabled: boolean;
  type: WaveformType;
  drawMethod: WaveformDrawMethod;
  /** 描画色 "#rrggbb" */
  color: string;
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
    drawOscilloscope(ctx, samples, options, canvasW, canvasH);
  } else {
    drawOscilloscopeCircular(
      ctx,
      samples,
      options,
      canvasW,
      canvasH,
      currentTimeSec,
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
  ctx.lineWidth = Math.max(1, canvasH * 0.003);
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
      drawPolyline(ctx, pts, false);
      break;
    case "curve":
      drawCurve(ctx, pts);
      break;
    case "fill":
      drawFill(ctx, pts);
      break;
    case "dots":
      drawDots(ctx, pts, canvasH);
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
  ctx.lineWidth = Math.max(1, refSize * 0.003);
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
      drawPolyline(ctx, pts, true);
      break;
    case "curve":
      drawCurveCircular(ctx, pts);
      break;
    case "fill":
      drawFillCircular(ctx, pts);
      break;
    case "dots":
      drawDots(ctx, pts, refSize);
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

/** 塗りつぶし（円形型: 閉じたポリゴン）*/
function drawFillCircular(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
): void {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.closePath();
  ctx.fill();
}

/** 点列 */
function drawDots(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  refSize: number,
): void {
  const r = Math.max(1, refSize * 0.004);
  for (const p of pts) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

import { registerAacEncoder } from "@mediabunny/aac-encoder";
import {
  AudioBufferSource,
  BufferTarget,
  CanvasSource,
  getFirstEncodableAudioCodec,
  getFirstEncodableVideoCodec,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
  type AudioCodec,
  type VideoCodec,
} from "mediabunny";
import type { Note } from "../lib/Note";

/** 動画の解像度オプション。"image" は読み込んだ画像サイズに合わせる */
export type VideoResolution = "1920x1080" | "1080x1920" | "image";
export const VIDEO_RESOLUTIONS: VideoResolution[] = [
  "1920x1080",
  "1080x1920",
  "image",
];

/**
 * 固定解像度モード時の余白（パディング）の埋め方
 *
 * color … ダイアログで選択した背景色で塗りつぶす
 * image … 同一画像を cover スケールで拡大して背景に敷く（現在のデフォルト動作）
 * blur  … image と同様だが背景にぼかしフィルターを適用する
 */
export type BgPaddingMode = "color" | "image" | "blur";
export const BG_PADDING_MODES: BgPaddingMode[] = ["color", "image", "blur"];

/** スライドイン/アウトの移動方向 */
export type SlideDirection = "up" | "down" | "left" | "right";

/**
 * 動画キャンバスに重ねる立絵の設定
 *
 * サイズ基準はエディタと同じアルゴリズム:
 *   横幅 50%・縦幅 min(キャンバス縦幔50%, naturalHeight) の枚内に contain 配置
 * scalePercent == 100 … 上記アルゴリズムが決定するデフォルトサイズ
 * scalePercent > 100 … 拡大（自然サイズ = scalePercent上限）
 */
export interface PortraitOptions {
  blob: Blob;
  /** vb.portraitHeight 。縦幔50%と一緒に contain 素材が大きすぎるときに䰊渟する */
  naturalHeight: number;
  /** 0–100 */
  opacity: number;
  /** 100 = エディタ表示サイズ。自然サイズが上限 */
  scalePercent: number;
  /**
   * X オフセット（描画幅基準の %）
   * 0  … デフォルト（画像右端をキャンバス右端に揃える）
   * 100 … 画像左端がキャンバス右端に一致（画像が右外へ）
   * 負値 … 画像をキャンバス内左方向へ移動
   */
  xOffset: number;
  /**
   * Y オフセット（描画高さ基準の %）
   * 0   … デフォルト（画像下端をキャンバス下端に揃える）
   * 100  … 画像が下方向に1枚分ずれる（下外へ）
   * 負値 … 画像を上方向へ移動
   */
  yOffset: number;
}

/**
 * Canvas テキスト描画に使用するフォントファミリースタック。
 * system-ui を先頭に Windows CJK フォールバックを明示する。
 * - 'Yu Gothic UI'   … Windows 日本語
 * - 'Microsoft YaHei' … Windows 中国語
 * - macOS/iOS は system-ui が Hiragino Sans を選択する
 * - Android は system-ui が Noto Sans を選択する
 */
export const FONT_STACK =
  "system-ui, -apple-system, 'Segoe UI', 'Hiragino Sans', 'Yu Gothic UI', 'Microsoft YaHei', sans-serif";

export type FontWeight = "normal" | "bold";
export type FontStyle = "normal" | "italic";
export type TextAlign = "left" | "center" | "right";

/** 動画キャンバスに重ねるテキストオーバーレイの設定 */
export interface TextOptions {
  text: string;
  /** フォントサイズ（px、出力解像度基準） */
  fontSize: number;
  fontWeight: FontWeight;
  fontStyle: FontStyle;
  /** テキストカラー "#rrggbb" */
  color: string;
  /** X 位置（キャンバス幅基準 %）。textAlign に応じて基準点が変わる */
  xPercent: number;
  /** Y 位置（キャンバス高さ基準 %）。テキスト高さの中央が基準点 */
  yPercent: number;
  textAlign: TextAlign;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  strokeEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  bgBarEnabled: boolean;
  bgBarColor: string;
  bgBarOpacity: number;
}

/**
 * 歌詞字幕の1フレーズ分のデータ
 *
 * startMs/endMs/noteBoundaries はすべて合成WAV内の時刻（ゼロ起点 ms）。
 * noteBoundaries[0] = startMs、noteBoundaries[length-1] = endMs。
 * 分割ポイント k（1 ≤ k ≤ length-2）で分割すると：
 *   前半: startMs〜noteBoundaries[k]、lyric.slice(0, k)
 *   後半: noteBoundaries[k]〜endMs、lyric.slice(k)
 */
export interface LyricsSegment {
  startMs: number;
  endMs: number;
  /** 編集可能な歌詞テキスト */
  lyric: string;
  /**
   * 元ノートの境界時刻（WAV相対ms）の配列。長さ = 元ノート数 + 1。
   * 分割UIのポイント選択に使用する。
   */
  noteBoundaries: number[];
}

/** 字幕全体の設定 */
export interface LyricsOptions {
  segments: LyricsSegment[];
  /** フォントサイズ（px、出力解像度基準）*/
  fontSize: number;
  /** テキストカラー "#rrggbb" */
  color: string;
  /** X 位置（キャンバス幅基準 %）。center 固定のため xPercent=50 */
  xPercent: number;
  /** Y 位置（キャンバス高さ基準 %） */
  yPercent: number;
  /** テキスト最大幅（キャンバス幅基準 %）。超過時にフォントサイズを自動縮小 */
  maxWidthPercent: number;
  // --- 文字装飾 ---
  shadowEnabled: boolean;
  /** シャドウ色 "#rrggbb" */
  shadowColor: string;
  /** シャドウぼかし半径 px（出力解像度基準）。offset = blur × 0.5 で固定 */
  shadowBlur: number;
  strokeEnabled: boolean;
  /** 縁取り色 "#rrggbb" */
  strokeColor: string;
  /** 縁取り太さ px（出力解像度基準） */
  strokeWidth: number;
  bgBarEnabled: boolean;
  /** 背景バー色 "#rrggbb" */
  bgBarColor: string;
  /** 背景バー不透明度 0–100 */
  bgBarOpacity: number;
  // --- フェード ---
  fadeEnabled: boolean;
  /** フェードイン/アウトの時間 ms */
  fadeDurationMs: number;
  // --- スケール ---
  scaleEnabled: boolean;
  /** 登場・退場時の初期スケール（%）。100 = 等倍 */
  scaleFrom: number;
  /** スケールアニメーションの時間 ms */
  scaleDurationMs: number;
  // --- スライド ---
  slideEnabled: boolean;
  /** 強調移動量 px（出力解像度基準）。正値 = 下から上へスライド */
  slideAmount: number;
  /** スライドアニメーションの時間 ms */
  slideDurationMs: number;
  // --- スライドイン/スライドアウト ---
  slideInEnabled: boolean;
  /** 入場方向（指定方向から画面内へ流入） */
  slideInDirection: SlideDirection;
  slideOutEnabled: boolean;
  /** 退場方向（画面外へ向かって流出） */
  slideOutDirection: SlideDirection;
  /** 入場・退場共通のアニメーション時間 ms */
  slideInOutDurationMs: number;
  // --- ブラーイン/ブラーアウト ---
  blurEnabled: boolean;
  /** 入場・退場時の最大ブラー半径 px（出力解像度基準） */
  blurAmount: number;
  /** ブラーアニメーションの時間 ms */
  blurDurationMs: number;
  // --- ワイプイン/ワイプアウト ---
  wipeInEnabled: boolean;
  /** 入場方向（その方向からワイプしながら出現） */
  wipeInDirection: SlideDirection;
  wipeOutEnabled: boolean;
  /** 退場方向（その方向へワイプしながら消える） */
  wipeOutDirection: SlideDirection;
  /** ワイプアニメーションの時間 ms */
  wipeDurationMs: number;
  // --- バウンスイン/バウンスアウト ---
  bounceInEnabled: boolean;
  /** 入場方向（その方向から彼んで登場） */
  bounceInDirection: SlideDirection;
  bounceOutEnabled: boolean;
  /** 退場方向（その方向へ彼ねて退場） */
  bounceOutDirection: SlideDirection;
  /** バウンスアニメーションの時間 ms */
  bounceInOutDurationMs: number;
  // --- スタガー ---
  staggerEnabled: boolean;
  /** 文字間スタガー間隔 ms。先頭文字はフレーズ開始と同時、末尾文字はフレーズ終了と同時に合わせる */
  staggerIntervalMs: number;
}

/**
 * notes[] と notesLeftMs[] から歌詞字幕セグメントを抽出する。
 *
 * @param notes 全ノートの配列
 * @param notesLeftMs 全ノートの開始時刻（WAV先頭からの絶対ms累積）
 * @param selectNotesIndex 合成対象ノートのインデックス列（空 = 全ノート）。
 *        非連続指定はスコープ外（正しい字幕を生成できない場合がある）。
 * @returns WAV相対ms（ゼロ起点）でタイミングを持つLyricsSegmentの配列
 */
export function extractLyricsSegments(
  notes: Note[],
  notesLeftMs: number[],
  selectNotesIndex: number[],
): LyricsSegment[] {
  if (notes.length === 0 || notesLeftMs.length === 0) return [];

  const minIndex =
    selectNotesIndex.length > 0 ? Math.min(...selectNotesIndex) : 0;
  const maxIndex =
    selectNotesIndex.length > 0
      ? Math.max(...selectNotesIndex)
      : notes.length - 1;

  // WAVのt=0に対応する絶対ms。合成対象ノート先頭の開始時刻。
  const offsetMs = notesLeftMs[minIndex] ?? 0;

  const targetNotes = notes.slice(minIndex, maxIndex + 1);
  const targetLeftMs = notesLeftMs.slice(minIndex, maxIndex + 1);

  const segments: LyricsSegment[] = [];
  let runStart: number | null = null;

  for (let i = 0; i <= targetNotes.length; i++) {
    const isRest = i === targetNotes.length || targetNotes[i].lyric === "R";

    if (!isRest && runStart === null) {
      runStart = i;
    } else if (isRest && runStart !== null) {
      const runEnd = i - 1;
      const startMs = targetLeftMs[runStart] - offsetMs;
      const endMs =
        targetLeftMs[runEnd] - offsetMs + targetNotes[runEnd].msLength;
      const lyric = targetNotes
        .slice(runStart, runEnd + 1)
        .map((n) => n.lyric)
        .join("");

      // noteBoundaries: [startMs, leftMs[runStart+1]-offsetMs, ..., endMs]
      const noteBoundaries: number[] = [];
      for (let k = runStart; k <= runEnd; k++) {
        noteBoundaries.push(targetLeftMs[k] - offsetMs);
      }
      noteBoundaries.push(endMs);

      segments.push({ startMs, endMs, lyric, noteBoundaries });
      runStart = null;
    }
  }

  return segments;
}

/** "image" モード時のキャンバス最大サイズ（FHD 上限） */
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

/**
 * ブラウザがエンコード可能な映像コーデックの優先順位
 *
 * avc (H.264) … iOS Safari・多くの Android に対応。ハードウェア依存で一部端末は非対応
 * vp9          … Android Chrome でハードウェアエンコーダーが利用可能な確実な選択肢
 * av1          … 最新端末向け
 * vp8          … 古い Chrome/Firefox の保険
 *
 * MP4コンテナは上記すべてに対応しているため、コンテナはMP4に固定する
 */
const VIDEO_CODEC_PRIORITY: VideoCodec[] = ["avc", "vp9", "av1", "vp8"];

/**
 * ブラウザがエンコード可能な音声コーデックの優先順位
 *
 * aac  … @mediabunny/aac-encoder polyfill で iOS を含む全環境に対応。再生互換性が最良
 * opus … WebCodecs ネイティブ対応で確実だが iOS Safari での再生は非対応
 */
const AUDIO_CODEC_PRIORITY: AudioCodec[] = ["aac", "opus"];

/** Canvas にテキストオーバーレイを描画する内部ヘルパー */
const drawTextOnCanvas = (
  ctx: CanvasRenderingContext2D,
  opts: TextOptions,
  cW: number,
  cH: number,
): void => {
  if (!opts.text.trim()) return;
  const x = (cW * opts.xPercent) / 100;
  const y = (cH * opts.yPercent) / 100;
  ctx.save();
  ctx.font = `${opts.fontStyle} ${opts.fontWeight} ${opts.fontSize}px ${FONT_STACK}`;
  ctx.textAlign = opts.textAlign;
  ctx.textBaseline = "middle";
  ctx.globalAlpha = 1;

  // 背景バー
  if (opts.bgBarEnabled) {
    const textW = ctx.measureText(opts.text).width;
    const padX = opts.fontSize * 0.5;
    const padY = opts.fontSize * 0.3;
    const barW = textW + padX * 2;
    const barH = opts.fontSize + padY * 2;
    const barX =
      opts.textAlign === "center"
        ? x - barW / 2
        : opts.textAlign === "right"
          ? x - barW
          : x - padX;
    ctx.save();
    ctx.globalAlpha = opts.bgBarOpacity / 100;
    ctx.fillStyle = opts.bgBarColor;
    ctx.fillRect(barX, y - barH / 2, barW, barH);
    ctx.restore();
  }

  // シャドウ
  if (opts.shadowEnabled) {
    ctx.shadowColor = opts.shadowColor;
    ctx.shadowBlur = opts.shadowBlur;
    ctx.shadowOffsetX = opts.shadowBlur * 0.5;
    ctx.shadowOffsetY = opts.shadowBlur * 0.5;
  }

  // 縁取り
  if (opts.strokeEnabled) {
    ctx.lineJoin = "round";
    ctx.lineWidth = opts.strokeWidth * 2;
    ctx.strokeStyle = opts.strokeColor;
    ctx.strokeText(opts.text, x, y);
  }

  ctx.fillStyle = opts.color;
  ctx.fillText(opts.text, x, y);
  ctx.restore();
};

/**
 * ease-out バウンス関数（CSS Animations Spec 準拠の piecewise quadratic、4 バウンス）
 * t = 0 → 0, t = 1 → 1
 */
const easeOutBounce = (t: number): number => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    t -= 1.5 / d1;
    return n1 * t * t + 0.75;
  } else if (t < 2.5 / d1) {
    t -= 2.25 / d1;
    return n1 * t * t + 0.9375;
  } else {
    t -= 2.625 / d1;
    return n1 * t * t + 0.984375;
  }
};

/**
 * スライド方向に対応する「画面内正規位置 → 画面外 」のベクトル（最大値就ればテキストが完全に画面外に出る距離）
 * halfW: テキスト幅の半分, halfH: テキスト高さの半分
 */
const slideExitVector = (
  dir: SlideDirection,
  cx: number,
  cy: number,
  cW: number,
  cH: number,
  halfW: number,
  halfH: number,
): [number, number] => {
  switch (dir) {
    case "up":
      return [0, -(cy + halfH)];
    case "down":
      return [0, cH - cy + halfH];
    case "left":
      return [-(cx + halfW), 0];
    case "right":
      return [cW - cx + halfW, 0];
  }
};

/**
 * Canvas に歌詞字幕を描画するヘルパー。
 * テキスト幅が maxWidthPercent を超える場合はフォントサイズを自動縮小する（最小 12px）。
 * elapsed / remaining によるアニメーション効果をすべて適用する。
 */
export const drawSubtitleOnCanvas = (
  ctx: CanvasRenderingContext2D,
  lyric: string,
  opts: LyricsOptions,
  cW: number,
  cH: number,
  elapsed: number,
  remaining: number,
): void => {
  if (!lyric.trim()) return;
  const maxW = (cW * opts.maxWidthPercent) / 100;
  const minFontSize = 12;
  let fontSize = opts.fontSize;

  // --- フレーズ全体のエフェクト値を計算 ---
  let alpha = 1;
  if (opts.fadeEnabled) {
    const fadeMs = opts.fadeDurationMs;
    alpha = Math.min(
      Math.min(1, elapsed / fadeMs),
      Math.min(1, remaining / fadeMs),
    );
  }
  let scale = 1;
  if (opts.scaleEnabled) {
    const scaleMs = opts.scaleDurationMs;
    // ease-out 二乗: SCALE_FROM付近で変化量大、100%付近で変化量小
    const ce = Math.min(1, elapsed / scaleMs);
    const cr = Math.min(1, remaining / scaleMs);
    const t = Math.min(1 - (1 - ce) * (1 - ce), 1 - (1 - cr) * (1 - cr));
    const s0 = opts.scaleFrom / 100;
    scale = s0 + (1 - s0) * t;
  }
  let slideY = 0;
  if (opts.slideEnabled) {
    const slideMs = opts.slideDurationMs;
    // ease-out 二乗: 始点付近で変化量大、正規位置近いと緩やか
    const ce = Math.min(1, elapsed / slideMs);
    const cr = Math.min(1, remaining / slideMs);
    const progress = Math.min(1 - (1 - ce) * (1 - ce), 1 - (1 - cr) * (1 - cr));
    slideY = opts.slideAmount * (1 - progress);
  }
  let slideInProgress = 1;
  let slideOutProgress = 0;
  if (opts.slideInEnabled) {
    slideInProgress = Math.min(1, elapsed / opts.slideInOutDurationMs);
  }
  if (opts.slideOutEnabled) {
    slideOutProgress = Math.max(0, 1 - remaining / opts.slideInOutDurationMs);
  }
  let blurRadius = 0;
  if (opts.blurEnabled) {
    const blurMs = opts.blurDurationMs;
    const ce = Math.min(1, elapsed / blurMs);
    const cr = Math.min(1, remaining / blurMs);
    // ease-out二乗: 入場ほど強く、表示中は0、退場ほど強く
    blurRadius =
      opts.blurAmount * Math.max((1 - ce) * (1 - ce), (1 - cr) * (1 - cr));
  }
  let wipeInProgress = 1;
  let wipeOutProgress = 0;
  if (opts.wipeInEnabled) {
    wipeInProgress = Math.min(1, elapsed / opts.wipeDurationMs);
  }
  if (opts.wipeOutEnabled) {
    wipeOutProgress = Math.max(0, 1 - remaining / opts.wipeDurationMs);
  }
  let bounceInProgress = 1;
  let bounceOutProgress = 0;
  if (opts.bounceInEnabled) {
    bounceInProgress = Math.min(1, elapsed / opts.bounceInOutDurationMs);
  }
  if (opts.bounceOutEnabled) {
    bounceOutProgress = Math.max(0, 1 - remaining / opts.bounceInOutDurationMs);
  }

  ctx.save();
  // スタガーモードではブラーは文字ごとに適用するため外側では設定しない
  ctx.filter =
    !opts.staggerEnabled && blurRadius > 0 ? `blur(${blurRadius}px)` : "none";
  ctx.globalAlpha = alpha;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `normal normal ${fontSize}px ${FONT_STACK}`;

  // Step 1: フォントサイズを 2px ずつ縮小して最大幅に収める（scale=1 基準）
  while (fontSize > minFontSize && ctx.measureText(lyric).width > maxW) {
    fontSize -= 2;
    ctx.font = `normal normal ${fontSize}px ${FONT_STACK}`;
  }

  const cx = (cW * opts.xPercent) / 100;
  const cy = (cH * opts.yPercent) / 100;
  const textW = ctx.measureText(lyric).width;
  const halfW = textW / 2;
  const halfH = fontSize * 0.6;

  // スライドイン/アウトのオフセット計算
  // ease-in 二乗: 目標居に正規位置付近でンマーい、遠いほど高速
  let dynX = 0;
  let dynY = 0;
  if (opts.slideInEnabled && !opts.staggerEnabled) {
    const [dvx, dvy] = slideExitVector(
      opts.slideInDirection,
      cx,
      cy,
      cW,
      cH,
      halfW,
      halfH,
    );
    const p = 1 - slideInProgress;
    dynX += dvx * p * p;
    dynY += dvy * p * p;
  }
  if (opts.slideOutEnabled && !opts.staggerEnabled) {
    const [dvx, dvy] = slideExitVector(
      opts.slideOutDirection,
      cx,
      cy,
      cW,
      cH,
      halfW,
      halfH,
    );
    dynX += dvx * slideOutProgress * slideOutProgress;
    dynY += dvy * slideOutProgress * slideOutProgress;
  }
  // バウンスイン/アウトのオフセット計算（slideExitVector 再利用、イージングは easeOutBounce）
  if (opts.bounceInEnabled && !opts.staggerEnabled) {
    const [dvx, dvy] = slideExitVector(
      opts.bounceInDirection,
      cx,
      cy,
      cW,
      cH,
      halfW,
      halfH,
    );
    const factor = 1 - easeOutBounce(bounceInProgress);
    dynX += dvx * factor;
    dynY += dvy * factor;
  }
  if (opts.bounceOutEnabled && !opts.staggerEnabled) {
    const [dvx, dvy] = slideExitVector(
      opts.bounceOutDirection,
      cx,
      cy,
      cW,
      cH,
      halfW,
      halfH,
    );
    // easeInBounce = 1 - easeOutBounce(1 - t)
    const factor = 1 - easeOutBounce(1 - bounceOutProgress);
    dynX += dvx * factor;
    dynY += dvy * factor;
  }

  // スタガーモードでは slideY は各文字のアニメーションに委ね、外側 translate に含めない
  ctx.translate(cx + dynX, cy + (opts.staggerEnabled ? 0 : slideY) + dynY);
  if (!opts.staggerEnabled) {
    ctx.scale(scale, scale);
  }

  // ワイプ: translate 後の座標系（中央 = (0,0)）でクリップ矩形を計算。
  // bgBar ・ shadow ・ テキスト をまとめてクリッピングする。
  const wipeBarW = textW + fontSize;
  const wipeBarH = fontSize * 2;
  if (opts.wipeInEnabled && wipeInProgress < 1) {
    // ease-out 二乗: 小さい領域から大きい領域へ、最後はヲント緩やかに全表示
    const t = 1 - (1 - wipeInProgress) * (1 - wipeInProgress);
    ctx.save();
    ctx.beginPath();
    switch (opts.wipeInDirection) {
      case "right": // 左苯から右へ出現
        ctx.rect(
          wipeBarW / 2 - wipeBarW * t,
          -wipeBarH / 2,
          wipeBarW * t,
          wipeBarH,
        );
        break;
      case "left": // 右苯から左へ出現
        ctx.rect(-wipeBarW / 2, -wipeBarH / 2, wipeBarW * t, wipeBarH);
        break;
      case "down": // 上辺から下へ出現
        ctx.rect(-wipeBarW / 2, -wipeBarH / 2, wipeBarW, wipeBarH * t);
        break;
      case "up": // 下辺から上へ出現
        ctx.rect(
          -wipeBarW / 2,
          wipeBarH / 2 - wipeBarH * t,
          wipeBarW,
          wipeBarH * t,
        );
        break;
    }
    ctx.clip();
  } else if (opts.wipeOutEnabled && wipeOutProgress > 0) {
    // ease-in 二乗: ヲント経源で小さな領域へ広がっていく
    const t = wipeOutProgress * wipeOutProgress;
    ctx.save();
    ctx.beginPath();
    switch (opts.wipeOutDirection) {
      case "right": // 右へ飛び出して降出
        ctx.rect(
          -wipeBarW / 2 + wipeBarW * t,
          -wipeBarH / 2,
          wipeBarW * (1 - t),
          wipeBarH,
        );
        break;
      case "left": // 左へ飛び出して降出
        ctx.rect(-wipeBarW / 2, -wipeBarH / 2, wipeBarW * (1 - t), wipeBarH);
        break;
      case "down": // 下へ飛び出して降出
        ctx.rect(
          -wipeBarW / 2,
          -wipeBarH / 2 + wipeBarH * t,
          wipeBarW,
          wipeBarH * (1 - t),
        );
        break;
      case "up": // 上へ飛び出して降出
        ctx.rect(-wipeBarW / 2, -wipeBarH / 2, wipeBarW, wipeBarH * (1 - t));
        break;
    }
    ctx.clip();
  }

  if (opts.staggerEnabled) {
    // ---- スタガー描画: 文字ごとに異なるタイミングで個別にアニメーション ----
    const chars = [...lyric];
    const N = chars.length;
    const S = opts.staggerIntervalMs;
    const charWidths = chars.map((c) => {
      ctx.font = `normal normal ${fontSize}px ${FONT_STACK}`;
      return ctx.measureText(c).width;
    });

    // 背景バーはフレーズ全体のアルファで一括描画（文字毎に描くと重なりが出るため）
    if (opts.bgBarEnabled) {
      const padX = fontSize * 0.5;
      const padY = fontSize * 0.3;
      const barW = textW + padX * 2;
      const barH = fontSize + padY * 2;
      ctx.save();
      ctx.globalAlpha = alpha * (opts.bgBarOpacity / 100);
      ctx.fillStyle = opts.bgBarColor;
      ctx.fillRect(-barW / 2, -barH / 2, barW, barH);
      ctx.restore();
    }

    let x = -charWidths.reduce((a, b) => a + b, 0) / 2;
    for (let i = 0; i < N; i++) {
      const charElapsed = Math.max(0, elapsed - i * S);
      const charRemaining = Math.max(0, remaining - (N - 1 - i) * S);

      // 文字ごとのフェード
      let charAlpha = 1;
      if (opts.fadeEnabled) {
        const fadeMs = opts.fadeDurationMs;
        charAlpha = Math.min(
          Math.min(1, charElapsed / fadeMs),
          Math.min(1, charRemaining / fadeMs),
        );
      }

      // 文字ごとのスケール
      let charScale = 1;
      if (opts.scaleEnabled) {
        const scaleMs = opts.scaleDurationMs;
        const ce = Math.min(1, charElapsed / scaleMs);
        const cr = Math.min(1, charRemaining / scaleMs);
        const t = Math.min(1 - (1 - ce) * (1 - ce), 1 - (1 - cr) * (1 - cr));
        const s0 = opts.scaleFrom / 100;
        charScale = s0 + (1 - s0) * t;
      }

      // 文字ごとのスライドアップ
      let charSlideY = 0;
      if (opts.slideEnabled) {
        const slideMs = opts.slideDurationMs;
        const ce = Math.min(1, charElapsed / slideMs);
        const cr = Math.min(1, charRemaining / slideMs);
        const progress = Math.min(
          1 - (1 - ce) * (1 - ce),
          1 - (1 - cr) * (1 - cr),
        );
        charSlideY = opts.slideAmount * (1 - progress);
      }

      // 文字ごとのブラー
      let charBlurRadius = 0;
      if (opts.blurEnabled) {
        const blurMs = opts.blurDurationMs;
        const ce = Math.min(1, charElapsed / blurMs);
        const cr = Math.min(1, charRemaining / blurMs);
        charBlurRadius =
          opts.blurAmount * Math.max((1 - ce) * (1 - ce), (1 - cr) * (1 - cr));
      }

      // 文字ごとのスライドイン/スライドアウト
      let charDynX = 0;
      let charDynY = 0;
      if (opts.slideInEnabled) {
        const charSlideInProgress = Math.min(
          1,
          charElapsed / opts.slideInOutDurationMs,
        );
        const p = 1 - charSlideInProgress;
        const [dvx, dvy] = slideExitVector(
          opts.slideInDirection,
          cx + x + charWidths[i] / 2,
          cy,
          cW,
          cH,
          charWidths[i] / 2,
          halfH,
        );
        charDynX += dvx * p * p;
        charDynY += dvy * p * p;
      }
      if (opts.slideOutEnabled) {
        const charSlideOutProgress = Math.max(
          0,
          1 - charRemaining / opts.slideInOutDurationMs,
        );
        const [dvx, dvy] = slideExitVector(
          opts.slideOutDirection,
          cx + x + charWidths[i] / 2,
          cy,
          cW,
          cH,
          charWidths[i] / 2,
          halfH,
        );
        charDynX += dvx * charSlideOutProgress * charSlideOutProgress;
        charDynY += dvy * charSlideOutProgress * charSlideOutProgress;
      }

      // 文字ごとのバウンスイン/バウンスアウト
      if (opts.bounceInEnabled) {
        const charBounceInProgress = Math.min(
          1,
          charElapsed / opts.bounceInOutDurationMs,
        );
        const [dvx, dvy] = slideExitVector(
          opts.bounceInDirection,
          cx + x + charWidths[i] / 2,
          cy,
          cW,
          cH,
          charWidths[i] / 2,
          halfH,
        );
        const factor = 1 - easeOutBounce(charBounceInProgress);
        charDynX += dvx * factor;
        charDynY += dvy * factor;
      }
      if (opts.bounceOutEnabled) {
        const charBounceOutProgress = Math.max(
          0,
          1 - charRemaining / opts.bounceInOutDurationMs,
        );
        const [dvx, dvy] = slideExitVector(
          opts.bounceOutDirection,
          cx + x + charWidths[i] / 2,
          cy,
          cW,
          cH,
          charWidths[i] / 2,
          halfH,
        );
        // easeInBounce = 1 - easeOutBounce(1 - t)
        const factor = 1 - easeOutBounce(1 - charBounceOutProgress);
        charDynX += dvx * factor;
        charDynY += dvy * factor;
      }

      ctx.save();
      ctx.filter = charBlurRadius > 0 ? `blur(${charBlurRadius}px)` : "none";
      ctx.globalAlpha = charAlpha;
      // 文字の中央を原点に translate、その後スケール
      ctx.translate(x + charWidths[i] / 2 + charDynX, charSlideY + charDynY);
      ctx.scale(charScale, charScale);

      if (opts.shadowEnabled) {
        ctx.shadowColor = opts.shadowColor;
        ctx.shadowBlur = opts.shadowBlur;
        ctx.shadowOffsetX = opts.shadowBlur * 0.5;
        ctx.shadowOffsetY = opts.shadowBlur * 0.5;
      }
      if (opts.strokeEnabled) {
        ctx.lineJoin = "round";
        ctx.lineWidth = opts.strokeWidth * 2;
        ctx.strokeStyle = opts.strokeColor;
        ctx.strokeText(chars[i], 0, 0);
      }
      ctx.fillStyle = opts.color;
      ctx.fillText(chars[i], 0, 0);

      ctx.restore();
      x += charWidths[i];
    }
  } else {
    // ---- 通常描画（スタガーなし）----
    // Step 2: 背景バー（shadow 適用前に描画）。座標は translate 後なので中央が (0,0)
    if (opts.bgBarEnabled) {
      const padX = fontSize * 0.5;
      const padY = fontSize * 0.3;
      const barW = textW + padX * 2;
      const barH = fontSize + padY * 2;
      ctx.save();
      ctx.globalAlpha = alpha * (opts.bgBarOpacity / 100);
      ctx.fillStyle = opts.bgBarColor;
      ctx.fillRect(-barW / 2, -barH / 2, barW, barH);
      ctx.restore();
    }

    // Step 3: shadow 設定
    if (opts.shadowEnabled) {
      ctx.shadowColor = opts.shadowColor;
      ctx.shadowBlur = opts.shadowBlur;
      ctx.shadowOffsetX = opts.shadowBlur * 0.5;
      ctx.shadowOffsetY = opts.shadowBlur * 0.5;
    }

    // Step 4: 縁取り
    if (opts.strokeEnabled) {
      ctx.lineJoin = "round";
      ctx.lineWidth = opts.strokeWidth * 2;
      ctx.strokeStyle = opts.strokeColor;
      ctx.strokeText(lyric, 0, 0);
    }

    // Step 5: メインテキスト
    ctx.fillStyle = opts.color;
    ctx.fillText(lyric, 0, 0);
  }

  // ワイプの clip 状態を解除（wipe 適用時は余分に ctx.save() してある）
  if (
    (opts.wipeInEnabled && wipeInProgress < 1) ||
    (opts.wipeOutEnabled && wipeOutProgress > 0)
  ) {
    ctx.restore();
  }

  ctx.restore();
};

/**
 * WAV ArrayBuffer と背景画像ファイルから MP4 ArrayBuffer を生成する（B-1 方式）
 *
 * 背景画像を静止画とした動画を生成する。映像は 1fps の静止画、音声は提供された WAV データ。
 * 画像が FHD (1920×1080) を超える場合はアスペクト比を維持して縮小する。
 *
 * --- 未実装のアプローチ（参考コメント） ---
 *
 * A-1 方式: MediaRecorder + captureStream() による DOM 録画
 *   const stream = canvasElement.captureStream(30);
 *   const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
 *   → iOS Safari は captureStream() 非対応のためモバイル実行環境としては不適。
 *   → captureStream は Experimental API であり将来的に変更される可能性がある。
 *
 * A-2 方式: オフスクリーン Pianoroll コンポーネントを再描画して録画
 *   → Pianoroll の描画ロジックを分離し、playingMs をループで更新しながら
 *     CanvasSource に連続フレームを追加することで実エディタ画面の録画が可能。
 *     実装コストが高く、モバイルでの GPU/メモリ消費も大きいため将来の課題とする。
 * -----------------------------------------
 */
export const generateMp4 = async (
  audioBuffer: ArrayBuffer,
  imageFile: File,
  resolution: VideoResolution = "image",
  bgPaddingMode: BgPaddingMode = "image",
  bgColor: string = "#000000",
  bgImageOpacity: number = 100,
  portraitOptions?: PortraitOptions | null,
  mainTextOptions?: TextOptions | null,
  subTextOptions?: TextOptions | null,
  lyricsOptions?: LyricsOptions | null,
  onProgress?: (current: number, total: number) => void,
): Promise<ArrayBuffer> => {
  // AAC エンコーダー polyfill を登録（iOS 等 WebCodecs ネイティブ AAC 非対応環境向け）
  // 登録後は canEncodeAudio('aac') が true を返すようになる
  registerAacEncoder();

  // ブラウザが実際にエンコードできるコーデックを実行時に選択する
  // これにより、avc のハードウェアエンコーダーがない Android 端末でも
  // vp9 等へ自動フォールバックして生成が成功する
  const videoCodec = await getFirstEncodableVideoCodec(VIDEO_CODEC_PRIORITY);
  if (!videoCodec) {
    throw new Error(
      `動画エンコードに対応するコーデックが見つかりません。試行: ${VIDEO_CODEC_PRIORITY.join(", ")}`,
    );
  }
  const audioCodec =
    (await getFirstEncodableAudioCodec(AUDIO_CODEC_PRIORITY)) ?? "opus";

  // WAV ArrayBuffer → Web Audio API の AudioBuffer（duration 取得のため）
  const audioCtx = new AudioContext();
  const decodedAudio = await audioCtx.decodeAudioData(audioBuffer.slice(0));
  const durationSec = decodedAudio.duration;
  await audioCtx.close();

  // 画像をロードしてキャンバスサイズを決定
  const imageUrl = URL.createObjectURL(imageFile);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = imageUrl;
  });
  URL.revokeObjectURL(imageUrl);

  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is not available");

  // キャンバスサイズを決定
  let cW: number;
  let cH: number;
  if (resolution === "image") {
    const scale = Math.min(1, MAX_WIDTH / imgW, MAX_HEIGHT / imgH);
    cW = Math.round(imgW * scale);
    cH = Math.round(imgH * scale);
  } else {
    [cW, cH] = resolution.split("x").map(Number);
  }
  canvas.width = cW;
  canvas.height = cH;

  // 立絵をすべての非同期処理の前にロードしておく（drawBase クロージャで再利用するため）
  let portraitImg: HTMLImageElement | null = null;
  if (portraitOptions) {
    const pUrl = URL.createObjectURL(portraitOptions.blob);
    portraitImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = pUrl;
    });
    URL.revokeObjectURL(pUrl);
  }

  /**
   * 背景・立絵・タイトルテキストのベースレイヤーをキャンバスに描画する。
   * 字幕フレームのたびに呼び出して canvas を上書きするため、副作用なしで完結させる。
   */
  const drawBase = () => {
    ctx.clearRect(0, 0, cW, cH);

    if (resolution === "image") {
      // 「画像サイズ」モード: FHD 超過の場合のみアスペクト比を維持して縮小
      ctx.drawImage(img, 0, 0, cW, cH);
    } else {
      // 固定解像度モード: bgPaddingMode に従って余白を埋めてから前景を中央配置
      if (bgPaddingMode === "color") {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, cW, cH);
      } else {
        // "image" or "blur": 最背面を背景色で塗り、その上に cover スケールで背景画像を重ねる
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, cW, cH);
        const bgScale = Math.max(cW / imgW, cH / imgH);
        const bgW = imgW * bgScale;
        const bgH = imgH * bgScale;
        if (bgPaddingMode === "blur") {
          ctx.filter = "blur(20px)";
        }
        ctx.globalAlpha = bgImageOpacity / 100;
        ctx.drawImage(img, (cW - bgW) / 2, (cH - bgH) / 2, bgW, bgH);
        ctx.globalAlpha = 1;
        ctx.filter = "none";
      }
      // 前景: 画像を contain・拡大なしで中央配置
      const fgScale = Math.min(1, cW / imgW, cH / imgH);
      const fgW = imgW * fgScale;
      const fgH = imgH * fgScale;
      ctx.drawImage(img, (cW - fgW) / 2, (cH - fgH) / 2, fgW, fgH);
    }

    // 立絵の描画（設定有りの場合のみ）
    if (portraitOptions && portraitImg) {
      const { naturalHeight, opacity, scalePercent } = portraitOptions;
      const pNatW = portraitImg.naturalWidth;
      const pNatH = portraitImg.naturalHeight;
      // エディタと同じアルゴリズム: 横50%・縦min(50%,naturalHeight) の枠内に contain
      const maxW = cW * 0.5;
      const maxH = Math.min(cH * 0.5, naturalHeight);
      const defaultScale = Math.min(maxW / pNatW, maxH / pNatH);
      // ユーザースケール適用。自然サイズ（scale=1）を上限とする
      const drawScale = Math.min(defaultScale * (scalePercent / 100), 1.0);
      const drawW = pNatW * drawScale;
      const drawH = pNatH * drawScale;
      // 右下配置 + オフセット適用（オフセットは描画サイズ基準の %）
      const px = cW - drawW + drawW * (portraitOptions.xOffset / 100);
      const py = cH - drawH + drawH * (portraitOptions.yOffset / 100);
      ctx.globalAlpha = opacity / 100;
      ctx.drawImage(portraitImg, px, py, drawW, drawH);
      ctx.globalAlpha = 1;
    }

    // テキストオーバーレイの描画（立絵より上のレイヤー）
    if (mainTextOptions) {
      drawTextOnCanvas(ctx, mainTextOptions, cW, cH);
    }
    if (subTextOptions) {
      drawTextOnCanvas(ctx, subTextOptions, cW, cH);
    }
  };

  // mediabunny Output を構築してトラックを追加
  const output = new Output({
    format: new Mp4OutputFormat(),
    target: new BufferTarget(),
  });

  const videoSource = new CanvasSource(canvas, {
    codec: videoCodec,
    bitrate: QUALITY_HIGH,
  });
  const audioSource = new AudioBufferSource({
    codec: audioCodec,
    bitrate: 128e3,
  });

  output.addVideoTrack(videoSource, { frameRate: 30 });
  output.addAudioTrack(audioSource);

  await output.start();

  // 映像フレームの生成（30fps 固定）
  const FRAME_RATE = 30;
  const frameDuration = 1 / FRAME_RATE;
  const totalFrames = Math.ceil(durationSec * FRAME_RATE);

  for (let f = 0; f < totalFrames; f++) {
    const tSec = f * frameDuration;
    const tMs = tSec * 1000;
    const dur = Math.min(frameDuration, durationSec - tSec);

    drawBase();

    if (lyricsOptions && lyricsOptions.segments.length > 0) {
      const activeSeg = lyricsOptions.segments.find(
        (seg) => tMs >= seg.startMs && tMs < seg.endMs,
      );
      if (activeSeg) {
        const elapsed = tMs - activeSeg.startMs;
        const remaining = activeSeg.endMs - tMs;
        drawSubtitleOnCanvas(
          ctx,
          activeSeg.lyric,
          lyricsOptions,
          cW,
          cH,
          elapsed,
          remaining,
        );
      }
    }

    await videoSource.add(tSec, dur);

    // 30フレームに1回プログレスを通知（毎フレーム呼ぶとオーバーヘッドになるため）
    if (onProgress && (f + 1) % 30 === 0) {
      onProgress(f + 1, totalFrames);
      // UIスレッドに制御を返してレンダリングを反映させる
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }

  videoSource.close();

  // デコード済み AudioBuffer をそのまま渡す
  await audioSource.add(decodedAudio);
  audioSource.close();

  await output.finalize();

  const mp4Buffer = (output.target as BufferTarget).buffer;
  if (!mp4Buffer) throw new Error("MP4 buffer generation failed");
  return mp4Buffer;
};

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
  ctx.save();
  ctx.font = `${opts.fontStyle} ${opts.fontWeight} ${opts.fontSize}px ${FONT_STACK}`;
  ctx.fillStyle = opts.color;
  ctx.textAlign = opts.textAlign;
  ctx.textBaseline = "middle";
  ctx.globalAlpha = 1;
  ctx.fillText(
    opts.text,
    (cW * opts.xPercent) / 100,
    (cH * opts.yPercent) / 100,
  );
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

  if (resolution === "image") {
    // 「画像サイズ」モード: FHD 超過の場合のみアスペクト比を維持して縮小
    const scale = Math.min(1, MAX_WIDTH / imgW, MAX_HEIGHT / imgH);
    canvas.width = Math.round(imgW * scale);
    canvas.height = Math.round(imgH * scale);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  } else {
    // 固定解像度モード: bgPaddingMode に従って余白を埋めてから前景を中央配置
    const [W, H] = resolution.split("x").map(Number);
    canvas.width = W;
    canvas.height = H;

    if (bgPaddingMode === "color") {
      // 背景色で塗りつぶす
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);
    } else {
      // "image" or "blur": 最背面を背景色で塗り、その上に cover スケールで背景画像を重ねる
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);

      const bgScale = Math.max(W / imgW, H / imgH);
      const bgW = imgW * bgScale;
      const bgH = imgH * bgScale;
      if (bgPaddingMode === "blur") {
        ctx.filter = "blur(20px)";
      }
      ctx.globalAlpha = bgImageOpacity / 100;
      ctx.drawImage(img, (W - bgW) / 2, (H - bgH) / 2, bgW, bgH);
      ctx.globalAlpha = 1;
      ctx.filter = "none";
    }

    // 前景: 画像を contain・拡大なしで中央配置
    // 例: 1000×1000 → 1920×1080 なら fgScale=1、左右460px/上下40px 余白
    const fgScale = Math.min(1, W / imgW, H / imgH);
    const fgW = imgW * fgScale;
    const fgH = imgH * fgScale;
    ctx.drawImage(img, (W - fgW) / 2, (H - fgH) / 2, fgW, fgH);
  }

  // 立絵の描画（設定有りの場合のみ）
  if (portraitOptions) {
    const { blob, naturalHeight, opacity, scalePercent } = portraitOptions;
    const pUrl = URL.createObjectURL(blob);
    const portraitImg = await new Promise<HTMLImageElement>(
      (resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = pUrl;
      },
    );
    URL.revokeObjectURL(pUrl);

    const pNatW = portraitImg.naturalWidth;
    const pNatH = portraitImg.naturalHeight;
    const cW = canvas.width;
    const cH = canvas.height;

    // エディタと同じアルゴリズム: 横50%・縦min(50%,naturalHeight) の枚内に contain
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
    drawTextOnCanvas(ctx, mainTextOptions, canvas.width, canvas.height);
  }
  if (subTextOptions) {
    drawTextOnCanvas(ctx, subTextOptions, canvas.width, canvas.height);
  }

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

  output.addVideoTrack(videoSource, { frameRate: 1 });
  output.addAudioTrack(audioSource);

  await output.start();

  // 静止画 1 フレーム（音声全長分のタイムスタンプ/デュレーションを設定）
  await videoSource.add(0, durationSec);
  videoSource.close();

  // デコード済み AudioBuffer をそのまま渡す
  await audioSource.add(decodedAudio);
  audioSource.close();

  await output.finalize();

  const mp4Buffer = (output.target as BufferTarget).buffer;
  if (!mp4Buffer) throw new Error("MP4 buffer generation failed");
  return mp4Buffer;
};

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
      // "image" or "blur": 同一画像を cover スケールで背景に敷く
      // cover スケールでは必ずキャンバス枠外に画像がはみ出るため
      // blur 時の半透明エッジ問題は発生しない
      const bgScale = Math.max(W / imgW, H / imgH);
      const bgW = imgW * bgScale;
      const bgH = imgH * bgScale;
      if (bgPaddingMode === "blur") {
        ctx.filter = "blur(20px)";
      }
      ctx.drawImage(img, (W - bgW) / 2, (H - bgH) / 2, bgW, bgH);
      ctx.filter = "none";
    }

    // 前景: 画像を contain・拡大なしで中央配置
    // 例: 1000×1000 → 1920×1080 なら fgScale=1、左右460px/上下40px 余白
    const fgScale = Math.min(1, W / imgW, H / imgH);
    const fgW = imgW * fgScale;
    const fgH = imgH * fgScale;
    ctx.drawImage(img, (W - fgW) / 2, (H - fgH) / 2, fgW, fgH);
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

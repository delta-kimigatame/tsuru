import { registerAacEncoder } from "@mediabunny/aac-encoder";
import {
  AudioBufferSource,
  BufferTarget,
  CanvasSource,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
} from "mediabunny";

/** FHD 縮小上限 */
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

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
): Promise<ArrayBuffer> => {
  // AAC エンコーダー polyfill を登録（iOS 等 WebCodecs ネイティブ AAC 非対応環境向け）
  registerAacEncoder();

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

  // FHD 超過の場合はアスペクト比を維持して縮小（contain フィット）
  const scale = Math.min(
    1,
    MAX_WIDTH / img.naturalWidth,
    MAX_HEIGHT / img.naturalHeight,
  );
  const canvasWidth = Math.round(img.naturalWidth * scale);
  const canvasHeight = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is not available");
  ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

  // mediabunny Output を構築してトラックを追加
  const output = new Output({
    format: new Mp4OutputFormat(),
    target: new BufferTarget(),
  });

  const videoSource = new CanvasSource(canvas, {
    codec: "avc",
    bitrate: QUALITY_HIGH,
  });
  const audioSource = new AudioBufferSource({
    codec: "aac",
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

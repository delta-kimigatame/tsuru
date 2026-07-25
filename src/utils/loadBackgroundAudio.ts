import {
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  MP3,
  MP4,
  Output,
  WAVE,
  WavOutputFormat,
} from "mediabunny";
import { Wave } from "utauwav";
import { renderingConfig } from "../config/rendering";

export interface LoadedBackgroundAudio {
  wav: Wave;
  wavBuffer: ArrayBuffer;
  objectUrl: string;
}

/**
 * 伴奏音声を既存の合成処理で扱えるWAV形式へ正規化して読み込む。
 * MP3/M4A/WAVのコンテナ解析とデコードはMediabunnyに委譲する。
 */
export const loadBackgroundAudio = async (
  file: File,
): Promise<LoadedBackgroundAudio> => {
  const input = new Input({
    formats: [MP3, MP4, WAVE],
    source: new BlobSource(file),
  });

  try {
    if (!(await input.canRead())) {
      throw new Error("対応していない、または破損した音声ファイルです。");
    }

    const audioTrack = await input.getPrimaryAudioTrack();
    if (audioTrack === null) {
      throw new Error("音声トラックが見つかりません。");
    }
    if (!(await audioTrack.canDecode())) {
      throw new Error("このブラウザでは音声コーデックをデコードできません。");
    }

    const target = new BufferTarget();
    const output = new Output({
      format: new WavOutputFormat(),
      target,
    });
    const conversion = await Conversion.init({
      input,
      output,
      tracks: "primary",
      video: { discard: true },
      audio: {
        codec: "pcm-s16",
        numberOfChannels: Math.min(
          2,
          Math.max(1, await audioTrack.getNumberOfChannels()),
        ),
        sampleRate: renderingConfig.frameRate,
        sampleFormat: "s16",
        forceTranscode: true,
      },
      tags: {},
      showWarnings: false,
    });

    if (!conversion.isValid) {
      throw new Error("音声をWAV形式へ変換できません。");
    }

    await conversion.execute();
    if (target.buffer === null) {
      throw new Error("変換後のWAVデータを取得できません。");
    }

    const wav = new Wave(target.buffer);
    wav.sampleRate = renderingConfig.frameRate;
    wav.bitDepth = renderingConfig.depth;
    wav.VolumeNormalize();
    const wavBuffer = await wav.Output();
    const objectUrl = URL.createObjectURL(
      new Blob([wavBuffer], { type: "audio/wav" }),
    );

    return { wav, wavBuffer, objectUrl };
  } finally {
    input.dispose();
  }
};

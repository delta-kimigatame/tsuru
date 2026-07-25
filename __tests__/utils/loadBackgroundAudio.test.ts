import { beforeEach, describe, expect, it, vi } from "vitest";

const mediabunnyMocks = vi.hoisted(() => ({
  audioTrack: {
    canDecode: vi.fn(),
    getNumberOfChannels: vi.fn(),
  },
  input: {
    canRead: vi.fn(),
    dispose: vi.fn(),
    getPrimaryAudioTrack: vi.fn(),
  },
  target: { buffer: new ArrayBuffer(8) },
  conversion: {
    execute: vi.fn(),
    isValid: true,
  },
  Conversion: { init: vi.fn() },
}));

const waveMocks = vi.hoisted(() => ({
  output: vi.fn(),
  volumeNormalize: vi.fn(),
}));

vi.mock("mediabunny", () => ({
  BlobSource: vi.fn(),
  BufferTarget: vi.fn(() => mediabunnyMocks.target),
  Conversion: mediabunnyMocks.Conversion,
  Input: vi.fn(() => mediabunnyMocks.input),
  MP3: {},
  MP4: {},
  Output: vi.fn(),
  WAVE: {},
  WavOutputFormat: vi.fn(),
}));

vi.mock("utauwav", () => ({
  Wave: vi.fn(() => ({
    bitDepth: 0,
    sampleRate: 0,
    Output: waveMocks.output,
    VolumeNormalize: waveMocks.volumeNormalize,
  })),
}));

import { Conversion } from "mediabunny";
import { loadBackgroundAudio } from "../../src/utils/loadBackgroundAudio";

describe("loadBackgroundAudio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mediabunnyMocks.input.canRead.mockResolvedValue(true);
    mediabunnyMocks.input.getPrimaryAudioTrack.mockResolvedValue(
      mediabunnyMocks.audioTrack,
    );
    mediabunnyMocks.audioTrack.canDecode.mockResolvedValue(true);
    mediabunnyMocks.audioTrack.getNumberOfChannels.mockResolvedValue(2);
    mediabunnyMocks.target.buffer = new ArrayBuffer(8);
    mediabunnyMocks.conversion.isValid = true;
    mediabunnyMocks.conversion.execute.mockResolvedValue(undefined);
    mediabunnyMocks.Conversion.init.mockResolvedValue(
      mediabunnyMocks.conversion,
    );
    waveMocks.output.mockResolvedValue(new ArrayBuffer(16));
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:background") });
  });

  it("MP3/M4A/WAVを44.1kHz・16-bit PCM WAVとして正規化する", async () => {
    const result = await loadBackgroundAudio(
      new File(["audio"], "background.m4a", { type: "audio/mp4" }),
    );

    expect(Conversion.init).toHaveBeenCalledWith(
      expect.objectContaining({
        tracks: "primary",
        video: { discard: true },
        audio: expect.objectContaining({
          codec: "pcm-s16",
          sampleFormat: "s16",
          sampleRate: 44100,
          numberOfChannels: 2,
        }),
      }),
    );
    expect(result.wav.sampleRate).toBe(44100);
    expect(result.wav.bitDepth).toBe(16);
    expect(waveMocks.volumeNormalize).toHaveBeenCalledOnce();
    expect(result.objectUrl).toBe("blob:background");
    expect(mediabunnyMocks.input.dispose).toHaveBeenCalledOnce();
  });

  it("デコードできない音声は変換せず、入力リソースを解放する", async () => {
    mediabunnyMocks.audioTrack.canDecode.mockResolvedValue(false);

    await expect(
      loadBackgroundAudio(new File(["audio"], "background.mp3")),
    ).rejects.toThrow("デコードできません");

    expect(Conversion.init).not.toHaveBeenCalled();
    expect(mediabunnyMocks.input.dispose).toHaveBeenCalledOnce();
  });
});

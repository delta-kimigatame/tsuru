import { GenerateWave, Wave, WaveProcessing } from "utauwav";
import { MIX_MASTER_DSP } from "../config/mixMaster";
import { renderingConfig } from "../config/rendering";
import { SimpleMixMasterSettings } from "../types/mixMaster";

export type MixMasterInput = {
  vocalWav: Wave;
  backgroundWav?: Wave;
  offsetMs: number;
  extendToBackground?: boolean;
  settings: SimpleMixMasterSettings;
};

export class SimpleMixMasterService {
  process(input: MixMasterInput): ArrayBuffer {
    const fs = renderingConfig.frameRate;
    const wp = new WaveProcessing();

    const vocalL = wp.LogicalNormalize(
      input.vocalWav.data,
      input.vocalWav.bitDepth,
    );
    const vocalR = input.vocalWav.rData
      ? wp.LogicalNormalize(input.vocalWav.rData, input.vocalWav.bitDepth)
      : vocalL.slice();

    let processedVocalL = vocalL.slice();
    let processedVocalR = vocalR.slice();

    if (input.settings.vocal.highPass.enabled) {
      processedVocalL = this.applyBiquadHighPass(
        processedVocalL,
        input.settings.vocal.highPass.cutoffHz,
        MIX_MASTER_DSP.vocalHighPassQ,
        fs,
      );
      processedVocalR = this.applyBiquadHighPass(
        processedVocalR,
        input.settings.vocal.highPass.cutoffHz,
        MIX_MASTER_DSP.vocalHighPassQ,
        fs,
      );
    }

    if (input.settings.vocal.compressor.enabled) {
      [processedVocalL, processedVocalR] = this.applyCompressor(
        processedVocalL,
        processedVocalR,
        input.settings.vocal.compressor.thresholdDb,
        input.settings.vocal.compressor.ratio,
      );
    }

    if (input.settings.vocal.eqBoost.enabled) {
      processedVocalL = this.applyBiquadPeakingEQ(
        processedVocalL,
        input.settings.vocal.eqBoost.freqHz,
        MIX_MASTER_DSP.vocalEqQ,
        input.settings.vocal.eqBoost.gainDb,
        fs,
      );
      processedVocalR = this.applyBiquadPeakingEQ(
        processedVocalR,
        input.settings.vocal.eqBoost.freqHz,
        MIX_MASTER_DSP.vocalEqQ,
        input.settings.vocal.eqBoost.gainDb,
        fs,
      );
    }

    if (input.settings.vocal.reverb.enabled) {
      processedVocalL = this.applySimpleReverb(
        processedVocalL,
        fs,
        input.settings.vocal.reverb.wet,
        input.settings.vocal.reverb.decay,
      );
      processedVocalR = this.applySimpleReverb(
        processedVocalR,
        fs,
        input.settings.vocal.reverb.wet,
        input.settings.vocal.reverb.decay,
      );
    }

    const mixedL = processedVocalL.slice();
    const mixedR = processedVocalR.slice();

    if (input.backgroundWav) {
      this.mixBackground(
        mixedL,
        mixedR,
        input.backgroundWav,
        input.offsetMs,
        input.extendToBackground ?? false,
        input.settings,
      );
    }

    let masteredL = mixedL;
    let masteredR = mixedR;

    if (input.settings.mastering.rmsNormalize.enabled) {
      [masteredL, masteredR] = this.applyRmsNormalize(
        masteredL,
        masteredR,
        input.settings.mastering.rmsNormalize.targetRmsDb,
      );
    }

    if (input.settings.mastering.limiter.enabled) {
      [masteredL, masteredR] = this.applyLimiter(
        masteredL,
        masteredR,
        input.settings.mastering.limiter.gainDb,
        fs,
      );
    }

    const wav = GenerateWave(
      renderingConfig.frameRate,
      renderingConfig.depth,
      wp.InverseLogicalNormalize(masteredL, renderingConfig.depth),
      wp.InverseLogicalNormalize(masteredR, renderingConfig.depth),
    );

    return wav.Output();
  }

  private mixBackground(
    mixedL: number[],
    mixedR: number[],
    backgroundWav: Wave,
    offsetMs: number,
    extendToBackground: boolean,
    settings: SimpleMixMasterSettings,
  ): void {
    const fs = renderingConfig.frameRate;
    const wp = new WaveProcessing();

    const offsetFrames = Math.floor((offsetMs / 1000) * fs);
    const backgroundStartFrame = Math.max(0, offsetFrames);
    const dataStartFrame = Math.max(0, -offsetFrames);

    let bgL = wp.LogicalNormalize(
      backgroundWav.data.slice(backgroundStartFrame),
      backgroundWav.bitDepth,
    );
    let bgR = backgroundWav.rData
      ? wp.LogicalNormalize(
          backgroundWav.rData.slice(backgroundStartFrame),
          backgroundWav.bitDepth,
        )
      : bgL.slice();

    if (settings.background.eqCut.enabled) {
      bgL = this.applyBiquadPeakingEQ(
        bgL,
        settings.background.eqCut.cutoffHz,
        MIX_MASTER_DSP.backgroundEqQ,
        settings.background.eqCut.gainDb,
        fs,
      );
      bgR = this.applyBiquadPeakingEQ(
        bgR,
        settings.background.eqCut.cutoffHz,
        MIX_MASTER_DSP.backgroundEqQ,
        settings.background.eqCut.gainDb,
        fs,
      );
    }

    let bgGain = 1;
    if (settings.background.normalize.enabled) {
      const targetLinear = 10 ** (settings.background.normalize.targetDb / 20);
      const peak = Math.max(
        bgL.reduce((max, v) => Math.max(max, Math.abs(v)), 0),
        bgR.reduce((max, v) => Math.max(max, Math.abs(v)), 0),
      );
      bgGain = peak > 1e-10 ? targetLinear / peak : 0;
    }

    const mixLength = Math.min(
      mixedL.length - dataStartFrame,
      bgL.length,
      bgR.length,
    );

    for (let i = 0; i < mixLength; i++) {
      mixedL[dataStartFrame + i] += bgL[i] * bgGain;
      mixedR[dataStartFrame + i] += bgR[i] * bgGain;
    }

    if (extendToBackground) {
      for (let i = mixLength; i < bgL.length; i++) {
        mixedL.push(bgL[i] * bgGain);
        mixedR.push(bgR[i] * bgGain);
      }
    }
  }

  private applyCompressor(
    left: number[],
    right: number[],
    thresholdDb: number,
    ratio: number,
  ): [number[], number[]] {
    const thresholdLinear = 10 ** (thresholdDb / 20);
    const outL = new Array<number>(left.length);
    const outR = new Array<number>(right.length);

    for (let i = 0; i < left.length; i++) {
      const absL = Math.abs(left[i]);
      const absR = Math.abs(right[i]);
      const maxAbs = Math.max(absL, absR);
      if (maxAbs <= thresholdLinear) {
        outL[i] = left[i];
        outR[i] = right[i];
        continue;
      }

      const levelDb = 20 * Math.log10(maxAbs);
      const compressedDb = thresholdDb + (levelDb - thresholdDb) / ratio;
      const gainDb = compressedDb - levelDb;
      const gain = 10 ** (gainDb / 20);
      outL[i] = left[i] * gain;
      outR[i] = right[i] * gain;
    }

    return [outL, outR];
  }

  private applyRmsNormalize(
    left: number[],
    right: number[],
    targetRmsDb: number,
  ): [number[], number[]] {
    const sumSq = left.reduce(
      (sum, v, i) => sum + v * v + right[i] * right[i],
      0,
    );
    const rms = Math.sqrt(sumSq / (left.length * 2));
    if (rms < 1e-10) return [left, right];

    const target = 10 ** (targetRmsDb / 20);
    const gain = target / rms;
    return [left.map((v) => v * gain), right.map((v) => v * gain)];
  }

  private applyLimiter(
    left: number[],
    right: number[],
    gainDb: number,
    fs: number,
  ): [number[], number[]] {
    const ceiling = 10 ** (-1 / 20); // -1dB fixed
    const gain = 10 ** (gainDb / 20);
    const releaseSamples = Math.max(1, Math.floor((80 / 1000) * fs));
    const outL = new Array<number>(left.length);
    const outR = new Array<number>(right.length);

    let limitGain = 1;
    for (let i = 0; i < left.length; i++) {
      const peak = Math.max(Math.abs(left[i] * gain), Math.abs(right[i] * gain));
      const requiredGain = peak > ceiling ? ceiling / peak : 1;
      if (requiredGain < limitGain) {
        limitGain = requiredGain;
      } else {
        limitGain += (1 - limitGain) / releaseSamples;
      }
      outL[i] = Math.max(-ceiling, Math.min(ceiling, left[i] * gain * limitGain));
      outR[i] = Math.max(-ceiling, Math.min(ceiling, right[i] * gain * limitGain));
    }

    return [outL, outR];
  }

  private applyBiquadHighPass(
    data: number[],
    fc: number,
    q: number,
    fs: number,
  ): number[] {
    const w0 = (2 * Math.PI * fc) / fs;
    const alpha = Math.sin(w0) / (2 * q);
    const cosW0 = Math.cos(w0);
    const a0 = 1 + alpha;
    return this.applyBiquad(
      data,
      (1 + cosW0) / 2 / a0,
      -(1 + cosW0) / a0,
      (1 + cosW0) / 2 / a0,
      (-2 * cosW0) / a0,
      (1 - alpha) / a0,
    );
  }

  private applyBiquadPeakingEQ(
    data: number[],
    fc: number,
    q: number,
    gainDb: number,
    fs: number,
  ): number[] {
    const a = 10 ** (gainDb / 40);
    const w0 = (2 * Math.PI * fc) / fs;
    const alpha = Math.sin(w0) / (2 * q);
    const cosW0 = Math.cos(w0);
    const a0 = 1 + alpha / a;
    return this.applyBiquad(
      data,
      (1 + alpha * a) / a0,
      (-2 * cosW0) / a0,
      (1 - alpha * a) / a0,
      (-2 * cosW0) / a0,
      (1 - alpha / a) / a0,
    );
  }

  private applyBiquad(
    data: number[],
    b0: number,
    b1: number,
    b2: number,
    a1: number,
    a2: number,
  ): number[] {
    const output = new Array<number>(data.length);
    let x1 = 0;
    let x2 = 0;
    let y1 = 0;
    let y2 = 0;
    for (let i = 0; i < data.length; i++) {
      const x0 = data[i];
      const y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      output[i] = y0;
      x2 = x1;
      x1 = x0;
      y2 = y1;
      y1 = y0;
    }
    return output;
  }

  private applySimpleReverb(
    data: number[],
    fs: number,
    wet: number,
    decay: number,
  ): number[] {
    const combDelaysMs = MIX_MASTER_DSP.reverbCombDelaysMs;
    const reverbSignal = new Array<number>(data.length).fill(0);

    for (const delayMs of combDelaysMs) {
      const delayFrames = Math.round((delayMs / 1000) * fs);
      const combOut = this.applyCombFilter(data, delayFrames, decay);
      for (let i = 0; i < data.length; i++) {
        reverbSignal[i] += combOut[i] / combDelaysMs.length;
      }
    }

    let diffused = reverbSignal;
    const apDelaysMs = MIX_MASTER_DSP.reverbAllPassDelaysMs;
    for (const delayMs of apDelaysMs) {
      const delayFrames = Math.round((delayMs / 1000) * fs);
      diffused = this.applyAllPassFilter(
        diffused,
        delayFrames,
        MIX_MASTER_DSP.reverbAllPassFeedback,
      );
    }

    return data.map((v, i) => v + wet * diffused[i]);
  }

  private applyCombFilter(
    data: number[],
    delayFrames: number,
    feedback: number,
  ): number[] {
    const output = new Array<number>(data.length).fill(0);
    const buf = new Array<number>(Math.max(1, delayFrames)).fill(0);
    for (let i = 0; i < data.length; i++) {
      const idx = i % buf.length;
      output[i] = data[i] + feedback * buf[idx];
      buf[idx] = output[i];
    }
    return output;
  }

  private applyAllPassFilter(
    data: number[],
    delayFrames: number,
    feedback: number,
  ): number[] {
    const output = new Array<number>(data.length);
    const buf = new Array<number>(Math.max(1, delayFrames)).fill(0);
    for (let i = 0; i < data.length; i++) {
      const idx = i % buf.length;
      const delayed = buf[idx];
      const w = data[i] + feedback * delayed;
      output[i] = -feedback * w + delayed;
      buf[idx] = w;
    }
    return output;
  }
}

import type { SimpleMixMasterSettings } from "../types/mixMaster";

export const MIX_MASTER_DSP = {
  vocalHighPassQ: 0.707,
  vocalEqQ: 1.0,
  backgroundEqQ: 1.0,
  reverbCombDelaysMs: [29.7, 37.1, 41.1, 43.7],
  reverbAllPassDelaysMs: [7.0, 11.0],
  reverbAllPassFeedback: 0.7,
} as const;

export const MIX_MASTER_UI_RANGES = {
  vocal: {
    highPassCutoffHz: { min: 40, max: 300, step: 5 },
    compressorThresholdDb: { min: -24, max: 0, step: 0.1 },
    compressorRatio: { min: 1, max: 8, step: 0.1 },
    eqBoostFreqHz: { min: 1000, max: 4000, step: 100 },
    eqBoostGainDb: { min: 0, max: 8, step: 0.1 },
    reverbWetPercent: { min: 0, max: 60, step: 1 },
    reverbDecayPercent: { min: 20, max: 90, step: 1 },
  },
  background: {
    normalizeTargetDb: { min: -20, max: -2, step: 0.1 },
    eqCutFreqHz: { min: 1000, max: 4000, step: 100 },
    eqCutGainDb: { min: -12, max: 0, step: 0.1 },
  },
  mastering: {
    rmsTargetDb: { min: -20, max: -8, step: 0.1 },
    limiterGainDb: { min: -12, max: 12, step: 0.1 },
  },
} as const;

export const defaultMixMasterSettings: SimpleMixMasterSettings = {
  vocal: {
    highPass: {
      enabled: true,
      cutoffHz: 100,
    },
    compressor: {
      enabled: false,
      thresholdDb: -6,
      ratio: 2.5,
    },
    eqBoost: {
      enabled: true,
      freqHz: 2000,
      gainDb: 3,
    },
    reverb: {
      enabled: true,
      wet: 0.2,
      decay: 0.6,
    },
  },
  background: {
    normalize: {
      enabled: true,
      targetDb: -8,
    },
    eqCut: {
      enabled: true,
      cutoffHz: 2000,
      gainDb: -2,
    },
  },
  mastering: {
    rmsNormalize: {
      enabled: true,
      targetRmsDb: -14,
    },
    limiter: {
      enabled: true,
      gainDb: 0,
    },
  },
};

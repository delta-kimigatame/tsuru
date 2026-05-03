export interface SimpleMixMasterSettings {
  vocal: {
    highPass: {
      enabled: boolean;
      cutoffHz: number;
    };
    compressor: {
      enabled: boolean;
      thresholdDb: number;
      ratio: number;
    };
    normalize: {
      enabled: boolean;
      targetDb: number;
    };
    eqBoost: {
      enabled: boolean;
      freqHz: number;
      gainDb: number;
    };
    reverb: {
      enabled: boolean;
      wet: number;
      decay: number;
    };
  };
  background: {
    normalize: {
      enabled: boolean;
      targetDb: number;
    };
    eqCut: {
      enabled: boolean;
      cutoffHz: number;
      gainDb: number;
    };
  };
  mastering: {
    rmsNormalize: {
      enabled: boolean;
      targetRmsDb: number;
      damped: boolean;
    };
    limiter: {
      enabled: boolean;
      gainDb: number;
    };
  };
}

export const cloneMixMasterSettings = (
  settings: SimpleMixMasterSettings,
): SimpleMixMasterSettings => {
  return JSON.parse(JSON.stringify(settings)) as SimpleMixMasterSettings;
};

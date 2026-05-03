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
    };
    hardLimiter: {
      enabled: boolean;
      ceilingDb: number;
      releaseMs: number;
    };
  };
}

export const defaultMixMasterSettings: SimpleMixMasterSettings = {
  vocal: {
    highPass: {
      enabled: true,
      cutoffHz: 100,
    },
    compressor: {
      enabled: true,
      thresholdDb: -18,
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
      cutoffHz: 220,
      gainDb: -2,
    },
  },
  mastering: {
    rmsNormalize: {
      enabled: true,
      targetRmsDb: -14,
    },
    hardLimiter: {
      enabled: true,
      ceilingDb: -1,
      releaseMs: 80,
    },
  },
};

export const cloneMixMasterSettings = (
  settings: SimpleMixMasterSettings,
): SimpleMixMasterSettings => {
  return JSON.parse(JSON.stringify(settings)) as SimpleMixMasterSettings;
};

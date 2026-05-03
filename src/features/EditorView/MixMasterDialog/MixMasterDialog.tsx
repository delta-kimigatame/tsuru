import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Slider,
  Switch,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { LabeledSlider } from "../../../components/EditorView/VideoExportDialog/LabeledSlider";
import {
  defaultMixMasterSettings,
  MIX_MASTER_UI_RANGES,
} from "../../../config/mixMaster";
import {
  cloneMixMasterSettings,
  SimpleMixMasterSettings,
} from "../../../types/mixMaster";

type Props = {
  open: boolean;
  settings: SimpleMixMasterSettings;
  previewUrl?: string;
  loading: boolean;
  onClose: () => void;
  onChange: (settings: SimpleMixMasterSettings) => void;
  onPreview: () => void;
  onConfirm: () => void;
};

export const MixMasterDialog: React.FC<Props> = ({
  open,
  settings,
  previewUrl,
  loading,
  onClose,
  onChange,
  onPreview,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const previewAudioRef = React.useRef<HTMLAudioElement>(null);
  const [previewPlaying, setPreviewPlaying] = React.useState<boolean>(false);
  const [previewCurrentSec, setPreviewCurrentSec] = React.useState<number>(0);
  const [previewDurationSec, setPreviewDurationSec] = React.useState<number>(0);

  const update = (updater: (draft: SimpleMixMasterSettings) => void) => {
    const next = JSON.parse(
      JSON.stringify(settings),
    ) as SimpleMixMasterSettings;
    updater(next);
    onChange(next);
  };

  const handleResetAll = () => {
    onChange(cloneMixMasterSettings(defaultMixMasterSettings));
  };

  const handleResetVocal = () => {
    update((draft) => {
      draft.vocal = cloneMixMasterSettings(defaultMixMasterSettings).vocal;
    });
  };

  const handleResetBackground = () => {
    update((draft) => {
      draft.background = cloneMixMasterSettings(
        defaultMixMasterSettings,
      ).background;
    });
  };

  const handleResetMastering = () => {
    update((draft) => {
      draft.mastering = cloneMixMasterSettings(
        defaultMixMasterSettings,
      ).mastering;
    });
  };

  React.useEffect(() => {
    setPreviewPlaying(false);
    setPreviewCurrentSec(0);
    setPreviewDurationSec(0);
  }, [previewUrl]);

  const handlePreviewPlayToggle = async () => {
    const audio = previewAudioRef.current;
    if (!audio || !previewUrl) return;
    if (previewPlaying) {
      audio.pause();
      setPreviewPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPreviewPlaying(true);
    } catch {
      setPreviewPlaying(false);
    }
  };

  const handlePreviewSeek = (_event: Event, value: number | number[]) => {
    const v = value as number;
    const audio = previewAudioRef.current;
    if (!audio) return;
    audio.currentTime = v;
    setPreviewCurrentSec(v);
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle sx={{ display: "flex", alignItems: "center", py: 1.5 }}>
        <Box sx={{ flex: 1 }}>{t("editor.mixMaster.title")}</Box>
        <Button size="small" onClick={handleResetAll} disabled={loading}>
          {t("editor.mixMaster.resetAll")}
        </Button>
        <IconButton
          size="small"
          onClick={onClose}
          disabled={loading}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2">
              {t("editor.mixMaster.vocal")}
            </Typography>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleResetVocal();
              }}
              disabled={loading}
              sx={{ ml: 1 }}
            >
              {t("editor.mixMaster.reset")}
            </Button>
          </AccordionSummary>
          <AccordionDetails
            sx={{ display: "flex", flexDirection: "column", gap: 1 }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.vocal.highPass.enabled}
                  onChange={(e) =>
                    update((draft) => {
                      draft.vocal.highPass.enabled = e.target.checked;
                    })
                  }
                />
              }
              label={t("editor.mixMaster.vocalHighPass")}
            />
            <LabeledSlider
              label={t("editor.mixMaster.vocalHighPassCutoff")}
              value={settings.vocal.highPass.cutoffHz}
              onChange={(v) =>
                update((draft) => {
                  draft.vocal.highPass.cutoffHz = v;
                })
              }
              min={MIX_MASTER_UI_RANGES.vocal.highPassCutoffHz.min}
              max={MIX_MASTER_UI_RANGES.vocal.highPassCutoffHz.max}
              step={MIX_MASTER_UI_RANGES.vocal.highPassCutoffHz.step}
              unit="Hz"
              valueMinWidth={64}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.vocal.compressor.enabled}
                  onChange={(e) =>
                    update((draft) => {
                      draft.vocal.compressor.enabled = e.target.checked;
                    })
                  }
                />
              }
              label={t("editor.mixMaster.vocalCompressor")}
            />
            <LabeledSlider
              label={t("editor.mixMaster.vocalCompressorThreshold")}
              value={settings.vocal.compressor.thresholdDb}
              onChange={(v) =>
                update((draft) => {
                  draft.vocal.compressor.thresholdDb = v;
                })
              }
              min={MIX_MASTER_UI_RANGES.vocal.compressorThresholdDb.min}
              max={MIX_MASTER_UI_RANGES.vocal.compressorThresholdDb.max}
              step={MIX_MASTER_UI_RANGES.vocal.compressorThresholdDb.step}
              unit="dB"
              valueMinWidth={64}
            />
            <LabeledSlider
              label={t("editor.mixMaster.vocalCompressorRatio")}
              value={settings.vocal.compressor.ratio}
              onChange={(v) =>
                update((draft) => {
                  draft.vocal.compressor.ratio = v;
                })
              }
              min={MIX_MASTER_UI_RANGES.vocal.compressorRatio.min}
              max={MIX_MASTER_UI_RANGES.vocal.compressorRatio.max}
              step={MIX_MASTER_UI_RANGES.vocal.compressorRatio.step}
              unit=":"
              valueMinWidth={64}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.vocal.normalize.enabled}
                  onChange={(e) =>
                    update((draft) => {
                      draft.vocal.normalize.enabled = e.target.checked;
                    })
                  }
                />
              }
              label={t("editor.mixMaster.vocalNormalize")}
            />
            <LabeledSlider
              label={t("editor.mixMaster.vocalNormalizeTarget")}
              value={settings.vocal.normalize.targetDb}
              onChange={(v) =>
                update((draft) => {
                  draft.vocal.normalize.targetDb = v;
                })
              }
              min={MIX_MASTER_UI_RANGES.vocal.normalizeTargetDb.min}
              max={MIX_MASTER_UI_RANGES.vocal.normalizeTargetDb.max}
              step={MIX_MASTER_UI_RANGES.vocal.normalizeTargetDb.step}
              unit="dB"
              valueMinWidth={64}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.vocal.eqBoost.enabled}
                  onChange={(e) =>
                    update((draft) => {
                      draft.vocal.eqBoost.enabled = e.target.checked;
                    })
                  }
                />
              }
              label={t("editor.mixMaster.vocalEqBoost")}
            />
            <LabeledSlider
              label={t("editor.mixMaster.vocalEqBoostFreq")}
              value={settings.vocal.eqBoost.freqHz}
              onChange={(v) =>
                update((draft) => {
                  draft.vocal.eqBoost.freqHz = v;
                })
              }
              min={MIX_MASTER_UI_RANGES.vocal.eqBoostFreqHz.min}
              max={MIX_MASTER_UI_RANGES.vocal.eqBoostFreqHz.max}
              step={MIX_MASTER_UI_RANGES.vocal.eqBoostFreqHz.step}
              unit="Hz"
              valueMinWidth={64}
            />
            <LabeledSlider
              label={t("editor.mixMaster.vocalEqBoostGain")}
              value={settings.vocal.eqBoost.gainDb}
              onChange={(v) =>
                update((draft) => {
                  draft.vocal.eqBoost.gainDb = v;
                })
              }
              min={MIX_MASTER_UI_RANGES.vocal.eqBoostGainDb.min}
              max={MIX_MASTER_UI_RANGES.vocal.eqBoostGainDb.max}
              step={MIX_MASTER_UI_RANGES.vocal.eqBoostGainDb.step}
              unit="dB"
              valueMinWidth={64}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.vocal.reverb.enabled}
                  onChange={(e) =>
                    update((draft) => {
                      draft.vocal.reverb.enabled = e.target.checked;
                    })
                  }
                />
              }
              label={t("editor.mixMaster.vocalReverb")}
            />
            <LabeledSlider
              label={t("editor.mixMaster.vocalReverbWet")}
              value={Math.round(settings.vocal.reverb.wet * 100)}
              onChange={(v) =>
                update((draft) => {
                  draft.vocal.reverb.wet = v / 100;
                })
              }
              min={MIX_MASTER_UI_RANGES.vocal.reverbWetPercent.min}
              max={MIX_MASTER_UI_RANGES.vocal.reverbWetPercent.max}
              step={MIX_MASTER_UI_RANGES.vocal.reverbWetPercent.step}
            />
            <LabeledSlider
              label={t("editor.mixMaster.vocalReverbDecay")}
              value={Math.round(settings.vocal.reverb.decay * 100)}
              onChange={(v) =>
                update((draft) => {
                  draft.vocal.reverb.decay = v / 100;
                })
              }
              min={MIX_MASTER_UI_RANGES.vocal.reverbDecayPercent.min}
              max={MIX_MASTER_UI_RANGES.vocal.reverbDecayPercent.max}
              step={MIX_MASTER_UI_RANGES.vocal.reverbDecayPercent.step}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2">
              {t("editor.mixMaster.background")}
            </Typography>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleResetBackground();
              }}
              disabled={loading}
              sx={{ ml: 1 }}
            >
              {t("editor.mixMaster.reset")}
            </Button>
          </AccordionSummary>
          <AccordionDetails
            sx={{ display: "flex", flexDirection: "column", gap: 1 }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.background.normalize.enabled}
                  onChange={(e) =>
                    update((draft) => {
                      draft.background.normalize.enabled = e.target.checked;
                    })
                  }
                />
              }
              label={t("editor.mixMaster.backgroundNormalize")}
            />
            <LabeledSlider
              label={t("editor.mixMaster.backgroundNormalizeTarget")}
              value={settings.background.normalize.targetDb}
              onChange={(v) =>
                update((draft) => {
                  draft.background.normalize.targetDb = v;
                })
              }
              min={MIX_MASTER_UI_RANGES.background.normalizeTargetDb.min}
              max={MIX_MASTER_UI_RANGES.background.normalizeTargetDb.max}
              step={MIX_MASTER_UI_RANGES.background.normalizeTargetDb.step}
              unit="dB"
              valueMinWidth={64}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.background.eqCut.enabled}
                  onChange={(e) =>
                    update((draft) => {
                      draft.background.eqCut.enabled = e.target.checked;
                    })
                  }
                />
              }
              label={t("editor.mixMaster.backgroundEqCut")}
            />
            <LabeledSlider
              label={t("editor.mixMaster.backgroundEqCutFreq")}
              value={settings.background.eqCut.cutoffHz}
              onChange={(v) =>
                update((draft) => {
                  draft.background.eqCut.cutoffHz = v;
                })
              }
              min={MIX_MASTER_UI_RANGES.background.eqCutFreqHz.min}
              max={MIX_MASTER_UI_RANGES.background.eqCutFreqHz.max}
              step={MIX_MASTER_UI_RANGES.background.eqCutFreqHz.step}
              unit="Hz"
              valueMinWidth={64}
            />
            <LabeledSlider
              label={t("editor.mixMaster.backgroundEqCutGain")}
              value={settings.background.eqCut.gainDb}
              onChange={(v) =>
                update((draft) => {
                  draft.background.eqCut.gainDb = v;
                })
              }
              min={MIX_MASTER_UI_RANGES.background.eqCutGainDb.min}
              max={MIX_MASTER_UI_RANGES.background.eqCutGainDb.max}
              step={MIX_MASTER_UI_RANGES.background.eqCutGainDb.step}
              unit="dB"
              valueMinWidth={64}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2">
              {t("editor.mixMaster.mastering")}
            </Typography>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleResetMastering();
              }}
              disabled={loading}
              sx={{ ml: 1 }}
            >
              {t("editor.mixMaster.reset")}
            </Button>
          </AccordionSummary>
          <AccordionDetails
            sx={{ display: "flex", flexDirection: "column", gap: 1 }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.mastering.rmsNormalize.enabled}
                  onChange={(e) =>
                    update((draft) => {
                      draft.mastering.rmsNormalize.enabled = e.target.checked;
                    })
                  }
                />
              }
              label={t("editor.mixMaster.masteringRms")}
            />
            <FormControlLabel
              sx={{ ml: 2 }}
              control={
                <Switch
                  size="small"
                  checked={settings.mastering.rmsNormalize.damped}
                  disabled={!settings.mastering.rmsNormalize.enabled}
                  onChange={(e) =>
                    update((draft) => {
                      draft.mastering.rmsNormalize.damped = e.target.checked;
                    })
                  }
                />
              }
              label={t("editor.mixMaster.masteringRmsDamping")}
            />
            <LabeledSlider
              label={t("editor.mixMaster.masteringRmsTarget")}
              value={settings.mastering.rmsNormalize.targetRmsDb}
              onChange={(v) =>
                update((draft) => {
                  draft.mastering.rmsNormalize.targetRmsDb = v;
                })
              }
              min={MIX_MASTER_UI_RANGES.mastering.rmsTargetDb.min}
              max={MIX_MASTER_UI_RANGES.mastering.rmsTargetDb.max}
              step={MIX_MASTER_UI_RANGES.mastering.rmsTargetDb.step}
              unit="dB"
              valueMinWidth={64}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.mastering.limiter.enabled}
                  onChange={(e) =>
                    update((draft) => {
                      draft.mastering.limiter.enabled = e.target.checked;
                    })
                  }
                />
              }
              label={t("editor.mixMaster.masteringLimiter")}
            />
            <LabeledSlider
              label={t("editor.mixMaster.masteringLimiterGain")}
              value={settings.mastering.limiter.gainDb}
              onChange={(v) =>
                update((draft) => {
                  draft.mastering.limiter.gainDb = v;
                })
              }
              min={MIX_MASTER_UI_RANGES.mastering.limiterGainDb.min}
              max={MIX_MASTER_UI_RANGES.mastering.limiterGainDb.max}
              step={MIX_MASTER_UI_RANGES.mastering.limiterGainDb.step}
              unit="dB"
              valueMinWidth={64}
            />
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          px: 2,
          py: 1,
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.5 }}
          >
            {t("editor.mixMaster.preview")}
          </Typography>
          <audio
            ref={previewAudioRef}
            src={previewUrl}
            preload="auto"
            onLoadedMetadata={(e) => {
              const duration = Number.isFinite(e.currentTarget.duration)
                ? e.currentTarget.duration
                : 0;
              setPreviewDurationSec(duration);
            }}
            onTimeUpdate={(e) => {
              setPreviewCurrentSec(e.currentTarget.currentTime);
            }}
            onEnded={() => {
              setPreviewPlaying(false);
              setPreviewCurrentSec(previewDurationSec);
            }}
            style={{ display: "none" }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              size="small"
              onClick={handlePreviewPlayToggle}
              disabled={!previewUrl}
            >
              {previewPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <Slider
              size="small"
              min={0}
              max={previewDurationSec > 0 ? previewDurationSec : 1}
              step={0.01}
              value={Math.min(previewCurrentSec, previewDurationSec || 1)}
              onChange={handlePreviewSeek}
              disabled={!previewUrl}
            />
          </Box>
          {!previewUrl && (
            <Typography variant="caption" color="text.secondary">
              {t("editor.mixMaster.previewHint")}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          <Button onClick={onClose} disabled={loading}>
            {t("editor.videoExport.cancel")}
          </Button>
          <Button onClick={onPreview} disabled={loading} variant="outlined">
            {t("editor.mixMaster.previewButton")}
          </Button>
          <Button onClick={onConfirm} disabled={loading} variant="contained">
            {t("editor.mixMaster.applyButton")}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

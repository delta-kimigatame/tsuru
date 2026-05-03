import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { LabeledSlider } from "../../../components/EditorView/VideoExportDialog/LabeledSlider";
import { MIX_MASTER_UI_RANGES } from "../../../config/mixMaster";
import { SimpleMixMasterSettings } from "../../../types/mixMaster";

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

  const update = (updater: (draft: SimpleMixMasterSettings) => void) => {
    const next = JSON.parse(
      JSON.stringify(settings),
    ) as SimpleMixMasterSettings;
    updater(next);
    onChange(next);
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle sx={{ display: "flex", alignItems: "center", py: 1.5 }}>
        <Box sx={{ flex: 1 }}>{t("editor.mixMaster.title")}</Box>
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
        <Typography variant="body2" color="text.secondary">
          {t("editor.mixMaster.description")}
        </Typography>

        <Divider>{t("editor.mixMaster.vocal")}</Divider>
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
        <Typography variant="caption" color="text.secondary">
          {t("editor.mixMaster.vocalCompressorThresholdHelp")}
        </Typography>
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

        <Divider>{t("editor.mixMaster.background")}</Divider>
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

        <Divider>{t("editor.mixMaster.mastering")}</Divider>
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
              checked={settings.mastering.hardLimiter.enabled}
              onChange={(e) =>
                update((draft) => {
                  draft.mastering.hardLimiter.enabled = e.target.checked;
                })
              }
            />
          }
          label={t("editor.mixMaster.masteringLimiter")}
        />
        <LabeledSlider
          label={t("editor.mixMaster.masteringLimiterCeiling")}
          value={settings.mastering.hardLimiter.ceilingDb}
          onChange={(v) =>
            update((draft) => {
              draft.mastering.hardLimiter.ceilingDb = v;
            })
          }
          min={MIX_MASTER_UI_RANGES.mastering.limiterCeilingDb.min}
          max={MIX_MASTER_UI_RANGES.mastering.limiterCeilingDb.max}
          step={MIX_MASTER_UI_RANGES.mastering.limiterCeilingDb.step}
          unit="dB"
          valueMinWidth={64}
        />
        <LabeledSlider
          label={t("editor.mixMaster.masteringLimiterRelease")}
          value={settings.mastering.hardLimiter.releaseMs}
          onChange={(v) =>
            update((draft) => {
              draft.mastering.hardLimiter.releaseMs = v;
            })
          }
          min={MIX_MASTER_UI_RANGES.mastering.limiterReleaseMs.min}
          max={MIX_MASTER_UI_RANGES.mastering.limiterReleaseMs.max}
          step={MIX_MASTER_UI_RANGES.mastering.limiterReleaseMs.step}
          unit="ms"
          valueMinWidth={64}
        />
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 180, mr: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.5 }}
          >
            {t("editor.mixMaster.preview")}
          </Typography>
          <audio
            src={previewUrl}
            controls
            style={{ width: "100%" }}
            preload="auto"
          />
          {!previewUrl && (
            <Typography variant="caption" color="text.secondary">
              {t("editor.mixMaster.previewHint")}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
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

import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import ImageIcon from "@mui/icons-material/Image";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { BackgroundSection } from "../../../components/EditorView/VideoExportDialog/BackgroundSection";
import { ExportPreviewCanvas } from "../../../components/EditorView/VideoExportDialog/ExportPreviewCanvas";
import { LyricsSubtitleSection } from "../../../components/EditorView/VideoExportDialog/LyricsSubtitleSection";
import { PianorollSection } from "../../../components/EditorView/VideoExportDialog/PianorollSection";
import { PortraitSection } from "../../../components/EditorView/VideoExportDialog/PortraitSection";
import { ResolutionSection } from "../../../components/EditorView/VideoExportDialog/ResolutionSection";
import { TextOverlaySection } from "../../../components/EditorView/VideoExportDialog/TextOverlaySection";
import { WaveformEffectSection } from "../../../components/EditorView/VideoExportDialog/WaveformEffectSection";
import {
  useVideoExportForm,
  type VideoExportFormContext,
} from "../../../hooks/useVideoExportForm";
import type { Note } from "../../../lib/Note";
import type { PianorollVideoOptions } from "../../../utils/pianorollVideo";
import type {
  BackgroundOptions,
  BgPaddingMode,
  LyricsOptions,
  PortraitOptions,
  TextOptions,
  VideoResolution,
  WaveformEffectOptions,
} from "../../../utils/videoExport";
import { extractLyricsSegments } from "../../../utils/videoExport";
import { FontSelector } from "../../components/FontSelector";

type Props = {
  onBack: () => void;
  onConfirm: (
    imageFile: File | null,
    resolution: VideoResolution,
    background: BackgroundOptions,
    bgPaddingMode: BgPaddingMode,
    bgImageOpacity: number,
    portraitOptions: PortraitOptions | null,
    mainTextOptions: TextOptions | null,
    subTextOptions: TextOptions | null,
    lyricsOptions: LyricsOptions | null,
    pianorollOptions: PianorollVideoOptions | null,
    waveformOptions: WaveformEffectOptions | null,
  ) => void;
  synthesisProgress: boolean;
  synthesisCount: number;
  videoExportTotal?: number;
  wavBuffer: ArrayBuffer;
  wavOffsetMs: number;
  onWavOffsetMsChange: (value: number) => void;
  ustOffsetMs: number;
  onUstOffsetMsChange: (value: number) => void;
  portraitBlob?: Blob | null;
  portraitFileName?: string;
  onPortraitSelected: (file: File | null) => void;
  portraitNaturalHeight?: number;
  voiceIcon?: ArrayBuffer;
  iconFileName?: string;
  onIconSelected: (file: File | null) => void;
  notes?: Note[];
  notesLeftMs?: number[];
  selectNotesIndex?: number[];
  ustFlags?: string;
  formContext: VideoExportFormContext;
};

export const VideoEditorView: React.FC<Props> = ({
  onBack,
  onConfirm,
  synthesisProgress,
  synthesisCount,
  videoExportTotal,
  wavBuffer,
  wavOffsetMs,
  onWavOffsetMsChange,
  ustOffsetMs,
  onUstOffsetMsChange,
  portraitBlob,
  portraitFileName,
  onPortraitSelected,
  portraitNaturalHeight,
  voiceIcon,
  iconFileName,
  onIconSelected,
  notes,
  notesLeftMs,
  selectNotesIndex,
  ustFlags,
  formContext,
}) => {
  const { t } = useTranslation();
  const portraitInputRef = React.useRef<HTMLInputElement>(null);
  const iconInputRef = React.useRef<HTMLInputElement>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const previewEndSecRef = React.useRef<number | null>(null);
  const autoOpenedPreviewRef = React.useRef(false);
  const [previewVisibleOnMobile, setPreviewVisibleOnMobile] =
    React.useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = React.useState(false);
  const [previewError, setPreviewError] = React.useState<string | undefined>(
    undefined,
  );

  const adjustedNotesLeftMs = React.useMemo(() => {
    if (!notesLeftMs) return undefined;
    return notesLeftMs.map((ms) => ms + ustOffsetMs);
  }, [notesLeftMs, ustOffsetMs]);

  const firstLyricSegment = React.useMemo(() => {
    if (!notes || !adjustedNotesLeftMs || notes.length === 0) return undefined;
    const segments = extractLyricsSegments(
      notes,
      adjustedNotesLeftMs,
      selectNotesIndex ?? [],
    );
    return segments.length > 0 ? segments[0] : undefined;
  }, [notes, adjustedNotesLeftMs, selectNotesIndex]);

  const previewStartMs = firstLyricSegment
    ? Math.max(0, firstLyricSegment.startMs + wavOffsetMs)
    : undefined;
  const previewEndMs = firstLyricSegment
    ? Math.max(0, firstLyricSegment.endMs + wavOffsetMs)
    : undefined;

  const form = useVideoExportForm(
    true,
    {
      onClose: onBack,
      onConfirm,
      portraitBlob,
      portraitNaturalHeight,
      voiceIcon,
      notes,
      notesLeftMs: adjustedNotesLeftMs,
      selectNotesIndex,
      ustFlags,
    },
    formContext,
  );

  const startTimelinePreview = form.startTimelinePreview;
  const stopTimelinePreview = form.stopTimelinePreview;

  const openPreviewForAutoPlay = React.useCallback(() => {
    if (!previewVisibleOnMobile) {
      setPreviewVisibleOnMobile(true);
      autoOpenedPreviewRef.current = true;
      return;
    }
    autoOpenedPreviewRef.current = false;
  }, [previewVisibleOnMobile]);

  const stopPreview = React.useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    stopTimelinePreview();
    previewEndSecRef.current = null;
    if (autoOpenedPreviewRef.current) {
      setPreviewVisibleOnMobile(false);
      autoOpenedPreviewRef.current = false;
    }
    setIsPreviewPlaying(false);
  }, [stopTimelinePreview]);

  const handlePreviewTimeUpdate = React.useCallback(() => {
    const audio = audioRef.current;
    const endSec = previewEndSecRef.current;
    if (!audio || endSec === null) return;
    if (audio.currentTime >= endSec) {
      stopPreview();
    }
  }, [stopPreview]);

  React.useEffect(() => {
    const url = URL.createObjectURL(
      new Blob([wavBuffer], { type: "audio/wav" }),
    );
    const audio = new Audio(url);
    audio.preload = "auto";
    audioRef.current = audio;

    const handleEnded = () => {
      stopPreview();
    };

    audio.addEventListener("timeupdate", handlePreviewTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handlePreviewTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audioRef.current = null;
      URL.revokeObjectURL(url);
    };
  }, [wavBuffer, handlePreviewTimeUpdate, stopPreview]);

  const handlePreviewPlayToggle = React.useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPreviewPlaying) {
      stopPreview();
      return;
    }
    if (previewStartMs === undefined || previewEndMs === undefined) {
      setPreviewError(t("videoEditor.previewNoLyrics"));
      return;
    }
    openPreviewForAutoPlay();
    setPreviewError(undefined);
    const durationSec = Number.isFinite(audio.duration)
      ? Math.max(0, audio.duration)
      : Number.POSITIVE_INFINITY;
    const startSec = Math.min(previewStartMs / 1000, durationSec);
    const endSec = Math.max(
      startSec,
      Math.min(previewEndMs / 1000, durationSec),
    );
    previewEndSecRef.current = endSec;
    audio.currentTime = startSec;
    try {
      await audio.play();
      await startTimelinePreview({
        startMs: previewStartMs,
        endMs: previewEndMs,
        wavBuffer,
        getCurrentSec: () => {
          const a = audioRef.current;
          if (!a) return null;
          if (a.paused) return null;
          return a.currentTime;
        },
      });
      setIsPreviewPlaying(true);
    } catch (e) {
      setPreviewError(t("videoEditor.previewPlayError", { error: String(e) }));
      stopPreview();
    }
  }, [
    isPreviewPlaying,
    previewStartMs,
    previewEndMs,
    stopPreview,
    t,
    startTimelinePreview,
    wavBuffer,
    openPreviewForAutoPlay,
  ]);

  const anyPreviewPlaying =
    isPreviewPlaying ||
    form.isWaveformSinePreviewPlaying ||
    form.isAnimPreviewPlaying;

  React.useEffect(() => {
    if (!anyPreviewPlaying && autoOpenedPreviewRef.current) {
      setPreviewVisibleOnMobile(false);
      autoOpenedPreviewRef.current = false;
    }
  }, [anyPreviewPlaying]);

  const handleWaveformPreviewStart = React.useCallback(() => {
    openPreviewForAutoPlay();
    form.startWaveformSinePreview();
  }, [openPreviewForAutoPlay, form]);

  const handleAnimPreviewStart = React.useCallback(() => {
    openPreviewForAutoPlay();
    form.startAnimPreview();
  }, [openPreviewForAutoPlay, form]);

  React.useEffect(() => {
    if (!notes || !adjustedNotesLeftMs || notes.length === 0) return;
    form.setLyricsSegmentsDirectly(
      extractLyricsSegments(notes, adjustedNotesLeftMs, selectNotesIndex ?? []),
    );
  }, [
    notes,
    adjustedNotesLeftMs,
    selectNotesIndex,
    form.setLyricsSegmentsDirectly,
  ]);

  return (
    <Box
      sx={{
        p: 2,
        height: "100dvh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <input
        ref={iconInputRef}
        hidden
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onIconSelected(file);
          e.currentTarget.value = "";
        }}
      />
      <input
        ref={portraitInputRef}
        hidden
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPortraitSelected(file);
          e.currentTarget.value = "";
        }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <BackgroundSection
            imageFile={form.imageFile}
            imagePreviewUrl={form.imagePreviewUrl}
            fileInputRef={form.fileInputRef}
            onFileChange={form.handleFileChange}
            onClearImage={form.clearImage}
            backgroundStyle={form.backgroundStyle}
            onBackgroundStyleChange={form.setBackgroundStyle}
            bgColor={form.bgColor}
            secondaryColor={form.bgSecondaryColor}
            secondaryOpacity={form.bgSecondaryOpacity}
            colorInput={form.colorInput}
            secondaryColorInput={form.secondaryColorInput}
            onColorInputChange={form.handleColorInputChange}
            onSecondaryColorInputChange={form.handleSecondaryColorInputChange}
            onColorApply={form.applyColor}
            onSecondaryColorApply={form.applySecondaryColor}
            onSecondaryOpacityChange={form.setBgSecondaryOpacity}
            patternSize={form.backgroundPatternSize}
            onPatternSizeChange={form.setBackgroundPatternSize}
            patternGap={form.backgroundPatternGap}
            onPatternGapChange={form.setBackgroundPatternGap}
            patternRotation={form.backgroundPatternRotation}
            onPatternRotationChange={form.setBackgroundPatternRotation}
            bgSize={form.bgSize}
            bgPaddingMode={form.bgPaddingMode}
            onBgPaddingModeChange={form.setBgPaddingMode}
            bgImageOpacity={form.bgImageOpacity}
            onBgImageOpacityChange={form.setBgImageOpacity}
          />

          <ResolutionSection
            bgSize={form.bgSize}
            onBgSizeChange={form.setBgSize}
            imageFile={form.imageFile}
          />

          {notes && notes.length > 0 && (
            <PianorollSection
              enabled={form.pianorollEnabled}
              layout={form.pianorollLayout}
              colorTheme={form.pianorollColorTheme}
              themeMode={form.pianorollThemeMode}
              horizontalZoom={form.pianorollHorizontalZoom}
              verticalZoom={form.pianorollVerticalZoom}
              onEnabledChange={form.setPianorollEnabled}
              onLayoutChange={form.setPianorollLayout}
              onColorThemeChange={form.setPianorollColorTheme}
              onThemeModeChange={form.setPianorollThemeMode}
              onHorizontalZoomChange={form.setPianorollHorizontalZoom}
              onVerticalZoomChange={form.setPianorollVerticalZoom}
              onApplyThemeToOutside={form.applyPianorollThemeToOutside}
              showKeyboard={form.pianorollShowKeyboard}
              showBackground={form.pianorollShowBackground}
              voiceColorEnabled={form.pianorollVoiceColorEnabled}
              voiceColorLegendEnabled={form.pianorollVoiceColorLegendEnabled}
              voiceColorLegendPosition={form.pianorollVoiceColorLegendPosition}
              voiceColorLegendXPercent={form.pianorollVoiceColorLegendXPercent}
              voiceColorLegendYPercent={form.pianorollVoiceColorLegendYPercent}
              voiceColorLegendScale={form.pianorollVoiceColorLegendScale}
              voiceColors={form.pianorollVoiceColors}
              defaultVoiceColorMap={form.pianorollDefaultVoiceColorMap}
              voiceColorMap={form.pianorollVoiceColorMap}
              onShowKeyboardChange={form.setPianorollShowKeyboard}
              onShowBackgroundChange={form.setPianorollShowBackground}
              onVoiceColorEnabledChange={form.setPianorollVoiceColorEnabled}
              onVoiceColorLegendEnabledChange={
                form.setPianorollVoiceColorLegendEnabled
              }
              onVoiceColorLegendPositionChange={
                form.setPianorollVoiceColorLegendPosition
              }
              onVoiceColorLegendXPercentChange={
                form.setPianorollVoiceColorLegendXPercent
              }
              onVoiceColorLegendYPercentChange={
                form.setPianorollVoiceColorLegendYPercent
              }
              onVoiceColorLegendScaleChange={
                form.setPianorollVoiceColorLegendScale
              }
              onVoiceColorMapChange={form.handlePianorollVoiceColorChange}
              currentNoteInfoEnabled={form.pianorollCurrentNoteInfoEnabled}
              currentNoteInfoShowVelocity={
                form.pianorollCurrentNoteInfoShowVelocity
              }
              currentNoteInfoShowFlags={form.pianorollCurrentNoteInfoShowFlags}
              currentNoteInfoShowIntensity={
                form.pianorollCurrentNoteInfoShowIntensity
              }
              onCurrentNoteInfoEnabledChange={
                form.setPianorollCurrentNoteInfoEnabled
              }
              onCurrentNoteInfoShowVelocityChange={
                form.setPianorollCurrentNoteInfoShowVelocity
              }
              onCurrentNoteInfoShowFlagsChange={
                form.setPianorollCurrentNoteInfoShowFlags
              }
              onCurrentNoteInfoShowIntensityChange={
                form.setPianorollCurrentNoteInfoShowIntensity
              }
              currentNoteInfoPosition={form.pianorollCurrentNoteInfoPosition}
              currentNoteInfoXPercent={form.pianorollCurrentNoteInfoXPercent}
              currentNoteInfoYPercent={form.pianorollCurrentNoteInfoYPercent}
              currentNoteInfoScale={form.pianorollCurrentNoteInfoScale}
              onCurrentNoteInfoPositionChange={
                form.setPianorollCurrentNoteInfoPosition
              }
              onCurrentNoteInfoXPercentChange={
                form.setPianorollCurrentNoteInfoXPercent
              }
              onCurrentNoteInfoYPercentChange={
                form.setPianorollCurrentNoteInfoYPercent
              }
              onCurrentNoteInfoScaleChange={
                form.setPianorollCurrentNoteInfoScale
              }
              extraContentWhenEnabled={
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<ImageIcon />}
                    onClick={() => iconInputRef.current?.click()}
                  >
                    {iconFileName ?? t("videoEditor.loadIconOptional")}
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    startIcon={<RestartAltIcon />}
                    disabled={!voiceIcon}
                    onClick={() => onIconSelected(null)}
                  >
                    {t("videoEditor.clearOptional")}
                  </Button>
                </Stack>
              }
            />
          )}

          <Box
            sx={{
              p: 1.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("videoEditor.syncAdjustTitle")}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label={t("videoEditor.wavOffsetMs")}
                value={wavOffsetMs}
                onChange={(e) => {
                  const next = Number.parseInt(e.target.value || "0", 10);
                  onWavOffsetMsChange(Number.isNaN(next) ? 0 : next);
                }}
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                label={t("videoEditor.ustOffsetMs")}
                value={ustOffsetMs}
                onChange={(e) => {
                  const next = Number.parseInt(e.target.value || "0", 10);
                  onUstOffsetMsChange(Number.isNaN(next) ? 0 : next);
                }}
              />
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ mt: 1 }}
            >
              <Button
                variant="contained"
                color="inherit"
                fullWidth
                startIcon={<RestartAltIcon />}
                onClick={() => {
                  onWavOffsetMsChange(0);
                  onUstOffsetMsChange(0);
                }}
              >
                {t("videoEditor.resetOffsets")}
              </Button>
              <Button
                variant="contained"
                color={isPreviewPlaying ? "error" : "primary"}
                fullWidth
                startIcon={<AudiotrackIcon />}
                onClick={handlePreviewPlayToggle}
              >
                {isPreviewPlaying
                  ? t("videoEditor.stopPreview")
                  : t("videoEditor.playFirstLyricSegment")}
              </Button>
            </Stack>
            <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
              {previewStartMs !== undefined && previewEndMs !== undefined
                ? t("videoEditor.previewRangeMs", {
                    start: Math.floor(previewStartMs),
                    end: Math.floor(previewEndMs),
                  })
                : t("videoEditor.previewNoLyrics")}
            </Typography>
            {previewError && (
              <Typography
                variant="caption"
                color="error"
                sx={{ display: "block", mt: 0.5 }}
              >
                {previewError}
              </Typography>
            )}
          </Box>

          <WaveformEffectSection
            enabled={form.waveformEnabled}
            type={form.waveformType}
            drawMethod={form.waveformDrawMethod}
            fftShape={form.waveformFftShape}
            fftGaugeShape={form.waveformFftGaugeShape}
            fftGaugeSegments={form.waveformFftGaugeSegments}
            fftBinCount={form.waveformFftBinCount}
            fftSize={form.waveformFftSize}
            fftIconShape={form.waveformFftIconShape}
            fftIconStrengthMode={form.waveformFftIconStrengthMode}
            fftIconSizePercent={form.waveformFftIconSizePercent}
            fftIconGlowStrength={form.waveformFftIconGlowStrength}
            fftIconEmitStrength={form.waveformFftIconEmitStrength}
            color={form.waveformColor}
            colorMode={form.waveformColorMode}
            opacity={form.waveformOpacity}
            xPercent={form.waveformXPercent}
            yPercent={form.waveformYPercent}
            rotation={form.waveformRotation}
            widthPercent={form.waveformWidthPercent}
            heightPercent={form.waveformHeightPercent}
            startAngle={form.waveformStartAngle}
            rotationSpeed={form.waveformRotationSpeed}
            windowSize={form.waveformWindowSize}
            strokeWidthPx={form.waveformStrokeWidthPx}
            isPreviewPlaying={form.isWaveformSinePreviewPlaying}
            onEnabledChange={form.setWaveformEnabled}
            onTypeChange={form.setWaveformType}
            onDrawMethodChange={form.setWaveformDrawMethod}
            onFftShapeChange={form.setWaveformFftShape}
            onFftGaugeShapeChange={form.setWaveformFftGaugeShape}
            onFftGaugeSegmentsChange={form.setWaveformFftGaugeSegments}
            onFftBinCountChange={form.setWaveformFftBinCount}
            onFftSizeChange={form.setWaveformFftSize}
            onFftIconShapeChange={form.setWaveformFftIconShape}
            onFftIconStrengthModeChange={form.setWaveformFftIconStrengthMode}
            onFftIconSizePercentChange={form.setWaveformFftIconSizePercent}
            onFftIconGlowStrengthChange={form.setWaveformFftIconGlowStrength}
            onFftIconEmitStrengthChange={form.setWaveformFftIconEmitStrength}
            onColorChange={form.setWaveformColor}
            onColorModeChange={form.setWaveformColorMode}
            onOpacityChange={form.setWaveformOpacity}
            onXPercentChange={form.setWaveformXPercent}
            onYPercentChange={form.setWaveformYPercent}
            onRotationChange={form.setWaveformRotation}
            onWidthPercentChange={form.setWaveformWidthPercent}
            onHeightPercentChange={form.setWaveformHeightPercent}
            onStartAngleChange={form.setWaveformStartAngle}
            onRotationSpeedChange={form.setWaveformRotationSpeed}
            onWindowSizeChange={form.setWaveformWindowSize}
            onStrokeWidthPxChange={form.setWaveformStrokeWidthPx}
            onStartPreview={handleWaveformPreviewStart}
            onStopPreview={form.stopWaveformSinePreview}
          />

          <Box
            sx={{
              p: 1.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("videoEditor.portraitLoadTitle")}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ImageIcon />}
                onClick={() => portraitInputRef.current?.click()}
              >
                {portraitFileName ?? t("videoEditor.loadPortraitOptional")}
              </Button>
              <Button
                variant="contained"
                color="error"
                fullWidth
                startIcon={<RestartAltIcon />}
                disabled={!portraitBlob}
                onClick={() => onPortraitSelected(null)}
              >
                {t("videoEditor.clearOptional")}
              </Button>
            </Stack>
          </Box>

          {portraitBlob && (
            <PortraitSection
              showPortrait={form.showPortrait}
              portraitOpacity={form.portraitOpacity}
              portraitScalePercent={form.portraitScalePercent}
              portraitXOffset={form.portraitXOffset}
              portraitYOffset={form.portraitYOffset}
              portraitMaxScale={form.portraitMaxScale}
              portraitXOffsetMin={form.portraitXOffsetMin}
              portraitYOffsetMin={form.portraitYOffsetMin}
              onShowPortraitChange={form.setShowPortrait}
              onPortraitOpacityChange={form.setPortraitOpacity}
              onPortraitScaleChange={form.setPortraitScalePercent}
              onPortraitXOffsetChange={form.setPortraitXOffset}
              onPortraitYOffsetChange={form.setPortraitYOffset}
            />
          )}

          <FontSelector
            value={form.mainTextFontFamily}
            onChange={form.setMainTextFontFamily}
            labelKey="videoEditor.fontSelectorMain"
          />
          <TextOverlaySection
            sectionTitleKey="editor.videoExport.mainTextSection"
            text={form.mainText}
            fontSize={form.mainTextFontSize}
            bold={form.mainTextBold}
            italic={form.mainTextItalic}
            color={form.mainTextColor}
            xPercent={form.mainTextX}
            yPercent={form.mainTextY}
            shadowEnabled={form.mainTextShadowEnabled}
            shadowColor={form.mainTextShadowColor}
            shadowBlur={form.mainTextShadowBlur}
            strokeEnabled={form.mainTextStrokeEnabled}
            strokeColor={form.mainTextStrokeColor}
            strokeWidth={form.mainTextStrokeWidth}
            bgBarEnabled={form.mainTextBgBarEnabled}
            bgBarColor={form.mainTextBgBarColor}
            bgBarOpacity={form.mainTextBgBarOpacity}
            onTextChange={form.setMainText}
            onFontSizeChange={form.setMainTextFontSize}
            onBoldItalicChange={form.handleMainBoldItalicChange}
            onColorChange={form.setMainTextColor}
            onXPercentChange={form.setMainTextX}
            onYPercentChange={form.setMainTextY}
            onShadowEnabledChange={form.setMainTextShadowEnabled}
            onShadowColorChange={form.setMainTextShadowColor}
            onShadowBlurChange={form.setMainTextShadowBlur}
            onStrokeEnabledChange={form.setMainTextStrokeEnabled}
            onStrokeColorChange={form.setMainTextStrokeColor}
            onStrokeWidthChange={form.setMainTextStrokeWidth}
            onBgBarEnabledChange={form.setMainTextBgBarEnabled}
            onBgBarColorChange={form.setMainTextBgBarColor}
            onBgBarOpacityChange={form.setMainTextBgBarOpacity}
          />

          <FontSelector
            value={form.subTextFontFamily}
            onChange={form.setSubTextFontFamily}
            labelKey="videoEditor.fontSelectorSub"
          />
          <TextOverlaySection
            sectionTitleKey="editor.videoExport.subTextSection"
            text={form.subText}
            fontSize={form.subTextFontSize}
            bold={form.subTextBold}
            italic={form.subTextItalic}
            color={form.subTextColor}
            xPercent={form.subTextX}
            yPercent={form.subTextY}
            shadowEnabled={form.subTextShadowEnabled}
            shadowColor={form.subTextShadowColor}
            shadowBlur={form.subTextShadowBlur}
            strokeEnabled={form.subTextStrokeEnabled}
            strokeColor={form.subTextStrokeColor}
            strokeWidth={form.subTextStrokeWidth}
            bgBarEnabled={form.subTextBgBarEnabled}
            bgBarColor={form.subTextBgBarColor}
            bgBarOpacity={form.subTextBgBarOpacity}
            onTextChange={form.setSubText}
            onFontSizeChange={form.setSubTextFontSize}
            onBoldItalicChange={form.handleSubBoldItalicChange}
            onColorChange={form.setSubTextColor}
            onXPercentChange={form.setSubTextX}
            onYPercentChange={form.setSubTextY}
            onShadowEnabledChange={form.setSubTextShadowEnabled}
            onShadowColorChange={form.setSubTextShadowColor}
            onShadowBlurChange={form.setSubTextShadowBlur}
            onStrokeEnabledChange={form.setSubTextStrokeEnabled}
            onStrokeColorChange={form.setSubTextStrokeColor}
            onStrokeWidthChange={form.setSubTextStrokeWidth}
            onBgBarEnabledChange={form.setSubTextBgBarEnabled}
            onBgBarColorChange={form.setSubTextBgBarColor}
            onBgBarOpacityChange={form.setSubTextBgBarOpacity}
          />

          <FontSelector
            value={form.lyricsFontFamily}
            onChange={form.setLyricsFontFamily}
            labelKey="videoEditor.fontSelectorLyrics"
          />
          <LyricsSubtitleSection
            lyricsEnabled={form.lyricsEnabled}
            segments={form.lyricsSegments}
            fontSize={form.lyricsFontSize}
            color={form.lyricsColor}
            yPercent={form.lyricsYPercent}
            maxWidthPercent={form.lyricsMaxWidthPercent}
            onEnabledChange={form.setLyricsEnabled}
            onFontSizeChange={form.setLyricsFontSize}
            onColorChange={form.setLyricsColor}
            onYPercentChange={form.setLyricsYPercent}
            onMaxWidthPercentChange={form.setLyricsMaxWidthPercent}
            onUpdateLyric={form.updateSegmentLyric}
            onUpdateSegments={form.setLyricsSegmentsDirectly}
            onMerge={form.mergeSegments}
            onSplit={form.splitSegment}
            shadowEnabled={form.lyricsShadowEnabled}
            shadowColor={form.lyricsShadowColor}
            shadowBlur={form.lyricsShadowBlur}
            strokeEnabled={form.lyricsStrokeEnabled}
            strokeColor={form.lyricsStrokeColor}
            strokeWidth={form.lyricsStrokeWidth}
            bgBarEnabled={form.lyricsBgBarEnabled}
            bgBarColor={form.lyricsBgBarColor}
            bgBarOpacity={form.lyricsBgBarOpacity}
            onShadowEnabledChange={form.setLyricsShadowEnabled}
            onShadowColorChange={form.setLyricsShadowColor}
            onShadowBlurChange={form.setLyricsShadowBlur}
            onStrokeEnabledChange={form.setLyricsStrokeEnabled}
            onStrokeColorChange={form.setLyricsStrokeColor}
            onStrokeWidthChange={form.setLyricsStrokeWidth}
            onBgBarEnabledChange={form.setLyricsBgBarEnabled}
            onBgBarColorChange={form.setLyricsBgBarColor}
            onBgBarOpacityChange={form.setLyricsBgBarOpacity}
            fadeEnabled={form.lyricsFadeEnabled}
            fadeDurationMs={form.lyricsFadeDurationMs}
            onFadeEnabledChange={form.setLyricsFadeEnabled}
            onFadeDurationMsChange={form.setLyricsFadeDurationMs}
            scaleEnabled={form.lyricsScaleEnabled}
            scaleFrom={form.lyricsScaleFrom}
            scaleDurationMs={form.lyricsScaleDurationMs}
            onScaleEnabledChange={form.setLyricsScaleEnabled}
            onScaleFromChange={form.setLyricsScaleFrom}
            onScaleDurationMsChange={form.setLyricsScaleDurationMs}
            slideEnabled={form.lyricsSlideEnabled}
            slideAmount={form.lyricsSlideAmount}
            slideDurationMs={form.lyricsSlideDurationMs}
            onSlideEnabledChange={form.setLyricsSlideEnabled}
            onSlideAmountChange={form.setLyricsSlideAmount}
            onSlideDurationMsChange={form.setLyricsSlideDurationMs}
            slideInEnabled={form.lyricsSlideInEnabled}
            slideInDirection={form.lyricsSlideInDirection}
            slideOutEnabled={form.lyricsSlideOutEnabled}
            slideOutDirection={form.lyricsSlideOutDirection}
            slideInOutDurationMs={form.lyricsSlideInOutDurationMs}
            onSlideInEnabledChange={form.setLyricsSlideInEnabled}
            onSlideInDirectionChange={form.setLyricsSlideInDirection}
            onSlideOutEnabledChange={form.setLyricsSlideOutEnabled}
            onSlideOutDirectionChange={form.setLyricsSlideOutDirection}
            onSlideInOutDurationMsChange={form.setLyricsSlideInOutDurationMs}
            blurEnabled={form.lyricsBlurEnabled}
            blurAmount={form.lyricsBlurAmount}
            blurDurationMs={form.lyricsBlurDurationMs}
            onBlurEnabledChange={form.setLyricsBlurEnabled}
            onBlurAmountChange={form.setLyricsBlurAmount}
            onBlurDurationMsChange={form.setLyricsBlurDurationMs}
            wipeInEnabled={form.lyricsWipeInEnabled}
            wipeInDirection={form.lyricsWipeInDirection}
            wipeOutEnabled={form.lyricsWipeOutEnabled}
            wipeOutDirection={form.lyricsWipeOutDirection}
            wipeDurationMs={form.lyricsWipeDurationMs}
            onWipeInEnabledChange={form.setLyricsWipeInEnabled}
            onWipeInDirectionChange={form.setLyricsWipeInDirection}
            onWipeOutEnabledChange={form.setLyricsWipeOutEnabled}
            onWipeOutDirectionChange={form.setLyricsWipeOutDirection}
            onWipeDurationMsChange={form.setLyricsWipeDurationMs}
            bounceInEnabled={form.lyricsBounceInEnabled}
            bounceInDirection={form.lyricsBounceInDirection}
            bounceOutEnabled={form.lyricsBounceOutEnabled}
            bounceOutDirection={form.lyricsBounceOutDirection}
            bounceInOutDurationMs={form.lyricsBounceInOutDurationMs}
            onBounceInEnabledChange={form.setLyricsBounceInEnabled}
            onBounceInDirectionChange={form.setLyricsBounceInDirection}
            onBounceOutEnabledChange={form.setLyricsBounceOutEnabled}
            onBounceOutDirectionChange={form.setLyricsBounceOutDirection}
            onBounceInOutDurationMsChange={form.setLyricsBounceInOutDurationMs}
            staggerEnabled={form.lyricsStaggerEnabled}
            staggerIntervalMs={form.lyricsStaggerIntervalMs}
            onStaggerEnabledChange={form.setLyricsStaggerEnabled}
            onStaggerIntervalMsChange={form.setLyricsStaggerIntervalMs}
            isAnimPreviewPlaying={form.isAnimPreviewPlaying}
            onStartAnimPreview={handleAnimPreviewStart}
            onStopAnimPreview={form.stopAnimPreview}
          />
        </Box>

        <Box
          sx={{
            display: {
              xs: previewVisibleOnMobile ? "flex" : "none",
              sm: "flex",
            },
            width: { xs: "100%", sm: "40%" },
            flexShrink: 0,
            maxHeight: { xs: "45%", sm: "none" },
            minHeight: { xs: 220, sm: 0 },
            overflowY: "auto",
            p: 2,
            flexDirection: "column",
            gap: 2,
            borderTop: { xs: "1px solid", sm: "none" },
            borderLeft: { xs: "none", sm: "1px solid" },
            borderColor: "divider",
          }}
        >
          <ExportPreviewCanvas
            canvasRef={form.previewCanvasRef}
            visible={form.imageFile !== null || form.bgSize !== "image"}
          />
        </Box>
      </Box>

      <Divider sx={{ mt: 1 }} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          pt: 1,
        }}
      >
        <IconButton
          color="inherit"
          onClick={() => {
            autoOpenedPreviewRef.current = false;
            setPreviewVisibleOnMobile((prev) => !prev);
          }}
          sx={{ display: { xs: "inline-flex", sm: "none" } }}
          aria-label={previewVisibleOnMobile ? "hide preview" : "show preview"}
        >
          {previewVisibleOnMobile ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button
            onClick={onBack}
            disabled={synthesisProgress}
            variant="contained"
            color="inherit"
          >
            {t("videoEditor.back")}
          </Button>
          <Button
            onClick={form.handleConfirm}
            variant="contained"
            color="primary"
            disabled={
              synthesisProgress || (form.bgSize === "image" && !form.imageFile)
            }
          >
            {synthesisProgress
              ? t("videoEditor.progressFrames", {
                  current: synthesisCount,
                  total: videoExportTotal ?? synthesisCount,
                })
              : t("editor.videoExport.confirm")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

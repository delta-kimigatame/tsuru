import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
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
  progressText?: string;
  portraitBlob?: Blob | null;
  portraitNaturalHeight?: number;
  voiceIcon?: ArrayBuffer;
  notes?: Note[];
  notesLeftMs?: number[];
  selectNotesIndex?: number[];
  formContext: VideoExportFormContext;
};

export const VideoEditorView: React.FC<Props> = ({
  onBack,
  onConfirm,
  synthesisProgress,
  progressText,
  portraitBlob,
  portraitNaturalHeight,
  voiceIcon,
  notes,
  notesLeftMs,
  selectNotesIndex,
  formContext,
}) => {
  const { t } = useTranslation();
  const form = useVideoExportForm(
    true,
    {
      onClose: onBack,
      onConfirm,
      portraitBlob,
      portraitNaturalHeight,
      voiceIcon,
      notes,
      notesLeftMs,
      selectNotesIndex,
    },
    formContext,
  );

  return (
    <Box
      sx={{
        p: 2,
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          disabled={synthesisProgress}
        >
          素材選択へ戻る
        </Button>
        <Typography variant="h6" sx={{ flex: 1 }}>
          {t("editor.videoExport.title")}
        </Typography>
        {synthesisProgress && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">
              {progressText ?? "動画生成中..."}
            </Typography>
          </Box>
        )}
      </Box>
      <Divider />

      <Box
        sx={{
          mt: 1,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          flex: 1,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            flex: 1,
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
            />
          )}

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
            onStartPreview={form.startWaveformSinePreview}
            onStopPreview={form.stopWaveformSinePreview}
          />

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
            onStartAnimPreview={form.startAnimPreview}
            onStopAnimPreview={form.stopAnimPreview}
          />
        </Box>

        <Box
          sx={{
            width: { xs: "100%", sm: "40%" },
            flexShrink: 0,
            maxHeight: { xs: "35%", sm: "none" },
            overflowY: { xs: "hidden", sm: "auto" },
            p: 2,
            display: "flex",
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
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 1 }}>
        <Button
          onClick={onBack}
          disabled={synthesisProgress}
          variant="contained"
          color="inherit"
        >
          戻る
        </Button>
        <Button
          onClick={form.handleConfirm}
          variant="contained"
          color="primary"
          disabled={
            synthesisProgress || (form.bgSize === "image" && !form.imageFile)
          }
        >
          {t("editor.videoExport.confirm")}
        </Button>
      </Box>
    </Box>
  );
};

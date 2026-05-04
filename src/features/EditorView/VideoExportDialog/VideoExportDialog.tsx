import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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
import { useVideoExportForm } from "../../../hooks/useVideoExportForm";
import type { Note } from "../../../lib/Note";
import type { PianorollVideoOptions } from "../../../utils/pianorollVideo";
import type {
  BackgroundOptions,
  BgPaddingMode,
  LyricsOptions,
  PortraitOptions,
  TextOptions,
  VideoResolution,
} from "../../../utils/videoExport";

type Props = {
  open: boolean;
  onClose: () => void;
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
  ) => void;
  synthesisProgress: boolean;
  /** vb.portrait を Blob に変換したもの。立絵なしの場合は null */
  portraitBlob?: Blob | null;
  /** vb.portraitHeight */
  portraitNaturalHeight?: number;
  voiceIcon?: ArrayBuffer;
  notes?: Note[];
  notesLeftMs?: number[];
  selectNotesIndex?: number[];
};

export const VideoExportDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  synthesisProgress,
  portraitBlob,
  portraitNaturalHeight,
  voiceIcon,
  notes,
  notesLeftMs,
  selectNotesIndex,
}) => {
  const { t } = useTranslation();
  const form = useVideoExportForm(open, {
    onClose,
    onConfirm,
    portraitBlob,
    portraitNaturalHeight,
    voiceIcon,
    notes,
    notesLeftMs,
    selectNotesIndex,
  });

  return (
    <Dialog open={open} onClose={form.handleClose} fullScreen>
      <DialogTitle sx={{ display: "flex", alignItems: "center", py: 1.5 }}>
        <Box sx={{ flex: 1 }}>{t("editor.videoExport.title")}</Box>
        <IconButton
          size="small"
          onClick={form.handleClose}
          disabled={synthesisProgress}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 0,
          overflow: "hidden",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            flex: 1,
            overflow: "hidden",
          }}
        >
          {/* 設定ペイン */}
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
                onEnabledChange={form.setPianorollEnabled}
                onLayoutChange={form.setPianorollLayout}
                onColorThemeChange={form.setPianorollColorTheme}
                onThemeModeChange={form.setPianorollThemeMode}
                onApplyThemeToOutside={form.applyPianorollThemeToOutside}
              />
            )}

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
              onBounceInOutDurationMsChange={
                form.setLyricsBounceInOutDurationMs
              }
              staggerEnabled={form.lyricsStaggerEnabled}
              staggerIntervalMs={form.lyricsStaggerIntervalMs}
              onStaggerEnabledChange={form.setLyricsStaggerEnabled}
              onStaggerIntervalMsChange={form.setLyricsStaggerIntervalMs}
              isAnimPreviewPlaying={form.isAnimPreviewPlaying}
              onStartAnimPreview={form.startAnimPreview}
              onStopAnimPreview={form.stopAnimPreview}
            />
          </Box>

          {/* プレビューペイン */}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={form.handleClose} disabled={synthesisProgress}>
          {t("editor.videoExport.cancel")}
        </Button>
        <Button
          onClick={form.handleConfirm}
          variant="contained"
          disabled={
            synthesisProgress || (form.bgSize === "image" && !form.imageFile)
          }
        >
          {t("editor.videoExport.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

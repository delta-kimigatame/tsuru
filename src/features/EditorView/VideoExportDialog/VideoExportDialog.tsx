import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { BackgroundSection } from "../../../components/EditorView/VideoExportDialog/BackgroundSection";
import { ExportPreviewCanvas } from "../../../components/EditorView/VideoExportDialog/ExportPreviewCanvas";
import { LyricsSubtitleSection } from "../../../components/EditorView/VideoExportDialog/LyricsSubtitleSection";
import { PortraitSection } from "../../../components/EditorView/VideoExportDialog/PortraitSection";
import { TextOverlaySection } from "../../../components/EditorView/VideoExportDialog/TextOverlaySection";
import { useVideoExportForm } from "../../../hooks/useVideoExportForm";
import type { Note } from "../../../lib/Note";
import type {
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
    imageFile: File,
    resolution: VideoResolution,
    bgPaddingMode: BgPaddingMode,
    bgColor: string,
    bgImageOpacity: number,
    portraitOptions: PortraitOptions | null,
    mainTextOptions: TextOptions | null,
    subTextOptions: TextOptions | null,
    lyricsOptions: LyricsOptions | null,
  ) => void;
  synthesisProgress: boolean;
  /** vb.portrait を Blob に変換したもの。立絵なしの場合は null */
  portraitBlob?: Blob | null;
  /** vb.portraitHeight */
  portraitNaturalHeight?: number;
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
  notes,
  notesLeftMs,
  selectNotesIndex,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const form = useVideoExportForm(open, {
    onClose,
    onConfirm,
    portraitBlob,
    portraitNaturalHeight,
    notes,
    notesLeftMs,
    selectNotesIndex,
  });

  return (
    <Dialog
      open={open}
      onClose={form.handleClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
    >
      <DialogTitle>{t("editor.videoExport.title")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <BackgroundSection
            imageFile={form.imageFile}
            imagePreviewUrl={form.imagePreviewUrl}
            fileInputRef={form.fileInputRef}
            onFileChange={form.handleFileChange}
            onClearImage={form.clearImage}
            bgColor={form.bgColor}
            colorInput={form.colorInput}
            onColorInputChange={form.handleColorInputChange}
            onColorApply={form.applyColor}
            bgSize={form.bgSize}
            onBgSizeChange={form.setBgSize}
            bgPaddingMode={form.bgPaddingMode}
            onBgPaddingModeChange={form.setBgPaddingMode}
            bgImageOpacity={form.bgImageOpacity}
            onBgImageOpacityChange={form.setBgImageOpacity}
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
            onTextChange={form.setMainText}
            onFontSizeChange={form.setMainTextFontSize}
            onBoldItalicChange={form.handleMainBoldItalicChange}
            onColorChange={form.setMainTextColor}
            onXPercentChange={form.setMainTextX}
            onYPercentChange={form.setMainTextY}
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
            onTextChange={form.setSubText}
            onFontSizeChange={form.setSubTextFontSize}
            onBoldItalicChange={form.handleSubBoldItalicChange}
            onColorChange={form.setSubTextColor}
            onXPercentChange={form.setSubTextX}
            onYPercentChange={form.setSubTextY}
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
          />

          <ExportPreviewCanvas
            canvasRef={form.previewCanvasRef}
            visible={form.imageFile !== null || form.bgSize !== "image"}
          />
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

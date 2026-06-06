import AccountBoxIcon from "@mui/icons-material/AccountBox";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import LyricsIcon from "@mui/icons-material/Lyrics";
import TitleIcon from "@mui/icons-material/Title";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
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
    waveformOptions: WaveformEffectOptions | null,
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
  ustFlags?: string;
  formContext: VideoExportFormContext;
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
  ustFlags,
  formContext,
}) => {
  const { t } = useTranslation();
  type TabId =
    | "resolution"
    | "background"
    | "pianoroll"
    | "waveform"
    | "portrait"
    | "text"
    | "lyrics";

  const form = useVideoExportForm(
    open,
    {
      onClose,
      onConfirm,
      portraitBlob,
      portraitNaturalHeight,
      voiceIcon,
      notes,
      notesLeftMs,
      selectNotesIndex,
      ustFlags,
    },
    formContext,
  );

  const visibleTabs = React.useMemo(
    () => [
      {
        id: "resolution" as const,
        icon: <AspectRatioIcon fontSize="small" />,
        ariaLabel: t("editor.videoExport.resolution"),
      },
      {
        id: "background" as const,
        icon: <WallpaperIcon fontSize="small" />,
        ariaLabel: t("editor.videoExport.background"),
      },
      ...(notes && notes.length > 0
        ? [
            {
              id: "pianoroll" as const,
              icon: <ViewModuleIcon fontSize="small" />,
              ariaLabel: t("editor.videoExport.pianoRoll"),
            },
          ]
        : []),
      {
        id: "waveform" as const,
        icon: <GraphicEqIcon fontSize="small" />,
        ariaLabel: t("editor.videoExport.waveformEffect"),
      },
      ...(portraitBlob
        ? [
            {
              id: "portrait" as const,
              icon: <AccountBoxIcon fontSize="small" />,
              ariaLabel: t("editor.videoExport.portraitSection"),
            },
          ]
        : []),
      {
        id: "text" as const,
        icon: <TitleIcon fontSize="small" />,
        ariaLabel: t("editor.videoExport.mainTextSection"),
      },
      {
        id: "lyrics" as const,
        icon: <LyricsIcon fontSize="small" />,
        ariaLabel: t("editor.videoExport.lyricsSection"),
      },
    ],
    [notes, portraitBlob, t],
  );

  const [activeTab, setActiveTab] = React.useState<TabId>("background");
  const [previewVisibleOnMobile, setPreviewVisibleOnMobile] =
    React.useState(false);
  const autoOpenedPreviewRef = React.useRef(false);

  const openPreviewForAutoPlay = React.useCallback(() => {
    if (!previewVisibleOnMobile) {
      setPreviewVisibleOnMobile(true);
      autoOpenedPreviewRef.current = true;
      return;
    }
    autoOpenedPreviewRef.current = false;
  }, [previewVisibleOnMobile]);

  const anyPreviewPlaying =
    form.isWaveformSinePreviewPlaying ||
    form.isAnimPreviewPlaying ||
    form.isBackgroundMovePreviewPlaying;

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
    if (!visibleTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(visibleTabs[0]?.id ?? "background");
    }
  }, [activeTab, visibleTabs]);

  const renderActiveSection = () => {
    switch (activeTab) {
      case "background":
        return (
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
            noiseIntensity={form.backgroundNoiseIntensity}
            onNoiseIntensityChange={form.setBackgroundNoiseIntensity}
            seed={form.backgroundSeed}
            onSeedChange={form.setBackgroundSeed}
            gradientEnabled={form.backgroundGradientEnabled}
            onGradientEnabledChange={form.setBackgroundGradientEnabled}
            gradientType={form.backgroundGradientType}
            onGradientTypeChange={form.setBackgroundGradientType}
            gradientAngleDeg={form.backgroundGradientAngleDeg}
            onGradientAngleDegChange={form.setBackgroundGradientAngleDeg}
            gradientStartPercent={form.backgroundGradientStartPercent}
            onGradientStartPercentChange={
              form.setBackgroundGradientStartPercent
            }
            gradientEndPercent={form.backgroundGradientEndPercent}
            onGradientEndPercentChange={form.setBackgroundGradientEndPercent}
            gradientStrengthPercent={form.backgroundGradientStrengthPercent}
            onGradientStrengthPercentChange={
              form.setBackgroundGradientStrengthPercent
            }
            movementEnabled={form.backgroundMovementEnabled}
            onMovementEnabledChange={form.setBackgroundMovementEnabled}
            moveXPerFrame={form.backgroundMoveXPerFrame}
            onMoveXPerFrameChange={form.setBackgroundMoveXPerFrame}
            moveYPerFrame={form.backgroundMoveYPerFrame}
            onMoveYPerFrameChange={form.setBackgroundMoveYPerFrame}
            isMovementPreviewPlaying={form.isBackgroundMovePreviewPlaying}
            onStartMovementPreview={form.startBackgroundMovePreview}
            onStopMovementPreview={form.stopBackgroundMovePreview}
            bgSize={form.bgSize}
            bgPaddingMode={form.bgPaddingMode}
            onBgPaddingModeChange={form.setBgPaddingMode}
            bgImageOpacity={form.bgImageOpacity}
            onBgImageOpacityChange={form.setBgImageOpacity}
          />
        );
      case "resolution":
        return (
          <ResolutionSection
            bgSize={form.bgSize}
            onBgSizeChange={form.setBgSize}
            imageFile={form.imageFile}
          />
        );
      case "pianoroll":
        return notes && notes.length > 0 ? (
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
            onCurrentNoteInfoScaleChange={form.setPianorollCurrentNoteInfoScale}
          />
        ) : null;
      case "waveform":
        return (
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
        );
      case "portrait":
        return portraitBlob ? (
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
        ) : null;
      case "text":
        return (
          <>
            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
              <InputLabel id="video-export-text-display-mode-label">
                {t("editor.videoExport.textDisplayMode")}
              </InputLabel>
              <Select
                labelId="video-export-text-display-mode-label"
                label={t("editor.videoExport.textDisplayMode")}
                value={form.textDisplayMode}
                onChange={(e) =>
                  form.setTextDisplayMode(
                    e.target.value as "always" | "intro" | "outro",
                  )
                }
              >
                <MenuItem value="always">
                  {t("editor.videoExport.textDisplayModeAlways")}
                </MenuItem>
                <MenuItem value="intro">
                  {t("editor.videoExport.textDisplayModeIntro")}
                </MenuItem>
                <MenuItem value="outro">
                  {t("editor.videoExport.textDisplayModeOutro")}
                </MenuItem>
              </Select>
            </FormControl>
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
            <Box sx={{ mt: 2 }}>
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
            </Box>
          </>
        );
      case "lyrics":
      default:
        return (
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
        );
    }
  };

  return (
    <Dialog open={open} onClose={form.handleClose} fullScreen>
      <DialogTitle sx={{ py: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_, next: TabId) => setActiveTab(next)}
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            sx={{ flex: 1, minHeight: 40 }}
          >
            {visibleTabs.map((tab) => (
              <Tab
                key={tab.id}
                value={tab.id}
                icon={tab.icon}
                aria-label={tab.ariaLabel}
              />
            ))}
          </Tabs>
          <IconButton
            color="inherit"
            onClick={() => setPreviewVisibleOnMobile((prev) => !prev)}
            sx={{ display: { xs: "inline-flex", sm: "none" } }}
            aria-label={
              previewVisibleOnMobile ? "hide preview" : "show preview"
            }
          >
            {previewVisibleOnMobile ? (
              <VisibilityOffIcon />
            ) : (
              <VisibilityIcon />
            )}
          </IconButton>
        </Box>
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
            }}
          >
            {renderActiveSection()}
          </Box>

          {/* プレビューペイン */}
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
      </DialogContent>
      <DialogActions>
        <Button
          onClick={form.handleClose}
          disabled={synthesisProgress}
          variant="contained"
          color="inherit"
        >
          {t("editor.videoExport.cancel")}
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
      </DialogActions>
    </Dialog>
  );
};

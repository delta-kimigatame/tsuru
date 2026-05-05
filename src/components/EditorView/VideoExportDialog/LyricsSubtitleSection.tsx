import CallSplitIcon from "@mui/icons-material/CallSplit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MergeIcon from "@mui/icons-material/MergeType";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Collapse,
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItemButton,
  Popover,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  LYRICS_BLUR_AMOUNT_MAX,
  LYRICS_BLUR_AMOUNT_MIN,
  LYRICS_BLUR_DURATION_MS_MAX,
  LYRICS_BLUR_DURATION_MS_MIN,
  LYRICS_BOUNCE_IN_OUT_DURATION_MS_MAX,
  LYRICS_BOUNCE_IN_OUT_DURATION_MS_MIN,
  LYRICS_FADE_DURATION_MS_MAX,
  LYRICS_FADE_DURATION_MS_MIN,
  LYRICS_FONT_SIZE_MAX,
  LYRICS_FONT_SIZE_MIN,
  LYRICS_SCALE_DURATION_MS_MAX,
  LYRICS_SCALE_DURATION_MS_MIN,
  LYRICS_SCALE_FROM_MAX,
  LYRICS_SCALE_FROM_MIN,
  LYRICS_SHADOW_BLUR_MAX,
  LYRICS_SHADOW_BLUR_MIN,
  LYRICS_SLIDE_AMOUNT_MAX,
  LYRICS_SLIDE_AMOUNT_MIN,
  LYRICS_SLIDE_DURATION_MS_MAX,
  LYRICS_SLIDE_DURATION_MS_MIN,
  LYRICS_SLIDE_IN_OUT_DURATION_MS_MAX,
  LYRICS_SLIDE_IN_OUT_DURATION_MS_MIN,
  LYRICS_STAGGER_INTERVAL_MS_MAX,
  LYRICS_STAGGER_INTERVAL_MS_MIN,
  LYRICS_STROKE_WIDTH_MAX,
  LYRICS_STROKE_WIDTH_MIN,
  LYRICS_WIPE_DURATION_MS_MAX,
  LYRICS_WIPE_DURATION_MS_MIN,
  TEXT_POSITION_MAX,
  TEXT_POSITION_MIN,
} from "../../../config/videoExport";
import { LyricsCardDialog } from "../../../features/EditorView/VideoExportDialog/LyricsCardDialog";
import { LyricsCardEncodingDialog } from "../../../features/EditorView/VideoExportDialog/LyricsCardEncodingDialog";
import type { LyricsSegment, SlideDirection } from "../../../utils/videoExport";
import { LabeledSlider } from "./LabeledSlider";

type Props = {
  lyricsEnabled: boolean;
  segments: LyricsSegment[];
  fontSize: number;
  color: string;
  yPercent: number;
  maxWidthPercent: number;
  onEnabledChange: (v: boolean) => void;
  onFontSizeChange: (v: number) => void;
  onColorChange: (v: string) => void;
  onYPercentChange: (v: number) => void;
  onMaxWidthPercentChange: (v: number) => void;
  onUpdateLyric: (i: number, value: string) => void;
  onUpdateSegments: (newSegments: LyricsSegment[]) => void;
  onMerge: (i: number) => void;
  onSplit: (i: number, k: number) => void;
  // 文字装飾
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  strokeEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  bgBarEnabled: boolean;
  bgBarColor: string;
  bgBarOpacity: number;
  onShadowEnabledChange: (v: boolean) => void;
  onShadowColorChange: (v: string) => void;
  onShadowBlurChange: (v: number) => void;
  onStrokeEnabledChange: (v: boolean) => void;
  onStrokeColorChange: (v: string) => void;
  onStrokeWidthChange: (v: number) => void;
  onBgBarEnabledChange: (v: boolean) => void;
  onBgBarColorChange: (v: string) => void;
  onBgBarOpacityChange: (v: number) => void;
  // フェード
  fadeEnabled: boolean;
  fadeDurationMs: number;
  onFadeEnabledChange: (v: boolean) => void;
  onFadeDurationMsChange: (v: number) => void;
  // スケール登場/退場
  scaleEnabled: boolean;
  scaleFrom: number;
  scaleDurationMs: number;
  onScaleEnabledChange: (v: boolean) => void;
  onScaleFromChange: (v: number) => void;
  onScaleDurationMsChange: (v: number) => void;
  // スライド登場/退場
  slideEnabled: boolean;
  slideAmount: number;
  slideDurationMs: number;
  onSlideEnabledChange: (v: boolean) => void;
  onSlideAmountChange: (v: number) => void;
  onSlideDurationMsChange: (v: number) => void;
  // スライドイン/アウト (方向指定)
  slideInEnabled: boolean;
  slideInDirection: SlideDirection;
  slideOutEnabled: boolean;
  slideOutDirection: SlideDirection;
  slideInOutDurationMs: number;
  onSlideInEnabledChange: (v: boolean) => void;
  onSlideInDirectionChange: (v: SlideDirection) => void;
  onSlideOutEnabledChange: (v: boolean) => void;
  onSlideOutDirectionChange: (v: SlideDirection) => void;
  onSlideInOutDurationMsChange: (v: number) => void;
  // ブラーイン/ブラーアウト
  blurEnabled: boolean;
  blurAmount: number;
  blurDurationMs: number;
  onBlurEnabledChange: (v: boolean) => void;
  onBlurAmountChange: (v: number) => void;
  onBlurDurationMsChange: (v: number) => void;
  // ワイプイン/アウト
  wipeInEnabled: boolean;
  wipeInDirection: SlideDirection;
  wipeOutEnabled: boolean;
  wipeOutDirection: SlideDirection;
  wipeDurationMs: number;
  onWipeInEnabledChange: (v: boolean) => void;
  onWipeInDirectionChange: (v: SlideDirection) => void;
  onWipeOutEnabledChange: (v: boolean) => void;
  onWipeOutDirectionChange: (v: SlideDirection) => void;
  onWipeDurationMsChange: (v: number) => void;
  // バウンスイン/アウト
  bounceInEnabled: boolean;
  bounceInDirection: SlideDirection;
  bounceOutEnabled: boolean;
  bounceOutDirection: SlideDirection;
  bounceInOutDurationMs: number;
  onBounceInEnabledChange: (v: boolean) => void;
  onBounceInDirectionChange: (v: SlideDirection) => void;
  onBounceOutEnabledChange: (v: boolean) => void;
  onBounceOutDirectionChange: (v: SlideDirection) => void;
  onBounceInOutDurationMsChange: (v: number) => void;
  // スタガー
  staggerEnabled: boolean;
  staggerIntervalMs: number;
  onStaggerEnabledChange: (v: boolean) => void;
  onStaggerIntervalMsChange: (v: number) => void;
  // アニメーションプレビュー
  isAnimPreviewPlaying: boolean;
  onStartAnimPreview: () => void;
  onStopAnimPreview: () => void;
};

/** ms → "m:ss.s" 形式の時刻文字列 */
const ms2timeStr = (ms: number): string => {
  const totalS = ms / 1000;
  const m = Math.floor(totalS / 60);
  const s = totalS % 60;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
};

export const LyricsSubtitleSection: React.FC<Props> = ({
  lyricsEnabled,
  segments,
  fontSize,
  color,
  yPercent,
  maxWidthPercent,
  onEnabledChange,
  onFontSizeChange,
  onColorChange,
  onYPercentChange,
  onMaxWidthPercentChange,
  onUpdateLyric,
  onUpdateSegments,
  onMerge,
  onSplit,
  shadowEnabled,
  shadowColor,
  shadowBlur,
  strokeEnabled,
  strokeColor,
  strokeWidth,
  bgBarEnabled,
  bgBarColor,
  bgBarOpacity,
  onShadowEnabledChange,
  onShadowColorChange,
  onShadowBlurChange,
  onStrokeEnabledChange,
  onStrokeColorChange,
  onStrokeWidthChange,
  onBgBarEnabledChange,
  onBgBarColorChange,
  onBgBarOpacityChange,
  fadeEnabled,
  fadeDurationMs,
  onFadeEnabledChange,
  onFadeDurationMsChange,
  scaleEnabled,
  scaleFrom,
  scaleDurationMs,
  onScaleEnabledChange,
  onScaleFromChange,
  onScaleDurationMsChange,
  slideEnabled,
  slideAmount,
  slideDurationMs,
  onSlideEnabledChange,
  onSlideAmountChange,
  onSlideDurationMsChange,
  slideInEnabled,
  slideInDirection,
  slideOutEnabled,
  slideOutDirection,
  slideInOutDurationMs,
  onSlideInEnabledChange,
  onSlideInDirectionChange,
  onSlideOutEnabledChange,
  onSlideOutDirectionChange,
  onSlideInOutDurationMsChange,
  blurEnabled,
  blurAmount,
  blurDurationMs,
  onBlurEnabledChange,
  onBlurAmountChange,
  onBlurDurationMsChange,
  wipeInEnabled,
  wipeInDirection,
  wipeOutEnabled,
  wipeOutDirection,
  wipeDurationMs,
  onWipeInEnabledChange,
  onWipeInDirectionChange,
  onWipeOutEnabledChange,
  onWipeOutDirectionChange,
  onWipeDurationMsChange,
  bounceInEnabled,
  bounceInDirection,
  bounceOutEnabled,
  bounceOutDirection,
  bounceInOutDurationMs,
  onBounceInEnabledChange,
  onBounceInDirectionChange,
  onBounceOutEnabledChange,
  onBounceOutDirectionChange,
  onBounceInOutDurationMsChange,
  staggerEnabled,
  staggerIntervalMs,
  onStaggerEnabledChange,
  onStaggerIntervalMsChange,
  isAnimPreviewPlaying,
  onStartAnimPreview,
  onStopAnimPreview,
}) => {
  const { t } = useTranslation();

  // 歌詞カード読み込み関連 state
  const lyricsCardInputRef = React.useRef<HTMLInputElement>(null);
  const [cardFileBuf, setCardFileBuf] = React.useState<ArrayBuffer | null>(
    null,
  );
  const [cardEncodingDialogOpen, setCardEncodingDialogOpen] =
    React.useState(false);
  const [cardWords, setCardWords] = React.useState<string[] | null>(null);
  const [cardDialogOpen, setCardDialogOpen] = React.useState(false);

  const handleCardFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 同じファイルを再度選択できるよう value をリセット
    e.target.value = "";
    try {
      const buf = await file.arrayBuffer();
      setCardFileBuf(buf);
      setCardEncodingDialogOpen(true);
    } catch {
      // 読み込み失敗時は何もしない
    }
  };

  const handleCardClipboardLoad = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.length === 0) return;
      const buf = new TextEncoder().encode(text).buffer;
      setCardFileBuf(buf);
      setCardEncodingDialogOpen(true);
    } catch {
      // クリップボードアクセス失敗時は何もしない
    }
  };

  const handleCardEncodingConfirm = (words: string[]) => {
    if (words.length === 0) return;
    setCardWords(words);
    setCardEncodingDialogOpen(false);
    setCardDialogOpen(true);
  };

  const handleCardApply = (newSegments: LyricsSegment[]) => {
    onUpdateSegments(newSegments);
    setCardDialogOpen(false);
  };

  // 分割ポップオーバーの管理: { rowIndex, anchorEl }
  const [splitPopover, setSplitPopover] = React.useState<{
    rowIndex: number;
    anchorEl: HTMLElement;
  } | null>(null);

  const handleSplitClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    i: number,
  ) => {
    setSplitPopover({ rowIndex: i, anchorEl: e.currentTarget });
  };

  const handleSplitSelect = (k: number) => {
    if (splitPopover !== null) {
      onSplit(splitPopover.rowIndex, k);
    }
    setSplitPopover(null);
  };

  const splitSeg =
    splitPopover !== null ? segments[splitPopover.rowIndex] : null;

  return (
    <>
      <Divider sx={{ fontSize: "0.75rem" }}>
        {t("editor.videoExport.lyricsSection")}
      </Divider>

      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={lyricsEnabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
          />
        }
        label={
          <Typography variant="body2">
            {t("editor.videoExport.lyricsEnable")}
          </Typography>
        }
      />

      <Collapse in={lyricsEnabled} unmountOnExit>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* グローバル表示設定 */}
          <Divider sx={{ fontSize: "0.7rem" }}>
            {t("editor.videoExport.lyricsGlobalSettings")}
          </Divider>

          <LabeledSlider
            label={t("editor.videoExport.lyricsFontSize")}
            value={fontSize}
            onChange={onFontSizeChange}
            min={LYRICS_FONT_SIZE_MIN}
            max={LYRICS_FONT_SIZE_MAX}
            unit="px"
            valueMinWidth={44}
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="caption" sx={{ flex: 1 }}>
              {t("editor.videoExport.lyricsColor")}
            </Typography>
            <Box
              component="input"
              type="color"
              value={color}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onColorChange(e.target.value)
              }
              sx={{
                width: 32,
                height: 28,
                border: "none",
                padding: 0,
                cursor: "pointer",
                borderRadius: 0.5,
              }}
            />
          </Box>

          <LabeledSlider
            label={t("editor.videoExport.lyricsPositionY")}
            value={yPercent}
            onChange={onYPercentChange}
            min={TEXT_POSITION_MIN}
            max={TEXT_POSITION_MAX}
            unit="%"
          />

          <LabeledSlider
            label={t("editor.videoExport.lyricsMaxWidth")}
            value={maxWidthPercent}
            onChange={onMaxWidthPercentChange}
            min={20}
            max={100}
            unit="%"
          />

          {/* 文字装飾 Accordion */}
          <Accordion
            disableGutters
            defaultExpanded={false}
            sx={{
              boxShadow: "none",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">
                {t("editor.videoExport.lyricsDecoration")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 0 }}
            >
              {/* シャドウ */}
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={shadowEnabled}
                    onChange={(e) => onShadowEnabledChange(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("editor.videoExport.lyricsShadow")}
                  </Typography>
                }
              />
              <Collapse in={shadowEnabled} unmountOnExit>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    pl: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="caption" sx={{ flex: 1 }}>
                      {t("editor.videoExport.lyricsShadowColor")}
                    </Typography>
                    <Box
                      component="input"
                      type="color"
                      value={shadowColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onShadowColorChange(e.target.value)
                      }
                      sx={{
                        width: 32,
                        height: 28,
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        borderRadius: 0.5,
                      }}
                    />
                  </Box>
                  <LabeledSlider
                    label={t("editor.videoExport.lyricsShadowBlur")}
                    value={shadowBlur}
                    onChange={onShadowBlurChange}
                    min={LYRICS_SHADOW_BLUR_MIN}
                    max={LYRICS_SHADOW_BLUR_MAX}
                    unit="px"
                    valueMinWidth={34}
                  />
                </Box>
              </Collapse>

              {/* 縁取り */}
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={strokeEnabled}
                    onChange={(e) => onStrokeEnabledChange(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("editor.videoExport.lyricsStroke")}
                  </Typography>
                }
              />
              <Collapse in={strokeEnabled} unmountOnExit>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    pl: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="caption" sx={{ flex: 1 }}>
                      {t("editor.videoExport.lyricsStrokeColor")}
                    </Typography>
                    <Box
                      component="input"
                      type="color"
                      value={strokeColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onStrokeColorChange(e.target.value)
                      }
                      sx={{
                        width: 32,
                        height: 28,
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        borderRadius: 0.5,
                      }}
                    />
                  </Box>
                  <LabeledSlider
                    label={t("editor.videoExport.lyricsStrokeWidth")}
                    value={strokeWidth}
                    onChange={onStrokeWidthChange}
                    min={LYRICS_STROKE_WIDTH_MIN}
                    max={LYRICS_STROKE_WIDTH_MAX}
                    unit="px"
                    valueMinWidth={34}
                  />
                </Box>
              </Collapse>

              {/* 背景バー */}
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={bgBarEnabled}
                    onChange={(e) => onBgBarEnabledChange(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("editor.videoExport.lyricsBgBar")}
                  </Typography>
                }
              />
              <Collapse in={bgBarEnabled} unmountOnExit>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    pl: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="caption" sx={{ flex: 1 }}>
                      {t("editor.videoExport.lyricsBgBarColor")}
                    </Typography>
                    <Box
                      component="input"
                      type="color"
                      value={bgBarColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onBgBarColorChange(e.target.value)
                      }
                      sx={{
                        width: 32,
                        height: 28,
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        borderRadius: 0.5,
                      }}
                    />
                  </Box>
                  <LabeledSlider
                    label={t("editor.videoExport.lyricsBgBarOpacity")}
                    value={bgBarOpacity}
                    onChange={onBgBarOpacityChange}
                    min={0}
                    max={100}
                    unit="%"
                    valueMinWidth={34}
                  />
                </Box>
              </Collapse>
            </AccordionDetails>
          </Accordion>

          {/* アニメーション Accordion */}
          <Accordion
            disableGutters
            defaultExpanded={false}
            sx={{
              boxShadow: "none",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pr: 1 }}>
              <Typography variant="body2" sx={{ flex: 1 }}>
                {t("editor.videoExport.lyricsAnimations")}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  isAnimPreviewPlaying
                    ? onStopAnimPreview()
                    : onStartAnimPreview();
                }}
                sx={{ mr: 0.5 }}
              >
                {isAnimPreviewPlaying ? (
                  <StopIcon fontSize="small" />
                ) : (
                  <PlayArrowIcon fontSize="small" />
                )}
              </IconButton>
            </AccordionSummary>
            <AccordionDetails
              sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 0 }}
            >
              {/* フェードイン/アウト */}
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={fadeEnabled}
                    onChange={(e) => onFadeEnabledChange(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("editor.videoExport.lyricsFade")}
                  </Typography>
                }
              />
              <Collapse in={fadeEnabled} unmountOnExit>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    pl: 1,
                  }}
                >
                  <LabeledSlider
                    label={t("editor.videoExport.lyricsFadeDuration")}
                    value={fadeDurationMs}
                    onChange={onFadeDurationMsChange}
                    min={LYRICS_FADE_DURATION_MS_MIN}
                    max={LYRICS_FADE_DURATION_MS_MAX}
                    unit="ms"
                    valueMinWidth={44}
                  />
                </Box>
              </Collapse>

              {/* スケール登場/退場 */}
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={scaleEnabled}
                    onChange={(e) => onScaleEnabledChange(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("editor.videoExport.lyricsScale")}
                  </Typography>
                }
              />
              <Collapse in={scaleEnabled} unmountOnExit>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    pl: 1,
                  }}
                >
                  <LabeledSlider
                    label={t("editor.videoExport.lyricsScaleFrom")}
                    value={scaleFrom}
                    onChange={onScaleFromChange}
                    min={LYRICS_SCALE_FROM_MIN}
                    max={LYRICS_SCALE_FROM_MAX}
                    unit="%"
                    valueMinWidth={44}
                  />
                  <LabeledSlider
                    label={t("editor.videoExport.lyricsScaleDuration")}
                    value={scaleDurationMs}
                    onChange={onScaleDurationMsChange}
                    min={LYRICS_SCALE_DURATION_MS_MIN}
                    max={LYRICS_SCALE_DURATION_MS_MAX}
                    unit="ms"
                    valueMinWidth={44}
                  />
                </Box>
              </Collapse>

              {/* スライド登場/退場 */}
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={slideEnabled}
                    onChange={(e) => onSlideEnabledChange(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("editor.videoExport.lyricsSlide")}
                  </Typography>
                }
              />
              <Collapse in={slideEnabled} unmountOnExit>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    pl: 1,
                  }}
                >
                  <LabeledSlider
                    label={t("editor.videoExport.lyricsSlideAmount")}
                    value={slideAmount}
                    onChange={onSlideAmountChange}
                    min={LYRICS_SLIDE_AMOUNT_MIN}
                    max={LYRICS_SLIDE_AMOUNT_MAX}
                    unit="px"
                    valueMinWidth={44}
                  />
                  <LabeledSlider
                    label={t("editor.videoExport.lyricsSlideDuration")}
                    value={slideDurationMs}
                    onChange={onSlideDurationMsChange}
                    min={LYRICS_SLIDE_DURATION_MS_MIN}
                    max={LYRICS_SLIDE_DURATION_MS_MAX}
                    unit="ms"
                    valueMinWidth={44}
                  />
                </Box>
              </Collapse>

              {/* スライドイン (入場方向) */}
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={slideInEnabled}
                    onChange={(e) => onSlideInEnabledChange(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("editor.videoExport.lyricsSlideIn")}
                  </Typography>
                }
              />
              <Collapse in={slideInEnabled} unmountOnExit>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    pl: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {t("editor.videoExport.lyricsSlideDirection")}
                  </Typography>
                  <ToggleButtonGroup
                    value={slideInDirection}
                    exclusive
                    size="small"
                    onChange={(_e, v: SlideDirection | null) => {
                      if (v !== null) onSlideInDirectionChange(v);
                    }}
                  >
                    <ToggleButton value="up">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideUp")}
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="down">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideDown")}
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="left">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideLeft")}
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="right">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideRight")}
                      </Typography>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Collapse>

              {/* スライドアウト (退場方向) */}
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={slideOutEnabled}
                    onChange={(e) => onSlideOutEnabledChange(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("editor.videoExport.lyricsSlideOut")}
                  </Typography>
                }
              />
              <Collapse in={slideOutEnabled} unmountOnExit>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    pl: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {t("editor.videoExport.lyricsSlideDirection")}
                  </Typography>
                  <ToggleButtonGroup
                    value={slideOutDirection}
                    exclusive
                    size="small"
                    onChange={(_e, v: SlideDirection | null) => {
                      if (v !== null) onSlideOutDirectionChange(v);
                    }}
                  >
                    <ToggleButton value="up">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideUp")}
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="down">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideDown")}
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="left">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideLeft")}
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="right">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideRight")}
                      </Typography>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Collapse>

              {/* スライドイン/アウト共通時間 */}
              <Collapse in={slideInEnabled || slideOutEnabled} unmountOnExit>
                <Box sx={{ pl: 1 }}>
                  <LabeledSlider
                    label={t("editor.videoExport.lyricsSlideInOutDuration")}
                    value={slideInOutDurationMs}
                    onChange={onSlideInOutDurationMsChange}
                    min={LYRICS_SLIDE_IN_OUT_DURATION_MS_MIN}
                    max={LYRICS_SLIDE_IN_OUT_DURATION_MS_MAX}
                    unit="ms"
                    valueMinWidth={44}
                  />
                </Box>
              </Collapse>

              {/* ブラーイン/ブラーアウト */}
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={blurEnabled}
                    onChange={(e) => onBlurEnabledChange(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("editor.videoExport.lyricsBlur")}
                  </Typography>
                }
              />
              <Collapse in={blurEnabled} unmountOnExit>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    pl: 1,
                  }}
                >
                  <LabeledSlider
                    label={t("editor.videoExport.lyricsBlurAmount")}
                    value={blurAmount}
                    onChange={onBlurAmountChange}
                    min={LYRICS_BLUR_AMOUNT_MIN}
                    max={LYRICS_BLUR_AMOUNT_MAX}
                    unit="px"
                    valueMinWidth={44}
                  />
                  <LabeledSlider
                    label={t("editor.videoExport.lyricsBlurDuration")}
                    value={blurDurationMs}
                    onChange={onBlurDurationMsChange}
                    min={LYRICS_BLUR_DURATION_MS_MIN}
                    max={LYRICS_BLUR_DURATION_MS_MAX}
                    unit="ms"
                    valueMinWidth={44}
                  />
                </Box>
              </Collapse>

              {/* ワイプイン (出現方向) */}
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={wipeInEnabled}
                    onChange={(e) => onWipeInEnabledChange(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("editor.videoExport.lyricsWipeIn")}
                  </Typography>
                }
              />
              <Collapse in={wipeInEnabled} unmountOnExit>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    pl: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {t("editor.videoExport.lyricsSlideDirection")}
                  </Typography>
                  <ToggleButtonGroup
                    value={wipeInDirection}
                    exclusive
                    size="small"
                    onChange={(_e, v: SlideDirection | null) => {
                      if (v !== null) onWipeInDirectionChange(v);
                    }}
                  >
                    <ToggleButton value="up">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideUp")}
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="down">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideDown")}
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="left">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideLeft")}
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="right">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideRight")}
                      </Typography>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Collapse>

              {/* ワイプアウト (退場方向) */}
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={wipeOutEnabled}
                    onChange={(e) => onWipeOutEnabledChange(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("editor.videoExport.lyricsWipeOut")}
                  </Typography>
                }
              />
              <Collapse in={wipeOutEnabled} unmountOnExit>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    pl: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {t("editor.videoExport.lyricsSlideDirection")}
                  </Typography>
                  <ToggleButtonGroup
                    value={wipeOutDirection}
                    exclusive
                    size="small"
                    onChange={(_e, v: SlideDirection | null) => {
                      if (v !== null) onWipeOutDirectionChange(v);
                    }}
                  >
                    <ToggleButton value="up">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideUp")}
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="down">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideDown")}
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="left">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideLeft")}
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="right">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideRight")}
                      </Typography>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Collapse>

              {/* ワイプ共通時間 */}
              <Collapse in={wipeInEnabled || wipeOutEnabled} unmountOnExit>
                <Box sx={{ pl: 1 }}>
                  <LabeledSlider
                    label={t("editor.videoExport.lyricsWipeDuration")}
                    value={wipeDurationMs}
                    onChange={onWipeDurationMsChange}
                    min={LYRICS_WIPE_DURATION_MS_MIN}
                    max={LYRICS_WIPE_DURATION_MS_MAX}
                    unit="ms"
                    valueMinWidth={44}
                  />
                </Box>
              </Collapse>

              {/* バウンスイン (入場方向) */}
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={bounceInEnabled}
                    onChange={(e) => onBounceInEnabledChange(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("editor.videoExport.lyricsBounceIn")}
                  </Typography>
                }
              />
              <Collapse in={bounceInEnabled} unmountOnExit>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    pl: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {t("editor.videoExport.lyricsSlideDirection")}
                  </Typography>
                  <ToggleButtonGroup
                    value={bounceInDirection}
                    exclusive
                    size="small"
                    onChange={(_e, v: SlideDirection | null) => {
                      if (v !== null) onBounceInDirectionChange(v);
                    }}
                  >
                    <ToggleButton value="up">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideUp")}
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="down">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideDown")}
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="left">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideLeft")}
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="right">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideRight")}
                      </Typography>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Collapse>

              {/* バウンスアウト (退場方向) */}
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={bounceOutEnabled}
                    onChange={(e) => onBounceOutEnabledChange(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t("editor.videoExport.lyricsBounceOut")}
                  </Typography>
                }
              />
              <Collapse in={bounceOutEnabled} unmountOnExit>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    pl: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {t("editor.videoExport.lyricsSlideDirection")}
                  </Typography>
                  <ToggleButtonGroup
                    value={bounceOutDirection}
                    exclusive
                    size="small"
                    onChange={(_e, v: SlideDirection | null) => {
                      if (v !== null) onBounceOutDirectionChange(v);
                    }}
                  >
                    <ToggleButton value="up">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideUp")}
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="down">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideDown")}
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="left">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideLeft")}
                      </Typography>
                    </ToggleButton>
                    <ToggleButton value="right">
                      <Typography variant="caption">
                        {t("editor.videoExport.lyricsSlideRight")}
                      </Typography>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Collapse>

              {/* バウンス共通時間 */}
              <Collapse in={bounceInEnabled || bounceOutEnabled} unmountOnExit>
                <Box sx={{ pl: 1 }}>
                  <LabeledSlider
                    label={t("editor.videoExport.lyricsBounceDuration")}
                    value={bounceInOutDurationMs}
                    onChange={onBounceInOutDurationMsChange}
                    min={LYRICS_BOUNCE_IN_OUT_DURATION_MS_MIN}
                    max={LYRICS_BOUNCE_IN_OUT_DURATION_MS_MAX}
                    unit="ms"
                    valueMinWidth={44}
                  />
                </Box>
              </Collapse>

              {/* スタガー */}
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={staggerEnabled}
                    onChange={(e) => onStaggerEnabledChange(e.target.checked)}
                  />
                }
                label={t("editor.videoExport.lyricsStagger")}
              />
              <Collapse in={staggerEnabled} unmountOnExit>
                <Box sx={{ pl: 1 }}>
                  <LabeledSlider
                    label={t("editor.videoExport.lyricsStaggerInterval")}
                    value={staggerIntervalMs}
                    onChange={onStaggerIntervalMsChange}
                    min={LYRICS_STAGGER_INTERVAL_MS_MIN}
                    max={LYRICS_STAGGER_INTERVAL_MS_MAX}
                    unit="ms"
                    valueMinWidth={36}
                  />
                </Box>
              </Collapse>
            </AccordionDetails>
          </Accordion>

          {/* 歌詞カード読み込みボタン */}
          {segments.length > 0 && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Box
                component="input"
                ref={lyricsCardInputRef}
                type="file"
                accept=".txt"
                style={{ display: "none" }}
                onChange={handleCardFileChange}
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="small"
                onClick={() => lyricsCardInputRef.current?.click()}
              >
                {t("editor.videoExport.lyricsCardLoad")}
              </Button>
            </Box>
          )}

          {/* クリップボードから歌詞カード読み込み */}
          {segments.length > 0 && (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="small"
              onClick={handleCardClipboardLoad}
            >
              {t("editor.videoExport.lyricsCardClipboardLoad")}
            </Button>
          )}

          {/* セグメントテーブル */}
          {segments.length > 0 && (
            <Box
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              {/* ヘッダー行 */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "52px 1fr 52px 56px",
                  gap: 0.5,
                  px: 0.5,
                  py: 0.25,
                  bgcolor: "action.hover",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  align="center"
                >
                  {t("editor.videoExport.lyricsStart")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  &nbsp;
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  align="center"
                >
                  {t("editor.videoExport.lyricsEnd")}
                </Typography>
                <Box />
              </Box>

              {/* セグメント行 (スクロール可能) */}
              <Box
                sx={{
                  maxHeight: 300,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {segments.map((seg, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "52px 1fr 52px 56px",
                      gap: 0.5,
                      px: 0.5,
                      py: 0.25,
                      alignItems: "center",
                      borderTop: i > 0 ? "1px solid" : "none",
                      borderColor: "divider",
                    }}
                  >
                    {/* 開始時間 */}
                    <Typography
                      variant="caption"
                      sx={{ fontFamily: "monospace", textAlign: "center" }}
                    >
                      {ms2timeStr(seg.startMs)}
                    </Typography>

                    {/* 歌詞 TextField */}
                    <TextField
                      size="small"
                      value={seg.lyric}
                      onChange={(e) => onUpdateLyric(i, e.target.value)}
                      inputProps={{
                        style: { fontSize: "0.8rem", padding: "2px 6px" },
                        onKeyDown: (e: React.KeyboardEvent) => {
                          if (e.key === "Enter") e.preventDefault();
                        },
                      }}
                    />

                    {/* 終了時間 */}
                    <Typography
                      variant="caption"
                      sx={{ fontFamily: "monospace", textAlign: "center" }}
                    >
                      {ms2timeStr(seg.endMs)}
                    </Typography>

                    {/* 操作ボタン */}
                    <Box sx={{ display: "flex", gap: 0 }}>
                      {/* 分割ボタン: noteBoundaries >= 3 (2ノート以上) の場合のみ活性 */}
                      <span>
                        <IconButton
                          size="small"
                          disabled={seg.noteBoundaries.length < 3}
                          onClick={(e) => handleSplitClick(e, i)}
                        >
                          <CallSplitIcon fontSize="inherit" />
                        </IconButton>
                      </span>

                      {/* 結合ボタン: 最後の行は非表示 */}
                      {i < segments.length - 1 ? (
                        <IconButton size="small" onClick={() => onMerge(i)}>
                          <MergeIcon fontSize="inherit" />
                        </IconButton>
                      ) : (
                        <Box sx={{ width: 28 }} />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>

      {/* 分割ポイント選択 Popover */}
      <Popover
        open={splitPopover !== null}
        anchorEl={splitPopover?.anchorEl}
        onClose={() => setSplitPopover(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {splitSeg && (
          <List dense disablePadding sx={{ minWidth: 180 }}>
            <Typography
              variant="caption"
              sx={{ px: 2, py: 0.5, display: "block", color: "text.secondary" }}
            >
              {t("editor.videoExport.lyricsSplitAt")}
            </Typography>
            {splitSeg.noteBoundaries.slice(1, -1).map((boundaryMs, ki) => {
              const k = ki + 1; // 実際の境界インデックス (1..N-1)
              const lyricA = splitSeg.noteLyrics.slice(0, k).join("");
              const lyricB = splitSeg.noteLyrics.slice(k).join("");
              return (
                <ListItemButton
                  key={k}
                  onClick={() => handleSplitSelect(k)}
                  sx={{ px: 2, py: 0.25 }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography variant="body2">
                      {lyricA || "…"} / {lyricB || "…"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontFamily: "monospace", color: "text.secondary" }}
                    >
                      [{ms2timeStr(boundaryMs)}]
                    </Typography>
                  </Box>
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Popover>

      {/* 歌詞カード文字コード&オプション選択ダイアログ */}
      <LyricsCardEncodingDialog
        open={cardEncodingDialogOpen}
        fileBuf={cardFileBuf}
        onConfirm={handleCardEncodingConfirm}
        onCancel={() => setCardEncodingDialogOpen(false)}
      />

      {/* 歌詞カードダイアログ */}
      {cardWords !== null && (
        <LyricsCardDialog
          open={cardDialogOpen}
          words={cardWords}
          segments={segments}
          onApply={handleCardApply}
          onClose={() => setCardDialogOpen(false)}
        />
      )}
    </>
  );
};

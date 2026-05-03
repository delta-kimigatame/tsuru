import CallSplitIcon from "@mui/icons-material/CallSplit";
import MergeIcon from "@mui/icons-material/MergeType";
import {
  Box,
  Collapse,
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItemButton,
  Popover,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
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
  LYRICS_STROKE_WIDTH_MAX,
  LYRICS_STROKE_WIDTH_MIN,
  TEXT_POSITION_MAX,
  TEXT_POSITION_MIN,
} from "../../../config/videoExport";
import type { LyricsSegment } from "../../../utils/videoExport";
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
}) => {
  const { t } = useTranslation();

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

          {/* 文字装飾 */}
          <Divider sx={{ fontSize: "0.7rem" }}>
            {t("editor.videoExport.lyricsDecoration")}
          </Divider>

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
              sx={{ display: "flex", flexDirection: "column", gap: 1, pl: 1 }}
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
              sx={{ display: "flex", flexDirection: "column", gap: 1, pl: 1 }}
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
              sx={{ display: "flex", flexDirection: "column", gap: 1, pl: 1 }}
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
              sx={{ display: "flex", flexDirection: "column", gap: 1, pl: 1 }}
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
              sx={{ display: "flex", flexDirection: "column", gap: 1, pl: 1 }}
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
              sx={{ display: "flex", flexDirection: "column", gap: 1, pl: 1 }}
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
                      <Tooltip title={t("editor.videoExport.lyricsSplit")}>
                        <span>
                          <IconButton
                            size="small"
                            disabled={seg.noteBoundaries.length < 3}
                            onClick={(e) => handleSplitClick(e, i)}
                          >
                            <CallSplitIcon fontSize="inherit" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      {/* 結合ボタン: 最後の行は非表示 */}
                      {i < segments.length - 1 ? (
                        <Tooltip title={t("editor.videoExport.lyricsMerge")}>
                          <IconButton size="small" onClick={() => onMerge(i)}>
                            <MergeIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
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
              const lyricA = splitSeg.lyric.slice(0, k);
              const lyricB = splitSeg.lyric.slice(k);
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
    </>
  );
};

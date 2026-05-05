import CallSplitIcon from "@mui/icons-material/CallSplit";
import MergeIcon from "@mui/icons-material/MergeType";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import type { LyricsSegment } from "../../../utils/videoExport";

/** ms → "m:ss.s" 形式の時刻文字列 */
const ms2timeStr = (ms: number): string => {
  const totalS = ms / 1000;
  const m = Math.floor(totalS / 60);
  const s = totalS % 60;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
};

/** ローカルでのセグメント分割（useVideoExportFormのsplitSegmentと同ロジック） */
const localSplitSegment = (
  segments: LyricsSegment[],
  i: number,
  k: number,
): LyricsSegment[] => {
  const seg = segments[i];
  const splitMs = seg.noteBoundaries[k];
  const segA: LyricsSegment = {
    startMs: seg.startMs,
    endMs: splitMs,
    lyric: seg.lyric.slice(0, k),
    noteBoundaries: seg.noteBoundaries.slice(0, k + 1),
  };
  const segB: LyricsSegment = {
    startMs: splitMs,
    endMs: seg.endMs,
    lyric: seg.lyric.slice(k),
    noteBoundaries: seg.noteBoundaries.slice(k),
  };
  return [...segments.slice(0, i), segA, segB, ...segments.slice(i + 1)];
};

/** ローカルでのセグメント結合（useVideoExportFormのmergeSegmentsと同ロジック） */
const localMergeSegments = (
  segments: LyricsSegment[],
  i: number,
): LyricsSegment[] => {
  const a = segments[i];
  const b = segments[i + 1];
  const merged: LyricsSegment = {
    startMs: a.startMs,
    endMs: b.endMs,
    lyric: a.lyric + b.lyric,
    noteBoundaries: [...a.noteBoundaries.slice(0, -1), ...b.noteBoundaries],
  };
  return [...segments.slice(0, i), merged, ...segments.slice(i + 2)];
};

type Props = {
  open: boolean;
  words: string[];
  segments: LyricsSegment[];
  onApply: (newLyrics: string[]) => void;
  onClose: () => void;
};

export const LyricsCardDialog: React.FC<Props> = ({
  open,
  words,
  segments,
  onApply,
  onClose,
}) => {
  const { t } = useTranslation();

  const [startIndex, setStartIndex] = React.useState<number | null>(null);
  const [localSegments, setLocalSegments] =
    React.useState<LyricsSegment[]>(segments);
  const [splitPopover, setSplitPopover] = React.useState<{
    rowIndex: number;
    anchorEl: HTMLElement;
  } | null>(null);

  // ダイアログが開かれるたびに segments をリセット
  React.useEffect(() => {
    if (open) {
      setStartIndex(null);
      setLocalSegments(segments);
    }
  }, [open, segments]);

  const activeWords = React.useMemo((): string[] => {
    if (startIndex === null) return [];
    return words.slice(startIndex);
  }, [words, startIndex]);

  const handleWordClick = (idx: number) => {
    setStartIndex(idx);
    setLocalSegments(segments);
  };

  const handleSplitClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    i: number,
  ) => {
    setSplitPopover({ rowIndex: i, anchorEl: e.currentTarget });
  };

  const handleSplitSelect = (k: number) => {
    if (splitPopover !== null) {
      setLocalSegments((prev) =>
        localSplitSegment(prev, splitPopover.rowIndex, k),
      );
    }
    setSplitPopover(null);
  };

  const handleMerge = (i: number) => {
    setLocalSegments((prev) => localMergeSegments(prev, i));
  };

  const handleApply = () => {
    const newLyrics = localSegments.map((seg, i) => {
      const word = activeWords[i];
      // activeWordsに対応するwordsがない区間は現在のlyricを維持
      return word !== undefined ? word : seg.lyric;
    });
    onApply(newLyrics);
  };

  const splitSeg =
    splitPopover !== null ? localSegments[splitPopover.rowIndex] : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("editor.videoExport.lyricsCardDialogTitle")}</DialogTitle>

      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 1 }}
      >
        {/* ステップ1: 開始単語の選択 */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t("editor.videoExport.lyricsCardSelectStart")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
              maxHeight: 160,
              overflowY: "auto",
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              p: 1,
            }}
          >
            {words.map((word, idx) => (
              <Chip
                key={idx}
                label={word}
                size="small"
                variant={startIndex === idx ? "filled" : "outlined"}
                color={startIndex === idx ? "primary" : "default"}
                onClick={() => handleWordClick(idx)}
                sx={{ cursor: "pointer" }}
              />
            ))}
          </Box>
        </Box>

        {/* ステップ2: 対照表（開始単語選択後に展開） */}
        {startIndex !== null && (
          <>
            <Divider />
            <Typography variant="body2" color="text.secondary">
              {t("editor.videoExport.lyricsCardMappingHint")}
            </Typography>

            {/* 対照表ヘッダー */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 80px",
                gap: 1,
                px: 1,
                py: 0.5,
                bgcolor: "action.hover",
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {t("editor.videoExport.lyricsCardWordColumn")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("editor.videoExport.lyricsCardSegmentColumn")}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                align="center"
              >
                {t("editor.videoExport.lyricsCardOpsColumn")}
              </Typography>
            </Box>

            {/* 対照表ボディ */}
            <Box
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                maxHeight: 360,
                overflowY: "auto",
              }}
            >
              {localSegments.map((seg, i) => {
                const word = activeWords[i];
                const isOrphan = word === undefined;
                return (
                  <Box
                    key={i}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 80px",
                      gap: 1,
                      px: 1,
                      py: 0.5,
                      alignItems: "center",
                      borderTop: i > 0 ? "1px solid" : "none",
                      borderColor: "divider",
                      bgcolor: isOrphan
                        ? "action.disabledBackground"
                        : "transparent",
                    }}
                  >
                    {/* 歌詞カード単語 */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isOrphan ? "normal" : "medium",
                        color: isOrphan ? "text.disabled" : "text.primary",
                      }}
                    >
                      {isOrphan
                        ? t("editor.videoExport.lyricsCardOrphan")
                        : word}
                    </Typography>

                    {/* セグメント情報 */}
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography variant="body2">
                        {seg.lyric || "—"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "monospace",
                          color: "text.secondary",
                        }}
                      >
                        {ms2timeStr(seg.startMs)} – {ms2timeStr(seg.endMs)}
                      </Typography>
                    </Box>

                    {/* 操作ボタン */}
                    <Box
                      sx={{ display: "flex", gap: 0, justifyContent: "center" }}
                    >
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
                      {i < localSegments.length - 1 ? (
                        <Tooltip title={t("editor.videoExport.lyricsMerge")}>
                          <IconButton
                            size="small"
                            onClick={() => handleMerge(i)}
                          >
                            <MergeIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Box sx={{ width: 28 }} />
                      )}
                    </Box>
                  </Box>
                );
              })}

              {/* 余剰単語（localSegments より words が多い場合） */}
              {activeWords.length > localSegments.length && (
                <>
                  <Divider />
                  <Box sx={{ px: 1, py: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t("editor.videoExport.lyricsCardUnassigned")}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        mt: 0.5,
                      }}
                    >
                      {activeWords.slice(localSegments.length).map((w, j) => (
                        <Chip
                          key={j}
                          label={w}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button
          variant="contained"
          disabled={startIndex === null}
          onClick={handleApply}
        >
          {t("editor.videoExport.lyricsCardApply")}
        </Button>
      </DialogActions>

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
              const k = ki + 1;
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
    </Dialog>
  );
};

import {
  Box,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { LOG } from "../../lib/Logging";
import type { BaseVoiceBank } from "../../lib/VoiceBanks/BaseVoiceBank";
import { noteNumToTone } from "../../utils/Notenum";

/**
 * prefix.map表示コンポーネント
 */
export const PrefixMapView: React.FC<PrefixMapViewProps> = ({ vb }) => {
  const { t } = useTranslation();
  const [selectedColor, setSelectedColor] = React.useState<string>("");

  // ボイスカラーのリストを取得
  const colors = React.useMemo(() => {
    try {
      const allColors = vb.colors || [];
      const prefixMapKeys = Object.keys(vb.prefixmaps || {});

      // 空文字列キーがあればそれを含める
      if (prefixMapKeys.includes("")) {
        return ["", ...allColors.filter((c) => c !== "")];
      }
      return allColors;
    } catch (error) {
      LOG.error(`ボイスカラー取得エラー: ${error}`, "PrefixMapView");
      return [];
    }
  }, [vb]);

  // 初期カラーの設定
  React.useEffect(() => {
    if (colors.length > 0 && selectedColor === "") {
      const prefixMapKeys = Object.keys(vb.prefixmaps || {});
      // 空文字列キーがあればそれを選択、なければ最初のカラー
      const initialColor = prefixMapKeys.includes("") ? "" : colors[0];
      setSelectedColor(initialColor);
    }
  }, [colors, selectedColor, vb.prefixmaps]);

  // prefix.mapデータの生成（C1-B7: notenum 24-107）
  const prefixMapData = React.useMemo(() => {
    try {
      const data: Array<{
        notenum: number;
        pitch: string;
        prefix: string;
        suffix: string;
      }> = [];

      for (let notenum = 24; notenum <= 107; notenum++) {
        const pitch = noteNumToTone(notenum);
        const { prefix, suffix } = vb.getPrefixMap(notenum, selectedColor);
        data.push({ notenum, pitch, prefix, suffix });
      }

      return data.reverse();
    } catch (error) {
      LOG.error(`prefix.mapデータ生成エラー: ${error}`, "PrefixMapView");
      return [];
    }
  }, [vb, selectedColor]);

  // prefix.mapが設定されていない場合
  if (!vb.prefixmaps || Object.keys(vb.prefixmaps).length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {t("infoVBDialog.prefixMapView.noData")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* ボイスカラー選択（複数ある場合のみ表示） */}
      {colors.length > 1 && (
        <Box sx={{ px: 0, py: 2 }}>
          <FormControl size="small" fullWidth>
            <Typography variant="caption" sx={{ mb: 0.5 }}>
              {t("infoVBDialog.prefixMapView.voiceColorLabel")}
            </Typography>
            <Select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              {colors.map((color) => (
                <MenuItem key={color} value={color}>
                  {color === "" ? "Default" : color}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* prefix.mapテーブル */}
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                {t("infoVBDialog.prefixMapView.pitchColumn")}
              </TableCell>
              <TableCell>
                {t("infoVBDialog.prefixMapView.prefixColumn")}
              </TableCell>
              <TableCell>
                {t("infoVBDialog.prefixMapView.suffixColumn")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prefixMapData.map((row) => (
              <TableRow key={row.notenum}>
                <TableCell>{row.pitch}</TableCell>
                <TableCell>{row.prefix}</TableCell>
                <TableCell>{row.suffix}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export interface PrefixMapViewProps {
  /** 音源データ */
  vb: BaseVoiceBank;
}

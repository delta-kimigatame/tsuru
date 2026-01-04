import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import type OtoRecord from "utauoto/dist/OtoRecord";
import type { BaseVoiceBank } from "../../lib/VoiceBanks/BaseVoiceBank";
import { getAllOtoRecords } from "../../utils/otoHelper";

/**
 * UTAU音源のエイリアス一覧を表示するコンポーネント
 * シンプルな3列テーブル（エイリアス、ファイル名、フォルダ）と検索機能を提供
 */
export const OtoAliasView: React.FC<OtoAliasViewProps> = ({ vb }) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [allRecords, setAllRecords] = React.useState<OtoRecord[]>([]);

  // 全OtoRecordを非同期で取得
  React.useEffect(() => {
    if (!vb) {
      setAllRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // requestAnimationFrameを2回使用して、UIの更新を優先
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // React.startTransitionを使用して低優先度で処理
        React.startTransition(() => {
          const records = getAllOtoRecords(vb.oto);
          setAllRecords(records);
          setLoading(false);
        });
      });
    });
  }, [vb]);

  // フィルタリング後のレコード（メモ化）
  const filteredRecords = React.useMemo<OtoRecord[]>(() => {
    if (!searchText.trim()) return allRecords;

    const searchLower = searchText.toLowerCase();
    return allRecords.filter((record) => {
      return record.alias.toLowerCase().includes(searchLower);
    });
  }, [allRecords, searchText]);

  // ローディング中の表示
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* 検索フィールド */}
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder={t("infoVBDialog.aliasView.searchPlaceholder")}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{ mb: 1 }}
      />

      {/* 件数表示 */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {t("infoVBDialog.aliasView.recordCount", {
          total: allRecords.length,
          filtered: filteredRecords.length,
        })}
      </Typography>

      {/* テーブル */}
      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: "0.75rem" }}>
                {t("infoVBDialog.aliasView.aliasColumn")}
              </TableCell>
              <TableCell sx={{ fontSize: "0.75rem" }}>
                {t("infoVBDialog.aliasView.filenameColumn")}
              </TableCell>
              <TableCell sx={{ fontSize: "0.75rem" }}>
                {t("infoVBDialog.aliasView.folderColumn")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.map((record, index) => (
              <TableRow
                key={`${record.dirpath}-${record.filename}-${record.alias}-${index}`}
                hover
              >
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                    fontSize: "0.75rem",
                  }}
                >
                  {record.alias}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                    fontSize: "0.75rem",
                  }}
                >
                  {record.filename}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                    fontSize: "0.75rem",
                  }}
                >
                  {record.dirpath || "/"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* レコードが0件の場合 */}
      {filteredRecords.length === 0 && (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {searchText
              ? t("infoVBDialog.aliasView.noResults")
              : t("infoVBDialog.aliasView.noRecords")}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export interface OtoAliasViewProps {
  /** 音源データ */
  vb: BaseVoiceBank;
}

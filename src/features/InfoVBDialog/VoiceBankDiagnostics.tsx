import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import type { BaseVoiceBank } from "../../lib/VoiceBanks/BaseVoiceBank";
import {
  diagnoseVoiceBank,
  type DiagnosticItem,
  type DiagnosticResult,
} from "../../utils/voiceBankDiagnostics";

/**
 * 音源診断コンポーネント
 */
export const VoiceBankDiagnostics: React.FC<VoiceBankDiagnosticsProps> = ({
  vb,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [result, setResult] = React.useState<DiagnosticResult | null>(null);

  /**
   * 診断を実行
   */
  const handleRunDiagnostics = () => {
    setLoading(true);
    setResult(null);

    // UIをブロックしないように非同期で実行
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        React.startTransition(() => {
          diagnoseVoiceBank(vb)
            .then((diagnosticResult) => {
              setResult(diagnosticResult);
              setLoading(false);
            })
            .catch((error) => {
              console.error("診断エラー:", error);
              setLoading(false);
            });
        });
      });
    });
  };

  // ローディング中
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          {t("infoVBDialog.diagnostics.running")}
        </Typography>
      </Box>
    );
  }

  // 診断結果表示
  if (result) {
    const hasIssues = result.errors.length > 0 || result.warnings.length > 0;

    return (
      <Box>
        {/* サマリー */}
        <Box sx={{ mb: 2 }}>
          {hasIssues ? (
            <Alert
              severity={result.errors.length > 0 ? "error" : "warning"}
              sx={{ mb: 1 }}
            >
              {t("infoVBDialog.diagnostics.summary", {
                errors: result.errors.length,
                warnings: result.warnings.length,
              })}
            </Alert>
          ) : (
            <Alert severity="success" sx={{ mb: 1 }}>
              {t("infoVBDialog.diagnostics.noIssues")}
            </Alert>
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={handleRunDiagnostics}
            fullWidth
          >
            {t("infoVBDialog.diagnostics.runButton")}
          </Button>
        </Box>

        {/* エラーセクション */}
        {result.errors.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              color="error"
              sx={{ mb: 1, fontWeight: "bold" }}
            >
              {t("infoVBDialog.diagnostics.errorSection")} (
              {result.errors.length})
            </Typography>
            <List dense disablePadding>
              {result.errors.map((item, index) => (
                <DiagnosticListItem key={index} item={item} severity="error" />
              ))}
            </List>
            {result.warnings.length > 0 && <Divider sx={{ my: 2 }} />}
          </Box>
        )}

        {/* 警告セクション */}
        {result.warnings.length > 0 && (
          <Box>
            <Typography
              variant="subtitle2"
              color="warning.main"
              sx={{ mb: 1, fontWeight: "bold" }}
            >
              {t("infoVBDialog.diagnostics.warningSection")} (
              {result.warnings.length})
            </Typography>
            <List dense disablePadding>
              {result.warnings.map((item, index) => (
                <DiagnosticListItem
                  key={index}
                  item={item}
                  severity="warning"
                />
              ))}
            </List>
          </Box>
        )}
      </Box>
    );
  }

  // 初期表示（診断前）
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("infoVBDialog.diagnostics.description")}
      </Typography>
      <Button
        variant="contained"
        onClick={handleRunDiagnostics}
        fullWidth
        color="primary"
      >
        {t("infoVBDialog.diagnostics.runButton")}
      </Button>
    </Box>
  );
};

/**
 * 診断項目を表示するリストアイテム
 */
const DiagnosticListItem: React.FC<{
  item: DiagnosticItem;
  severity: "error" | "warning";
}> = ({ item, severity }) => {
  const { t } = useTranslation();

  return (
    <ListItem disableGutters sx={{ alignItems: "flex-start", py: 0.5 }}>
      <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
        {severity === "error" ? (
          <ErrorIcon color="error" fontSize="small" />
        ) : (
          <WarningIcon color="warning" fontSize="small" />
        )}
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
            {t(`infoVBDialog.diagnostics.types.${item.message}`)}
          </Typography>
        }
        secondary={
          item.details && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem", wordBreak: "break-all" }}
            >
              {item.details}
            </Typography>
          )
        }
      />
    </ListItem>
  );
};

export interface VoiceBankDiagnosticsProps {
  /** 音源データ */
  vb: BaseVoiceBank;
}

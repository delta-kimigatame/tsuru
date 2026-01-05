import ErrorIcon from "@mui/icons-material/Error";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningIcon from "@mui/icons-material/Warning";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { LOG } from "../../lib/Logging";
import type { BaseVoiceBank } from "../../lib/VoiceBanks/BaseVoiceBank";
import {
  diagnoseVoiceBank,
  DiagnosticType,
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

  // 診断結果をタイプごとにグルーピング（フックは条件分岐の外で呼び出す）
  const groupedErrors = React.useMemo(() => {
    if (!result) return new Map<DiagnosticType, DiagnosticItem[]>();
    const map = new Map<DiagnosticType, DiagnosticItem[]>();
    result.errors.forEach((item) => {
      if (!map.has(item.type)) {
        map.set(item.type, []);
      }
      map.get(item.type)!.push(item);
    });
    return map;
  }, [result]);

  const groupedWarnings = React.useMemo(() => {
    if (!result) return new Map<DiagnosticType, DiagnosticItem[]>();
    const map = new Map<DiagnosticType, DiagnosticItem[]>();
    result.warnings.forEach((item) => {
      if (!map.has(item.type)) {
        map.set(item.type, []);
      }
      map.get(item.type)!.push(item);
    });
    return map;
  }, [result]);

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
              LOG.gtag("vbDiagnostics", {
                // Warnings
                wav_without_oto:
                  diagnosticResult.warnings.some(
                    (w) => w.type === "wav_without_oto"
                  ) || false,
                missing_frq:
                  diagnosticResult.warnings.some(
                    (w) => w.type === "missing_frq"
                  ) || false,
                oto_outside_root:
                  diagnosticResult.warnings.some(
                    (w) => w.type === "oto_outside_root"
                  ) || false,
                config_file_misplaced:
                  diagnosticResult.warnings.some(
                    (w) => w.type === "config_file_misplaced"
                  ) || false,
                // Errors
                invalid_wav_format:
                  diagnosticResult.errors.some(
                    (e) => e.type === "invalid_wav_format"
                  ) || false,
                oto_without_wav:
                  diagnosticResult.errors.some(
                    (e) => e.type === "oto_without_wav"
                  ) || false,
                no_stretch_range:
                  diagnosticResult.errors.some(
                    (e) => e.type === "no_stretch_range"
                  ) || false,
              });
              setLoading(false);
            })
            .catch((error) => {
              LOG.error(`診断エラー:${error.message}`, "VoiceBankDiagnostics");
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
            {Array.from(groupedErrors.entries()).map(([type, items]) => (
              <DiagnosticTypeSection
                key={type}
                type={type}
                items={items}
                severity="error"
              />
            ))}
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
            {Array.from(groupedWarnings.entries()).map(([type, items]) => (
              <DiagnosticTypeSection
                key={type}
                type={type}
                items={items}
                severity="warning"
              />
            ))}
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
 * 診断タイプごとのセクション（ヘルプ + 項目リスト）
 */
const DiagnosticTypeSection: React.FC<{
  type: DiagnosticType;
  items: DiagnosticItem[];
  severity: "error" | "warning";
}> = ({ type, items, severity }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = React.useState(false);

  const helpKey = `infoVBDialog.diagnostics.help.${type}`;

  return (
    <Box sx={{ mb: 1 }}>
      {/* ヘルプアコーディオン */}
      <Accordion
        expanded={expanded}
        onChange={(_, isExpanded) => setExpanded(isExpanded)}
        sx={{
          boxShadow: "none",
          border: "1px solid",
          borderColor: "divider",
          "&:before": { display: "none" },
          mb: 0.5,
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            minHeight: 36,
            "&.Mui-expanded": { minHeight: 36 },
            "& .MuiAccordionSummary-content": {
              margin: "6px 0",
              "&.Mui-expanded": { margin: "6px 0" },
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <InfoOutlinedIcon
              sx={{ fontSize: "0.9rem", color: "text.secondary" }}
            />
            <Typography variant="caption" color="text.secondary">
              {t(`infoVBDialog.diagnostics.types.${type}`)}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 1 }}>
          <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
            {t(`${helpKey}.description`)}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.5 }}
          >
            {t(`${helpKey}.impact`)}
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
            {t(`${helpKey}.solution`)}
          </Typography>
          <Link
            href={t(`${helpKey}.toolUrl`)}
            target="_blank"
            rel="noopener noreferrer"
            variant="caption"
            sx={{ fontSize: "0.7rem" }}
          >
            {t(`${helpKey}.toolName`)} ↗
          </Link>
        </AccordionDetails>
      </Accordion>

      {/* 診断項目リスト */}
      <List dense disablePadding>
        {items.map((item, index) => (
          <DiagnosticListItem key={index} item={item} severity={severity} />
        ))}
      </List>
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

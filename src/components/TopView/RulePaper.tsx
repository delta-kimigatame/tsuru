import * as React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { BasePaper } from "../common/BasePaper";

/**
 * トップビューに表示する、利用規約
 * @returns トップビューに表示する、利用規約
 */
export const RulePaper: React.FC = () => {
  const { t } = useTranslation();
  return (
    <BasePaper title={t("top.rule")}>
      <Box sx={{ m: 1, p: 1 }}>
        <Typography variant="body1">{t("top.ruleDescription")}</Typography>
        <Typography variant="caption" color="inherit">
          {t("top.ruleDescription2")}
        </Typography>
        <br />
      </Box>
    </BasePaper>
  );
};

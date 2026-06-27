import { Box, Link, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { BasePaper } from "../../../components/common/BasePaper";

export const LinkPaper: React.FC = () => {
  const { t } = useTranslation();

  return (
    <BasePaper title={t("videoEditor.linkPaperTitle")}>
      <Box sx={{ m: 1, p: 1 }}>
        <Typography variant="subtitle2">
          {t("videoEditor.linkPaperMutual")}
        </Typography>
        <ul style={{ marginTop: 0 }}>
          <li>
            <Link variant="body2" href="./index.html">
              {t("videoEditor.linkBackToMain")}
            </Link>
          </li>
          <li>
            <Link variant="body2" href="./videoeditor.html">
              {t("videoEditor.linkToTop")}
            </Link>
          </li>
        </ul>
      </Box>
    </BasePaper>
  );
};

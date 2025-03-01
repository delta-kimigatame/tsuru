import * as React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import { BasePaper } from "../common/BasePaper";

/**
 * トップビューに表示する、更新履歴
 * @returns トップビューに表示する、更新履歴
 */
export const HistoryPaper: React.FC = () => {
  const { t } = useTranslation();
  return (
    <BasePaper title={t("top.history")}>
      <Box sx={{ m: 1, p: 1 }}>
        {(t("top.changelog", { returnObjects: true }) as Array<string>).map(
          (l) => (
            <>
              <Typography variant="body2">{l}</Typography>
              <Divider />
            </>
          )
        )}
      </Box>
    </BasePaper>
  );
};

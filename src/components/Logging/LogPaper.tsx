import * as React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import { LOG } from "../../lib/Logging";
import { BasePaper } from "../common/BasePaper";

/**
 * 操作ログ画面
 * @returns 操作ログ画面
 */
export const LogPaper: React.FC = () => {
  const { t } = useTranslation();
  return (
    <BasePaper title={t("error.log")}>
      <Box sx={{ m: 1, p: 1 }}>
        {LOG.datas.map((l) => (
          <>
            <Typography variant="body2">{l}</Typography>
            <Divider />
          </>
        ))}
      </Box>
    </BasePaper>
  );
};

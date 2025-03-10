import * as React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { LoadVBUnit } from "../../features/TopView/LoadVBUnit";
import { BasePaper } from "../common/BasePaper";

/**
 * トップビューに表示する、利用規約
 * @returns トップビューに表示する、利用規約
 */
export const DescriptionPaper: React.FC = () => {
  const { t } = useTranslation();
  return (
    <BasePaper title={t("top.catchphrase")}>
      <Box sx={{ m: 1, p: 1 }}>
        <Typography variant="body1">
          {(
            t("top.descriptions", { returnObjects: true }) as Array<string>
          ).map((l) => (
            <>
              {l}
              <br />
            </>
          ))}
        </Typography>
        <br />
        <LoadVBUnit />
      </Box>
    </BasePaper>
  );
};

import { Box, Divider, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { BasePaper } from "../../../components/common/BasePaper";

export const HistoryPaper: React.FC = () => {
  const { t } = useTranslation();
  const history = t("videoEditor.historyEntries", {
    returnObjects: true,
  }) as string[];

  return (
    <BasePaper title={t("videoEditor.historyTitle")}>
      <Box sx={{ m: 1, p: 1 }}>
        {history.map((item) => (
          <React.Fragment key={item}>
            <Typography variant="body2">
              {item.split("\n").map((line) => (
                <React.Fragment key={line}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </Typography>
            <Divider />
          </React.Fragment>
        ))}
      </Box>
    </BasePaper>
  );
};

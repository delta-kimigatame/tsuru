import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * フッターの免責事項
 */
const FooterDisclaimer: React.FC<{ matches: boolean }> = ({ matches }) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        textAlign: matches ? "right" : "left",
        flex: 1,
        order: matches ? 3 : 2,
      }}
    >
      <Typography variant="caption">
        {t("footer.disclaimer")}
        <br />
        <br />
        {t("footer.disclaimer2")}
      </Typography>
      <br />
      <br />
    </Box>
  );
};

export default FooterDisclaimer;

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { useTranslation } from "react-i18next";
import { setting } from "../../config/siteConfig";
import { XButton } from "../common/XButton";

/**
 * フッターの製品情報・シェアボタン
 */
const FooterShare: React.FC<{ matches: boolean }> = ({ matches }) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        textAlign: matches ? "center" : "left",
        flex: 1,
        order: matches ? 2 : 3,
      }}
    >
      <Typography variant="body2">
        きみがため
        <br />
        <br />
      </Typography>
      <XButton
        href={`https://twitter.com/intent/tweet?text=${setting.siteName} - ${setting.productName} - ${setting.productUrl}`}
      >
        {t("xbutton.share")}
      </XButton>
    </Box>
  );
};

export default FooterShare;

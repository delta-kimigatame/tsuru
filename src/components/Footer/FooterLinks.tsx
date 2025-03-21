import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import React from "react";
import { useTranslation } from "react-i18next";
import { setting } from "../../config/siteConfig";

/**
 * フッターのリンク一覧
 */
const FooterLinks: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ flex: 1, order: 1 }}>
      <Typography>
        <Link variant="body2" color="inherit" href={setting.developerXUrl}>
          {t("footer.developerx")}
        </Link>{" "}
        <br />
        <Link variant="body2" color="inherit" href={setting.githubUrl}>
          {t("footer.github")}
        </Link>{" "}
        <br />
        <Link variant="body2" color="inherit" href={setting.discordUrl}>
          {t("footer.discord")}
        </Link>{" "}
        <br />
        <br />
      </Typography>
    </Box>
  );
};

export default FooterLinks;

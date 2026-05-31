import HomeIcon from "@mui/icons-material/Home";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { HeaderMenu } from "../../features/Header/HeaderMenu";

export const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ justifyContent: "space-between", minHeight: "40" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img
            src="./static/logo192.png"
            alt="UTAlet"
            style={{ width: 32, height: 32 }}
          />
          <Typography variant="subtitle1">
            {t("videoEditor.headerTitle")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button color="inherit" href="./index.html" startIcon={<HomeIcon />}>
            {t("videoEditor.headerBackToMain")}
          </Button>
          <HeaderMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

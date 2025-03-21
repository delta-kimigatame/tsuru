import { AppBar, Toolbar } from "@mui/material";
import React from "react";
import { HeaderLogo } from "../../features/Header/HeaderLogo";
import { HeaderMenu } from "../../features/Header/HeaderMenu";

/**
 * このアプリのヘッダー
 * @returns
 */
export const Header: React.FC = () => {
  return (
    <AppBar position="fixed">
      <Toolbar sx={{ justifyContent: "space-between", minHeight: "40" }}>
        <HeaderLogo />
        <HeaderMenu />
      </Toolbar>
    </AppBar>
  );
};

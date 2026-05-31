import HomeIcon from "@mui/icons-material/Home";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import React from "react";

export const Header: React.FC = () => {
  return (
    <AppBar position="fixed">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img
            src="./static/logo192.png"
            alt="UTAlet"
            style={{ width: 32, height: 32 }}
          />
          <Typography variant="subtitle1">UTAlet Video Editor</Typography>
        </Box>
        <Button color="inherit" href="./index.html" startIcon={<HomeIcon />}>
          UTAlet本体へ
        </Button>
      </Toolbar>
    </AppBar>
  );
};

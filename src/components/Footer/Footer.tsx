import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import React from "react";
import FooterDisclaimer from "./FooterDisclaimer";
import FooterLinks from "./FooterLinks";
import FooterShare from "./FooterShare";

/**
 * フッターコンポーネント
 */
export const Footer: React.FC = () => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <>
      <Divider />
      <Box
        sx={{
          justifyContent: "space-between",
          display: matches ? "flex" : "block",
          p: 2,
        }}
      >
        <FooterLinks />
        <FooterShare matches={matches} />
        <FooterDisclaimer matches={matches} />
      </Box>
    </>
  );
};

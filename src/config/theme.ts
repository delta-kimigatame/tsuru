import { PaletteMode } from "@mui/material";
import { blueGrey, deepPurple, grey, red } from "@mui/material/colors";
import { ThemeOptions } from "@mui/material/styles";

/**
 * 全体のテーマを設定する。
 *  */
export const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // palette values for light mode
          primary: {
            light: deepPurple[100],
            main: deepPurple[300],
            dark: deepPurple[500],
          },
          secondary: {
            light: red[100],
            main: red[300],
            dark: red[500],
          },
          text: {
            primary: grey[900],
            secondary: grey[800],
          },
          background: {
            default: grey[200],
            paper: grey[200],
          },
        }
      : {
          // palette values for dark mode
          primary: {
            light: deepPurple[100],
            main: deepPurple[300],
            dark: deepPurple[500],
          },
          secondary: {
            light: red[100],
            main: red[300],
            dark: red[500],
          },
          text: {
            primary: "#fff",
            secondary: grey[500],
          },
          background: {
            default: blueGrey[900],
            paper: blueGrey[900],
          },
        }),
  },
});

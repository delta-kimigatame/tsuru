import { PaletteMode } from "@mui/material";
import {
  blue,
  blueGrey,
  brown,
  deepPurple,
  green,
  grey,
  lightBlue,
  lightGreen,
  orange,
  pink,
  red,
  yellow,
} from "@mui/material/colors";
import { ThemeOptions } from "@mui/material/styles";
import { ColorTheme } from "../types/colorTheme";

const pallets = {
  default: { primary: deepPurple, secondary: red },
  red: { primary: red, secondary: green },
  orange: { primary: orange, secondary: green },
  yellow: { primary: yellow, secondary: red },
  lightgreen: { primary: lightGreen, secondary: red },
  green: { primary: green, secondary: red },
  blue: { primary: blue, secondary: red },
  aqua: { primary: lightBlue, secondary: red },
  pink: { primary: pink, secondary: green },
  brown: { primary: brown, secondary: green },
};

/**
 * 全体のテーマを設定する。
 *  */
export const getDesignTokens = (
  mode: PaletteMode,
  colorTheme: ColorTheme = "default"
): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // palette values for light mode
          primary: {
            light: pallets[colorTheme]["primary"][100],
            main: pallets[colorTheme]["primary"][300],
            dark: pallets[colorTheme]["primary"][500],
          },
          secondary: {
            light: pallets[colorTheme]["secondary"][100],
            main: pallets[colorTheme]["secondary"][300],
            dark: pallets[colorTheme]["secondary"][500],
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
            light: pallets[colorTheme]["primary"][100],
            main: pallets[colorTheme]["primary"][300],
            dark: pallets[colorTheme]["primary"][500],
          },
          secondary: {
            light: pallets[colorTheme]["secondary"][100],
            main: pallets[colorTheme]["secondary"][300],
            dark: pallets[colorTheme]["secondary"][500],
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

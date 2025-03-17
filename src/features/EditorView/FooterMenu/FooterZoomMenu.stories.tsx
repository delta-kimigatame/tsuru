import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../../config/theme";
import i18n from "../../../i18n/configs";
import { FooterZoomMenu, FooterZoomMenuProps } from "./FooterZoomMenu";

export default {
  title: "EditView/FooterMenu/FooterZoomMenu",
  component: FooterZoomMenu,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));
const darkTheme = createTheme(getDesignTokens("dark"));

const Template: StoryFn<FooterZoomMenuProps> = (args) => {
  // useRef でアンカー用の div を参照する
  const anchorRef = React.useRef<HTMLDivElement>(null);
  // アンカーエレメントを state で管理
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  // コンポーネントのマウント時に、anchorRef.current を state に設定する
  React.useEffect(() => {
    if (anchorRef.current) {
      setAnchorEl(anchorRef.current);
    }
  }, []);
  return (
    <div>
      <div
        ref={anchorRef}
        style={{
          display: "inline-block",
          padding: "8px",
          background: "#eee",
          marginBottom: "16px",
        }}
      >
        アンカー要素
      </div>
      <FooterZoomMenu {...args} anchor={anchorEl} handleClose={() => {}} />
    </div>
  );
};
export const LightMode = Template.bind({});
LightMode.args = {};
LightMode.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];

export const DarkMode = Template.bind({});
DarkMode.args = {};
DarkMode.decorators = [
  (Story) => (
    <ThemeProvider theme={darkTheme}>
      <Story />
    </ThemeProvider>
  ),
];

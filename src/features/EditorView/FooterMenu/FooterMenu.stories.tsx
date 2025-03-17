import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../../config/theme";
import i18n from "../../../i18n/configs";
import { FooterMenu, FooterMenuProps } from "./FooterMenu";

export default {
  title: "EditView/FooterMenu/FooterMenu",
  component: FooterMenu,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));
const darkTheme = createTheme(getDesignTokens("dark"));

const Template: StoryFn<FooterMenuProps> = (args) => <FooterMenu {...args} />;
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
DarkMode.args = {
  selectedNotesIndex: [],
};
DarkMode.decorators = [
  (Story) => (
    <ThemeProvider theme={darkTheme}>
      <Story />
    </ThemeProvider>
  ),
];

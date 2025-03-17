import { createTheme, ThemeProvider } from "@mui/material";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { useCookieStore } from "../../store/cookieStore";
import { EditorView } from "./EditorView";

export default {
  title: "EditView/EditorView",
  component: EditorView,
} as Meta<typeof EditorView>;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));
const darkTheme = createTheme(getDesignTokens("dark"));

const Template: StoryFn = () => <EditorView />;

export const LightMode = Template.bind({});
LightMode.args = {};
LightMode.decorators = [
  (Story) => {
    return (
      <ThemeProvider theme={lightTheme}>
        <Story />
      </ThemeProvider>
    );
  },
];

LightMode.play = async () => {
  const store = useCookieStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
};

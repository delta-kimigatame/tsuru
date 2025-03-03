import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import { sampleWav } from "../../storybook/sampledata";
import { SampleWavButton, SampleWavButtonProps } from "./SampleWavButton";

export default {
  title: "VbInfoDialog/SampleWavButton",
  component: SampleWavButton,
  argTypes: {},
} as Meta;
const lightTheme = createTheme(getDesignTokens("light"));

const Template: StoryFn<SampleWavButtonProps> = (args) => (
  <ThemeProvider theme={lightTheme}>
    <SampleWavButton {...args} />
  </ThemeProvider>
);
export const Default = Template.bind({});
Default.args = {
  sampleUrl: "data:audio/wav;base64," + sampleWav,
};
export const Disabled = Template.bind({});
Disabled.args = {
  sampleUrl: undefined,
};

import { IconButton, SvgIconProps } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import { VibratoIcon } from "../../../../src/components/EditorView/NoteMenu/VibratoIcon";
import { getDesignTokens } from "../../../../src/config/theme";

export default {
  title: "03_9_エディタアイコン/ビブラート",
  component: VibratoIcon,
} as Meta;

const lightTheme = createTheme(getDesignTokens("light"));
const darkTheme = createTheme(getDesignTokens("dark"));

const Template: StoryFn<SvgIconProps> = (args) => <VibratoIcon {...args} />;
export const LightMode = Template.bind({});
LightMode.args = {};
LightMode.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <IconButton>
        <Story />
      </IconButton>
    </ThemeProvider>
  ),
];
LightMode.storyName = "ライトモード";

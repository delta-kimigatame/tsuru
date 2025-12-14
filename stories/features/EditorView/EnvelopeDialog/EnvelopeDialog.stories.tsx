import { createTheme, ThemeProvider } from "@mui/material";
import { Meta, StoryFn } from "@storybook/react";
import { getDesignTokens } from "../../../../src/config/theme";
import {
  EnvelopeDialog,
  EnvelopeDialogProps,
} from "../../../../src/features/EditorView/EnvelopeDialog/EnvelopeDialog";
import i18n from "../../../../src/i18n/configs";
import { Note } from "../../../../src/lib/Note";
const dummyNote = new Note();
dummyNote.length = 480;
dummyNote.tempo = 120;
dummyNote.preutter = 50;
dummyNote.overlap = 30;
dummyNote.envelope = "0,5,35,0,100,100,0";
export default {
  title: "03_4_ダイアログ/エンベロープダイアログ",
  component: EnvelopeDialog,
  args: { open: true, note: dummyNote, handleClose: () => {} },
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));
const darkTheme = createTheme(getDesignTokens("dark"));

const Template: StoryFn<EnvelopeDialogProps> = (args) => (
  <EnvelopeDialog {...args} />
);

export const LightMode = Template.bind({});
LightMode.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
LightMode.storyName = "ライトモード";

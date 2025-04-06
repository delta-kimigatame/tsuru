import { createTheme, ThemeProvider } from "@mui/material";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { Note } from "../../lib/Note";
import { Ust } from "../../lib/Ust";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import { NoteDividerDialog, NoteDividerDialogProps } from "./NoteDividerDialog";
const dummyNote = new Note();
dummyNote.length = 480;
dummyNote.tempo = 120;
const shortNote = new Note();
shortNote.length = 240;
shortNote.tempo = 120;
const longNote = new Note();
longNote.length = 480 * 5 + 240;
longNote.tempo = 120;
export default {
  title: "03_4_ダイアログ/ノート分割",
  component: NoteDividerDialog,
  args: { open: true, noteIndex: 0, handleClose: () => {}, notes: [dummyNote] },
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));
const darkTheme = createTheme(getDesignTokens("dark"));

const DummyParent: React.FC<NoteDividerDialogProps & { notes: Array<Note> }> = (
  args
) => {
  const useProject = useMusicProjectStore();
  React.useEffect(() => {
    useProject.setUst({} as Ust);
    useProject.setNotes(args.notes);
  }, []);
  return (
    <NoteDividerDialog
      {...args}
      open={useProject.notes.length !== 0 ? args.open : false}
    />
  );
};

const Template: StoryFn<NoteDividerDialogProps & { notes: Array<Note> }> = (
  args
) => <DummyParent {...args} />;

export const LightMode = Template.bind({});
LightMode.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
LightMode.storyName = "ライトモード";

export const DarkMode = Template.bind({});
DarkMode.decorators = [
  (Story) => (
    <ThemeProvider theme={darkTheme}>
      <Story />
    </ThemeProvider>
  ),
];
DarkMode.storyName = "ダークモード";

export const ShortNote = Template.bind({});
ShortNote.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
ShortNote.args = {
  notes: [shortNote],
};
ShortNote.storyName = "短いノートの場合";
export const LongNote = Template.bind({});
LongNote.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
LongNote.args = {
  notes: [longNote],
};
LongNote.storyName = "長いノートの場合";

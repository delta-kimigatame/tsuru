import { createTheme, ThemeProvider } from "@mui/material";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { Note } from "../../lib/Note";
import { Ust } from "../../lib/Ust";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import {
  NotePropertyDialog,
  NotePropertyDialogProps,
} from "./NotePropertyDialog";
const dummyNote = new Note();
dummyNote.length = 480;
dummyNote.tempo = 120;
dummyNote.notenum = 60;
dummyNote.lyric = "あ";
dummyNote.preutter = 10;
dummyNote.overlap = -5;
dummyNote.stp = 3;
const dummyRestNote = new Note();
dummyRestNote.length = 480;
dummyRestNote.tempo = 120;
dummyRestNote.notenum = 60;
dummyRestNote.lyric = "R";
dummyRestNote.preutter = 10;
dummyRestNote.overlap = -5;
dummyRestNote.stp = 3;

export default {
  title: "03_4_ダイアログ/ノートプロパティ",
  component: NotePropertyDialog,
  args: {
    open: true,
    note: dummyNote,
    handleClose: () => {},
    notes: [dummyNote],
  },
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));
const darkTheme = createTheme(getDesignTokens("dark"));

const DummyParent: React.FC<
  NotePropertyDialogProps & { notes: Array<Note> }
> = (args) => {
  const useProject = useMusicProjectStore();
  React.useEffect(() => {
    useProject.setUst({} as Ust);
    useProject.setNotes(args.notes);
  }, []);
  return (
    <NotePropertyDialog
      {...args}
      open={useProject.notes.length !== 0 ? args.open : false}
    />
  );
};

const Template: StoryFn<NotePropertyDialogProps & { notes: Array<Note> }> = (
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

export const RestNote = Template.bind({});
RestNote.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
RestNote.args = {
  note: dummyRestNote,
  notes: [dummyRestNote],
};
RestNote.storyName = "休符の場合";

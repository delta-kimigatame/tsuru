import { createTheme, ThemeProvider } from "@mui/material";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { Note } from "../../lib/Note";
import { Ust } from "../../lib/Ust";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import { VibratoDialog, VibratoDialogProps } from "./VibratoDialog";
const dummyNote = new Note();
dummyNote.length = 480;
dummyNote.tempo = 120;
dummyNote.notenum = 60;
dummyNote.lyric = "あ";
dummyNote.vibrato = "50,120,40,35,45,1,8,0";
const dummyNoVibratoNote = new Note();
dummyNoVibratoNote.length = 480;
dummyNoVibratoNote.tempo = 120;
dummyNoVibratoNote.notenum = 60;
dummyNote.lyric = "あ";

export default {
  title: "03_4_ダイアログ/ビブラート",
  component: VibratoDialog,
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

const DummyParent: React.FC<VibratoDialogProps & { notes: Array<Note> }> = (
  args
) => {
  const useProject = useMusicProjectStore();
  React.useEffect(() => {
    useProject.setUst({} as Ust);
    useProject.setNotes(args.notes);
  }, []);
  return (
    <VibratoDialog
      {...args}
      open={useProject.notes.length !== 0 ? args.open : false}
    />
  );
};

const Template: StoryFn<VibratoDialogProps & { notes: Array<Note> }> = (
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

export const UndefinedVibrato = Template.bind({});
UndefinedVibrato.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
UndefinedVibrato.args = {
  note: dummyNoVibratoNote,
  notes: [dummyNoVibratoNote],
};
UndefinedVibrato.storyName = "ビブラートの初期値が無い場合";

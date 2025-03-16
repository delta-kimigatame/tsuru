import { Box } from "@mui/system";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { Note } from "../../../lib/Note";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { last } from "../../../utils/array";
import { PianorollBackground } from "./PianorollBackground";
import { PianorollNotes, PianorollNotesProps } from "./PianorollNotes";
import { PianorollPitch } from "./PianorollPitch";
import { PianorollVibrato } from "./PianorollVibrato";

export default {
  title: "EditView/Pianoroll/PianorollVibrato",
  component: PianorollVibrato,
} as Meta<typeof PianorollVibrato>;

const Template: StoryFn<PianorollNotesProps> = (args) => (
  <>
    <Box
      style={{
        position: "relative",
        width: "100%",
        height: PIANOROLL_CONFIG.TOTAL_HEIGHT + 100,
        overflowX: "scroll",
        overflowY: "auto",
      }}
    >
      <PianorollBackground />
      <PianorollNotes selectedNotesIndex={[]} />
      <PianorollPitch />
      <PianorollVibrato />
    </Box>
  </>
);
/** テスト用の処理。最低限必要なパラメータを持ったノートを指定数生成する */
const createNotes = (count: number): Note[] => {
  const newNotes = new Array<Note>();
  for (let i = 0; i < count; i++) {
    const n = new Note();
    n.index = 0;
    n.lyric = i % 3 === 0 ? "R" : "あ";
    n.length = 120 * ((i % 8) + 1);
    n.notenum = 107 - i;
    n.hasTempo = false;
    n.tempo = 120;
    n.vibrato = "70,180,65,20,20,50,0,0";
    n.prev = last(newNotes);
    // n.prev.next = n;
    newNotes.push(n);
  }
  return newNotes;
};

export const LightMode = Template.bind({});
LightMode.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
  store.setVerticalZoom(1);
  store.setHorizontalZoom(1);
  const newNotes = createNotes(107 - 24 + 1);
  projectStore.setNotes(newNotes);
};

export const DarkMode = Template.bind({});
DarkMode.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  store.setMode("dark");
  store.setColorTheme("default");
  store.setVerticalZoom(1);
  store.setHorizontalZoom(1);
  const newNotes = createNotes(107 - 24 + 1);
  projectStore.setNotes(newNotes);
};

export const VerticalZoom = Template.bind({});
VerticalZoom.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
  store.setVerticalZoom(0.5);
  store.setHorizontalZoom(1);
  const newNotes = createNotes(107 - 24 + 1);
  projectStore.setNotes(newNotes);
};

export const HorizontalZoom = Template.bind({});
HorizontalZoom.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
  store.setVerticalZoom(1);
  store.setHorizontalZoom(0.5);
  const newNotes = createNotes(107 - 24 + 1);
  projectStore.setNotes(newNotes);
};

export const Zoom = Template.bind({});
Zoom.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
  store.setVerticalZoom(0.5);
  store.setHorizontalZoom(0.5);
  const newNotes = createNotes(107 - 24 + 1);
  projectStore.setNotes(newNotes);
};

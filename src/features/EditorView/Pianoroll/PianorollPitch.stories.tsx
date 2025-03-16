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

export default {
  title: "EditView/Pianoroll/PianorollPitch",
  component: PianorollPitch,
  args: { selectedNotesIndex: [] },
} as Meta<typeof PianorollPitch>;

const DummyParent = (args) => {
  const { verticalZoom, horizontalZoom } = useCookieStore();
  const { notes } = useMusicProjectStore();
  /**
   * 各ノートのx座標描画位置を予め求めておく
   */
  const notesLeft = React.useMemo(() => {
    if (notes.length === 0) return [];
    const lefts = new Array<number>();
    let totalLength = 0;
    for (let i = 0; i < notes.length; i++) {
      lefts.push(totalLength);
      totalLength += notes[i].length;
    }
    return lefts;
  }, [notes]);

  /**
   * svg幅を計算するためにノート長の合計を求める
   */
  const totalLength = React.useMemo(() => {
    if (notes.length === 0) return 0;
    return notesLeft.slice(-1)[0] + notes.slice(-1)[0].length;
  }, [notesLeft]);
  return (
    <svg
      width={totalLength * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom}
      height={PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom}
      style={{
        display: "block",
        position: "relative",
      }}
    >
      <g id="background">
        <PianorollBackground {...args} totalLength={totalLength} />
      </g>
      <g id="notes">
        <PianorollNotes
          {...args}
          totalLength={totalLength}
          notesLeft={notesLeft}
        />
      </g>
      <g id="pitch">
        <PianorollPitch
          {...args}
          totalLength={totalLength}
          notesLeft={notesLeft}
        />
      </g>
    </svg>
  );
};
const Template: StoryFn<PianorollNotesProps> = (args) => (
  <DummyParent {...args} />
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
    n.pbs = "-125;-10";
    n.setPbw([250]);
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

export const pbmS = Template.bind({});
pbmS.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
  store.setVerticalZoom(1);
  store.setHorizontalZoom(1);
  const newNotes = createNotes(107 - 24 + 1);
  newNotes.forEach((n) => n.setPbm(["s"]));
  projectStore.setNotes(newNotes);
};
export const pbmR = Template.bind({});
pbmR.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
  store.setVerticalZoom(1);
  store.setHorizontalZoom(1);
  const newNotes = createNotes(107 - 24 + 1);
  newNotes.forEach((n) => n.setPbm(["r"]));
  projectStore.setNotes(newNotes);
};

export const pbmJ = Template.bind({});
pbmJ.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
  store.setVerticalZoom(1);
  store.setHorizontalZoom(1);
  const newNotes = createNotes(107 - 24 + 1);
  newNotes.forEach((n) => n.setPbm(["j"]));
  projectStore.setNotes(newNotes);
};

export const MultiPoltament = Template.bind({});
MultiPoltament.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
  store.setVerticalZoom(1);
  store.setHorizontalZoom(1);
  const newNotes = createNotes(107 - 24 + 1);
  newNotes.forEach((n) => {
    n.setPbw([75, 75, 75, 75]);
    n.setPbm(["j", "r", "s"]);
    n.setPby([10, -5, 5]);
  });
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

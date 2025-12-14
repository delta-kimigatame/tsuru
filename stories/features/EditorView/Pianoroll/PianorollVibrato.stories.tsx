import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { PIANOROLL_CONFIG } from "../../../../src/config/pianoroll";
import { PianorollBackground } from "../../../../src/features/EditorView/Pianoroll/PianorollBackground";
import {
  PianorollNotes,
  PianorollNotesProps,
} from "../../../../src/features/EditorView/Pianoroll/PianorollNotes";
import { PianorollVibrato } from "../../../../src/features/EditorView/Pianoroll/PianorollVibrato";
import { Note } from "../../../../src/lib/Note";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { last } from "../../../../src/utils/array";

export default {
  title: "03_2_ピアノロール/部品/ビブラート",
  component: PianorollVibrato,
  args: { selectedNotesIndex: [] },
} as Meta<typeof PianorollVibrato>;

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
      <g id="vibrato">
        <PianorollVibrato
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
LightMode.storyName = "ライトモード";

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
DarkMode.storyName = "ダークモード";

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
VerticalZoom.storyName = "音階方向縮小";

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
HorizontalZoom.storyName = "時間方向縮小";

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
Zoom.storyName = "縮小";

import { Meta, StoryObj } from "@storybook/react";
// TODO: Migrate to @storybook/test when implementing interactions
import React from "react";
import { PIANOROLL_CONFIG } from "../../../../src/config/pianoroll";
import { PianorollBackground } from "../../../../src/features/EditorView/Pianoroll/PianorollBackground";
import {
  PianorollNotes,
  PianorollNotesProps,
} from "../../../../src/features/EditorView/Pianoroll/PianorollNotes";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

const DummyParent = (args: PianorollNotesProps) => {
  const { verticalZoom, horizontalZoom } = useCookieStore();
  const { notes } = useMusicProjectStore();
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
    </svg>
  );
};

const meta: Meta<typeof DummyParent> = {
  title: "features/EditorView/Pianoroll/PianorollNotes",
  component: DummyParent,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// TODO: Uncomment and migrate to @storybook/test when upgrading testing interactions
// /** テスト用の処理。最低限必要なパラメータを持ったノートを指定数生成する */
// const createNotes = (count: number): Note[] => {
//   const newNotes = new Array<Note>();
//   for (let i = 0; i < count; i++) {
//     const n = new Note();
//     n.index = 0;
//     n.lyric = i % 3 === 0 ? "R" : "あ";
//     n.length = 120 * ((i % 8) + 1);
//     n.notenum = 107 - i;
//     n.hasTempo = false;
//     n.tempo = 120;
//     newNotes.push(n);
//   }
//   return newNotes;
// };

// export const LightMode: Story = {
//   name: "ライトモード",
//   args: {
//     selectedNotesIndex: [0, 1],
//   },
//   play: async () => {
//     const store = useCookieStore.getState();
//     const projectStore = useMusicProjectStore.getState();
//     store.setMode("light");
//     store.setColorTheme("default");
//     store.setVerticalZoom(1);
//     store.setHorizontalZoom(1);
//     projectStore.setNoteProperty(0, "length", 480);
//     const newNotes = createNotes(107 - 24 + 1);
//     projectStore.setNotes(newNotes);
//   },
// };

// export const DarkMode: Story = {
//   name: "ダークモード",
//   args: {
//     selectedNotesIndex: [0, 1],
//   },
//   play: async () => {
//     const store = useCookieStore.getState();
//     const projectStore = useMusicProjectStore.getState();
//     store.setMode("dark");
//     store.setColorTheme("default");
//     store.setVerticalZoom(1);
//     store.setHorizontalZoom(1);
//     projectStore.setNoteProperty(0, "length", 480);
//     const newNotes = createNotes(107 - 24 + 1);
//     projectStore.setNotes(newNotes);
//   },
// };

// Other stories with play functions commented out for @storybook/test migration...

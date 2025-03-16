import { Box } from "@mui/system";
import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { Note } from "../../../lib/Note";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { PianorollBackground } from "./PianorollBackground";
import { PianorollNotes, PianorollNotesProps } from "./PianorollNotes";

export default {
  title: "EditView/Pianoroll/PianorollNotes",
  component: PianorollNotes,
} as Meta<typeof PianorollNotes>;
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
    newNotes.push(n);
  }
  return newNotes;
};

export const LightMode = Template.bind({});
LightMode.args = {
  selectedNotesIndex: [0, 1],
};
LightMode.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
  store.setVerticalZoom(1);
  store.setHorizontalZoom(1);
  projectStore.setNoteProperty(0, "length", 480);
  const newNotes = createNotes(107 - 24 + 1);
  projectStore.setNotes(newNotes);
};

export const DarkMode = Template.bind({});
DarkMode.args = {
  selectedNotesIndex: [0, 1],
};
DarkMode.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  store.setMode("dark");
  store.setColorTheme("default");
  store.setVerticalZoom(1);
  store.setHorizontalZoom(1);
  projectStore.setNoteProperty(0, "length", 480);
  const newNotes = createNotes(107 - 24 + 1);
  projectStore.setNotes(newNotes);
};

export const VerticalZoomEffect = Template.bind({});
VerticalZoomEffect.args = {
  selectedNotesIndex: [0, 1],
};
VerticalZoomEffect.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
  store.setVerticalZoom(0.5);
  store.setHorizontalZoom(1);
  projectStore.setNoteProperty(0, "length", 480);
  const newNotes = createNotes(107 - 24 + 1);
  projectStore.setNotes(newNotes);
};
export const HorizontalZoomEffect = Template.bind({});
HorizontalZoomEffect.args = {
  selectedNotesIndex: [0, 1],
};
HorizontalZoomEffect.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
  store.setVerticalZoom(1);
  store.setHorizontalZoom(0.5);
  projectStore.setNoteProperty(0, "length", 480);
  const newNotes = createNotes(107 - 24 + 1);
  projectStore.setNotes(newNotes);
};

export const ZoomEffect = Template.bind({});
ZoomEffect.args = {
  selectedNotesIndex: [0, 1],
};
ZoomEffect.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
  store.setVerticalZoom(0.5);
  store.setHorizontalZoom(2);
  projectStore.setNoteProperty(0, "length", 480);
  const newNotes = createNotes(107 - 24 + 1);
  projectStore.setNotes(newNotes);
};

const PerformanceWrapper: React.FC<PianorollNotesProps> = (props) => {
  const [renderTime, setRenderTime] = React.useState<number | null>(null);

  React.useEffect(() => {
    const start = performance.now();
    // 次のアニメーションフレームで終了時間を測定する
    requestAnimationFrame(() => {
      const end = performance.now();
      setRenderTime(end - start);
    });
  }, []);

  return (
    <Box sx={{ position: "relative" }}>
      <DummyParent {...props} />
      {renderTime !== null && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 1000,
            bgcolor: "white",
            p: 1,
            fontSize: "12px",
            border: "1px solid #ccc",
          }}
        >
          Render Time: {renderTime.toFixed(2)} ms
        </Box>
      )}
    </Box>
  );
};
const PeformanceTemplate: StoryFn<PianorollNotesProps> = (args) => (
  <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
    <PerformanceWrapper {...args} />
  </Box>
);

export const PeformanceTest9999 = PeformanceTemplate.bind({});
PeformanceTest9999.args = {
  selectedNotesIndex: [],
};
PeformanceTest9999.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  const newNotes = createNotes(9999);
  newNotes.forEach((n, i) => {
    newNotes[i].length = 480;
  });
  projectStore.setNotes(newNotes);
};

export const PeformanceTest2000 = PeformanceTemplate.bind({});
PeformanceTest2000.args = {
  selectedNotesIndex: [],
};
PeformanceTest2000.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  const newNotes = createNotes(2000);
  newNotes.forEach((n, i) => {
    newNotes[i].length = 480;
  });
  projectStore.setNotes(newNotes);
};

export const PeformanceTest1000 = PeformanceTemplate.bind({});
PeformanceTest1000.args = {
  selectedNotesIndex: [],
};
PeformanceTest1000.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  const newNotes = createNotes(1000);
  newNotes.forEach((n, i) => {
    newNotes[i].length = 480;
  });
  projectStore.setNotes(newNotes);
};

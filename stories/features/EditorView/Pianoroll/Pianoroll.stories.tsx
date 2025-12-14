import { Meta, StoryFn } from "@storybook/react";
import JSZip from "jszip";
import {
  Pianoroll,
  PianorollProps,
} from "../../../../src/features/EditorView/Pianoroll/Pianoroll";
import { Note } from "../../../../src/lib/Note";
import { Ust } from "../../../../src/lib/Ust";
import { VoiceBank } from "../../../../src/lib/VoiceBanks/VoiceBank";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../src/store/musicProjectStore";
import { sampleLongCVUst } from "../../src/storybook/sampledata";
import { base64ToArrayBuffer, loadVB } from "../../src/storybook/utils";
import { last } from "../../src/utils/array";

export default {
  title: "03_2_ピアノロール/全体",
  component: Pianoroll,
  args: { selectedNotesIndex: [], playing: false, playingMs: 0 },
} as Meta<typeof Pianoroll>;

const Template: StoryFn<PianorollProps> = (args) => <Pianoroll {...args} />;

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
Zoom.storyName = "両方縮小";

export const Portrait = Template.bind({});
Portrait.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
  store.setVerticalZoom(1);
  store.setHorizontalZoom(1);
  const newNotes = createNotes(107 - 24 + 1);
  projectStore.setNotes(newNotes);
  const td = new TextDecoder("Shift-JIS");
  const buffer = await loadVB("minimumCV.zip");
  const zip = new JSZip();
  await zip.loadAsync(buffer, {
    decodeFileName: (fileNameBinary: Uint8Array) => td.decode(fileNameBinary),
  });
  const loadedVb = new VoiceBank(zip.files);
  await loadedVb.initialize();
  projectStore.setVb(loadedVb);
};
Portrait.storyName = "立ち絵表示";

export const RealUst = Template.bind({});
RealUst.play = async () => {
  const store = useCookieStore.getState();
  const projectStore = useMusicProjectStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
  store.setVerticalZoom(1);
  store.setHorizontalZoom(1);
  const u = new Ust();
  await u.load(base64ToArrayBuffer(sampleLongCVUst));
  projectStore.setUst(u);
  projectStore.setNotes(u.notes);
};
RealUst.storyName = "ust読込";

import { createTheme, ThemeProvider } from "@mui/material/styles";
// import { expect } from "@storybook/jest";
import { Meta, StoryFn } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import React from "react";
import { getDesignTokens } from "../../../../src/config/theme";
import {
  FooterMenu,
  FooterMenuProps,
} from "../../../../src/features/EditorView/FooterMenu/FooterMenu";
import i18n from "../../../../src/i18n/configs";
import { Note } from "../../../../src/lib/Note";
import { Ust } from "../../../../src/lib/Ust";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../../src/storybook/utils";

export default {
  title: "03_1_エディタ下部メニュー/全体",
  component: FooterMenu,
  args: {
    selectedNotesIndex: [],
    handlePlay: () => {},
    handleDownload: () => {},
    synthesisProgress: false,
    synthesisCount: 0,
    playing: false,
    handlePlayStop: () => {},
  },
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));
const darkTheme = createTheme(getDesignTokens("dark"));

const Template: StoryFn<FooterMenuProps> = (args) => <FooterMenu {...args} />;
export const LightMode = Template.bind({});
LightMode.args = {};
LightMode.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
LightMode.storyName = "ライトモード";

export const DarkMode = Template.bind({});
DarkMode.args = {
  selectedNotesIndex: [],
};
DarkMode.decorators = [
  (Story) => (
    <ThemeProvider theme={darkTheme}>
      <Story />
    </ThemeProvider>
  ),
];
DarkMode.storyName = "ダークモード";

export const SynthesisProgress = Template.bind({});
SynthesisProgress.args = {
  synthesisProgress: true,
  selectedNotesIndex: [],
  synthesisCount: 1,
};
SynthesisProgress.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
SynthesisProgress.storyName = "合成待ち画面(全体)";
SynthesisProgress.play = async () => {
  const projectStore = useMusicProjectStore.getState();
  const notes = new Array<Note>();
  notes.push(new Note());
  notes.push(new Note());
  notes.push(new Note());
  notes.push(new Note());
  notes.push(new Note());
  projectStore.setUst({} as Ust);
  projectStore.setNotes(notes);
};

export const SynthesisProgressWithSelect = Template.bind({});
SynthesisProgressWithSelect.args = {
  synthesisProgress: true,
  selectedNotesIndex: [0, 1],
  synthesisCount: 1,
};
SynthesisProgressWithSelect.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
SynthesisProgressWithSelect.play = async () => {
  const projectStore = useMusicProjectStore.getState();
  const notes = new Array<Note>();
  notes.push(new Note());
  notes.push(new Note());
  notes.push(new Note());
  notes.push(new Note());
  notes.push(new Note());
  projectStore.setUst({} as Ust);
  projectStore.setNotes(notes);
};
SynthesisProgressWithSelect.storyName = "合成待ち画面(選択ノート)";

export const Playing = Template.bind({});
Playing.args = {
  playing: true,
};
Playing.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];

export const Landscape = Template.bind({});
Landscape.args = {};
Landscape.parameters = {
  viewport: {
    defaultViewport: "iphonex",
    defaultOrientation: "landscape",
  },
};
Landscape.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
Landscape.storyName = "iphoneX横向き";

export const ClickUst = Template.bind({});
ClickUst.args = {};
ClickUst.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
ClickUst.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);
  const ustTab = await canvas.findByRole("tab", { name: /UST読込/i });
  await userEvent.click(ustTab);
  const fileInput = await canvas.findByTestId("file-input");
  if (!fileInput) {
    throw new Error("隠しファイル入力が見つかりません");
  }
};
ClickUst.storyName = "UST読込クリック(ファイル読込が開く)";
export const ClickZoom = Template.bind({});
ClickZoom.args = {};
ClickZoom.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
ClickZoom.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);
  await step(
    "隠しファイル入力にダミーのustファイルをアップロードする",
    async () => {
      const fileInput = await canvas.findByTestId("file-input");
      const dummyZip = new File(
        [base64ToArrayBuffer(sampleShortCVUst)],
        "test.ust"
      );
      await userEvent.upload(fileInput, dummyZip);
    }
  );
  const zoomTab = await canvas.findByRole("tab", { name: /拡大縮小/i });
  await userEvent.click(zoomTab);
  await within(document.body).findByRole("menu", {}, { timeout: 5000 });
};
ClickZoom.storyName = "拡大縮小クリック(メニューが開く)";

export const ClickBatchProcess = Template.bind({});
ClickBatchProcess.args = {};
ClickBatchProcess.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
ClickBatchProcess.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);
  await step(
    "隠しファイル入力にダミーのustファイルをアップロードする",
    async () => {
      const fileInput = await canvas.findByTestId("file-input");
      const dummyZip = new File(
        [base64ToArrayBuffer(sampleShortCVUst)],
        "test.ust"
      );
      await userEvent.upload(fileInput, dummyZip);
    }
  );
  const batchProcessTab = await canvas.findByRole("tab", { name: /一括処理/i });
  await userEvent.click(batchProcessTab);

  await within(document.body).findByRole("menu", {}, { timeout: 5000 });
};
ClickBatchProcess.storyName = "一括処理クリック(メニューが開く)";

const DummyParent: React.FC = () => {
  const [playing, setPlaying] = React.useState<boolean>(false);
  const [processing, setProcessing] = React.useState<boolean>(false);

  const handlePlay = () => {
    setPlaying(true);
  };

  const handlePlayStop = () => {
    setPlaying(false);
  };

  const handleDownload = () => {
    setProcessing(true);
  };

  // 他のハンドラーはダミー関数でOK
  const dummyProps: FooterMenuProps = {
    selectedNotesIndex: [],
    handlePlay: handlePlay,
    handleDownload: handleDownload,
    synthesisProgress: processing,
    synthesisCount: 0,
    playing: playing,
    handlePlayStop: handlePlayStop,
  };

  return <FooterMenu {...dummyProps} />;
};

const ClickTemplate: StoryFn = () => <DummyParent />;
export const ClickPlay = ClickTemplate.bind({});
ClickPlay.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
ClickPlay.storyName = "再生クリック";

ClickPlay.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);
  await step(
    "隠しファイル入力にダミーのustファイルをアップロードする",
    async () => {
      const fileInput = await canvas.findByTestId("file-input");
      const dummyZip = new File(
        [base64ToArrayBuffer(sampleShortCVUst)],
        "test.ust"
      );
      await userEvent.upload(fileInput, dummyZip);
    }
  );
  const playTab = await canvas.findByRole("tab", { name: /再生/i });
  await userEvent.click(playTab);
  const stopTab = await canvas.findByRole("tab", { name: /停止/i });
  await userEvent.click(stopTab);
  await canvas.findByRole("tab", { name: /再生/i });
};

export const ClickDownload = ClickTemplate.bind({});
ClickDownload.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];

ClickDownload.storyName = "wav保存をクリック";
ClickDownload.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);
  await step(
    "隠しファイル入力にダミーのustファイルをアップロードする",
    async () => {
      const fileInput = await canvas.findByTestId("file-input");
      const dummyZip = new File(
        [base64ToArrayBuffer(sampleShortCVUst)],
        "test.ust"
      );
      await userEvent.upload(fileInput, dummyZip);
    }
  );
  const downloadTab = await canvas.findByRole("tab", { name: /WAV保存/i });
  await userEvent.click(downloadTab);
  await canvas.findAllByRole("tab", { name: /0\/9/i });
};

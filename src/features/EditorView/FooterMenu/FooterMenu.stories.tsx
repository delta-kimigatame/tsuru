import { createTheme, ThemeProvider } from "@mui/material/styles";
// import { expect } from "@storybook/jest";
import { Meta, StoryFn } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import React from "react";
import { getDesignTokens } from "../../../config/theme";
import i18n from "../../../i18n/configs";
import { Note } from "../../../lib/Note";
import { Ust } from "../../../lib/Ust";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { sampleShortCVUst } from "../../../storybook/sampledata";
import { base64ToArrayBuffer } from "../../../storybook/utils";
import { FooterMenu, FooterMenuProps } from "./FooterMenu";

export default {
  title: "EditView/FooterMenu/FooterMenu",
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

import { createTheme, ThemeProvider } from "@mui/material";
import { Meta, StoryFn } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import JSZip from "jszip";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { VoiceBank } from "../../lib/VoiceBanks/VoiceBank";
import { useCookieStore } from "../../store/cookieStore";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import { sampleLongCVUst } from "../../storybook/sampledata";
import { base64ToArrayBuffer, loadVB } from "../../storybook/utils";
import { EditorView } from "./EditorView";
export default {
  title: "EditView/EditorView",
  component: EditorView,
} as Meta<typeof EditorView>;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));
const darkTheme = createTheme(getDesignTokens("dark"));

const testUstBuf = base64ToArrayBuffer(sampleLongCVUst);
const testVBFileName = "minimumCV.zip";

/**
 * EditorViewに必要なグローバルな状態を初期化するためのダミーコンポーネント
 * @returns
 */
const DummyParent: React.FC = () => {
  const { setVb, setNotes } = useMusicProjectStore();
  const { setVerticalZoom, setHorizontalZoom } = useCookieStore();
  const initialize = async () => {
    const td = new TextDecoder("Shift-JIS");
    const buffer = await loadVB(testVBFileName);
    const zip = new JSZip();
    await zip.loadAsync(buffer, {
      decodeFileName: (fileNameBinary: Uint8Array) => td.decode(fileNameBinary),
    });
    const loadedVb = new VoiceBank(zip.files);
    await loadedVb.initialize();
    setVb(loadedVb);
    setNotes([]);
    setVerticalZoom(1);
    setHorizontalZoom(1);
  };
  React.useEffect(() => {
    initialize();
  }, []);
  return <EditorView />;
};

const Template: StoryFn = () => <DummyParent />;

export const LightMode = Template.bind({});
LightMode.args = {};
LightMode.decorators = [
  (Story) => {
    return (
      <ThemeProvider theme={lightTheme}>
        <Story />
      </ThemeProvider>
    );
  },
];

LightMode.play = async () => {
  const store = useCookieStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
};

export const DarkMode = Template.bind({});
DarkMode.args = {};
DarkMode.decorators = [
  (Story) => {
    return (
      <ThemeProvider theme={darkTheme}>
        <Story />
      </ThemeProvider>
    );
  },
];

DarkMode.play = async () => {
  const store = useCookieStore.getState();
  store.setMode("dark");
  store.setColorTheme("default");
};

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

export const LoadUstAndPlay = Template.bind({});
LoadUstAndPlay.args = {};
LoadUstAndPlay.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];

LoadUstAndPlay.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);
  await step("コンポーネントの初期化待ち", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
  await step(
    "隠しファイル入力にダミーのustファイルをアップロードする",
    async () => {
      const fileInput = await canvas.findByTestId("file-input");
      const dummyZip = new File([testUstBuf], "test.ust");
      await userEvent.upload(fileInput, dummyZip);
    }
  );
  await step("ustのロード完了待ち", async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });
  const playTab = await canvas.findByRole("tab", { name: /再生/i });
  await userEvent.click(playTab);
  await step("合成処理待ち", async () => {
    await canvas.findByRole("tab", { name: /停止/i }, { timeout: 60000 });
  });
};

export const LoadUstAndPlayAndStop = Template.bind({});
LoadUstAndPlay.args = {};
LoadUstAndPlay.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];

LoadUstAndPlayAndStop.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);
  await step("コンポーネントの初期化待ち", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
  await step(
    "隠しファイル入力にダミーのustファイルをアップロードする",
    async () => {
      const fileInput = await canvas.findByTestId("file-input");
      const dummyZip = new File([testUstBuf], "test.ust");
      await userEvent.upload(fileInput, dummyZip);
    }
  );
  await step("ustのロード完了待ち", async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });
  const playTab = await canvas.findByRole("tab", { name: /再生/i });
  await userEvent.click(playTab);
  await step("再生が始まってから停止を押す", async () => {
    const stopTab = await canvas.findByRole(
      "tab",
      { name: /停止/i },
      { timeout: 60000 }
    );
    await userEvent.click(stopTab);
  });
  await step("もう1度再生ボタンが表示されるはず", async () => {
    await canvas.findByRole("tab", { name: /再生/i });
  });
};

export const LoadUstAndDownload = Template.bind({});
LoadUstAndDownload.args = {};
LoadUstAndDownload.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];

LoadUstAndDownload.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);
  await step("コンポーネントの初期化待ち", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
  await step(
    "隠しファイル入力にダミーのustファイルをアップロードする",
    async () => {
      const fileInput = await canvas.findByTestId("file-input");
      const dummyZip = new File([testUstBuf], "test.ust");
      await userEvent.upload(fileInput, dummyZip);
    }
  );
  await step("ustのロード完了待ち", async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });
  const playTab = await canvas.findByRole("tab", { name: /wav保存/i });
  await userEvent.click(playTab);
  await step(
    "合成処理が終わればまたwav保存ボタンが表示されるはず",
    async () => {
      await canvas.findByRole("tab", { name: /wav保存/i }, { timeout: 60000 });
    }
  );
};

export const LoadUstAndVerticalZoom = Template.bind({});
LoadUstAndVerticalZoom.args = {};
LoadUstAndVerticalZoom.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];

LoadUstAndVerticalZoom.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);
  await step("コンポーネントの初期化待ち", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
  await step(
    "隠しファイル入力にダミーのustファイルをアップロードする",
    async () => {
      const fileInput = await canvas.findByTestId("file-input");
      const dummyZip = new File([testUstBuf], "test.ust");
      await userEvent.upload(fileInput, dummyZip);
    }
  );
  await step("ustのロード完了待ち", async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });
  const zoomTab = await canvas.findByRole("tab", { name: /拡大縮小/i });
  await userEvent.click(zoomTab);
  const menu = await within(document.body).findByRole(
    "menu",
    {},
    { timeout: 5000 }
  );
  const menuitem = await within(document.body).findByRole("menuitem", {
    name: /縮小\(縦\)/i,
  });
  await userEvent.click(menuitem);
  await step("縮小待ち", async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });
  await userEvent.click(zoomTab);
  await within(document.body).findByRole("menu", {}, { timeout: 5000 });
  const menuitem2 = await within(document.body).findByRole("menuitem", {
    name: /拡大\(縦\)/i,
  });
  await userEvent.click(menuitem2);
};

export const LoadUstAndHorizontalZoom = Template.bind({});
LoadUstAndHorizontalZoom.args = {};
LoadUstAndHorizontalZoom.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];

LoadUstAndHorizontalZoom.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);
  await step("コンポーネントの初期化待ち", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
  await step(
    "隠しファイル入力にダミーのustファイルをアップロードする",
    async () => {
      const fileInput = await canvas.findByTestId("file-input");
      const dummyZip = new File([testUstBuf], "test.ust");
      await userEvent.upload(fileInput, dummyZip);
    }
  );
  await step("ustのロード完了待ち", async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });
  const zoomTab = await canvas.findByRole("tab", { name: /拡大縮小/i });
  await userEvent.click(zoomTab);
  const menu = await within(document.body).findByRole(
    "menu",
    {},
    { timeout: 5000 }
  );
  const menuitem = await within(document.body).findByRole("menuitem", {
    name: /縮小\(横\)/i,
  });
  await userEvent.click(menuitem);
  await step("縮小待ち", async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });
  await userEvent.click(zoomTab);
  await within(document.body).findByRole("menu", {}, { timeout: 5000 });
  const menuitem2 = await within(document.body).findByRole("menuitem", {
    name: /拡大\(横\)/i,
  });
  await userEvent.click(menuitem2);
};

export const LoadUstAndBatchProcessAndPlay = Template.bind({});
LoadUstAndBatchProcessAndPlay.args = {};
LoadUstAndBatchProcessAndPlay.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];

LoadUstAndBatchProcessAndPlay.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);
  await step("コンポーネントの初期化待ち", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
  await step(
    "隠しファイル入力にダミーのustファイルをアップロードする",
    async () => {
      const fileInput = await canvas.findByTestId("file-input");
      const dummyZip = new File([testUstBuf], "test.ust");
      await userEvent.upload(fileInput, dummyZip);
    }
  );
  await step("ustのロード完了待ち", async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });
  const batchProcessTab = await canvas.findByRole("tab", { name: /一括処理/i });
  await userEvent.click(batchProcessTab);
  await within(document.body).findByRole("menu", {}, { timeout: 5000 });
  const menuitem = await within(document.body).findByRole("menuitem", {
    name: /1オクターブ上げる/i,
  });
  await userEvent.click(menuitem);
  const playTab = await canvas.findByRole("tab", { name: /再生/i });
  await userEvent.click(playTab);
  await step("合成処理待ち", async () => {
    await canvas.findByRole("tab", { name: /停止/i }, { timeout: 60000 });
  });
};

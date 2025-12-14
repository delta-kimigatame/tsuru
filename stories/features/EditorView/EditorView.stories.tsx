import { Meta, StoryObj } from "@storybook/react";
// TODO: Migrate to @storybook/test when implementing interactions
// import { userEvent, within } from "@storybook/test";
import JSZip from "jszip";
import React from "react";
import { EditorView } from "../../../src/features/EditorView/EditorView";
import { VoiceBank } from "../../../src/lib/VoiceBanks/VoiceBank";
import { useCookieStore } from "../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";
import { loadVB } from "../../../src/storybook/utils";

const testVBFileName = "minimumCV.zip";

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

const meta: Meta<typeof DummyParent> = {
  title: "features/EditorView/EditorView",
  component: DummyParent,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// TODO: Migrate to @storybook/test when upgrading testing interactions
// export const ClickUst: Story = {
//   name: "UST読込をクリック",
//   play: async ({ canvasElement, step }) => {
//     const canvas = within(canvasElement);
//     const ustTab = await canvas.findByRole("tab", { name: /UST読込/i });
//     await userEvent.click(ustTab);
//     const fileInput = await canvas.findByTestId("file-input");
//     if (!fileInput) {
//       throw new Error("隠しファイル入力が見つかりません");
//     }
//   },
// };

// TODO: Migrate to @storybook/test when upgrading testing interactions
// export const LoadUstAndPlay: Story = {
//   name: "ustを読み込んで再生",
//   play: async ({ canvasElement, step }) => {
//     const canvas = within(canvasElement);
//     await step("コンポーネントの初期化待ち", async () => {
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     });
//     await step(
//       "隠しファイル入力にダミーのustファイルをアップロードする",
//       async () => {
//         const fileInput = await canvas.findByTestId("file-input");
//         const dummyZip = new File([testUstBuf], "test.ust");
//         await userEvent.upload(fileInput, dummyZip);
//       }
//     );
//     await step("ustのロード完了待ち", async () => {
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//     });
//     const playTab = await canvas.findByRole("tab", { name: /再生/i });
//     await userEvent.click(playTab);
//     await step("合成処理待ち", async () => {
//       await canvas.findByRole("tab", { name: /停止/i }, { timeout: 60000 });
//     });
//   },
// };

// TODO: Migrate to @storybook/test when upgrading testing interactions
// export const LoadUstAndPlayAndStop: Story = {
//   name: "ustを読み込んで再生中に停止",
//   play: async ({ canvasElement, step }) => {
//     const canvas = within(canvasElement);
//     await step("コンポーネントの初期化待ち", async () => {
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     });
//     await step(
//       "隠しファイル入力にダミーのustファイルをアップロードする",
//       async () => {
//         const fileInput = await canvas.findByTestId("file-input");
//         const dummyZip = new File([testUstBuf], "test.ust");
//         await userEvent.upload(fileInput, dummyZip);
//       }
//     );
//     await step("ustのロード完了待ち", async () => {
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//     });
//     const playTab = await canvas.findByRole("tab", { name: /再生/i });
//     await userEvent.click(playTab);
//     await step("再生が始まってから停止を押す", async () => {
//       const stopTab = await canvas.findByRole(
//         "tab",
//         { name: /停止/i },
//         { timeout: 60000 }
//       );
//       await userEvent.click(stopTab);
//     });
//     await step("もう1度再生ボタンが表示されるはず", async () => {
//       await canvas.findByRole("tab", { name: /再生/i });
//     });
//   },
// };

// TODO: Migrate to @storybook/test when upgrading testing interactions
// export const LoadUstAndDownload: Story = {
//   name: "ustを読み込んでwavをダウンロード",
//   play: async ({ canvasElement, step }) => {
//     const canvas = within(canvasElement);
//     await step("コンポーネントの初期化待ち", async () => {
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     });
//     await step(
//       "隠しファイル入力にダミーのustファイルをアップロードする",
//       async () => {
//         const fileInput = await canvas.findByTestId("file-input");
//         const dummyZip = new File([testUstBuf], "test.ust");
//         await userEvent.upload(fileInput, dummyZip);
//       }
//     );
//     await step("ustのロード完了待ち", async () => {
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//     });
//     const playTab = await canvas.findByRole("tab", { name: /wav保存/i });
//     await userEvent.click(playTab);
//     await step(
//       "合成処理が終わればまたwav保存ボタンが表示されるはず",
//       async () => {
//         await canvas.findByRole("tab", { name: /wav保存/i }, { timeout: 60000 });
//       }
//     );
//   },
// };

// TODO: Migrate to @storybook/test when upgrading testing interactions
// export const LoadUstAndVerticalZoom: Story = {
//   name: "ustを読み込んで音高方向拡大縮小",
//   play: async ({ canvasElement, step }) => {
//     const canvas = within(canvasElement);
//     await step("コンポーネントの初期化待ち", async () => {
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     });
//     await step(
//       "隠しファイル入力にダミーのustファイルをアップロードする",
//       async () => {
//         const fileInput = await canvas.findByTestId("file-input");
//         const dummyZip = new File([testUstBuf], "test.ust");
//         await userEvent.upload(fileInput, dummyZip);
//       }
//     );
//     await step("ustのロード完了待ち", async () => {
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//     });
//     const zoomTab = await canvas.findByRole("tab", { name: /拡大縮小/i });
//     await userEvent.click(zoomTab);
//     const menu = await within(document.body).findByRole(
//       "menu",
//       {},
//       { timeout: 5000 }
//     );
//     const menuitem = await within(document.body).findByRole("menuitem", {
//       name: /縮小\(縦\)/i,
//     });
//     await userEvent.click(menuitem);
//     await step("縮小待ち", async () => {
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//     });
//     await userEvent.click(zoomTab);
//     await within(document.body).findByRole("menu", {}, { timeout: 5000 });
//     const menuitem2 = await within(document.body).findByRole("menuitem", {
//       name: /拡大\(縦\)/i,
//     });
//     await userEvent.click(menuitem2);
//   },
// };

// TODO: Migrate to @storybook/test when upgrading testing interactions
// export const LoadUstAndHorizontalZoom: Story = {
//   name: "ustを読み込んで時間方向拡大縮小",
//   play: async ({ canvasElement, step }) => {
//     const canvas = within(canvasElement);
//     await step("コンポーネントの初期化待ち", async () => {
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     });
//     await step(
//       "隠しファイル入力にダミーのustファイルをアップロードする",
//       async () => {
//         const fileInput = await canvas.findByTestId("file-input");
//         const dummyZip = new File([testUstBuf], "test.ust");
//         await userEvent.upload(fileInput, dummyZip);
//       }
//     );
//     await step("ustのロード完了待ち", async () => {
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//     });
//     const zoomTab = await canvas.findByRole("tab", { name: /拡大縮小/i });
//     await userEvent.click(zoomTab);
//     const menu = await within(document.body).findByRole(
//       "menu",
//       {},
//       { timeout: 5000 }
//     );
//     const menuitem = await within(document.body).findByRole("menuitem", {
//       name: /縮小\(横\)/i,
//     });
//     await userEvent.click(menuitem);
//     await step("縮小待ち", async () => {
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//     });
//     await userEvent.click(zoomTab);
//     await within(document.body).findByRole("menu", {}, { timeout: 5000 });
//     const menuitem2 = await within(document.body).findByRole("menuitem", {
//       name: /拡大\(横\)/i,
//     });
//     await userEvent.click(menuitem2);
//   },
// };

// TODO: Migrate to @storybook/test when upgrading testing interactions
// export const LoadUstAndBatchProcessAndPlay: Story = {
//   name: "ustを読み込んで一括処理を実行し再生",
//   play: async ({ canvasElement, step }) => {
//     const canvas = within(canvasElement);
//     await step("コンポーネントの初期化待ち", async () => {
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     });
//     await step(
//       "隠しファイル入力にダミーのustファイルをアップロードする",
//       async () => {
//         const fileInput = await canvas.findByTestId("file-input");
//         const dummyZip = new File([testUstBuf], "test.ust");
//         await userEvent.upload(fileInput, dummyZip);
//       }
//     );
//     await step("ustのロード完了待ち", async () => {
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//     });
//     const batchProcessTab = await canvas.findByRole("tab", { name: /一括処理/i });
//     await userEvent.click(batchProcessTab);
//     await within(document.body).findByRole("menu", {}, { timeout: 5000 });
//     const menuitem = await within(document.body).findByRole("menuitem", {
//       name: /1オクターブ上げる/i,
//     });
//     await userEvent.click(menuitem);
//     const playTab = await canvas.findByRole("tab", { name: /再生/i });
//     await userEvent.click(playTab);
//     await step("合成処理待ち", async () => {
//       await canvas.findByRole("tab", { name: /停止/i }, { timeout: 60000 });
//     });
//   },
// };

import { Meta, StoryObj } from "@storybook/react";
// TODO: Migrate to @storybook/test when implementing interactions
// import { userEvent, within } from "@storybook/test";
import React from "react";
import { App } from "../../src/features/App";
import { Ust } from "../../src/lib/Ust";
import { useCookieStore } from "../../src/store/cookieStore";
import { useMusicProjectStore } from "../../src/store/musicProjectStore";

interface DummyParentProps {
  mode: "system" | "light" | "dark";
  language: "ja";
}

const DummyParent: React.FC<DummyParentProps> = (args) => {
  const store = useCookieStore();
  const projectStore = useMusicProjectStore();
  React.useEffect(() => {
    store.setMode(args.mode);
    store.setLanguage(args.language);
    projectStore.setVb(null);
    projectStore.setUst({} as Ust);
    projectStore.setNotes([]);
    projectStore.setUstFlags("");
    projectStore.setUstTempo(120);
    projectStore.setUst(null);
  }, []);
  return <App />;
};

const meta: Meta<typeof DummyParent> = {
  title: "features/App",
  component: DummyParent,
  tags: ["autodocs"],
  args: {
    mode: "system",
    language: "ja",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LightMode: Story = {
  args: {
    mode: "light",
    language: "ja",
  },
};

export const DarkMode: Story = {
  args: {
    mode: "dark",
    language: "ja",
  },
};
//   await step(
//     "隠しファイル入力にダミーのZIPファイルをアップロードする",
//     async () => {
//       const buffer = await loadVB(testVBFileName);
//       const fileInput = await canvas.findByTestId("file-input");
//       const dummyZip = new File([buffer], "minimumCV.zip", {
//         type: "application/zip",
//       });
//       await userEvent.upload(fileInput, dummyZip);
//     }
//   );
//   await step("LoadVBDialog が表示されるのを確認する", async () => {
//     const dialog = await within(document.body).findByRole(
//       "dialog",
//       {},
//       { timeout: 5000 }
//     );
//     if (!dialog) {
//       throw new Error("LoadVBDialog が表示されていません");
//     }
//   });
//   await step("LoadVBDialog の OK ボタンをクリックする", async () => {
//     const okButton = await within(document.body).findByRole(
//       "button",
//       { name: /OK/i },
//       { timeout: 5000 }
//     );
//     await userEvent.click(okButton);
//   });
//   await step("InfoVBDialog の 全規約に同意 ボタンをクリックする", async () => {
//     const okButton = await within(document.body).findByRole(
//       "button",
//       { name: /全規約に同意/i },
//       { timeout: 5000 }
//     );
//     await userEvent.click(okButton);
//   });
// };

// export const DefaultEditorView = Template.bind({});
// DefaultEditorView.play = playEditorView;
// DefaultEditorView.storyName =
//   "エディタ画面・デフォルト(標準画面で、モードは端末設定)";

// export const LightModeEditorView = Template.bind({});
// LightModeEditorView.args = {
//   mode: "light",
// };
// LightModeEditorView.play = playEditorView;
// LightModeEditorView.storyName = "エディタ画面・ライトモード";

// export const DarkModeEditorView = Template.bind({});
// DarkMode.args = {
//   mode: "dark",
// };
// DarkModeEditorView.play = playEditorView;
// DarkModeEditorView.storyName = "エディタ画面・ダークモード";

// export const iphoneXLandscapeEditorView = Template.bind({});
// iphoneXLandscapeEditorView.parameters = {
//   viewport: {
//     defaultViewport: "iphonex",
//     defaultOrientation: "landscape",
//   },
// };
// iphoneXLandscapeEditorView.play = playEditorView;
// iphoneXLandscapeEditorView.storyName = "エディタ画面・モバイル(横向き)";

// export const iphoneXEditorView = Template.bind({});
// iphoneXEditorView.parameters = {
//   viewport: {
//     defaultViewport: "iphonex",
//     defaultOrientation: "portrait",
//   },
// };
// iphoneXEditorView.play = playEditorView;
// iphoneXEditorView.storyName = "エディタ画面・モバイル(縦向き)";

// export const ipadLandscapeEditorView = Template.bind({});
// ipadLandscapeEditorView.parameters = {
//   viewport: {
//     defaultViewport: "ipad",
//     defaultOrientation: "landscape",
//   },
// };
// ipadLandscapeEditorView.play = playEditorView;
// ipadLandscapeEditorView.storyName = "エディタ画面・ipad(横向き)";

// export const ipadEditorView = Template.bind({});
// ipadEditorView.parameters = {
//   viewport: {
//     defaultViewport: "ipad",
//     defaultOrientation: "portrait",
//   },
// };
// ipadEditorView.play = playEditorView;
// ipadEditorView.storyName = "エディタ画面・ipad(縦向き)";

import { Meta, StoryFn } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import React from "react";
import { Ust } from "../lib/Ust";
import { useCookieStore } from "../store/cookieStore";
import { useMusicProjectStore } from "../store/musicProjectStore";
import { loadVB } from "../storybook/utils";
import { App } from "./App";

export default {
  title: "App",
  component: App,
  args: {
    mode: "system",
    language: "ja",
  },
  parameters: {
    viewport: {
      defaultViewport: "responsive",
      defaultOrientation: "portrait",
    },
  },
} as Meta;

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
interface DummyParentProps {
  mode: "system";
  language: "ja";
}

const Template: StoryFn<DummyParentProps> = (args) => <DummyParent {...args} />;
export const Default = Template.bind({});

export const LightMode = Template.bind({});
LightMode.args = {
  mode: "light",
};

export const DarkMode = Template.bind({});
DarkMode.args = {
  mode: "dark",
};

export const iphoneXLandscape = Template.bind({});
iphoneXLandscape.args = {};
iphoneXLandscape.parameters = {
  viewport: {
    defaultViewport: "iphonex",
    defaultOrientation: "landscape",
  },
};
export const iphoneX = Template.bind({});
iphoneX.args = {};
iphoneX.parameters = {
  viewport: {
    defaultViewport: "iphonex",
    defaultOrientation: "portrait",
  },
};

export const ipadLandscape = Template.bind({});
ipadLandscape.args = {};
ipadLandscape.parameters = {
  viewport: {
    defaultViewport: "ipad",
    defaultOrientation: "landscape",
  },
};
export const ipad = Template.bind({});
ipad.args = {};
ipad.parameters = {
  viewport: {
    defaultViewport: "ipad",
    defaultOrientation: "portrait",
  },
};
const testVBFileName = "minimumCV.zip";
const td = new TextDecoder("Shift-JIS");
const playEditorView = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);
  await step(
    "隠しファイル入力にダミーのZIPファイルをアップロードする",
    async () => {
      const buffer = await loadVB(testVBFileName);
      const fileInput = await canvas.findByTestId("file-input");
      const dummyZip = new File([buffer], "minimumCV.zip", {
        type: "application/zip",
      });
      await userEvent.upload(fileInput, dummyZip);
    }
  );
  await step("LoadVBDialog が表示されるのを確認する", async () => {
    const dialog = await within(document.body).findByRole(
      "dialog",
      {},
      { timeout: 5000 }
    );
    if (!dialog) {
      throw new Error("LoadVBDialog が表示されていません");
    }
  });
  await step("LoadVBDialog の OK ボタンをクリックする", async () => {
    const okButton = await within(document.body).findByRole(
      "button",
      { name: /OK/i },
      { timeout: 5000 }
    );
    await userEvent.click(okButton);
  });
  await step("InfoVBDialog の 全規約に同意 ボタンをクリックする", async () => {
    const okButton = await within(document.body).findByRole(
      "button",
      { name: /全規約に同意/i },
      { timeout: 5000 }
    );
    await userEvent.click(okButton);
  });
};

export const DefaultEditorView = Template.bind({});
DefaultEditorView.play = playEditorView;

export const LightModeEditorView = Template.bind({});
LightModeEditorView.args = {
  mode: "light",
};
LightModeEditorView.play = playEditorView;

export const DarkModeEditorView = Template.bind({});
DarkMode.args = {
  mode: "dark",
};
DarkModeEditorView.play = playEditorView;

export const iphoneXLandscapeEditorView = Template.bind({});
iphoneXLandscapeEditorView.parameters = {
  viewport: {
    defaultViewport: "iphonex",
    defaultOrientation: "landscape",
  },
};
iphoneXLandscapeEditorView.play = playEditorView;
export const iphoneXEditorView = Template.bind({});
iphoneXEditorView.parameters = {
  viewport: {
    defaultViewport: "iphonex",
    defaultOrientation: "portrait",
  },
};
iphoneXEditorView.play = playEditorView;

export const ipadLandscapeEditorView = Template.bind({});
ipadLandscapeEditorView.parameters = {
  viewport: {
    defaultViewport: "ipad",
    defaultOrientation: "landscape",
  },
};
ipadLandscapeEditorView.play = playEditorView;
export const ipadEditorView = Template.bind({});
ipadEditorView.parameters = {
  viewport: {
    defaultViewport: "ipad",
    defaultOrientation: "portrait",
  },
};
ipadEditorView.play = playEditorView;

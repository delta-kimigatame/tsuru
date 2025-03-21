import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { base64ToArrayBuffer } from "../../storybook/utils";
import { LoadVBUnit } from "./LoadVBUnit";

export default {
  title: "02_トップ/音源読込",
  component: LoadVBUnit,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

const Template: StoryFn = () => (
  <ThemeProvider theme={lightTheme}>
    <LoadVBUnit />
  </ThemeProvider>
);

/**内部にてすと.txtを持つshift-jisで圧縮したzip */
const base64ZipData =
  "UEsDBBQAAAAAACprYloAAAAAAAAAAAAAAAAKAAAAg2WDWINnLnR4dFBLAQIUABQAAAAAACprYloAAAAAAAAAAAAAAAAKAAAAAAAAAAEAIAAAAAAAAACDZYNYg2cudHh0UEsFBgAAAAABAAEAOAAAACgAAAAAAA==";

export const Default = Template.bind({});
Default.storyName = "初期状態";

export const clickButton = Template.bind({});
clickButton.storyName = "ファイル選択画面の表示";
clickButton.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);

  await step("SelectVBButton をクリックする", async () => {
    // ボタンの表示テキストは翻訳キー t("top.selectZipButtonText") により表示されるので、
    // ここでは「UTAU音源のZIPファイルを選択」と仮定
    const selectButton = await canvas.findByRole("button", {
      name: /UTAU音源のZIPファイルを選択/i,
    });
    await userEvent.click(selectButton);
  });

  await step("隠しファイル入力が存在することを確認する", async () => {
    // ここでは、隠しの file input の存在を確認するだけに留めます。
    const fileInput = await canvas.findByTestId("file-input");
    if (!fileInput) {
      throw new Error("隠しファイル入力が見つかりません");
    }
  });
};

export const showDialog = Template.bind({});
showDialog.storyName = "音源読込画面表示";
showDialog.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);

  await step(
    "隠しファイル入力にダミーのZIPファイルをアップロードする",
    async () => {
      const fileInput = await canvas.findByTestId("file-input");
      const dummyZip = new File(
        [base64ToArrayBuffer(base64ZipData)],
        "dummy.zip",
        {
          type: "application/zip",
        }
      );
      await userEvent.upload(fileInput, dummyZip);
    }
  );

  await step("LoadVBDialog が表示されるのを確認する", async () => {
    // Portal 内にレンダリングされているため、document.body から検索します。
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
};

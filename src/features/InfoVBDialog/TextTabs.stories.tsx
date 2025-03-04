import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import JSZip from "jszip";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { EncodingOption } from "../../utils/EncodingMapping";
import { TextTabs, TextTabsProps } from "./TextTabs";

// i18n を日本語に設定
i18n.changeLanguage("ja");

// テーマの設定
const lightTheme = createTheme(getDesignTokens("light"));

export default {
  title: "VbInfoDialog/TextTabs",
  component: TextTabs,
  argTypes: {},
} as Meta;

// ヘルパー関数: ダミーテキストファイルを作成する
const createDummyTextFile = (
  filename: string,
  content: string
): JSZip.JSZipObject => {
  const zip = new JSZip();
  // File の生成（内容は minimal な文字列）
  const file = new File([content], filename, { type: "text/plain" });
  zip.file(filename, file);
  return zip.files[filename];
};

// 正常系: 「readme.txt」と「a.txt」を含むダミーデータ
const normalZipFiles = (() => {
  const zip = new JSZip();
  // readme.txt は特殊扱いとして後で先頭に表示される
  const readmeContent = "R"; // 最小限の内容
  const aContent = "A";
  zip.file(
    "readme.txt",
    new File([readmeContent], "readme.txt", { type: "text/plain" })
  );
  zip.file("a.txt", new File([aContent], "a.txt", { type: "text/plain" }));
  return zip.files;
})();

// タブ切替用: readme.txt, a.txt, b.txt の3ファイル
const multiZipFiles = (() => {
  const zip = new JSZip();
  zip.file("readme.txt", new File(["R"], "readme.txt", { type: "text/plain" }));
  zip.file("a.txt", new File(["A"], "a.txt", { type: "text/plain" }));
  zip.file("b.txt", new File(["B"], "b.txt", { type: "text/plain" }));
  return zip.files;
})();

// フォールバック: フィルター対象外のファイルのみ（character.txt, install.txt）
const fallbackZipFiles = (() => {
  const zip = new JSZip();
  zip.file(
    "character.txt",
    new File(["C"], "character.txt", { type: "text/plain" })
  );
  zip.file(
    "install.txt",
    new File(["I"], "install.txt", { type: "text/plain" })
  );
  return zip.files;
})();

// テンプレート関数
const Template: StoryFn<TextTabsProps> = (args) => (
  <ThemeProvider theme={lightTheme}>
    <TextTabs {...args} />
  </ThemeProvider>
);

// デフォルトのストーリー: 正常な表示
export const Default = Template.bind({});
Default.storyName = "正常なファイル一覧の表示";
Default.args = {
  zipFiles: normalZipFiles,
  encoding: EncodingOption.SHIFT_JIS,
};

// タブ切替動作のストーリー
export const タブ切替動作 = Template.bind({});
タブ切替動作.storyName = "タブ切替動作";
タブ切替動作.args = {
  zipFiles: multiZipFiles,
  encoding: EncodingOption.SHIFT_JIS,
};
タブ切替動作.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);

  await step(
    "最初のタブ（readme.txt）の内容が表示されていることを確認",
    async () => {
      const readmeTab = await canvas.findByRole("tab", {
        name: /readme\.txt/i,
      });
    }
  );

  await step("2番目のタブ（a.txt）をクリックして内容を切替", async () => {
    const aTab = await canvas.findByRole("tab", { name: /a\.txt/i });
    await userEvent.click(aTab);
    // ここで TabPanel 内の TextTabContent のレンダリング結果を確認できる
    const typography = await canvas.findByText("A");
  });

  await step("3番目のタブ（b.txt）をクリックして内容を切替", async () => {
    const bTab = await canvas.findByRole("tab", { name: /b\.txt/i });
    await userEvent.click(bTab);
    // ここで TabPanel 内の TextTabContent のレンダリング結果を確認できる
    const typography = await canvas.findByText("B");
  });
};

// フォールバックのストーリー: テキストファイルが見つからない場合
export const テキストファイル不在 = Template.bind({});
テキストファイル不在.storyName =
  "テキストファイルが見つからない場合のフォールバック";
テキストファイル不在.args = {
  zipFiles: fallbackZipFiles,
  encoding: EncodingOption.SHIFT_JIS,
};

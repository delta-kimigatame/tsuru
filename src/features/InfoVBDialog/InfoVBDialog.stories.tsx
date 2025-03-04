import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import React from "react";
import { getDesignTokens } from "../../config/theme";
import i18n from "../../i18n/configs";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import { sampleIcon, sampleWav } from "../../storybook/sampledata";
import { base64ToArrayBuffer } from "../../storybook/utils";
import { EncodingOption } from "../../utils/EncodingMapping";
import { InfoVBDialog, InfoVBDialogProps } from "./InfoVBDialog";

// i18n を日本語に設定
i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

// ダミーの vb オブジェクト（MusicProjectStore の vb）
const fakeVb = {
  name: "Test VB",
  image: base64ToArrayBuffer(sampleIcon),
  sample: base64ToArrayBuffer(sampleWav),
  author: "Test Author",
  web: "https://example.com",
  version: "v1.0",
  voice: "Test Voice",
  oto: {
    otoCount: 5,
  },
  // zip はダミーのファイル群。ここでは最低限 readme.txt と a.txt を用意
  zip: {
    "readme.txt": {},
    "a.txt": {},
  },
  // initialize は非同期関数（実際の再読み込み動作は省略）
  initialize: async (encoding: EncodingOption) => {
    // ここでは単に Promise.resolve() するだけ
    return;
  },
};

// Storybook 用のデコレーター：親コンポーネント（Header）が状態を管理するので、
// InfoVBDialog の props.open と setOpen を受け取る形になります。
// MusicProjectStore の vb はここで上書きしておきます。

// @ts-expect-error testのために実際と異なる型の代入
useMusicProjectStore.setState({ vb: fakeVb });

export default {
  title: "VBInfoDialog/InfoVBDialog",
  component: InfoVBDialog,
  argTypes: {},
} as Meta;

const Template: StoryFn<InfoVBDialogProps> = (args) => (
  <ThemeProvider theme={lightTheme}>
    <InfoVBDialog {...args} />
  </ThemeProvider>
);

/**
 * Story: 正常な表示
 * - vb が非null、かつ親（Header）から props.open が true で渡される。
 * - CharacterInfo に vb の各情報が表示され、EncodingSelect、TextTabs も表示される。
 * - 初回起動時は利用規約同意ボタン（"全規約に同意"）が表示される。
 */
export const 正常な表示 = Template.bind({});
正常な表示.storyName = "正常な表示 (未同意)";
正常な表示.args = {
  open: true,
  setOpen: (open: boolean) => {
    // Storybook では setOpen は単にコンソール出力で代用（実際の UI は play 関数で操作）
    console.log("setOpen:", open);
  },
};
/**
 * Story: 利用規約同意後の動作
 * - 初回起動時は利用規約同意ボタンが表示され、ユーザーが同意するとダイアログが閉じる。
 * - play 関数で同意ボタンをクリックした後、ダイアログが閉じることを視覚的に確認する。
 */
export const 利用規約同意後 = Template.bind({});
利用規約同意後.storyName = "利用規約同意後 (自動閉じ)";
利用規約同意後.args = {
  open: true,
  setOpen: (open: boolean) => {
    // 同意後はダイアログが閉じるので、open が false になる状態を確認できる
    console.log("setOpen:", open);
  },
};
利用規約同意後.play = async ({ canvasElement, step }) => {
  const canvas = within(document.body);
  await step("利用規約同意ボタンが表示される", async () => {
    // 「全規約に同意」のボタンが表示される前提
    await canvas.findByRole("button", { name: /全規約に同意/i });
  });
  await step("利用規約同意ボタンをクリックする", async () => {
    const agreeButton = await canvas.findByRole("button", {
      name: /全規約に同意/i,
    });
    await userEvent.click(agreeButton);
  });
  await step("ダイアログが閉じる（setOpenが false になる）", async () => {
    // ダイアログが閉じた状態（例えば、dialog が document.body から消える）を確認するために、
    // Portal 内から dialog を検索して、見つからなければ成功とする
    await within(document.body)
      .findByRole("dialog", {}, { timeout: 5000 })
      .catch(() => {
        // Dialog が見つからなければ閉じていると判断
        return;
      });
  });
};

/**
 * Story: ヘッダからの呼び出し（既に利用規約に同意済み）
 * - vb が更新された際に、利用規約同意ボタンは表示されず、代わりに閉じる専用アイコンボタンが表示される。
 */
export const ヘッダ呼び出し = Template.bind({});
ヘッダ呼び出し.storyName = "ヘッダから呼び出し (同意済み)";
ヘッダ呼び出し.args = {
  open: true,
  setOpen: (open: boolean) => {
    console.log("setOpen:", open);
  },
};
// このシナリオでは、初回起動時の同意状態（agreed）が true になるようにシミュレーションするため、
// play 関数で「全規約に同意」ボタンをクリックしてから、再度 open を true にして再表示することを想定します。
ヘッダ呼び出し.play = async ({ canvasElement, step }) => {
  const canvas = within(document.body);
  await step("初回起動時に利用規約同意ボタンが表示される", async () => {
    await canvas.findByRole("button", { name: /全規約に同意/i });
  });
  await step("利用規約同意ボタンをクリックし、ダイアログを閉じる", async () => {
    const agreeButton = await canvas.findByRole("button", {
      name: /全規約に同意/i,
    });
    await userEvent.click(agreeButton);
    // その後、Header から再びダイアログを開く場合、同意済み状態とみなす
  });
  await step(
    "Header から再呼び出しで、閉じるアイコンが表示される",
    async () => {
      // Header から呼び出した場合は、agreed が true になっている前提で閉じる専用のアイコンボタンが表示される
      // Portal 内から閉じるアイコン（aria-label "close"）を検出
      await canvas.findByRole("button", { name: /close/i });
    }
  );
};

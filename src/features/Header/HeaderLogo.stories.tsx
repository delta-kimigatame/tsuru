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
import { SnackBar } from "../common/SnackBar";
import { HeaderLogo } from "./HeaderLogo";

// 言語リソースを日本語に設定
i18n.changeLanguage("ja");
const lightTheme = createTheme(getDesignTokens("light"));

// ダミーの vb オブジェクト
const fakeVb = {
  name: "Test VB",
  image: base64ToArrayBuffer(sampleIcon),
  sample: base64ToArrayBuffer(sampleWav),
  author: "Test Author",
  web: "https://example.com",
  version: "v1.0",
  voice: "Test Voice",
  oto: { otoCount: 5 },
  zip: { "readme.txt": {}, "a.txt": {} },
  initialize: async (encoding: EncodingOption) => Promise.resolve(),
};

useMusicProjectStore.setState({ vb: null });
export default {
  title: "01_ヘッダ/ヘッダ部品/ロゴ",
  component: HeaderLogo,
  decorators: [
    (Story) => (
      <ThemeProvider theme={lightTheme}>
        <Story />
        {/* SnackBar を表示しておくことで、vbがnullの場合の案内が実際に表示される */}
        <SnackBar />
      </ThemeProvider>
    ),
  ],

  parameters: {
    viewport: {
      defaultViewport: "responsive", // デフォルトの表示をレスポンシブに
    },
  },
} as Meta;
const Template: StoryFn = () => <HeaderLogo />;

export const Default_vbnull = Template.bind({});
Default_vbnull.storyName = "音源読込前";
Default_vbnull.play = async ({ canvasElement, step }) => {
  // グローバルな vb を null に設定
  useMusicProjectStore.setState({ vb: null });
  const canvas = within(document.body);
  await step("デフォルトのロゴとアプリ名が表示される", async () => {
    // デフォルトのロゴ（"./static/logo192.png"）と、setting.productName が表示される前提
    await canvas.findByAltText("logo");
  });
};

export const Default_withVb = Template.bind({});
Default_withVb.storyName = "音源読込後";
Default_withVb.play = async ({ canvasElement }) => {
  // @ts-expect-error testのために実際と異なる型の代入
  useMusicProjectStore.setState({ vb: fakeVb });
  const canvas = within(document.body);
  // vb.name が表示されるので確認
  await canvas.findByText(fakeVb.name);
};

export const avatarClick = Template.bind({});
avatarClick.storyName =
  "音源読込後にアイコンをクリックすると音源情報画面が表示される";
avatarClick.play = async ({ canvasElement, step }) => {
  // @ts-expect-error testのために実際と異なる型の代入
  useMusicProjectStore.setState({ vb: fakeVb });
  const canvas = within(document.body);
  await step("Avatar（vb.image から生成されたもの）が表示される", async () => {
    // vb が非null の場合、Avatar の alt 属性は vb.name となる
    await canvas.findByAltText(fakeVb.name);
  });
  await step("Avatar をクリックすると InfoVBDialog が表示される", async () => {
    const avatar = await canvas.findByAltText(fakeVb.name);
    await userEvent.click(avatar);
    // InfoVBDialog は Dialog として表示される
    await canvas.findByRole("dialog", {}, { timeout: 5000 });
  });
};

export const vbNullAvatarClick = Template.bind({});
vbNullAvatarClick.storyName =
  "音源読込前にアイコンをクリックすると案内が表示される";
vbNullAvatarClick.play = async ({ canvasElement, step }) => {
  // vb を null に設定
  useMusicProjectStore.setState({ vb: null });
  const canvas = within(document.body);
  await step("Avatar（デフォルトロゴ）が表示される", async () => {
    await canvas.findByAltText("logo");
  });
  await step(
    "Avatar をクリックすると SnackBar の案内メッセージが表示される",
    async () => {
      const avatar = await canvas.findByAltText("logo");
      await userEvent.click(avatar);
      // 期待するメッセージ: "音源が未選択です。音源を選択して始めよう!"
      await canvas.findByText("音源が未選択です。音源を選択して始めよう!");
    }
  );
};

export const smallScreen = Template.bind({});
smallScreen.storyName = "画面サイズが小さい場合（テキスト非表示）";
smallScreen.parameters = {
  viewport: {
    defaultViewport: "iphonex",
  },
};
smallScreen.play = async ({ canvasElement, step }) => {
  // @ts-expect-error testのために実際と異なる型の代入
  useMusicProjectStore.setState({ vb: fakeVb });
  const canvas = within(document.body);
  await step("画面サイズが小さい場合、ロゴテキストが非表示である", async () => {
    // vb.name が表示されているとエラーになるので、vb.name のテキストが見つからないことを確認
    const textElement = canvas.queryByText(fakeVb.name);
    if (textElement) {
      throw new Error("小さい画面でテキストが表示されています");
    }
  });
};

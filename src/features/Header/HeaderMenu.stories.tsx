import { Meta, StoryFn } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import React from "react";
import i18n from "../../i18n/configs";
import { HeaderMenu } from "./HeaderMenu";

export default {
  title: "Header/HeaderMenu",
  component: HeaderMenu,
  argTypes: {},
} as Meta;

i18n.changeLanguage("ja");
const Template: StoryFn = (args) => <HeaderMenu {...args} />;
export const Default = Template.bind({});
Default.storyName = "HeaderMenu のデフォルト表示";
Default.args = {};

Default.play = async ({ canvasElement, step }) => {
  const canvas = within(canvasElement);

  await step("メニューアイコンが表示される", async () => {
    // IconButton に aria-label "メニューを開く" を設定しているため、それで検出
    await canvas.findByRole("button", { name: /メニューを開く/i });
  });

  await step("メニューアイコンをクリックしてメニューを開く", async () => {
    const button = await canvas.findByRole("button", {
      name: /メニューを開く/i,
    });
    await userEvent.click(button);
  });

  await step("メニューが表示される", async () => {
    // Material UI の Menu コンポーネントは Portal 経由でレンダリングされるため、
    // document.body 内から検索します。
    const menu = await within(document.body).findByRole(
      "menu",
      {},
      { timeout: 5000 }
    );
    if (!menu) {
      throw new Error("メニューが表示されませんでした");
    }
  });

  await step("ヘッダメニューの各項目が表示される", async () => {
    // HeaderMenuLanguage と HeaderMenuTheme の内容が表示される前提
    // ここでは、仮に「言語」と「テーマ」というテキストが表示されるとします（実際の実装に合わせて調整してください）
    await within(document.body).findByText(/日本語/i, {}, { timeout: 5000 });
    await within(document.body).findByText(
      /端末設定にあわせる/i,
      {},
      { timeout: 5000 }
    );
  });
};

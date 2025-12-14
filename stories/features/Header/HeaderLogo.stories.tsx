import { Meta, StoryObj } from "@storybook/react";
// TODO: Migrate to @storybook/test when implementing interactions
// import { userEvent, within } from "@storybook/test";
import { SnackBar } from "../../../src/features/common/SnackBar";
import { HeaderLogo } from "../../../src/features/Header/HeaderLogo";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";
import { sampleIcon, sampleWav } from "../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../src/storybook/utils";
import { EncodingOption } from "../../../src/utils/EncodingMapping";

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

const meta: Meta<typeof HeaderLogo> = {
  title: "features/Header/HeaderLogo",
  component: HeaderLogo,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <>
        <Story />
        <SnackBar />
      </>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const VbNull: Story = {
  // TODO: Uncomment and migrate to @storybook/test
  // play: async ({ canvasElement, step }) => {
  //   useMusicProjectStore.setState({ vb: null });
  //   const canvas = within(document.body);
  //   await step("デフォルトのロゴとアプリ名が表示される", async () => {
  //     await canvas.findByAltText("logo");
  //   });
  // },
};

export const WithVb: Story = {
  // TODO: Uncomment and migrate to @storybook/test
  // play: async ({ canvasElement }) => {
  //   // @ts-expect-error testのために実際と異なる型の代入
  //   useMusicProjectStore.setState({ vb: fakeVb });
  //   const canvas = within(document.body);
  //   await canvas.findByText(fakeVb.name);
  // },
};

export const AvatarClick: Story = {
  // TODO: Uncomment and migrate to @storybook/test
  // play: async ({ canvasElement, step }) => {
  //   // @ts-expect-error testのために実際と異なる型の代入
  //   useMusicProjectStore.setState({ vb: fakeVb });
  //   const canvas = within(document.body);
  //   await step("Avatar（vb.image から生成されたもの）が表示される", async () => {
  //     await canvas.findByAltText(fakeVb.name);
  //   });
  //   await step("Avatar をクリックすると InfoVBDialog が表示される", async () => {
  //     const avatar = await canvas.findByAltText(fakeVb.name);
  //     await userEvent.click(avatar);
  //     await canvas.findByRole("dialog", {}, { timeout: 5000 });
  //   });
  // },
};

export const VbNullAvatarClick: Story = {
  // TODO: Uncomment and migrate to @storybook/test
  // play: async ({ canvasElement, step }) => {
  //   useMusicProjectStore.setState({ vb: null });
  //   const canvas = within(document.body);
  //   await step("Avatar（デフォルトロゴ）が表示される", async () => {
  //     await canvas.findByAltText("logo");
  //   });
  //   await step(
  //     "Avatar をクリックすると SnackBar の案内メッセージが表示される",
  //     async () => {
  //       const avatar = await canvas.findByAltText("logo");
  //       await userEvent.click(avatar);
  //       await canvas.findByText("音源が未選択です。音源を選択して始めよう!");
  //     }
  //   );
  // },
};

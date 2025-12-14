import { Meta, StoryObj } from "@storybook/react";
// TODO: Migrate to @storybook/test when implementing interactions
// import { userEvent, within } from "@storybook/test";
import { InfoVBDialog } from "../../../src/features/InfoVBDialog/InfoVBDialog";
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
  oto: {
    otoCount: 5,
  },
  zip: {
    "readme.txt": {},
    "a.txt": {},
  },
  initialize: async (encoding: EncodingOption) => {
    return;
  },
};

// @ts-expect-error testのために実際と異なる型の代入
useMusicProjectStore.setState({ vb: fakeVb });

const meta: Meta<typeof InfoVBDialog> = {
  title: "features/InfoVBDialog/InfoVBDialog",
  component: InfoVBDialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    setOpen: (open: boolean) => {
      console.log("setOpen:", open);
    },
  },
};

export const AfterAgreement: Story = {
  args: {
    open: true,
    setOpen: (open: boolean) => {
      console.log("setOpen:", open);
    },
  },
  // TODO: Uncomment and migrate to @storybook/test
  // play: async ({ canvasElement, step }) => {
  //   const canvas = within(document.body);
  //   await step("利用規約同意ボタンが表示される", async () => {
  //     await canvas.findByRole("button", { name: /全規約に同意/i });
  //   });
  //   await step("利用規約同意ボタンをクリックする", async () => {
  //     const agreeButton = await canvas.findByRole("button", {
  //       name: /全規約に同意/i,
  //     });
  //     await userEvent.click(agreeButton);
  //   });
  //   await step("ダイアログが閉じる", async () => {
  //     await within(document.body)
  //       .findByRole("dialog", {}, { timeout: 5000 })
  //       .catch(() => {
  //         return;
  //       });
  //   });
  // },
};

export const FromHeader: Story = {
  args: {
    open: true,
    setOpen: (open: boolean) => {
      console.log("setOpen:", open);
    },
  },
  // TODO: Uncomment and migrate to @storybook/test
  // play: async ({ canvasElement, step }) => {
  //   const canvas = within(document.body);
  //   await step("初回起動時に利用規約同意ボタンが表示される", async () => {
  //     await canvas.findByRole("button", { name: /全規約に同意/i });
  //   });
  //   await step("利用規約同意ボタンをクリックし、ダイアログを閉じる", async () => {
  //     const agreeButton = await canvas.findByRole("button", {
  //       name: /全規約に同意/i,
  //     });
  //     await userEvent.click(agreeButton);
  //   });
  //   await step(
  //     "Header から再呼び出しで、閉じるアイコンが表示される",
  //     async () => {
  //       await canvas.findByRole("button", { name: /close/i });
  //     }
  //   );
  // },
};

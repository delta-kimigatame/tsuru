import { Meta, StoryObj } from "@storybook/react";
// import { userEvent, within } from "@storybook/testing-library"; // TODO: @storybook/test に移行
import { LoadVBUnit } from "../../../src/features/TopView/LoadVBUnit";
// import { base64ToArrayBuffer } from "../../../src/storybook/utils";

const meta: Meta<typeof LoadVBUnit> = {
  title: "features/TopView/LoadVBUnit",
  component: LoadVBUnit,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**内部にてすと.txtを持つshift-jisで圧縮したzip */
// const base64ZipData =
//   "UEsDBBQAAAAAACprYloAAAAAAAAAAAAAAAAKAAAAg2WDWINnLnR4dFBLAQIUABQAAAAAACprYloAAAAAAAAAAAAAAAAKAAAAAAAAAAEAIAAAAAAAAACDZYNYg2cudHh0UEsFBgAAAAABAAEAOAAAACgAAAAAAA==";

export const Default: Story = {
  render: () => <LoadVBUnit />,
};

// TODO: @storybook/test に移行後、以下のインタラクションストーリーを有効化
// export const clickButton: Story = {
//   render: () => <LoadVBUnit />,
//   play: async ({ canvasElement, step }) => {
//     const canvas = within(canvasElement);
//     await step("SelectVBButton をクリックする", async () => {
//       const selectButton = await canvas.findByRole("button", {
//         name: /UTAU音源のZIPファイルを選択/i,
//       });
//       await userEvent.click(selectButton);
//     });
//     await step("隠しファイル入力が存在することを確認する", async () => {
//       const fileInput = await canvas.findByTestId("file-input");
//       if (!fileInput) {
//         throw new Error("隠しファイル入力が見つかりません");
//       }
//     });
//   },
// };

// export const showDialog: Story = {
//   render: () => <LoadVBUnit />,
//   play: async ({ canvasElement, step }) => {
//     const canvas = within(canvasElement);
//     await step(
//       "隠しファイル入力にダミーのZIPファイルをアップロードする",
//       async () => {
//         const fileInput = await canvas.findByTestId("file-input");
//         const dummyZip = new File(
//           [base64ToArrayBuffer(base64ZipData)],
//           "dummy.zip",
//           {
//             type: "application/zip",
//           }
//         );
//         await userEvent.upload(fileInput, dummyZip);
//       }
//     );
//     await step("LoadVBDialog が表示されるのを確認する", async () => {
//       const dialog = await within(document.body).findByRole(
//         "dialog",
//         {},
//         { timeout: 5000 }
//       );
//       if (!dialog) {
//         throw new Error("LoadVBDialog が表示されていません");
//       }
//     });
//     await step("LoadVBDialog の OK ボタンをクリックする", async () => {
//       const okButton = await within(document.body).findByRole(
//         "button",
//         { name: /OK/i },
//         { timeout: 5000 }
//       );
//       await userEvent.click(okButton);
//     });
//   },
// };

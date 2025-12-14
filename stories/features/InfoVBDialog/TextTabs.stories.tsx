import { Meta, StoryObj } from "@storybook/react";
// TODO: Migrate to @storybook/test when implementing interactions
// import { userEvent, within } from "@storybook/test";
import JSZip from "jszip";
import { TextTabs } from "../../../src/features/InfoVBDialog/TextTabs";
import { EncodingOption } from "../../../src/utils/EncodingMapping";

const createDummyTextFile = (
  filename: string,
  content: string
): JSZip.JSZipObject => {
  const zip = new JSZip();
  const file = new File([content], filename, { type: "text/plain" });
  zip.file(filename, file);
  return zip.files[filename];
};

const normalZipFiles = (() => {
  const zip = new JSZip();
  const readmeContent = "R";
  const aContent = "A";
  zip.file(
    "readme.txt",
    new File([readmeContent], "readme.txt", { type: "text/plain" })
  );
  zip.file("a.txt", new File([aContent], "a.txt", { type: "text/plain" }));
  return zip.files;
})();

const multiZipFiles = (() => {
  const zip = new JSZip();
  zip.file("readme.txt", new File(["R"], "readme.txt", { type: "text/plain" }));
  zip.file("a.txt", new File(["A"], "a.txt", { type: "text/plain" }));
  zip.file("b.txt", new File(["B"], "b.txt", { type: "text/plain" }));
  return zip.files;
})();

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

const meta: Meta<typeof TextTabs> = {
  title: "features/InfoVBDialog/TextTabs",
  component: TextTabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    zipFiles: normalZipFiles,
    encoding: EncodingOption.SHIFT_JIS,
  },
};

export const ChangeTab: Story = {
  args: {
    zipFiles: multiZipFiles,
    encoding: EncodingOption.SHIFT_JIS,
  },
  // TODO: Uncomment and migrate to @storybook/test
  // play: async ({ canvasElement, step }) => {
  //   const canvas = within(canvasElement);
  //   await step(
  //     "最初のタブ（readme.txt）の内容が表示されていることを確認",
  //     async () => {
  //       const readmeTab = await canvas.findByRole("tab", {
  //         name: /readme\.txt/i,
  //       });
  //     }
  //   );
  //   await step("2番目のタブ（a.txt）をクリックして内容を切替", async () => {
  //     const aTab = await canvas.findByRole("tab", { name: /a\.txt/i });
  //     await userEvent.click(aTab);
  //     const typography = await canvas.findByText("A");
  //   });
  //   await step("3番目のタブ（b.txt）をクリックして内容を切替", async () => {
  //     const bTab = await canvas.findByRole("tab", { name: /b\.txt/i });
  //     await userEvent.click(bTab);
  //     const typography = await canvas.findByText("B");
  //   });
  // },
};

export const FileNotFound: Story = {
  args: {
    zipFiles: fallbackZipFiles,
    encoding: EncodingOption.SHIFT_JIS,
  },
};

import { Meta, StoryObj } from "@storybook/react";
import { TextTabs } from "../../../src/features/InfoVBDialog/TextTabs";
import { EncodingOption } from "../../../src/utils/EncodingMapping";

const meta: Meta<typeof TextTabs> = {
  title: "features/InfoVBDialog/TextTabs",
  component: TextTabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Shift-JISでエンコードされたバイト列を使ってFileオブジェクトを作成
const readmeBytes = new Uint8Array([
  0x72, 0x65, 0x61, 0x64, 0x6d, 0x65, 0x20, 0x63, 0x6f, 0x6e, 0x74, 0x65, 0x6e,
  0x74,
]); // "readme content"
const licenseBytes = new Uint8Array([
  0x6c, 0x69, 0x63, 0x65, 0x6e, 0x73, 0x65, 0x20, 0x63, 0x6f, 0x6e, 0x74, 0x65,
  0x6e, 0x74,
]); // "license content"
const manualBytes = new Uint8Array([
  0x6d, 0x61, 0x6e, 0x75, 0x61, 0x6c, 0x20, 0x63, 0x6f, 0x6e, 0x74, 0x65, 0x6e,
  0x74,
]); // "manual content"

const sampleFiles: { [key: string]: File } = {
  "readme.txt": new File([readmeBytes], "readme.txt"),
  "license.txt": new File([licenseBytes], "license.txt"),
  "manual.txt": new File([manualBytes], "manual.txt"),
};

export const Default: Story = {
  args: {
    files: sampleFiles,
    zipFiles: null,
    encoding: EncodingOption.SHIFT_JIS,
  },
};

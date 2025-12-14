import { Meta, StoryObj } from "@storybook/react";
import { LoadVBDialog } from "../../../src/features/LoadVBDialog/LoadVBDialog";
import { base64ToArrayBuffer } from "../../../src/storybook/utils";

const meta: Meta<typeof LoadVBDialog> = {
  title: "features/LoadVBDialog/LoadVBDialog",
  component: LoadVBDialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**内部にてすと.txtを持つshift-jisで圧縮したzip */
const base64ZipData =
  "UEsDBBQAAAAAACprYloAAAAAAAAAAAAAAAAKAAAAg2WDWINnLnR4dFBLAQIUABQAAAAAACprYloAAAAAAAAAAAAAAAAKAAAAAAAAAAEAIAAAAAAAAACDZYNYg2cudHh0UEsFBgAAAAABAAEAOAAAACgAAAAAAA==";

export const Default: Story = {
  args: {
    dialogOpen: true,
    readFile: new File([base64ToArrayBuffer(base64ZipData)], "dummy.zip", {
      type: "application/zip",
    }),
    setProcessing: () => {},
    setReadFile: () => {},
    setDialogOpen: () => {},
  },
};

export const NotOpen: Story = {
  args: {
    dialogOpen: false,
    readFile: new File([base64ToArrayBuffer(base64ZipData)], "dummy.zip", {
      type: "application/zip",
    }),
    setProcessing: () => {},
    setReadFile: () => {},
    setDialogOpen: () => {},
  },
};

export const FileNull: Story = {
  args: {
    dialogOpen: true,
    readFile: null,
    setProcessing: () => {},
    setReadFile: () => {},
    setDialogOpen: () => {},
  },
};

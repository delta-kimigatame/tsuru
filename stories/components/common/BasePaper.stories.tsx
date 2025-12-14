import type { Meta, StoryObj } from "@storybook/react";
import { BasePaper } from "../../../src/components/common/BasePaper";

const meta = {
  title: "components/common/BasePaper",
  component: BasePaper,
  tags: ["autodocs"],
} satisfies Meta<typeof BasePaper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "デフォルト",
    children: (
      <>
        test
        <br />
        test
      </>
    ),
  },
};

export const ElevationChange: Story = {
  args: {
    title: "エレベーション6",
    children: (
      <>
        test
        <br />
        test
      </>
    ),
    elevation: 6,
  },
};

export const SxAdd: Story = {
  args: {
    title: "sx(maxWidth:300)",
    children: (
      <>
        test
        <br />
        test
      </>
    ),
    sx: { maxWidth: 300 },
  },
};

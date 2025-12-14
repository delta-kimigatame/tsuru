import { Meta, StoryObj } from "@storybook/react";
import { EncodingSelect } from "../../../src/features/common/EncodingSelect";

const meta: Meta<typeof EncodingSelect> = {
  title: "features/common/EncodingSelect",
  component: EncodingSelect,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    disabled: false,
    value: "",
    setValue: () => {},
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "",
    setValue: () => {},
  },
};

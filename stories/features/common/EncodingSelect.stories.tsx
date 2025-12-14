import { Meta, StoryObj } from "@storybook/react";
import { EncodingSelect } from "../../../src/features/common/EncodingSelect";
import { EncodingOption } from "../../../src/utils/EncodingMapping";

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
    value: EncodingOption.UTF8,
    setValue: () => {},
  },
};

export const ShiftJIS: Story = {
  args: {
    disabled: false,
    value: EncodingOption.SHIFT_JIS,
    setValue: () => {},
  },
};

export const GB18030: Story = {
  args: {
    disabled: false,
    value: EncodingOption.GB18030,
    setValue: () => {},
  },
};

export const GBK: Story = {
  args: {
    disabled: false,
    value: EncodingOption.GBK,
    setValue: () => {},
  },
};

export const BIG5: Story = {
  args: {
    disabled: false,
    value: EncodingOption.BIG5,
    setValue: () => {},
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: EncodingOption.UTF8,
    setValue: () => {},
  },
};

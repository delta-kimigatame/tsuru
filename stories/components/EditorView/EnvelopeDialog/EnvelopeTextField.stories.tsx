import { Meta, StoryObj } from "@storybook/react";
import { EnvelopeTextField } from "../../../../src/components/EditorView/EnvelopeDialog/EnvelopeTextField";

const meta: Meta<typeof EnvelopeTextField> = {
  title: "components/EditorView/EnvelopeDialog/EnvelopeTextField",
  component: EnvelopeTextField,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "p1",
    index: 0,
    value: "10",
    setValue: (index, value) => console.log(`Set ${index}: ${value}`),
    onBlur: (index) => console.log(`Blur ${index}`),
  },
};

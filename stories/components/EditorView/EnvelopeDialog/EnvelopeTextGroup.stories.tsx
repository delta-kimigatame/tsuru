import { Meta, StoryObj } from "@storybook/react";
import { EnvelopeTextGroup } from "../../../../src/components/EditorView/EnvelopeDialog/EnvelopeTextGroup";

const meta: Meta<typeof EnvelopeTextGroup> = {
  title: "components/EditorView/EnvelopeDialog/EnvelopeTextGroup",
  component: EnvelopeTextGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    points: ["0", "5", "35", "0", "100"],
    values: ["0", "100", "100", "100", "0"],
    index: 0,
    setPoint: (index, value) => console.log(`Set point ${index}: ${value}`),
    setValue: (index, value) => console.log(`Set value ${index}: ${value}`),
    onPointBlur: (index) => console.log(`Point blur ${index}`),
    onValueBlur: (index) => console.log(`Value blur ${index}`),
  },
};

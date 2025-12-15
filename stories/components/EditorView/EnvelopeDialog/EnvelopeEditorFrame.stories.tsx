import { Meta, StoryObj } from "@storybook/react";
import { EnvelopeEditorFrame } from "../../../../src/components/EditorView/EnvelopeDialog/EnvelopeEditorFrame";
import { COLOR_PALLET } from "../../../../src/config/pallet";

const meta: Meta<typeof EnvelopeEditorFrame> = {
  title: "components/EditorView/EnvelopeDialog/EnvelopeEditorFrame",
  component: EnvelopeEditorFrame,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <svg width="400" height="200">
        <Story />
      </svg>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    svgSize: { width: 400, height: 200 },
    pallet: COLOR_PALLET.default.light,
  },
};

export const Dark: Story = {
  args: {
    svgSize: { width: 400, height: 200 },
    pallet: COLOR_PALLET.default.dark,
  },
};

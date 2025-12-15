import { Meta, StoryObj } from "@storybook/react";
import { EnvelopeEditorPoltament } from "../../../../src/components/EditorView/EnvelopeDialog/EnvelopeEditorPoltament";
import { COLOR_PALLET } from "../../../../src/config/pallet";

const meta: Meta<typeof EnvelopeEditorPoltament> = {
  title: "components/EditorView/EnvelopeDialog/EnvelopeEditorPoltament",
  component: EnvelopeEditorPoltament,
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
    pointX: [50, 100, 300, 350, 200],
    pointY: [150, 100, 100, 100, 150],
  },
};

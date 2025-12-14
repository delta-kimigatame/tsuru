import { Meta, StoryObj } from "@storybook/react";
import { EnvelopeEditorTimingLine } from "../../../../src/components/EditorView/EnvelopeDialog/EnvelopeEditorTimingLine";
import { COLOR_PALLET } from "../../../../src/config/pallet";

const meta: Meta<typeof EnvelopeEditorTimingLine> = {
  title: "components/EditorView/EnvelopeDialog/EnvelopeEditorTimingLine",
  component: EnvelopeEditorTimingLine,
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
    overlapX: 100,
    preutterX: 150,
  },
};

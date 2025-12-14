import { Meta, StoryObj } from "@storybook/react";
import { sampleShortCVUst } from "../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../src/storybook/utils";
import SynthesisWorkerDemo from "../../src/worker/SynthesisWorkerDemo";

const ustBuffer = base64ToArrayBuffer(sampleShortCVUst);

const meta: Meta<typeof SynthesisWorkerDemo> = {
  title: "benchmark/worker/synthesis",
  component: SynthesisWorkerDemo,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const MinimumCV: Story = {
  args: {
    vbFileName: "minimumCV.zip",
    ustBuffer: base64ToArrayBuffer(sampleShortCVUst),
    testDescription: "休符が2つ、音符が7つの短い音声を合成します。",
  },
};

export const NoFrqCV: Story = {
  args: {
    vbFileName: "nofrqCV.zip",
    ustBuffer: base64ToArrayBuffer(sampleShortCVUst),
    testDescription:
      "休符が2つ、音符が7つの短い音声を合成します。(周波数表無し)",
  },
};

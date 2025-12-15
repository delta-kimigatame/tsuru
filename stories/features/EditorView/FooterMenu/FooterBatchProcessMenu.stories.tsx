import { Meta, StoryObj } from "@storybook/react";
import { FooterBatchProcessMenu } from "../../../../src/features/EditorView/FooterMenu/FooterBatchProcessMenu";
import { AddSuffixBatchProcess } from "../../../../src/lib/BatchProcess/AddSuffixBatchProcess";
import { ApplyAutoFitBatchProcess } from "../../../../src/lib/BatchProcess/ApplyAutoFitBatchProcess";
import { ApplyOtoBatchProcess } from "../../../../src/lib/BatchProcess/ApplyOtoBatchProcess";
import { EnvelopeNormalizeBatchProcess } from "../../../../src/lib/BatchProcess/EnvelopeNormalizeBatchProcess";
import { LengthQuantizeBatchProcess } from "../../../../src/lib/BatchProcess/LengthQuantizeBatchProcess";
import { LyricBatchProcess } from "../../../../src/lib/BatchProcess/LyricBatchProcess";
import { LyricTorestBatchProcess } from "../../../../src/lib/BatchProcess/LyricToRestBatchProcess";
import { OctaveDownBatchProcess } from "../../../../src/lib/BatchProcess/OctaveDownBatchProcess";
import { OctaveUpBatchProcess } from "../../../../src/lib/BatchProcess/OctaveUpBatchProcess";
import { PreprocessingBatchProcess } from "../../../../src/lib/BatchProcess/PreprocessingBatchProcess";
import { RemoveSuffixBatchProcess } from "../../../../src/lib/BatchProcess/RemoveSuffixBatchProcess";
import { ResetEditBatchProcess } from "../../../../src/lib/BatchProcess/ResetEditBatchProcess";

const meta: Meta<typeof FooterBatchProcessMenu> = {
  title: "features/EditorView/FooterMenu/FooterBatchProcessMenu",
  component: FooterBatchProcessMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// summaryでソート（実際の実装と同じ順序）
const sampleBatchProcesses = [
  {
    title: new EnvelopeNormalizeBatchProcess().title,
    cls: EnvelopeNormalizeBatchProcess,
  },
  {
    title: new LengthQuantizeBatchProcess().title,
    cls: LengthQuantizeBatchProcess,
  },
  { title: new AddSuffixBatchProcess().title, cls: AddSuffixBatchProcess },
  { title: new LyricBatchProcess().title, cls: LyricBatchProcess },
  { title: new LyricTorestBatchProcess().title, cls: LyricTorestBatchProcess },
  {
    title: new RemoveSuffixBatchProcess().title,
    cls: RemoveSuffixBatchProcess,
  },
  { title: new OctaveDownBatchProcess().title, cls: OctaveDownBatchProcess },
  { title: new OctaveUpBatchProcess().title, cls: OctaveUpBatchProcess },
  {
    title: new ApplyAutoFitBatchProcess().title,
    cls: ApplyAutoFitBatchProcess,
  },
  { title: new ApplyOtoBatchProcess().title, cls: ApplyOtoBatchProcess },
  {
    title: new PreprocessingBatchProcess().title,
    cls: PreprocessingBatchProcess,
  },
  { title: new ResetEditBatchProcess().title, cls: ResetEditBatchProcess },
];

export const Default: Story = {
  args: {
    anchor: document.createElement("div"),
    handleClose: () => {},
    batchProcesses: sampleBatchProcesses,
    process: (index: number) => console.log(`Process ${index}`),
  },
};

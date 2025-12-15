import { Meta, StoryObj } from "@storybook/react";
import { EnvelopeDialog } from "../../../../src/features/EditorView/EnvelopeDialog/EnvelopeDialog";
import { Note } from "../../../../src/lib/Note";

const meta: Meta<typeof EnvelopeDialog> = {
  title: "features/EditorView/EnvelopeDialog/EnvelopeDialog",
  component: EnvelopeDialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// 標準的なエンベロープ設定
const standardNote = new Note();
standardNote.length = 480;
standardNote.tempo = 120;
standardNote.preutter = 50;
standardNote.overlap = 30;
// エンベロープフォーマット: p1,p2,p3,v1,v2,v3,v4 (optional: %,p5,v5)
// point順序: [0, 1, 4, 2, 3] = [p1, p1+p2, p1+p2+p5, msLength-p3-p4, msLength-p4]
// 標準: 0,5,35,0,100,100,0 = p1=0, p2=5, p3=35, v1=0, v2=100, v3=100, v4=0
standardNote.envelope = "0,5,35,0,100,100,0";

export const Standard: Story = {
  args: {
    open: true,
    note: standardNote,
    handleClose: () => {},
  },
};

// ポルタメントあり (5点エンベロープ)
const portamentoNote = new Note();
portamentoNote.length = 480;
portamentoNote.tempo = 120;
portamentoNote.preutter = 50;
portamentoNote.overlap = 30;
// p1=0, p2=10, p3=40, p4=5, p5=20, v1=0, v2=80, v3=100, v4=100, v5=0
portamentoNote.envelope = "0,10,40,5,0,80,100,100,0,%,20";

export const WithPortamento: Story = {
  args: {
    open: true,
    note: portamentoNote,
    handleClose: () => {},
  },
};

// 短いノート
const shortNote = new Note();
shortNote.length = 240;
shortNote.tempo = 120;
shortNote.preutter = 30;
shortNote.overlap = 15;
shortNote.envelope = "0,3,20,0,100,100,0";

export const ShortNote: Story = {
  args: {
    open: true,
    note: shortNote,
    handleClose: () => {},
  },
};

// 長いノート
const longNote = new Note();
longNote.length = 1920;
longNote.tempo = 120;
longNote.preutter = 80;
longNote.overlap = 50;
longNote.envelope = "0,20,80,10,0,100,100,100,0";

export const LongNote: Story = {
  args: {
    open: true,
    note: longNote,
    handleClose: () => {},
  },
};

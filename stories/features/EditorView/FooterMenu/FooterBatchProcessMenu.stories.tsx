import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import {
  FooterBatchProcessMenu,
  FooterBatchProcessMenuProps,
} from "../../../../src/features/EditorView/FooterMenu/FooterBatchProcessMenu";
import { BaseBatchProcess } from "../../../../src/lib/BaseBatchProcess";

class DummyBatchProcess extends BaseBatchProcess {
  title = "dummy.process";
  summary = "ダミー処理";
  protected _process(notes: any, options?: any): any {
    return notes;
  }
}

const dummyBatchProcesses = [
  { title: "dummy.process", cls: DummyBatchProcess },
  { title: "dummy.process", cls: DummyBatchProcess },
  { title: "dummy.process", cls: DummyBatchProcess },
];

const Wrapper = (args: FooterBatchProcessMenuProps) => {
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (anchorRef.current) {
      setAnchorEl(anchorRef.current);
    }
  }, []);

  return (
    <div>
      <div
        ref={anchorRef}
        style={{
          display: "inline-block",
          padding: "8px",
          background: "#eee",
          marginBottom: "16px",
        }}
      >
        アンカー要素
      </div>
      <FooterBatchProcessMenu
        {...args}
        anchor={anchorEl}
        handleClose={() => {}}
      />
    </div>
  );
};

const meta: Meta<typeof Wrapper> = {
  title: "features/EditorView/FooterMenu/FooterBatchProcessMenu",
  component: Wrapper,
  tags: ["autodocs"],
  args: {
    batchProcesses: dummyBatchProcesses,
    process: (index: number) => {
      console.log("Process called with index", index);
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

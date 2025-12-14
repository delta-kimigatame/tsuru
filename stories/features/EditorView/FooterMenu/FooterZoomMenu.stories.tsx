import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import {
  FooterZoomMenu,
  FooterZoomMenuProps,
} from "../../../../src/features/EditorView/FooterMenu/FooterZoomMenu";

const Wrapper = (args: FooterZoomMenuProps) => {
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
      <FooterZoomMenu {...args} anchor={anchorEl} handleClose={() => {}} />
    </div>
  );
};

const meta: Meta<typeof Wrapper> = {
  title: "features/EditorView/FooterMenu/FooterZoomMenu",
  component: Wrapper,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

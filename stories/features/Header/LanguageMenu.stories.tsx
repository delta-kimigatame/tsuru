import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { LanguageMenu } from "../../../src/features/Header/LanguageMenu";

const meta: Meta<typeof LanguageMenu> = {
  title: "features/Header/LanguageMenu",
  component: LanguageMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
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
        <LanguageMenu {...args} anchor={anchorEl} />
      </div>
    );
  },
  args: {
    onMenuClose: () => {
      console.log("Menu closed");
    },
  },
};

import { Meta, StoryObj } from "@storybook/react";
// TODO: Migrate to @storybook/test when implementing interactions
// import { userEvent, within } from "@storybook/test";
import { HeaderMenuLog } from "../../../../src/features/Header/Menu/HeaderMenuLog";

const meta: Meta<typeof HeaderMenuLog> = {
  title: "features/Header/Menu/HeaderMenuLog",
  component: HeaderMenuLog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClick: () => {},
    onMenuClose: () => {
      console.log("Menu closed");
    },
  },
};

export const ShowDialog: Story = {
  args: {
    onClick: () => {},
    onMenuClose: () => {
      console.log("Menu closed");
    },
  },
  // TODO: Uncomment and migrate to @storybook/test
  // play: async ({ canvasElement, step }) => {
  //   const canvas = within(canvasElement);
  //   const button = await within(document.body).findByText(
  //     /操作ログ表示/i,
  //     {},
  //     { timeout: 5000 }
  //   );
  //   await userEvent.click(button);
  // },
};

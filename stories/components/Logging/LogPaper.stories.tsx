import type { Meta, StoryObj } from "@storybook/react";
import { LogPaper } from "../../../src/components/Logging/LogPaper";
import { LOG } from "../../../src/lib/Logging";

const meta = {
  title: "components/Logging/LogPaper",
  component: LogPaper,
  tags: ["autodocs"],
} satisfies Meta<typeof LogPaper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  decorators: [
    (Story) => {
      LOG.clear();
      LOG.debug("ログテスト", "storybook");
      LOG.info("ログテスト", "storybook");
      LOG.warn("ログテスト", "storybook");
      LOG.error("ログテスト", "storybook");
      return <Story />;
    },
  ],
};

export const Empty: Story = {
  args: {},
  decorators: [
    (Story) => {
      LOG.clear();
      return <Story />;
    },
  ],
};

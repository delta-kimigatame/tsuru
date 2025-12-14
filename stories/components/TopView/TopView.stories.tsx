import type { Meta, StoryObj } from "@storybook/react";
import { TopView } from "../../../src/components/TopView/TopView";
import i18n from "../../../src/i18n/configs";

const meta = {
  title: "components/TopView/TopView",
  component: TopView,
  tags: ["autodocs"],
} satisfies Meta<typeof TopView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Japanese: Story = {
  args: {},
  decorators: [
    (Story) => {
      i18n.changeLanguage("ja");
      return <Story />;
    },
  ],
};

export const English: Story = {
  args: {},
  decorators: [
    (Story) => {
      i18n.changeLanguage("en");
      return <Story />;
    },
  ],
};

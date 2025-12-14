import { Meta, StoryObj } from "@storybook/react";
import { HeaderMenuWorkers } from "../../../../src/features/Header/Menu/HeaderMenuWorkers";
import { useCookieStore } from "../../../../src/store/cookieStore";

const meta: Meta<typeof HeaderMenuWorkers> = {
  title: "features/Header/Menu/HeaderMenuWorkers",
  component: HeaderMenuWorkers,
  tags: ["autodocs"],
  args: {
    onMenuClose: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Workers1: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ workersCount: 1 });
      return <Story />;
    },
  ],
};

export const Workers4: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ workersCount: 4 });
      return <Story />;
    },
  ],
};

export const Workers8: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ workersCount: 8 });
      return <Story />;
    },
  ],
};

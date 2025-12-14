import { Meta, StoryObj } from "@storybook/react";
import { HeaderMenuTheme } from "../../../../src/features/Header/Menu/HeaderMenuTheme";
import { useCookieStore } from "../../../../src/store/cookieStore";

const meta: Meta<typeof HeaderMenuTheme> = {
  title: "features/Header/Menu/HeaderMenuTheme",
  component: HeaderMenuTheme,
  tags: ["autodocs"],
  args: {
    onMenuClose: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const System: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ mode: "system" });
      return <Story />;
    },
  ],
};

export const Light: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ mode: "light" });
      return <Story />;
    },
  ],
};

export const Dark: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ mode: "dark" });
      return <Story />;
    },
  ],
};

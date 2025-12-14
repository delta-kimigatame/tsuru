import { Meta, StoryObj } from "@storybook/react";
import { HeaderMenuTheme } from "../../../../src/features/Header/Menu/HeaderMenuTheme";
import { useCookieStore } from "../../../../src/store/cookieStore";

useCookieStore.setState({ mode: "system" });

const meta: Meta<typeof HeaderMenuTheme> = {
  title: "features/Header/Menu/HeaderMenuTheme",
  component: HeaderMenuTheme,
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

import { Meta, StoryObj } from "@storybook/react";
import { HeaderMenuLanguage } from "../../../../src/features/Header/Menu/HeaderMenuLanguage";
import { useCookieStore } from "../../../../src/store/cookieStore";

useCookieStore.setState({ language: "ja" });

const meta: Meta<typeof HeaderMenuLanguage> = {
  title: "features/Header/Menu/HeaderMenuLanguage",
  component: HeaderMenuLanguage,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onMenuClose: () => {
      console.log("Menu closed");
    },
  },
};

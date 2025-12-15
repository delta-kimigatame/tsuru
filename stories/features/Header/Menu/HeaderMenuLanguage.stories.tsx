import { Meta, StoryObj } from "@storybook/react";
import { HeaderMenuLanguage } from "../../../../src/features/Header/Menu/HeaderMenuLanguage";
import { useCookieStore } from "../../../../src/store/cookieStore";

const meta: Meta<typeof HeaderMenuLanguage> = {
  title: "features/Header/Menu/HeaderMenuLanguage",
  component: HeaderMenuLanguage,
  tags: ["autodocs"],
  args: {
    onMenuClose: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ language: "ja" });
      return <Story />;
    },
  ],
};

export const English: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ language: "en" });
      return <Story />;
    },
  ],
};

export const Chinese: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ language: "zh" });
      return <Story />;
    },
  ],
};

export const Portuguese: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ language: "pt" });
      return <Story />;
    },
  ],
};

import { Meta, StoryObj } from "@storybook/react";
import { HeaderMenuColorTheme } from "../../../../src/features/Header/Menu/HeaderMenuColorTheme";
import { useCookieStore } from "../../../../src/store/cookieStore";

const meta: Meta<typeof HeaderMenuColorTheme> = {
  title: "features/Header/Menu/HeaderMenuColorTheme",
  component: HeaderMenuColorTheme,
  tags: ["autodocs"],
  args: {
    onMenuClose: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ colorTheme: "default" });
      return <Story />;
    },
  ],
};

export const Red: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ colorTheme: "red" });
      return <Story />;
    },
  ],
};

export const Orange: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ colorTheme: "orange" });
      return <Story />;
    },
  ],
};

export const Yellow: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ colorTheme: "yellow" });
      return <Story />;
    },
  ],
};

export const LightGreen: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ colorTheme: "lightgreen" });
      return <Story />;
    },
  ],
};

export const Green: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ colorTheme: "green" });
      return <Story />;
    },
  ],
};

export const Blue: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ colorTheme: "blue" });
      return <Story />;
    },
  ],
};

export const Aqua: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ colorTheme: "aqua" });
      return <Story />;
    },
  ],
};

export const Pink: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ colorTheme: "pink" });
      return <Story />;
    },
  ],
};

export const Brown: Story = {
  decorators: [
    (Story) => {
      useCookieStore.setState({ colorTheme: "brown" });
      return <Story />;
    },
  ],
};

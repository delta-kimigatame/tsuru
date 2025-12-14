import { Meta, StoryObj } from "@storybook/react";
import { HeaderMenu } from "../../../src/features/Header/HeaderMenu";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";
import { loadVB } from "../../../src/storybook/utils";

const meta: Meta<typeof HeaderMenu> = {
  title: "features/Header/HeaderMenu",
  component: HeaderMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NoVoiceBank: Story = {
  decorators: [
    (Story) => {
      useMusicProjectStore.setState({ vb: null });
      return <Story />;
    },
  ],
};

export const WithVoiceBank: Story = {
  decorators: [
    (Story) => {
      const vb = loadVB("Iona_Beta");
      useMusicProjectStore.setState({ vb });
      return <Story />;
    },
  ],
};

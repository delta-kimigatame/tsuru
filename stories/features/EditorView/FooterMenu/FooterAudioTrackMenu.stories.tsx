import { Meta, StoryObj } from "@storybook/react";
import { FooterAudioTrackMenu } from "../../../../src/features/EditorView/FooterMenu/FooterAudioTrackMenu";

const meta: Meta<typeof FooterAudioTrackMenu> = {
  title: "features/EditorView/FooterMenu/FooterAudioTrackMenu",
  component: FooterAudioTrackMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    anchor: document.createElement("div"),
    handleClose: () => {},
    backgroundWave: null,
    setBackgroundWave: () => {},
    backgroundOffsetMs: 0,
    setBackgroundOffsetMs: () => {},
    backgroundVolume: 1,
    setBackgroundVolume: () => {},
    isPlayingBackground: false,
    setIsPlayingBackground: () => {},
  },
};

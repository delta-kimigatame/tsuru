import type { Meta, StoryObj } from "@storybook/react";
import { CharacterInfo } from "../../../src/components/InfoVBDialog/CharacterInfo";
import { sampleIcon, sampleWav } from "../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../src/storybook/utils";

const meta = {
  title: "components/InfoVBDialog/CharacterInfo",
  component: CharacterInfo,
  tags: ["autodocs"],
} satisfies Meta<typeof CharacterInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "testVB",
    image: base64ToArrayBuffer(sampleIcon),
    sample: base64ToArrayBuffer(sampleWav),
    author: "かんりにん",
    web: "https://k-uta.jp/gakuya/",
    version: "単独音1",
    voice: "中の人",
    otoCount: 0,
  },
};

export const Minimum: Story = {
  args: {
    name: "testVB",
    image: undefined,
    sample: undefined,
    author: undefined,
    web: undefined,
    version: undefined,
    voice: undefined,
    otoCount: 0,
  },
};

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Meta, StoryFn } from "@storybook/react";
import {
  CharacterInfo,
  CharacterInfoProps,
} from "../../../src/components/InfoVBDialog/CharacterInfo";
import { getDesignTokens } from "../../../src/config/theme";
import { sampleIcon, sampleWav } from "../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../src/storybook/utils";

export default {
  title: "06_音源情報画面/音源情報画面部品/音源情報",
  component: CharacterInfo,
  argTypes: {},
} as Meta;

const lightTheme = createTheme(getDesignTokens("light"));

const Template: StoryFn<CharacterInfoProps> = (args) => (
  <ThemeProvider theme={lightTheme}>
    <CharacterInfo {...args} />
  </ThemeProvider>
);
export const Default = Template.bind({});
Default.args = {
  name: "testVB",
  image: base64ToArrayBuffer(sampleIcon),
  sample: base64ToArrayBuffer(sampleWav),
  author: "かんりにん",
  web: "https://k-uta.jp/gakuya/",
  version: "単独音1",
  voice: "中の人",
  otoCount: 0,
};
Default.storyName = "デフォルト";

export const Minimum = Template.bind({});
Minimum.args = {
  name: "testVB",
  image: undefined,
  sample: undefined,
  author: undefined,
  web: undefined,
  version: undefined,
  voice: undefined,
  otoCount: 0,
};
Minimum.storyName = "最小構成";

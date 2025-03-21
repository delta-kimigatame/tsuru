import { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { PIANOROLL_CONFIG } from "../../../config/pianoroll";
import { useCookieStore } from "../../../store/cookieStore";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import {
  PianorollBackground,
  PianorollBackgroundProps,
} from "./PianorollBackground";

export default {
  title: "03_2_ピアノロール/部品/背景",
  component: PianorollBackground,
} as Meta<typeof PianorollBackground>;
const DummyParent = (args) => {
  const { verticalZoom, horizontalZoom } = useCookieStore();
  const { notes } = useMusicProjectStore();
  /**
   * 各ノートのx座標描画位置を予め求めておく
   */
  const notesLeft = React.useMemo(() => {
    if (notes.length === 0) return [];
    const lefts = new Array<number>();
    let totalLength = 0;
    for (let i = 0; i < notes.length; i++) {
      lefts.push(totalLength);
      totalLength += notes[i].length;
    }
    return lefts;
  }, [notes]);

  /**
   * svg幅を計算するためにノート長の合計を求める
   */
  const totalLength = React.useMemo(() => {
    if (notes.length === 0) return 0;
    return notesLeft.slice(-1)[0] + notes.slice(-1)[0].length;
  }, [notesLeft]);
  return (
    <svg
      width={totalLength * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom}
      height={PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom}
      style={{
        display: "block",
        position: "relative",
      }}
    >
      <g id="background">
        <PianorollBackground {...args} totalLength={totalLength} />
      </g>
    </svg>
  );
};

const Template: StoryFn<PianorollBackgroundProps> = (args) => (
  <DummyParent {...args} />
);

export const LightMode = Template.bind({});
LightMode.play = async () => {
  const store = useCookieStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
  store.setVerticalZoom(1);
};
LightMode.args = {};
LightMode.storyName = "ライトモード";
export const DarkMode = Template.bind({});
DarkMode.play = async () => {
  const store = useCookieStore.getState();
  store.setMode("dark");
  store.setColorTheme("default");
  store.setVerticalZoom(1);
};
DarkMode.args = {};
DarkMode.storyName = "ダークモード";

export const Zoom05 = Template.bind({});
Zoom05.play = async () => {
  const store = useCookieStore.getState();
  store.setMode("light");
  store.setColorTheme("default");
  store.setVerticalZoom(0.5);
};
Zoom05.args = {};
Zoom05.storyName = "縮小";

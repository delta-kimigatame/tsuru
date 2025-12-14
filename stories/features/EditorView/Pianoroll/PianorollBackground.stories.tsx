import { Meta, StoryObj } from "@storybook/react";
// TODO: Migrate to @storybook/test when implementing interactions
import React from "react";
import { PIANOROLL_CONFIG } from "../../../../src/config/pianoroll";
import {
  PianorollBackground,
  PianorollBackgroundProps,
} from "../../../../src/features/EditorView/Pianoroll/PianorollBackground";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

const DummyParent = (args: PianorollBackgroundProps) => {
  const { verticalZoom, horizontalZoom } = useCookieStore();
  const { notes } = useMusicProjectStore();
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

const meta: Meta<typeof DummyParent> = {
  title: "features/EditorView/Pianoroll/PianorollBackground",
  component: DummyParent,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// TODO: Migrate to @storybook/test when upgrading testing interactions
// export const LightMode: Story = {
//   name: "ライトモード",
//   play: async () => {
//     const store = useCookieStore.getState();
//     store.setMode("light");
//     store.setColorTheme("default");
//     store.setVerticalZoom(1);
//   },
// };

// TODO: Migrate to @storybook/test when upgrading testing interactions
// export const DarkMode: Story = {
//   name: "ダークモード",
//   play: async () => {
//     const store = useCookieStore.getState();
//     store.setMode("dark");
//     store.setColorTheme("default");
//     store.setVerticalZoom(1);
//   },
// };

// TODO: Migrate to @storybook/test when upgrading testing interactions
// export const Zoom05: Story = {
//   name: "縦0.5倍",
//   play: async () => {
//     const store = useCookieStore.getState();
//     store.setMode("light");
//     store.setColorTheme("default");
//     store.setVerticalZoom(0.5);
//   },
// };
Zoom05.args = {};
Zoom05.storyName = "縮小";

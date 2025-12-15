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
  // 4小節分の固定長を表示
  const totalLength = 480 * 4 * 4; // 4拍子 * 4小節

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

/**
 * デフォルト：C Major (tone=0, isMinor=false)
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      React.useEffect(() => {
        useCookieStore.setState({
          language: "ja",
          verticalZoom: 1,
          horizontalZoom: 1,
        });
        useMusicProjectStore.setState({
          tone: 0,
          isMinor: false,
        });
      }, []);

      return <Story />;
    },
  ],
};

/**
 * A Minor (tone=9, isMinor=true)
 * 短調の場合、白鍵/黒鍵の色分けが+3音ずれる
 */
export const AMinor: Story = {
  decorators: [
    (Story) => {
      React.useEffect(() => {
        useCookieStore.setState({
          language: "ja",
          verticalZoom: 1,
          horizontalZoom: 1,
        });
        useMusicProjectStore.setState({
          tone: 9, // A
          isMinor: true,
        });
      }, []);

      return <Story />;
    },
  ],
};

/**
 * F# Major (tone=6, isMinor=false)
 * シャープが多い調性での表示確認
 */
export const FSharpMajor: Story = {
  decorators: [
    (Story) => {
      React.useEffect(() => {
        useCookieStore.setState({
          language: "ja",
          verticalZoom: 1,
          horizontalZoom: 1,
        });
        useMusicProjectStore.setState({
          tone: 6, // F#
          isMinor: false,
        });
      }, []);

      return <Story />;
    },
  ],
};

/**
 * 水平ズーム2倍
 * グリッドの幅が広がる
 */
export const HorizontalZoom: Story = {
  decorators: [
    (Story) => {
      React.useEffect(() => {
        useCookieStore.setState({
          language: "ja",
          verticalZoom: 1,
          horizontalZoom: 2,
        });
        useMusicProjectStore.setState({
          tone: 0,
          isMinor: false,
        });
      }, []);

      return <Story />;
    },
  ],
};

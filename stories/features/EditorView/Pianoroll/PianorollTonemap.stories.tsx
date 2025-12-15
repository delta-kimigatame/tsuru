import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { PianorollTonemap } from "../../../../src/features/EditorView/Pianoroll/PianorollTonemap";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

const meta: Meta<typeof PianorollTonemap> = {
  title: "features/EditorView/Pianoroll/PianorollTonemap",
  component: PianorollTonemap,
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
 * 縦ズーム2倍
 * キーの高さが2倍になる
 */
export const VerticalZoom: Story = {
  decorators: [
    (Story) => {
      React.useEffect(() => {
        useCookieStore.setState({
          language: "ja",
          verticalZoom: 2,
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

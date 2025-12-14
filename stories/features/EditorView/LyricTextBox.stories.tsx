import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { LyricTextBox } from "../../../src/features/EditorView/LyricTextBox";
import { Ust } from "../../../src/lib/Ust";
import { useCookieStore } from "../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../src/storybook/utils";

const meta: Meta<typeof LyricTextBox> = {
  title: "features/EditorView/LyricTextBox",
  component: LyricTextBox,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：非表示状態（targetNoteIndex = undefined）
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      const [targetNoteIndex, setTargetNoteIndex] = React.useState<
        number | undefined
      >(undefined);
      const [lyricAnchor, setLyricAnchor] = React.useState<{
        x: number;
        y: number;
      } | null>(null);

      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          useMusicProjectStore.setState({
            notes: ust.notes,
            vb: null,
          });
        });
      }, []);

      useCookieStore.setState({
        language: "ja",
      });

      return (
        <Story
          args={{
            targetNoteIndex,
            setTargetNoteIndex,
            lyricAnchor,
          }}
        />
      );
    },
  ],
};

/**
 * 歌詞編集ダイアログ表示状態（画面中央）
 */
export const EditingLyric: Story = {
  decorators: [
    (Story) => {
      const [targetNoteIndex, setTargetNoteIndex] = React.useState<
        number | undefined
      >(2);
      const [lyricAnchor, setLyricAnchor] = React.useState<{
        x: number;
        y: number;
      } | null>({ x: 400, y: 300 });

      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          useMusicProjectStore.setState({
            notes: ust.notes,
            vb: null,
          });
        });
      }, []);

      useCookieStore.setState({
        language: "ja",
      });

      return (
        <Story
          args={{
            targetNoteIndex,
            setTargetNoteIndex,
            lyricAnchor,
          }}
        />
      );
    },
  ],
};

/**
 * 歌詞編集ダイアログ表示（左上位置）
 */
export const EditingTopLeft: Story = {
  decorators: [
    (Story) => {
      const [targetNoteIndex, setTargetNoteIndex] = React.useState<
        number | undefined
      >(1);
      const [lyricAnchor, setLyricAnchor] = React.useState<{
        x: number;
        y: number;
      } | null>({ x: 100, y: 100 });

      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          useMusicProjectStore.setState({
            notes: ust.notes,
            vb: null,
          });
        });
      }, []);

      useCookieStore.setState({
        language: "ja",
      });

      return (
        <Story
          args={{
            targetNoteIndex,
            setTargetNoteIndex,
            lyricAnchor,
          }}
        />
      );
    },
  ],
};

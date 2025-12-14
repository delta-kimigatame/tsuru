import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { PitchPortal } from "../../../../src/features/EditorView/PitchPortal/PitchPortal";
import { Note } from "../../../../src/lib/Note";
import { Ust } from "../../../../src/lib/Ust";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../../src/storybook/utils";

const meta: Meta<typeof PitchPortal> = {
  title: "features/EditorView/PitchPortal/PitchPortal",
  component: PitchPortal,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：ピッチポータル非表示（note = undefined）
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      const [targetIndex, setTargetIndex] = React.useState<number | undefined>(
        undefined
      );
      const [note, setNote] = React.useState<Note | undefined>(undefined);

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
            targetIndex,
            note,
          }}
        />
      );
    },
  ],
};

/**
 * ピッチ編集モード：ノートが選択されている状態
 * ポルタメントは未選択（targetIndex = undefined）
 */
export const NoteSelected: Story = {
  decorators: [
    (Story) => {
      const [targetIndex, setTargetIndex] = React.useState<number | undefined>(
        undefined
      );
      const [note, setNote] = React.useState<Note | undefined>(undefined);

      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          useMusicProjectStore.setState({
            notes: ust.notes,
            vb: null,
          });

          // ピッチベンドデータを持つノートを設定
          const testNote = ust.notes[2].deepCopy();
          testNote.setPbw([10, 20, 30]);
          testNote.setPby([50, -30, 20]);
          testNote.setPbm(["", "s", "r"]);
          testNote.pbsTime = 5;
          testNote.pbsHeight = 0;
          setNote(testNote);
        });
      }, []);

      useCookieStore.setState({
        language: "ja",
      });

      return (
        <Story
          args={{
            targetIndex,
            note,
          }}
        />
      );
    },
  ],
};

/**
 * ピッチ編集モード：ポルタメント選択状態（targetIndex = 0）
 * 開始点のポルタメントを選択
 */
export const PortamentStartSelected: Story = {
  decorators: [
    (Story) => {
      const [targetIndex, setTargetIndex] = React.useState<number | undefined>(
        0
      );
      const [note, setNote] = React.useState<Note | undefined>(undefined);

      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          useMusicProjectStore.setState({
            notes: ust.notes,
            vb: null,
          });

          const testNote = ust.notes[2].deepCopy();
          testNote.setPbw([10, 20, 30]);
          testNote.setPby([50, -30, 20]);
          testNote.setPbm(["", "s", "r"]);
          testNote.pbsTime = 5;
          testNote.pbsHeight = 0;
          setNote(testNote);
        });
      }, []);

      useCookieStore.setState({
        language: "ja",
      });

      return (
        <Story
          args={{
            targetIndex,
            note,
          }}
        />
      );
    },
  ],
};

/**
 * ピッチ編集モード：中間ポルタメント選択状態（targetIndex = 1）
 * ポルタメント追加/削除/回転ボタンが表示される
 */
export const PortamentMiddleSelected: Story = {
  decorators: [
    (Story) => {
      const [targetIndex, setTargetIndex] = React.useState<number | undefined>(
        1
      );
      const [note, setNote] = React.useState<Note | undefined>(undefined);

      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          useMusicProjectStore.setState({
            notes: ust.notes,
            vb: null,
          });

          const testNote = ust.notes[2].deepCopy();
          testNote.setPbw([10, 20, 30]);
          testNote.setPby([50, -30, 20]);
          testNote.setPbm(["s", "", "r"]);
          testNote.pbsTime = 5;
          testNote.pbsHeight = 0;
          setNote(testNote);
        });
      }, []);

      useCookieStore.setState({
        language: "ja",
      });

      return (
        <Story
          args={{
            targetIndex,
            note,
          }}
        />
      );
    },
  ],
};

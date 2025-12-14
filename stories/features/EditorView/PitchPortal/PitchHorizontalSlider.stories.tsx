import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { PitchHorizontalSlider } from "../../../../src/features/EditorView/PitchPortal/PitchHorizontalSlider";
import { Note } from "../../../../src/lib/Note";
import { Ust } from "../../../../src/lib/Ust";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../../src/storybook/utils";

const meta: Meta<typeof PitchHorizontalSlider> = {
  title: "features/EditorView/PitchPortal/PitchHorizontalSlider",
  component: PitchHorizontalSlider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：ポルタメント未選択（targetIndex = undefined）
 * スライダーは非表示
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      const [targetIndex, setTargetIndex] = React.useState<number | undefined>(
        undefined
      );
      const [note, setNote] = React.useState<Note | undefined>(undefined);
      const [hasUpdate, setHasUpdate] = React.useState(false);

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
            setHasUpdate,
          }}
        />
      );
    },
  ],
};

/**
 * 開始点のポルタメント選択（targetIndex = 0）
 * pbsのtime値を調整するスライダーを表示
 */
export const StartPortamentSelected: Story = {
  decorators: [
    (Story) => {
      const [targetIndex, setTargetIndex] = React.useState<number | undefined>(
        0
      );
      const [note, setNote] = React.useState<Note | undefined>(undefined);
      const [hasUpdate, setHasUpdate] = React.useState(false);

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
            setHasUpdate,
          }}
        />
      );
    },
  ],
};

/**
 * 中間ポルタメント選択（targetIndex = 1）
 * pbw[0]の値を調整するスライダーを表示
 */
export const MiddlePortamentSelected: Story = {
  decorators: [
    (Story) => {
      const [targetIndex, setTargetIndex] = React.useState<number | undefined>(
        1
      );
      const [note, setNote] = React.useState<Note | undefined>(undefined);
      const [hasUpdate, setHasUpdate] = React.useState(false);

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
            setHasUpdate,
          }}
        />
      );
    },
  ],
};

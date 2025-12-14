import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { NoteDividerDialog } from "../../../src/features/EditorView/NoteDividerDialog";
import { Ust } from "../../../src/lib/Ust";
import { useCookieStore } from "../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../src/storybook/utils";

const meta: Meta<typeof NoteDividerDialog> = {
  title: "features/EditorView/NoteDividerDialog",
  component: NoteDividerDialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：ダイアログ非表示
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(false);
      const [noteIndex, setNoteIndex] = React.useState<number>(0);

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
            noteIndex,
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};

/**
 * 標準的な長さのノート（480tick = 四分音符）を分割
 */
export const StandardNote: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);
      const [noteIndex, setNoteIndex] = React.useState<number>(2);

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
            noteIndex,
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};

/**
 * 短いノート（240tick = 八分音符）を分割
 */
export const ShortNote: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);
      const [noteIndex, setNoteIndex] = React.useState<number>(0);

      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          const notes = ust.notes.map((n) => n.deepCopy());
          notes[0].length = 240; // 短いノートに変更
          useMusicProjectStore.setState({
            notes,
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
            noteIndex,
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};

/**
 * 長いノート（2640tick = 全音符 + 付点二分音符）を分割
 */
export const LongNote: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);
      const [noteIndex, setNoteIndex] = React.useState<number>(1);

      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          const notes = ust.notes.map((n) => n.deepCopy());
          notes[1].length = 2640; // 長いノートに変更
          useMusicProjectStore.setState({
            notes,
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
            noteIndex,
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};

/**
 * 480で割り切れない長さのノート（500tick）を分割
 * スライダーに最後のマークが追加される
 */
export const IrregularLength: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);
      const [noteIndex, setNoteIndex] = React.useState<number>(3);

      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          const notes = ust.notes.map((n) => n.deepCopy());
          notes[3].length = 500; // 480で割り切れない長さ
          useMusicProjectStore.setState({
            notes,
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
            noteIndex,
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};

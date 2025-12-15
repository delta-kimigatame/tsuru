import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { NotePasteDialog } from "../../../src/features/EditorView/NotePasteDialog";
import { Ust } from "../../../src/lib/Ust";
import { useCookieStore } from "../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../src/storybook/utils";

const meta: Meta<typeof NotePasteDialog> = {
  title: "features/EditorView/NotePasteDialog",
  component: NotePasteDialog,
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
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([]);

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
            selectedNotesIndex,
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};

/**
 * 単一ノート選択時の形式指定貼り付けダイアログ
 */
export const SingleNoteSelected: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([2]);

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
            selectedNotesIndex,
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};

/**
 * 複数ノート選択時の形式指定貼り付けダイアログ
 */
export const MultipleNotesSelected: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([1, 2, 3, 4]);

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
            selectedNotesIndex,
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};

/**
 * ノート未選択時（空配列）
 */
export const NoSelection: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([]);

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
            selectedNotesIndex,
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};

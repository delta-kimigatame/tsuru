import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { NotePropertyDialog } from "../../../src/features/EditorView/NotePropertyDialog";
import { Note } from "../../../src/lib/Note";
import { Ust } from "../../../src/lib/Ust";
import { useCookieStore } from "../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../src/storybook/utils";

const meta: Meta<typeof NotePropertyDialog> = {
  title: "features/EditorView/NotePropertyDialog",
  component: NotePropertyDialog,
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
            note: note || ust.notes[0],
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};

/**
 * 標準的な音符のプロパティ編集
 */
export const EditingNote: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);
      const [note, setNote] = React.useState<Note | undefined>(undefined);

      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          useMusicProjectStore.setState({
            notes: ust.notes,
            vb: null,
          });
          setNote(ust.notes[2]);
        });
      }, []);

      useCookieStore.setState({
        language: "ja",
      });

      if (!note) return <div>Loading...</div>;

      return (
        <Story
          args={{
            note,
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};

/**
 * 休符（R）のプロパティ編集
 * 音符固有のパラメータ（preutter, overlap等）は非表示
 */
export const EditingRest: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);
      const [note, setNote] = React.useState<Note | undefined>(undefined);

      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          const notes = ust.notes.map((n) => n.deepCopy());
          notes[1].lyric = "R"; // 休符に変更
          useMusicProjectStore.setState({
            notes,
            vb: null,
          });
          setNote(notes[1]);
        });
      }, []);

      useCookieStore.setState({
        language: "ja",
      });

      if (!note) return <div>Loading...</div>;

      return (
        <Story
          args={{
            note,
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};

/**
 * カスタムパラメータを持つ音符
 * velocity, intensity, modulation等が設定済み
 */
export const WithCustomParameters: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);
      const [note, setNote] = React.useState<Note | undefined>(undefined);

      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          const notes = ust.notes.map((n) => n.deepCopy());
          const customNote = notes[2];
          customNote.preutter = 50;
          customNote.overlap = -10;
          customNote.stp = 5;
          customNote.velocity = 150;
          customNote.intensity = 120;
          customNote.modulation = 50;
          customNote.flags = "g-5";
          customNote.direct = true;
          useMusicProjectStore.setState({
            notes,
            vb: null,
          });
          setNote(customNote);
        });
      }, []);

      useCookieStore.setState({
        language: "ja",
      });

      if (!note) return <div>Loading...</div>;

      return (
        <Story
          args={{
            note,
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};

/**
 * Tempoパラメータを持つ音符
 */
export const WithTempo: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);
      const [note, setNote] = React.useState<Note | undefined>(undefined);

      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          const notes = ust.notes.map((n) => n.deepCopy());
          notes[3].tempo = 140;
          notes[3].hasTempo = true;
          useMusicProjectStore.setState({
            notes,
            vb: null,
          });
          setNote(notes[3]);
        });
      }, []);

      useCookieStore.setState({
        language: "ja",
      });

      if (!note) return <div>Loading...</div>;

      return (
        <Story
          args={{
            note,
            open,
            handleClose: () => setOpen(false),
          }}
        />
      );
    },
  ],
};

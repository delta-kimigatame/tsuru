import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { VibratoDialog } from "../../../src/features/EditorView/VibratoDialog";
import { Note } from "../../../src/lib/Note";
import { Ust } from "../../../src/lib/Ust";
import { useCookieStore } from "../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../src/storybook/utils";

const meta: Meta<typeof VibratoDialog> = {
  title: "features/EditorView/VibratoDialog",
  component: VibratoDialog,
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
 * ビブラートなし（未定義）
 * useVibratoスイッチがOFF、全スライダー無効
 */
export const NoVibrato: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);
      const [note, setNote] = React.useState<Note | undefined>(undefined);

      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          const notes = ust.notes.map((n) => n.deepCopy());
          notes[2].vibrato = undefined; // ビブラート未定義
          useMusicProjectStore.setState({
            notes,
            vb: null,
          });
          setNote(notes[2]);
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
 * 標準的なビブラート設定
 * デフォルト値：length=50, cycle=120, depth=40, fadeIn=35, fadeOut=45, phase=1, height=8
 */
export const StandardVibrato: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);
      const [note, setNote] = React.useState<Note | undefined>(undefined);

      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          const notes = ust.notes.map((n) => n.deepCopy());
          notes[2].vibrato = "50,120,40,35,45,1,8,0";
          useMusicProjectStore.setState({
            notes,
            vb: null,
          });
          setNote(notes[2]);
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
 * 強めのビブラート
 * 長い周期、深い深度、速いフェードイン
 */
export const StrongVibrato: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);
      const [note, setNote] = React.useState<Note | undefined>(undefined);

      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          const notes = ust.notes.map((n) => n.deepCopy());
          // length=80, cycle=180, depth=70, fadeIn=20, fadeOut=30, phase=0, height=15
          notes[2].vibrato = "80,180,70,20,30,0,15,0";
          useMusicProjectStore.setState({
            notes,
            vb: null,
          });
          setNote(notes[2]);
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
 * 弱めのビブラート
 * 短い周期、浅い深度、遅いフェードイン
 */
export const SubtleVibrato: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);
      const [note, setNote] = React.useState<Note | undefined>(undefined);

      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          const notes = ust.notes.map((n) => n.deepCopy());
          // length=30, cycle=80, depth=20, fadeIn=50, fadeOut=60, phase=2, height=5
          notes[2].vibrato = "30,80,20,50,60,2,5,0";
          useMusicProjectStore.setState({
            notes,
            vb: null,
          });
          setNote(notes[2]);
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
 * 極端なビブラート設定
 * 最大長、非常に速い周期、最大深度
 */
export const ExtremeVibrato: Story = {
  decorators: [
    (Story) => {
      const [open, setOpen] = React.useState(true);
      const [note, setNote] = React.useState<Note | undefined>(undefined);

      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          const notes = ust.notes.map((n) => n.deepCopy());
          // length=100, cycle=40, depth=100, fadeIn=10, fadeOut=10, phase=3, height=20
          notes[2].vibrato = "100,40,100,10,10,3,20,0";
          useMusicProjectStore.setState({
            notes,
            vb: null,
          });
          setNote(notes[2]);
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

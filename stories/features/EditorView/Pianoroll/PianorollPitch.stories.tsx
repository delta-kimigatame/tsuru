import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { PIANOROLL_CONFIG } from "../../../../src/config/pianoroll";
import { PianorollBackground } from "../../../../src/features/EditorView/Pianoroll/PianorollBackground";
import { PianorollNotes } from "../../../../src/features/EditorView/Pianoroll/PianorollNotes";
import { PianorollPitch } from "../../../../src/features/EditorView/Pianoroll/PianorollPitch";
import { Ust } from "../../../../src/lib/Ust";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../../src/storybook/utils";

const meta: Meta<typeof PianorollPitch> = {
  title: "features/EditorView/Pianoroll/PianorollPitch",
  component: PianorollPitch,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：ピッチベンド描画
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      const { verticalZoom, horizontalZoom } = useCookieStore();
      const { notes } = useMusicProjectStore();
      const [loading, setLoading] = React.useState(true);

      React.useEffect(() => {
        useCookieStore.setState({
          language: "ja",
          verticalZoom: 1,
          horizontalZoom: 1,
        });

        const ust = new Ust();
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          const loadedNotes = ust.notes.map((n) => n.deepCopy());
          // ピッチベンドデータを設定
          if (loadedNotes.length > 2) {
            loadedNotes[2].setPbw([80, 80]);
            loadedNotes[2].setPby([-20, 10]);
            loadedNotes[2].pbsTime = 0;
            loadedNotes[2].pbsHeight = 0;
          }
          if (loadedNotes.length > 3) {
            loadedNotes[3].setPbw([60, 60, 60]);
            loadedNotes[3].setPby([30, -15, 20]);
            loadedNotes[3].pbsTime = 5;
            loadedNotes[3].pbsHeight = -5;
          }
          useMusicProjectStore.setState({ notes: loadedNotes, vb: null });
          setLoading(false);
        });
      }, []);

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

      if (loading || notes.length === 0) return <div>Loading...</div>;

      return (
        <svg
          width={
            totalLength * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom
          }
          height={PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom}
          style={{
            display: "block",
            position: "relative",
          }}
        >
          <g id="background">
            <PianorollBackground totalLength={totalLength} />
          </g>
          <g id="notes">
            <PianorollNotes
              selectedNotesIndex={[]}
              totalLength={totalLength}
              notesLeft={notesLeft}
            />
          </g>
          <g id="pitch">
            <Story
              args={{
                selectedNotesIndex: [],
                totalLength,
                notesLeft,
              }}
            />
          </g>
        </svg>
      );
    },
  ],
};

/**
 * 複雑なピッチベンド（複数ポイント）
 */
export const ComplexPitch: Story = {
  decorators: [
    (Story) => {
      const { verticalZoom, horizontalZoom } = useCookieStore();
      const { notes } = useMusicProjectStore();
      const [loading, setLoading] = React.useState(true);

      React.useEffect(() => {
        useCookieStore.setState({
          language: "ja",
          verticalZoom: 1,
          horizontalZoom: 1,
        });

        const ust = new Ust();
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          const loadedNotes = ust.notes.map((n) => n.deepCopy());
          // より複雑なピッチベンド設定
          if (loadedNotes.length > 1) {
            loadedNotes[1].setPbw([50, 50, 50, 50]);
            loadedNotes[1].setPby([20, -30, 40, -20]);
            loadedNotes[1].pbsTime = 10;
            loadedNotes[1].pbsHeight = -10;
          }
          if (loadedNotes.length > 2) {
            loadedNotes[2].setPbw([40, 40, 40, 40, 40]);
            loadedNotes[2].setPby([-15, 25, -35, 30, -10]);
            loadedNotes[2].pbsTime = 15;
            loadedNotes[2].pbsHeight = 8;
          }
          useMusicProjectStore.setState({ notes: loadedNotes, vb: null });
          setLoading(false);
        });
      }, []);

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

      if (loading || notes.length === 0) return <div>Loading...</div>;

      return (
        <svg
          width={
            totalLength * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom
          }
          height={PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom}
          style={{
            display: "block",
            position: "relative",
          }}
        >
          <g id="background">
            <PianorollBackground totalLength={totalLength} />
          </g>
          <g id="notes">
            <PianorollNotes
              selectedNotesIndex={[]}
              totalLength={totalLength}
              notesLeft={notesLeft}
            />
          </g>
          <g id="pitch">
            <Story
              args={{
                selectedNotesIndex: [],
                totalLength,
                notesLeft,
              }}
            />
          </g>
        </svg>
      );
    },
  ],
};

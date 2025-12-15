import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { PIANOROLL_CONFIG } from "../../../../src/config/pianoroll";
import { PianorollBackground } from "../../../../src/features/EditorView/Pianoroll/PianorollBackground";
import { PianorollNotes } from "../../../../src/features/EditorView/Pianoroll/PianorollNotes";
import { PianorollVibrato } from "../../../../src/features/EditorView/Pianoroll/PianorollVibrato";
import { Ust } from "../../../../src/lib/Ust";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../../src/storybook/utils";

const meta: Meta<typeof PianorollVibrato> = {
  title: "features/EditorView/Pianoroll/PianorollVibrato",
  component: PianorollVibrato,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：ビブラート描画
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
          // ビブラートデータを設定
          if (loadedNotes.length > 2) {
            loadedNotes[2].vibrato = "65,180,35,20,20,0,0,0";
          }
          if (loadedNotes.length > 3) {
            loadedNotes[3].vibrato = "50,120,40,35,45,1,8,0";
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
          <g id="vibrato">
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
 * 強めのビブラート
 */
export const StrongVibrato: Story = {
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
          // 強いビブラート：長い周期、深い深度
          if (loadedNotes.length > 1) {
            loadedNotes[1].vibrato = "80,180,70,20,30,0,15,0";
          }
          if (loadedNotes.length > 2) {
            loadedNotes[2].vibrato = "75,200,65,15,25,2,12,0";
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
          <g id="vibrato">
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
 * 弱めのビブラート
 */
export const SubtleVibrato: Story = {
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
          // 弱いビブラート：短い周期、浅い深度
          if (loadedNotes.length > 1) {
            loadedNotes[1].vibrato = "30,80,20,50,60,2,5,0";
          }
          if (loadedNotes.length > 3) {
            loadedNotes[3].vibrato = "40,100,25,40,50,1,6,0";
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
          <g id="vibrato">
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

// TODO: Uncomment and migrate to @storybook/test when upgrading testing interactions
// Additional stories with play functions commented out for @storybook/test migration...

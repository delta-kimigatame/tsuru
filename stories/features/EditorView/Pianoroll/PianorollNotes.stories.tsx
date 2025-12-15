import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { PIANOROLL_CONFIG } from "../../../../src/config/pianoroll";
import { PianorollBackground } from "../../../../src/features/EditorView/Pianoroll/PianorollBackground";
import { PianorollNotes } from "../../../../src/features/EditorView/Pianoroll/PianorollNotes";
import { Ust } from "../../../../src/lib/Ust";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../../src/storybook/utils";

const meta: Meta<typeof PianorollNotes> = {
  title: "features/EditorView/Pianoroll/PianorollNotes",
  component: PianorollNotes,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：音符と休符の描画
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
          useMusicProjectStore.setState({ notes: ust.notes, vb: null });
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
 * 音符選択状態の描画
 */
export const WithSelection: Story = {
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
          useMusicProjectStore.setState({ notes: ust.notes, vb: null });
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
            <Story
              args={{
                selectedNotesIndex: [0, 2, 4],
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

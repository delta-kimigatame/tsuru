import { Meta, StoryObj } from "@storybook/react";
// TODO: Migrate to @storybook/test when implementing interactions
import React from "react";
import { PIANOROLL_CONFIG } from "../../../../src/config/pianoroll";
import { PianorollBackground } from "../../../../src/features/EditorView/Pianoroll/PianorollBackground";
import { PianorollNotes } from "../../../../src/features/EditorView/Pianoroll/PianorollNotes";
import { PianorollVibrato } from "../../../../src/features/EditorView/Pianoroll/PianorollVibrato";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";

const DummyParent = (args: any) => {
  const { verticalZoom, horizontalZoom } = useCookieStore();
  const { notes } = useMusicProjectStore();
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

  return (
    <svg
      width={totalLength * PIANOROLL_CONFIG.NOTES_WIDTH_RATE * horizontalZoom}
      height={PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom}
      style={{
        display: "block",
        position: "relative",
      }}
    >
      <g id="background">
        <PianorollBackground {...args} totalLength={totalLength} />
      </g>
      <g id="notes">
        <PianorollNotes
          {...args}
          totalLength={totalLength}
          notesLeft={notesLeft}
        />
      </g>
      <g id="vibrato">
        <PianorollVibrato
          {...args}
          totalLength={totalLength}
          notesLeft={notesLeft}
        />
      </g>
    </svg>
  );
};

const meta: Meta<typeof DummyParent> = {
  title: "features/EditorView/Pianoroll/PianorollVibrato",
  component: DummyParent,
  tags: ["autodocs"],
  args: { selectedNotesIndex: [] },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// TODO: Uncomment and migrate to @storybook/test when upgrading testing interactions
// Additional stories with play functions commented out for @storybook/test migration...

import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { NotesLeftButton } from "../../../../src/features/EditorView/NoteMenu/NotesLeftButton";
import { Ust } from "../../../../src/lib/Ust";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../../src/storybook/utils";

const meta: Meta<typeof NotesLeftButton> = {
  title: "features/EditorView/NoteMenu/NotesLeftButton",
  component: NotesLeftButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：ノートを左（前）に移動
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([2, 3]);

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
            setSelectedNotesIndex,
          }}
        />
      );
    },
  ],
};

import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { NotesDownButton } from "../../../../src/features/EditorView/NoteMenu/NotesDownButton";
import { Ust } from "../../../../src/lib/Ust";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../../src/storybook/utils";

const meta: Meta<typeof NotesDownButton> = {
  title: "features/EditorView/NoteMenu/NotesDownButton",
  component: NotesDownButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：ノートを半音下げる
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([1, 2, 3]);

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
          }}
        />
      );
    },
  ],
};

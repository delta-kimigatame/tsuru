import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { NotesDeleteButton } from "../../../../src/features/EditorView/NoteMenu/NotesDeleteButton";
import { Ust } from "../../../../src/lib/Ust";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../../src/storybook/utils";

const meta: Meta<typeof NotesDeleteButton> = {
  title: "features/EditorView/NoteMenu/NotesDeleteButton",
  component: NotesDeleteButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：選択されたノートを削除
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([1, 2]);

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

      const handleMenuClose = () => {
        console.log("Menu closed");
      };

      return (
        <Story
          args={{
            selectedNotesIndex,
            setSelectedNotesIndex,
            handleMenuClose,
          }}
        />
      );
    },
  ],
};

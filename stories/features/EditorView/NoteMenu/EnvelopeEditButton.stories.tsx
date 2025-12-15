import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { EnvelopeEditButton } from "../../../../src/features/EditorView/NoteMenu/EnvelopeEditButton";
import { Note } from "../../../../src/lib/Note";
import { Ust } from "../../../../src/lib/Ust";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../../src/storybook/utils";

const meta: Meta<typeof EnvelopeEditButton> = {
  title: "features/EditorView/NoteMenu/EnvelopeEditButton",
  component: EnvelopeEditButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：エンベロープ編集ダイアログを開く
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([2]);
      const [envelopeTargetNote, setEnvelopeTargetNote] = React.useState<
        Note | undefined
      >(undefined);

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
            setEnvelopeTargetNote,
            handleMenuClose,
          }}
        />
      );
    },
  ],
};

import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { DividerButton } from "../../../../src/features/EditorView/NoteMenu/DividerButton";
import { Ust } from "../../../../src/lib/Ust";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../../src/storybook/utils";

const meta: Meta<typeof DividerButton> = {
  title: "features/EditorView/NoteMenu/DividerButton",
  component: DividerButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：ノート分割ダイアログを開く
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([2]);
      const [dividerTargetIndex, setDividerTargetIndex] = React.useState<
        number | undefined
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
            setDividerTargetIndex,
            handleMenuClose,
          }}
        />
      );
    },
  ],
};

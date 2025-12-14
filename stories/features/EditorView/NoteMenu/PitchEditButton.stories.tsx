import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { PitchEditButton } from "../../../../src/features/EditorView/NoteMenu/PitchEditButton";
import { Ust } from "../../../../src/lib/Ust";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../../src/storybook/utils";

const meta: Meta<typeof PitchEditButton> = {
  title: "features/EditorView/NoteMenu/PitchEditButton",
  component: PitchEditButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：ピッチ編集モードに切り替える
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([2]);
      const [pitchTargetIndex, setPitchTargetIndex] = React.useState<
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
            setPitchTargetIndex,
            handleMenuClose,
          }}
        />
      );
    },
  ],
};

import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { LengthSelect } from "../../../../src/features/EditorView/NoteMenu/LengthSelect";
import { Ust } from "../../../../src/lib/Ust";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../../src/storybook/utils";

const meta: Meta<typeof LengthSelect> = {
  title: "features/EditorView/NoteMenu/LengthSelect",
  component: LengthSelect,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：ノート長さ選択セレクトボックス
 * よく使われる長さのプリセットが表示される
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([2]);
      const [lengthValue, setLengthValue] = React.useState<number>(480);

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

      const handleClose = () => {
        console.log("Menu closed");
      };

      return (
        <Story
          args={{
            selectedNotesIndex,
            handleClose,
            lengthValue,
            setLengthValue,
          }}
        />
      );
    },
  ],
};

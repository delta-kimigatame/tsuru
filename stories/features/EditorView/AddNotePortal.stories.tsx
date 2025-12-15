import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { AddNotePortal } from "../../../src/features/EditorView/AddNotePortal";
import { useCookieStore } from "../../../src/store/cookieStore";

const meta: Meta<typeof AddNotePortal> = {
  title: "features/EditorView/AddNotePortal",
  component: AddNotePortal,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：音符追加モード、長さ480tick（四分音符）
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      const [addNoteLength, setAddNoteLength] = React.useState<number>(480);
      const [addNoteLyric, setAddNoteLyric] = React.useState<string>("あ");

      useCookieStore.setState({
        language: "ja",
      });

      return (
        <Story
          args={{
            addNoteLength,
            setAddNoteLength,
            addNoteLyric,
            setAddNoteLyric,
          }}
        />
      );
    },
  ],
};

/**
 * 休符追加モード（歌詞が「R」）
 */
export const RestMode: Story = {
  decorators: [
    (Story) => {
      const [addNoteLength, setAddNoteLength] = React.useState<number>(480);
      const [addNoteLyric, setAddNoteLyric] = React.useState<string>("R");

      useCookieStore.setState({
        language: "ja",
      });

      return (
        <Story
          args={{
            addNoteLength,
            setAddNoteLength,
            addNoteLyric,
            setAddNoteLyric,
          }}
        />
      );
    },
  ],
};

/**
 * 長い音符（全音符：1920tick）
 */
export const LongNote: Story = {
  decorators: [
    (Story) => {
      const [addNoteLength, setAddNoteLength] = React.useState<number>(1920);
      const [addNoteLyric, setAddNoteLyric] = React.useState<string>("あ");

      useCookieStore.setState({
        language: "ja",
      });

      return (
        <Story
          args={{
            addNoteLength,
            setAddNoteLength,
            addNoteLyric,
            setAddNoteLyric,
          }}
        />
      );
    },
  ],
};

/**
 * 短い音符（32分音符：60tick）
 */
export const ShortNote: Story = {
  decorators: [
    (Story) => {
      const [addNoteLength, setAddNoteLength] = React.useState<number>(60);
      const [addNoteLyric, setAddNoteLyric] = React.useState<string>("あ");

      useCookieStore.setState({
        language: "ja",
      });

      return (
        <Story
          args={{
            addNoteLength,
            setAddNoteLength,
            addNoteLyric,
            setAddNoteLyric,
          }}
        />
      );
    },
  ],
};

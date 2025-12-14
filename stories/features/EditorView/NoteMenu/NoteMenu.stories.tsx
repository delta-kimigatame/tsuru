import { Meta, StoryObj } from "@storybook/react";
import JSZip from "jszip";
import React from "react";
import { NoteMenu } from "../../../../src/features/EditorView/NoteMenu/NoteMenu";
import { Ust } from "../../../../src/lib/Ust";
import { VoiceBank } from "../../../../src/lib/VoiceBanks/VoiceBank";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../../src/storybook/sampledata";
import { base64ToArrayBuffer, loadVB } from "../../../../src/storybook/utils";

const meta: Meta<typeof NoteMenu> = {
  title: "features/EditorView/NoteMenu/NoteMenu",
  component: NoteMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：複数ノート選択時のメニュー
 * 矢印ボタン、コピー、貼り付け、削除、キャッシュクリアボタンが表示される
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      const [menuAnchor, setMenuAnchor] = React.useState<{
        x: number;
        y: number;
      } | null>({ x: 300, y: 200 });
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([0, 1, 2]);
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

      return (
        <Story
          args={{
            menuAnchor,
            setMenuAnchor,
            selectedNotesIndex,
            setSelectedNotesIndex,
            setPitchTargetIndex,
            selectMode: "toggle",
          }}
        />
      );
    },
  ],
};

/**
 * 単一ノート選択時のメニュー
 * 矢印ボタンに加えて、編集、分割、エンベロープ、ピッチ、ビブラート、連結選択ボタン、
 * エイリアスと長さのセレクトボックスが表示される
 */
export const SingleNoteSelected: Story = {
  decorators: [
    (Story) => {
      const [menuAnchor, setMenuAnchor] = React.useState<{
        x: number;
        y: number;
      } | null>({ x: 300, y: 200 });
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([2]);
      const [pitchTargetIndex, setPitchTargetIndex] = React.useState<
        number | undefined
      >(undefined);
      const [loading, setLoading] = React.useState(true);

      React.useEffect(() => {
        const load = async () => {
          try {
            const td = new TextDecoder("Shift-JIS");
            const buffer = await loadVB("minimumCV.zip");
            const zip = new JSZip();
            await zip.loadAsync(buffer, {
              decodeFileName: (fileNameBinary: Uint8Array) =>
                td.decode(fileNameBinary),
            });
            const loadedVb = new VoiceBank(zip.files);
            await loadedVb.initialize();

            const ust = new Ust();
            await ust.load(base64ToArrayBuffer(sampleShortCVUst));

            useMusicProjectStore.setState({
              notes: ust.notes,
              vb: loadedVb,
            });

            useCookieStore.setState({
              language: "ja",
            });
          } catch (err) {
            console.error("Failed to load VB:", err);
          } finally {
            setLoading(false);
          }
        };
        load();
      }, []);

      if (loading) return <div>Loading voicebank...</div>;

      return (
        <Story
          args={{
            menuAnchor,
            setMenuAnchor,
            selectedNotesIndex,
            setSelectedNotesIndex,
            setPitchTargetIndex,
            selectMode: "toggle",
          }}
        />
      );
    },
  ],
};

/**
 * メニューが閉じている状態
 */
export const MenuClosed: Story = {
  decorators: [
    (Story) => {
      const [menuAnchor, setMenuAnchor] = React.useState<{
        x: number;
        y: number;
      } | null>(null);
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([0]);
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

      return (
        <Story
          args={{
            menuAnchor,
            setMenuAnchor,
            selectedNotesIndex,
            setSelectedNotesIndex,
            setPitchTargetIndex,
            selectMode: "toggle",
          }}
        />
      );
    },
  ],
};

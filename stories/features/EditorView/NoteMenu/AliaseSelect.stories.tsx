import { Meta, StoryObj } from "@storybook/react";
import JSZip from "jszip";
import React from "react";
import { AliaseSelect } from "../../../../src/features/EditorView/NoteMenu/AliaseSelect";
import { Ust } from "../../../../src/lib/Ust";
import { VoiceBank } from "../../../../src/lib/VoiceBanks/VoiceBank";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../../src/storybook/sampledata";
import { base64ToArrayBuffer, loadVB } from "../../../../src/storybook/utils";

const AliaseSelectWrapper: React.FC = () => {
  const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<number[]>([
    2,
  ]);
  const [aliasValue, setAliasValue] = React.useState<string>("");
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

  const handleClose = () => {
    console.log("Menu closed");
  };

  if (loading) return <div>Loading voicebank...</div>;

  return (
    <AliaseSelect
      selectedNotesIndex={selectedNotesIndex}
      handleClose={handleClose}
      aliasValue={aliasValue}
      setAliasValue={setAliasValue}
    />
  );
};

const meta: Meta<typeof AliaseSelectWrapper> = {
  title: "features/EditorView/NoteMenu/AliaseSelect",
  component: AliaseSelectWrapper,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：エイリアス選択セレクトボックス
 * 音源に登録されているエイリアスの候補が表示される
 */
export const Default: Story = {};

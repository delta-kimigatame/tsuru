import { Meta, StoryObj } from "@storybook/react";
import JSZip from "jszip";
import React from "react";
import { Pianoroll } from "../../../../src/features/EditorView/Pianoroll/Pianoroll";
import { Ust } from "../../../../src/lib/Ust";
import { VoiceBank } from "../../../../src/lib/VoiceBanks/VoiceBank";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../../src/storybook/sampledata";
import { base64ToArrayBuffer, loadVB } from "../../../../src/storybook/utils";

const meta: Meta<typeof Pianoroll> = {
  title: "features/EditorView/Pianoroll/Pianoroll",
  component: Pianoroll,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：ピアノロール全体表示
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      const [loading, setLoading] = React.useState(true);
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([]);
      const [lyricTargetIndex, setLyricTargetIndex] = React.useState<
        number | undefined
      >(undefined);
      const [notesLeftMs, setNotesLeftMs] = React.useState<number[]>([]);

      React.useEffect(() => {
        const load = async () => {
          useCookieStore.setState({
            language: "ja",
            verticalZoom: 1,
            horizontalZoom: 1,
          });

          // 音源を読み込み
          const td = new TextDecoder("Shift-JIS");
          const buffer = await loadVB("minimumCV.zip");
          const zip = new JSZip();
          await zip.loadAsync(buffer, {
            decodeFileName: (bytes: Uint8Array) => td.decode(bytes),
          });
          const loadedVb = new VoiceBank(zip.files);
          await loadedVb.initialize();

          // USTを読み込み
          const ust = new Ust();
          await ust.load(base64ToArrayBuffer(sampleShortCVUst));

          useMusicProjectStore.setState({ notes: ust.notes, vb: loadedVb });
          setLoading(false);
        };
        load();
      }, []);

      if (loading) return <div>Loading voicebank and notes...</div>;

      return (
        <Story
          args={{
            playing: false,
            playingMs: 0,
            selectedNotesIndex,
            setSelectedNotesIndes: setSelectedNotesIndex,
            selectMode: "toggle",
            lyricTargetIndex,
            setLyricTargetIndex,
            setNotesLeftMs,
          }}
        />
      );
    },
  ],
};

/**
 * 音符選択状態
 */
export const WithSelection: Story = {
  decorators: [
    (Story) => {
      const [loading, setLoading] = React.useState(true);
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([0, 2, 4]);
      const [lyricTargetIndex, setLyricTargetIndex] = React.useState<
        number | undefined
      >(undefined);
      const [notesLeftMs, setNotesLeftMs] = React.useState<number[]>([]);

      React.useEffect(() => {
        const load = async () => {
          useCookieStore.setState({
            language: "ja",
            verticalZoom: 1,
            horizontalZoom: 1,
          });

          const td = new TextDecoder("Shift-JIS");
          const buffer = await loadVB("minimumCV.zip");
          const zip = new JSZip();
          await zip.loadAsync(buffer, {
            decodeFileName: (bytes: Uint8Array) => td.decode(bytes),
          });
          const loadedVb = new VoiceBank(zip.files);
          await loadedVb.initialize();

          const ust = new Ust();
          await ust.load(base64ToArrayBuffer(sampleShortCVUst));

          useMusicProjectStore.setState({ notes: ust.notes, vb: loadedVb });
          setLoading(false);
        };
        load();
      }, []);

      if (loading) return <div>Loading voicebank and notes...</div>;

      return (
        <Story
          args={{
            playing: false,
            playingMs: 0,
            selectedNotesIndex,
            setSelectedNotesIndes: setSelectedNotesIndex,
            selectMode: "toggle",
            lyricTargetIndex,
            setLyricTargetIndex,
            setNotesLeftMs,
          }}
        />
      );
    },
  ],
};

/**
 * 再生中
 */
export const Playing: Story = {
  decorators: [
    (Story) => {
      const [loading, setLoading] = React.useState(true);
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([]);
      const [lyricTargetIndex, setLyricTargetIndex] = React.useState<
        number | undefined
      >(undefined);
      const [notesLeftMs, setNotesLeftMs] = React.useState<number[]>([]);

      React.useEffect(() => {
        const load = async () => {
          useCookieStore.setState({
            language: "ja",
            verticalZoom: 1,
            horizontalZoom: 1,
          });

          const td = new TextDecoder("Shift-JIS");
          const buffer = await loadVB("minimumCV.zip");
          const zip = new JSZip();
          await zip.loadAsync(buffer, {
            decodeFileName: (bytes: Uint8Array) => td.decode(bytes),
          });
          const loadedVb = new VoiceBank(zip.files);
          await loadedVb.initialize();

          const ust = new Ust();
          await ust.load(base64ToArrayBuffer(sampleShortCVUst));

          useMusicProjectStore.setState({ notes: ust.notes, vb: loadedVb });
          setLoading(false);
        };
        load();
      }, []);

      if (loading) return <div>Loading voicebank and notes...</div>;

      return (
        <Story
          args={{
            playing: true,
            playingMs: 1500,
            selectedNotesIndex,
            setSelectedNotesIndes: setSelectedNotesIndex,
            selectMode: "toggle",
            lyricTargetIndex,
            setLyricTargetIndex,
            setNotesLeftMs,
          }}
        />
      );
    },
  ],
};

/**
 * ピッチ編集モード：ポルタメント点表示
 * note[1]にポルタメント点を設定し、pitchTargetIndexで選択状態を表示
 */
export const WithPortamento: Story = {
  decorators: [
    (Story) => {
      const [loading, setLoading] = React.useState(true);
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([]);
      const [lyricTargetIndex, setLyricTargetIndex] = React.useState<
        number | undefined
      >(undefined);
      const [notesLeftMs, setNotesLeftMs] = React.useState<number[]>([]);
      const [pitchTargetIndex, setPitchTargetIndex] = React.useState<
        number | undefined
      >(1);
      const [targetPoltament, setTargetPoltament] = React.useState<
        number | undefined
      >(undefined);

      React.useEffect(() => {
        const load = async () => {
          useCookieStore.setState({
            language: "ja",
            verticalZoom: 1,
            horizontalZoom: 1,
          });

          const td = new TextDecoder("Shift-JIS");
          const buffer = await loadVB("minimumCV.zip");
          const zip = new JSZip();
          await zip.loadAsync(buffer, {
            decodeFileName: (bytes: Uint8Array) => td.decode(bytes),
          });
          const loadedVb = new VoiceBank(zip.files);
          await loadedVb.initialize();

          const ust = new Ust();
          await ust.load(base64ToArrayBuffer(sampleShortCVUst));

          // note[1]にポルタメント点を設定
          if (ust.notes.length > 1) {
            const note = ust.notes[1];
            note.pbsTime = 15.0; // 開始時刻
            note.pbsHeight = -5; // 開始高さ（前のノートから-0.5音下）
            note.setPbw([30, 50, 40]); // 各ポルタメント点の時間幅
            note.setPby([10, 30, 0]); // 各ポルタメント点の高さ
          }

          useMusicProjectStore.setState({ notes: ust.notes, vb: loadedVb });
          setLoading(false);
        };
        load();
      }, []);

      if (loading) return <div>Loading voicebank and notes...</div>;

      return (
        <Story
          args={{
            playing: false,
            playingMs: 0,
            selectedNotesIndex,
            setSelectedNotesIndes: setSelectedNotesIndex,
            selectMode: "pitch",
            lyricTargetIndex,
            setLyricTargetIndex,
            setNotesLeftMs,
            pitchTargetIndex,
            setPitchTargetIndex,
            targetPoltament,
            setTargetPoltament,
          }}
        />
      );
    },
  ],
};

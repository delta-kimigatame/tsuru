import { Meta, StoryObj } from "@storybook/react";
import JSZip from "jszip";
import React from "react";
import { EditorView } from "../../../src/features/EditorView/EditorView";
import { Ust } from "../../../src/lib/Ust";
import { VoiceBank } from "../../../src/lib/VoiceBanks/VoiceBank";
import { useCookieStore } from "../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../src/storybook/sampledata";
import { base64ToArrayBuffer, loadVB } from "../../../src/storybook/utils";

const meta: Meta<typeof EditorView> = {
  title: "features/EditorView/EditorView",
  component: EditorView,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：空のエディタ（音源読み込み済み）
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      const [loading, setLoading] = React.useState(true);

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

          useMusicProjectStore.setState({
            vb: loadedVb,
            notes: [],
          });
          setLoading(false);
        };
        load();
      }, []);

      if (loading) return <div>Loading voicebank...</div>;

      return <Story />;
    },
  ],
};

/**
 * UST読み込み後の状態
 */
export const WithNotes: Story = {
  decorators: [
    (Story) => {
      const [loading, setLoading] = React.useState(true);

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

          useMusicProjectStore.setState({
            vb: loadedVb,
            notes: ust.notes,
          });
          setLoading(false);
        };
        load();
      }, []);

      if (loading) return <div>Loading voicebank and notes...</div>;

      return <Story />;
    },
  ],
};

/**
 * 水平ズーム2倍
 */
export const HorizontalZoom: Story = {
  decorators: [
    (Story) => {
      const [loading, setLoading] = React.useState(true);

      React.useEffect(() => {
        const load = async () => {
          useCookieStore.setState({
            language: "ja",
            verticalZoom: 1,
            horizontalZoom: 2,
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

          useMusicProjectStore.setState({
            vb: loadedVb,
            notes: ust.notes,
          });
          setLoading(false);
        };
        load();
      }, []);

      if (loading) return <div>Loading voicebank and notes...</div>;

      return <Story />;
    },
  ],
};

/**
 * 縦ズーム2倍
 */
export const VerticalZoom: Story = {
  decorators: [
    (Story) => {
      const [loading, setLoading] = React.useState(true);

      React.useEffect(() => {
        const load = async () => {
          useCookieStore.setState({
            language: "ja",
            verticalZoom: 2,
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

          useMusicProjectStore.setState({
            vb: loadedVb,
            notes: ust.notes,
          });
          setLoading(false);
        };
        load();
      }, []);

      if (loading) return <div>Loading voicebank and notes...</div>;

      return <Story />;
    },
  ],
};

import { Meta, StoryObj } from "@storybook/react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JSZip from "jszip";
import React from "react";
import { App } from "../../src/features/App";
import { Ust } from "../../src/lib/Ust";
import { VoiceBank } from "../../src/lib/VoiceBanks/VoiceBank";
import { useCookieStore } from "../../src/store/cookieStore";
import { useMusicProjectStore } from "../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../src/storybook/sampledata";
import { base64ToArrayBuffer, loadVB } from "../../src/storybook/utils";

const meta: Meta<typeof App> = {
  title: "features/App",
  component: App,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト：トップ画面（音源未読み込み）
 * Header、TopView、Footerが表示される
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      React.useEffect(() => {
        useCookieStore.setState({
          language: "ja",
          mode: "system",
          verticalZoom: 1,
          horizontalZoom: 1,
        });
        useMusicProjectStore.setState({
          vb: null,
          notes: [],
        });
      }, []);

      return <Story />;
    },
  ],
};

/**
 * ライトモード：トップ画面
 */
export const LightMode: Story = {
  decorators: [
    (Story) => {
      React.useEffect(() => {
        useCookieStore.setState({
          language: "ja",
          mode: "light",
          verticalZoom: 1,
          horizontalZoom: 1,
        });
        useMusicProjectStore.setState({
          vb: null,
          notes: [],
        });
      }, []);

      return <Story />;
    },
  ],
};

/**
 * ダークモード：トップ画面
 */
export const DarkMode: Story = {
  decorators: [
    (Story) => {
      React.useEffect(() => {
        useCookieStore.setState({
          language: "ja",
          mode: "dark",
          verticalZoom: 1,
          horizontalZoom: 1,
        });
        useMusicProjectStore.setState({
          vb: null,
          notes: [],
        });
      }, []);

      return <Story />;
    },
  ],
};

/**
 * エディタ画面（音源読み込み済み、規約同意をクリック）
 * InfoVBDialogが開くので「全規約に同意」ボタンをクリックしてEditorViewを表示
 */
export const EditorView: Story = {
  decorators: [
    (Story) => {
      const [loading, setLoading] = React.useState(true);

      React.useEffect(() => {
        const load = async () => {
          useCookieStore.setState({
            language: "ja",
            mode: "system",
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
          // agreeは未設定（InfoVBDialogが開く）

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
  play: async () => {
    const user = userEvent.setup();

    // InfoVBDialogの「全規約に同意」ボタンを待機
    const agreeButton = await waitFor(
      () => screen.getByRole("button", { name: /全規約に同意/i }),
      { timeout: 5000 }
    );

    // ボタンをクリック
    await user.click(agreeButton);
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Wave } from "utauwav";
import { FooterMenu } from "../../../../src/features/EditorView/FooterMenu/FooterMenu";
import { Ust } from "../../../../src/lib/Ust";
import { useCookieStore } from "../../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../../src/store/musicProjectStore";
import { sampleShortCVUst } from "../../../../src/storybook/sampledata";
import { base64ToArrayBuffer } from "../../../../src/storybook/utils";
import type { NoteSelectMode } from "../../../../src/types/noteSelectMode";

const meta = {
  title: "features/EditorView/FooterMenu/FooterMenu",
  component: FooterMenu,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FooterMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * FooterMenuコンポーネントのデフォルト表示
 *
 * 選択モード切替、Undo/Redo、バッチ処理、再生/停止、WAVダウンロードなどの機能を提供
 */
export const Default: Story = {
  decorators: [
    (Story) => {
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([]);
      const [selectMode, setSelectMode] = React.useState<NoteSelectMode>("toggle");
      const [synthesisProgress, setSynthesisProgress] = React.useState(false);
      const [synthesisCount, setSynthesisCount] = React.useState(0);
      const [playing, setPlaying] = React.useState(false);
      const [backgroundAudioWav, setBackgroundAudioWav] =
        React.useState<Wave | null>(null);
      const [backgroundWavUrl, setBackgroundWavUrl] = React.useState("");
      const [backgroundOffsetMs, setBackgroundOffsetMs] = React.useState(0);
      const [backgroundVolume, setBackgroundVolume] = React.useState(0.5);
      const [backgroundMuted, setBackgroundMuted] = React.useState(false);

      // 音楽プロジェクトのストアに初期データをセット
      const ust = new Ust();
      React.useEffect(() => {
        ust.load(base64ToArrayBuffer(sampleShortCVUst)).then(() => {
          useMusicProjectStore.setState({
            notes: ust.notes,
            vb: null,
          });
        });
      }, []);

      // 言語設定
      useCookieStore.setState({
        language: "ja",
      });

      const handlePlay = () => {
        console.log("Play clicked");
        setPlaying(true);
        // 実際の再生処理はダミー
        setTimeout(() => setPlaying(false), 3000);
      };

      const handlePlayStop = () => {
        console.log("Stop clicked");
        setPlaying(false);
      };

      const handleDownload = () => {
        console.log("Download clicked");
        setSynthesisProgress(true);
        setSynthesisCount(0);
        // ダミーの生成進捗
        const interval = setInterval(() => {
          setSynthesisCount((prev) => {
            const next = prev + 1;
            if (next >= ust.notes.length) {
              clearInterval(interval);
              setSynthesisProgress(false);
              return 0;
            }
            return next;
          });
        }, 100);
      };

      return (
        <Story
          args={{
            selectedNotesIndex,
            setSelectedNotesIndex,
            handlePlay,
            handleDownload,
            synthesisProgress,
            synthesisCount,
            playing,
            handlePlayStop,
            selectMode,
            setSelectMode,
            backgroundAudioWav,
            setBackgroundAudioWav,
            backgroundWavUrl,
            setBackgroundWavUrl,
            backgroundOffsetMs,
            setBackgroundOffsetMs,
            backgroundVolume,
            setBackgroundVolume,
            backgroundMuted,
            setBackgroundMuted,
          }}
        />
      );
    },
  ],
};

/**
 * ノートが選択されている状態
 */
export const WithSelectedNotes: Story = {
  decorators: [
    (Story) => {
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([0, 1, 2]);
      const [selectMode, setSelectMode] = React.useState<NoteSelectMode>("toggle");
      const [synthesisProgress, setSynthesisProgress] = React.useState(false);
      const [synthesisCount, setSynthesisCount] = React.useState(0);
      const [playing, setPlaying] = React.useState(false);
      const [backgroundAudioWav, setBackgroundAudioWav] =
        React.useState<Wave | null>(null);
      const [backgroundWavUrl, setBackgroundWavUrl] = React.useState("");
      const [backgroundOffsetMs, setBackgroundOffsetMs] = React.useState(0);
      const [backgroundVolume, setBackgroundVolume] = React.useState(0.5);
      const [backgroundMuted, setBackgroundMuted] = React.useState(false);

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

      const handlePlay = () => {
        console.log("Play selected notes");
        setPlaying(true);
        setTimeout(() => setPlaying(false), 3000);
      };

      const handlePlayStop = () => {
        console.log("Stop playing");
        setPlaying(false);
      };

      const handleDownload = () => {
        console.log("Download selected notes");
        setSynthesisProgress(true);
        setSynthesisCount(0);
        const interval = setInterval(() => {
          setSynthesisCount((prev) => {
            const next = prev + 1;
            if (next >= selectedNotesIndex.length) {
              clearInterval(interval);
              setSynthesisProgress(false);
              return 0;
            }
            return next;
          });
        }, 100);
      };

      return (
        <Story
          args={{
            selectedNotesIndex,
            setSelectedNotesIndex,
            handlePlay,
            handleDownload,
            synthesisProgress,
            synthesisCount,
            playing,
            handlePlayStop,
            selectMode,
            setSelectMode,
            backgroundAudioWav,
            setBackgroundAudioWav,
            backgroundWavUrl,
            setBackgroundWavUrl,
            backgroundOffsetMs,
            setBackgroundOffsetMs,
            backgroundVolume,
            setBackgroundVolume,
            backgroundMuted,
            setBackgroundMuted,
          }}
        />
      );
    },
  ],
};

/**
 * 再生中の状態
 */
export const PlayingState: Story = {
  decorators: [
    (Story) => {
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([]);
      const [selectMode, setSelectMode] = React.useState<NoteSelectMode>("toggle");
      const [synthesisProgress, setSynthesisProgress] = React.useState(false);
      const [synthesisCount, setSynthesisCount] = React.useState(0);
      const [playing, setPlaying] = React.useState(true);
      const [backgroundAudioWav, setBackgroundAudioWav] =
        React.useState<Wave | null>(null);
      const [backgroundWavUrl, setBackgroundWavUrl] = React.useState("");
      const [backgroundOffsetMs, setBackgroundOffsetMs] = React.useState(0);
      const [backgroundVolume, setBackgroundVolume] = React.useState(0.5);
      const [backgroundMuted, setBackgroundMuted] = React.useState(false);

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

      const handlePlay = () => {
        console.log("Play clicked");
        setPlaying(true);
      };

      const handlePlayStop = () => {
        console.log("Stop clicked");
        setPlaying(false);
      };

      const handleDownload = () => {
        console.log("Download clicked");
      };

      return (
        <Story
          args={{
            selectedNotesIndex,
            setSelectedNotesIndex,
            handlePlay,
            handleDownload,
            synthesisProgress,
            synthesisCount,
            playing,
            handlePlayStop,
            selectMode,
            setSelectMode,
            backgroundAudioWav,
            setBackgroundAudioWav,
            backgroundWavUrl,
            setBackgroundWavUrl,
            backgroundOffsetMs,
            setBackgroundOffsetMs,
            backgroundVolume,
            setBackgroundVolume,
            backgroundMuted,
            setBackgroundMuted,
          }}
        />
      );
    },
  ],
};

/**
 * 合成処理中の状態
 */
export const Synthesizing: Story = {
  decorators: [
    (Story) => {
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([]);
      const [selectMode, setSelectMode] = React.useState<NoteSelectMode>("toggle");
      const [synthesisProgress, setSynthesisProgress] = React.useState(true);
      const [synthesisCount, setSynthesisCount] = React.useState(5);
      const [playing, setPlaying] = React.useState(false);
      const [backgroundAudioWav, setBackgroundAudioWav] =
        React.useState<Wave | null>(null);
      const [backgroundWavUrl, setBackgroundWavUrl] = React.useState("");
      const [backgroundOffsetMs, setBackgroundOffsetMs] = React.useState(0);
      const [backgroundVolume, setBackgroundVolume] = React.useState(0.5);
      const [backgroundMuted, setBackgroundMuted] = React.useState(false);

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

      const handlePlay = () => {
        console.log("Play clicked");
      };

      const handlePlayStop = () => {
        console.log("Stop clicked");
      };

      const handleDownload = () => {
        console.log("Download clicked");
      };

      return (
        <Story
          args={{
            selectedNotesIndex,
            setSelectedNotesIndex,
            handlePlay,
            handleDownload,
            synthesisProgress,
            synthesisCount,
            playing,
            handlePlayStop,
            selectMode,
            setSelectMode,
            backgroundAudioWav,
            setBackgroundAudioWav,
            backgroundWavUrl,
            setBackgroundWavUrl,
            backgroundOffsetMs,
            setBackgroundOffsetMs,
            backgroundVolume,
            setBackgroundVolume,
            backgroundMuted,
            setBackgroundMuted,
          }}
        />
      );
    },
  ],
};

/**
 * 追加モード（ノート追加）
 */
export const AddMode: Story = {
  decorators: [
    (Story) => {
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([0]);
      const [selectMode, setSelectMode] = React.useState<NoteSelectMode>("add");
      const [synthesisProgress, setSynthesisProgress] = React.useState(false);
      const [synthesisCount, setSynthesisCount] = React.useState(0);
      const [playing, setPlaying] = React.useState(false);
      const [backgroundAudioWav, setBackgroundAudioWav] =
        React.useState<Wave | null>(null);
      const [backgroundWavUrl, setBackgroundWavUrl] = React.useState("");
      const [backgroundOffsetMs, setBackgroundOffsetMs] = React.useState(0);
      const [backgroundVolume, setBackgroundVolume] = React.useState(0.5);
      const [backgroundMuted, setBackgroundMuted] = React.useState(false);

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

      const handlePlay = () => {
        console.log("Play clicked");
        setPlaying(true);
        setTimeout(() => setPlaying(false), 3000);
      };

      const handlePlayStop = () => {
        console.log("Stop clicked");
        setPlaying(false);
      };

      const handleDownload = () => {
        console.log("Download clicked");
      };

      return (
        <Story
          args={{
            selectedNotesIndex,
            setSelectedNotesIndex,
            handlePlay,
            handleDownload,
            synthesisProgress,
            synthesisCount,
            playing,
            handlePlayStop,
            selectMode,
            setSelectMode,
            backgroundAudioWav,
            setBackgroundAudioWav,
            backgroundWavUrl,
            setBackgroundWavUrl,
            backgroundOffsetMs,
            setBackgroundOffsetMs,
            backgroundVolume,
            setBackgroundVolume,
            backgroundMuted,
            setBackgroundMuted,
          }}
        />
      );
    },
  ],
};

/**
 * 範囲選択モード
 */
export const RangeSelectMode: Story = {
  decorators: [
    (Story) => {
      const [selectedNotesIndex, setSelectedNotesIndex] = React.useState<
        number[]
      >([]);
      const [selectMode, setSelectMode] = React.useState<NoteSelectMode>("range");
      const [synthesisProgress, setSynthesisProgress] = React.useState(false);
      const [synthesisCount, setSynthesisCount] = React.useState(0);
      const [playing, setPlaying] = React.useState(false);
      const [backgroundAudioWav, setBackgroundAudioWav] =
        React.useState<Wave | null>(null);
      const [backgroundWavUrl, setBackgroundWavUrl] = React.useState("");
      const [backgroundOffsetMs, setBackgroundOffsetMs] = React.useState(0);
      const [backgroundVolume, setBackgroundVolume] = React.useState(0.5);
      const [backgroundMuted, setBackgroundMuted] = React.useState(false);

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

      const handlePlay = () => {
        console.log("Play clicked");
        setPlaying(true);
        setTimeout(() => setPlaying(false), 3000);
      };

      const handlePlayStop = () => {
        console.log("Stop clicked");
        setPlaying(false);
      };

      const handleDownload = () => {
        console.log("Download clicked");
      };

      return (
        <Story
          args={{
            selectedNotesIndex,
            setSelectedNotesIndex,
            handlePlay,
            handleDownload,
            synthesisProgress,
            synthesisCount,
            playing,
            handlePlayStop,
            selectMode,
            setSelectMode,
            backgroundAudioWav,
            setBackgroundAudioWav,
            backgroundWavUrl,
            setBackgroundWavUrl,
            backgroundOffsetMs,
            setBackgroundOffsetMs,
            backgroundVolume,
            setBackgroundVolume,
            backgroundMuted,
            setBackgroundMuted,
          }}
        />
      );
    },
  ],
};

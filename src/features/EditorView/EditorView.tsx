import React from "react";
import { useTranslation } from "react-i18next";
import { Wave } from "utauwav";
import { EDITOR_CONFIG } from "../../config/editor";
import { useThemeMode } from "../../hooks/useThemeMode";
import { LOG } from "../../lib/Logging";
import { resampCache } from "../../lib/ResampCache";
import { SimpleMixMasterService } from "../../services/simpleMixMaster";
import { SynthesisWorker } from "../../services/synthesis";
import { useCookieStore } from "../../store/cookieStore";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import { useSnackBarStore } from "../../store/snackBarStore";
import { cloneMixMasterSettings } from "../../types/mixMaster";
import { NoteSelectMode } from "../../types/noteSelectMode";
import { type PianorollVideoOptions } from "../../utils/pianorollVideo";
import {
  generateMp4,
  type BackgroundOptions,
  type BgPaddingMode,
  type LyricsOptions,
  type PortraitOptions,
  type TextOptions,
  type VideoResolution,
  type WaveformEffectOptions,
} from "../../utils/videoExport";
import { AddNotePortal } from "./AddNotePortal";
import { FooterMenu } from "./FooterMenu/FooterMenu";
import { MixMasterDialog } from "./MixMasterDialog/MixMasterDialog";
import { Pianoroll } from "./Pianoroll/Pianoroll";
import { PitchPortal } from "./PitchPortal/PitchPortal";
import { VideoExportDialog } from "./VideoExportDialog/VideoExportDialog";

export const EditorView: React.FC<{
  checkWorkerReady?: (synthesisWorker: SynthesisWorker) => boolean;
}> = ({
  checkWorkerReady = CheckWorkerReady, // デフォルト値として元の関数を使用
}) => {
  const { t } = useTranslation();
  const {
    vb,
    notes,
    tone,
    isMinor,
    ustFlags,
    phonemizer,
    setNote,
    mixMasterSettings,
    setMixMasterSettings,
  } = useMusicProjectStore();
  const {
    defaultNote,
    playMode,
    exportMode,
    colorTheme,
    horizontalZoom,
    verticalZoom,
  } = useCookieStore();
  const themeMode = useThemeMode();
  const synthesisWorker = React.useMemo(() => new SynthesisWorker(), []);
  const mixMasterService = React.useMemo(
    () => new SimpleMixMasterService(),
    [],
  );
  /**
   * ノートのインデックス一覧
   */
  const [selectNotesIndex, setSelectNotesIndex] = React.useState<Array<number>>(
    [],
  );
  /**
   * 生成したwavのデータurl
   */
  const [wavUrl, setWavUrl] = React.useState<string>();
  /**
   * 生成処理の処理状況
   */
  const [synthesisProgress, setSynthesisProgress] =
    React.useState<boolean>(false);
  /**
   * 生成処理の進捗状況をいくつめのノートまで進んだかで管理する処理
   */
  const [synthesisCount, setSynthesisCount] = React.useState<number>(0);
  /**
   * 再生処理待ちの状態
   */
  const [playReady, setPlayReady] = React.useState<boolean>(false);
  /**
   * 再生中の状態
   */
  const [playing, setPlaying] = React.useState<boolean>(false);
  /**
   * 再生時間
   */
  const [playingMs, setPlayingMs] = React.useState<number>(0);
  /**
   * 選択モード
   */
  const [selectMode, setSelectMode] = React.useState<NoteSelectMode>("toggle");
  /** ピッチ編集対象のノート */
  const [pitchTargetIndex, setPitchTargetIndex] = React.useState<
    number | undefined
  >(undefined);
  /** ピッチ編集モードで操作するポルタメント */
  const [targetPoltament, setTargetPoltament] = React.useState<
    number | undefined
  >(undefined);
  /** ノート追加モードで追加するノートの長さ */
  const [addNoteLength, setAddNoteLength] = React.useState<number>(480);
  /** ノート追加モードで追加するノートの歌詞 */
  const [addNoteLyric, setAddNoteLyric] = React.useState<string>("あ");
  /** 歌詞編集モードの対象ノート */
  const [lyricTargetIndex, setLyricTargetIndex] = React.useState<
    number | undefined
  >(undefined);
  const [notesLeftMs, setNotesLeftMs] = React.useState<number[]>([]);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  // 伴奏音声のデータ
  const [backgroundAudioWav, setBackgroundAudioWav] = React.useState<Wave>();
  // 伴奏音声用のデータURL
  const [backgroundWavUrl, setBackgroundWavUrl] = React.useState<string>();
  // 伴奏用のオフセット値（ミリ秒）
  const [backgroundOffsetMs, setBackgroundOffsetMs] = React.useState<number>(0);
  const [backgroundVolume, setBackgroundVolume] = React.useState<number>(0.5); // 0.0 - 1.0
  const [backgroundMuted, setBackgroundMuted] = React.useState<boolean>(false);
  // ノート末尾から伴奏のみを再生する際の時間(小節数)
  const [backgroundPlayDuration, setBackgroundPlayDuration] =
    React.useState<number>(4);
  const [backgroundPlayEndMs, setBackgroundPlayEndMs] =
    React.useState<number>(0);
  /** 動画エクスポートダイアログの表示状態 */
  const [movieExportDialogOpen, setMovieExportDialogOpen] =
    React.useState<boolean>(false);
  /** 動画エクスポート用に先行合成した WAV データを保持する ref */
  const movieWavBufRef = React.useRef<ArrayBuffer | null>(null);
  /** 動画エクスポート中の総フレーム数（FooterMenu のプログレス表示用） */
  const [videoExportTotal, setVideoExportTotal] = React.useState<
    number | undefined
  >(undefined);
  const [mixMasterDialogOpen, setMixMasterDialogOpen] =
    React.useState<boolean>(false);
  const [mixMasterTarget, setMixMasterTarget] = React.useState<
    "play" | "download" | "movie"
  >("play");
  const [mixMasterVocalBuf, setMixMasterVocalBuf] =
    React.useState<ArrayBuffer | null>(null);
  const [mixPreviewUrl, setMixPreviewUrl] = React.useState<string>();
  const [mixDialogBusy, setMixDialogBusy] = React.useState<boolean>(false);
  const mixPreviewUrlRef = React.useRef<string | undefined>(undefined);

  const backgroundAudioRef = React.useRef<HTMLAudioElement>(null);
  const snackBarStore = useSnackBarStore();

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    LOG.debug("vbかnotesかselectNotesIndexの更新を検知", "EditorView");
    LOG.debug("生成済みwavのクリア", "EditorView");
    setWavUrl(undefined);
  }, [vb, notes, selectNotesIndex, phonemizer]);

  React.useEffect(() => {
    LOG.debug("vbの更新を検知。全てのキャッシュクリア", "EditorView");
    resampCache.clear();
    makeCache();
  }, [vb]);

  React.useEffect(() => {
    LOG.debug("phonemizerの更新を検知。全てのキャッシュクリア", "EditorView");
    resampCache.clear();
    makeCache();
  }, [phonemizer]);

  React.useEffect(() => {
    timerRef.current = setTimeout(() => {
      LOG.debug("notesかustFlagsかdefaultNoteの更新検知", "EditorView");
      makeCache();
    }, EDITOR_CONFIG.MAKE_CACHE_DELAT);

    return () => {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [notes, ustFlags, defaultNote]);

  React.useEffect(() => {
    LOG.debug("selectNotesIndexの更新を検知", "EditorView");
    if (selectMode !== "pitch") {
      setSelectMode("toggle");
    } else {
      setPitchTargetIndex(selectNotesIndex[0]);
    }
  }, [selectNotesIndex]);

  React.useEffect(() => {
    LOG.debug("selectModeの更新を検知", "EditorView");
    if (selectMode !== "pitch") {
      setPitchTargetIndex(undefined);
    }
  }, [selectMode]);
  React.useEffect(() => {
    LOG.debug("pitchTargetIndexの更新検知", "EditorView");
    if (pitchTargetIndex === undefined) {
      setSelectMode("toggle");
    } else {
      const n = notes[pitchTargetIndex];
      if (n.pbs === undefined) {
        n.pbs = "-40;0";
        n.pbw = "80";
        n.pbm = "";
        setNote(n.index, n);
      }
      setSelectMode("pitch");
    }
    setTargetPoltament(undefined);
  }, [pitchTargetIndex]);

  /**
   * バックグラウンドでキャッシュを生成する
   */
  const makeCache = () => {
    if (vb === null) return;
    if (checkWorkerReady(synthesisWorker)) {
      LOG.debug(
        `キャッシュ生成を試みましたが、workerが読み込まれていません。`,
        "EditorView",
      );
      return;
    }
    notes.forEach((n) => {
      const requests = n.getRequestParam(vb, ustFlags, defaultNote);
      const cacheIndex = n.getCacheIndex(vb);
      requests.forEach((request, i) => {
        if (request.resamp === undefined) return;
        const key = resampCache.createKey(request.resamp);
        if (!resampCache.checkKey(n.index, key)) {
          LOG.debug(
            `キャッシュ生成のために、既存のタスクのキャンセル。index:${n.index}`,
            "EditorView",
          );
          synthesisWorker.clearTask(n.index);
          LOG.debug(
            `キャッシュ生成開始。index:${n.index}。i:${i}`,
            "EditorView",
          );
          synthesisWorker.resamp(request, vb, cacheIndex[i]).catch((error) => {
            LOG.error(
              `キャッシュ生成の失敗。input:${JSON.stringify(
                request.resamp,
              )},error:${error.message}\n${error.stack}}`,
              "EditorView",
            );
          });
        }
      });
    });
  };
  /**
   * 楽譜の一部生成時の開始時間オフセットを計算
   */
  const getAudioTimeOffset = React.useCallback((): number => {
    if (selectNotesIndex.length === 0) return 0;

    const minIndex = Math.min(...selectNotesIndex);
    if (minIndex < 0 || minIndex >= notesLeftMs.length) return 0;

    // 選択されたノートの最初の時間（ミリ秒）を秒に変換
    return (notesLeftMs[minIndex] - notes[minIndex].atPreutter) / 1000;
  }, [selectNotesIndex, notesLeftMs]);

  /** playとwavdownloadの共通処理 */
  const synthesis = async (backgroundAudio?: {
    wav: Wave;
    offsetMs: number;
    volume: number;
    mute: boolean;
  }) => {
    if (!synthesisWorker.isReady) {
      LOG.error("エンジンが起動していません", "EditorView");
      synthesisWorker.reload();
      snackBarStore.setSeverity("error");
      snackBarStore.setValue(t("editor.workerError"));
      snackBarStore.setOpen(true);
      return;
    }
    LOG.info("wavファイル生成", "EditorView");
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setSynthesisProgress(true);
    LOG.info("wavファイル生成完了", "EditorView");
    try {
      setSynthesisCount(0);
      const synthesisStartTime = Date.now();
      const wavBuf = await synthesisWorker.synthesis(
        selectNotesIndex,
        setSynthesisCount,
        backgroundAudio,
      );
      LOG.gtag("synthesis", {
        synthesisName: vb.name,
        wavSize: wavBuf.byteLength,
        synthesisTime: Date.now() - synthesisStartTime,
        phonemizer: phonemizer.name,
      });
      const wavUrl_ = URL.createObjectURL(
        new File([wavBuf], "temp.wav", { type: "audio/wav" }),
      );
      setWavUrl(wavUrl_);
      return wavUrl_;
    } catch (e) {
      LOG.error(`合成処理の失敗。${e.message}\n${e.stack}`, "EditorView");
      snackBarStore.setSeverity("error");
      snackBarStore.setValue(t("editor.synthesisError"));
      snackBarStore.setOpen(true);
      return undefined;
    }
  };

  const synthesisVocalBuffer = async (): Promise<ArrayBuffer | undefined> => {
    if (!synthesisWorker.isReady) {
      LOG.error("エンジンが起動していません", "EditorView");
      synthesisWorker.reload();
      snackBarStore.setSeverity("error");
      snackBarStore.setValue(t("editor.workerError"));
      snackBarStore.setOpen(true);
      return undefined;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setSynthesisProgress(true);
    setSynthesisCount(0);
    try {
      const wavBuf = await synthesisWorker.synthesis(
        selectNotesIndex,
        setSynthesisCount,
      );
      return wavBuf;
    } catch (e) {
      LOG.error(`合成処理の失敗。${e.message}\n${e.stack}`, "EditorView");
      snackBarStore.setSeverity("error");
      snackBarStore.setValue(t("editor.synthesisError"));
      snackBarStore.setOpen(true);
      return undefined;
    } finally {
      setSynthesisProgress(false);
    }
  };

  const getMasterBackground = React.useCallback(() => {
    if (!backgroundAudioWav || backgroundMuted) {
      return undefined;
    }
    const realOffsetMs = getAudioTimeOffset() * 1000 - backgroundOffsetMs;
    return {
      wav: backgroundAudioWav,
      offsetMs: realOffsetMs,
    };
  }, [
    backgroundAudioWav,
    backgroundMuted,
    getAudioTimeOffset,
    backgroundOffsetMs,
  ]);

  const buildMixMasterBuffer = React.useCallback(
    (vocalBuf: ArrayBuffer) => {
      const vocalWav = new Wave(vocalBuf);
      const background = getMasterBackground();
      return mixMasterService.process({
        vocalWav,
        backgroundWav: background?.wav,
        offsetMs: background?.offsetMs ?? 0,
        extendToBackground: selectNotesIndex.length === 0,
        settings: mixMasterSettings,
      });
    },
    [
      mixMasterService,
      getMasterBackground,
      selectNotesIndex,
      mixMasterSettings,
    ],
  );

  const replaceMixPreviewUrl = React.useCallback((nextUrl?: string) => {
    if (mixPreviewUrlRef.current) {
      URL.revokeObjectURL(mixPreviewUrlRef.current);
    }
    mixPreviewUrlRef.current = nextUrl;
    setMixPreviewUrl(nextUrl);
  }, []);

  const generateMixPreview = React.useCallback(
    (vocalBuf: ArrayBuffer): string => {
      const mixedBuf = buildMixMasterBuffer(vocalBuf);
      return URL.createObjectURL(
        new File([mixedBuf], "preview.wav", { type: "audio/wav" }),
      );
    },
    [buildMixMasterBuffer],
  );

  const generateRawVocalPreview = React.useCallback((vocalBuf: ArrayBuffer) => {
    return URL.createObjectURL(
      new File([vocalBuf], "preview-vocal.wav", { type: "audio/wav" }),
    );
  }, []);

  const openMixMasterFlow = async (target: "play" | "download" | "movie") => {
    const vocalBuf = await synthesisVocalBuffer();
    if (!vocalBuf) {
      return;
    }
    setMixDialogBusy(true);
    setMixMasterTarget(target);
    setMixMasterVocalBuf(vocalBuf);
    replaceMixPreviewUrl(undefined);
    setMixMasterDialogOpen(true);
    try {
      const previewUrl = generateMixPreview(vocalBuf);
      replaceMixPreviewUrl(previewUrl);
    } catch (e) {
      LOG.error(`プレビュー生成失敗。${e.message}\n${e.stack}`, "EditorView");
      const fallbackUrl = generateRawVocalPreview(vocalBuf);
      replaceMixPreviewUrl(fallbackUrl);
      snackBarStore.setSeverity("error");
      snackBarStore.setValue(t("editor.synthesisError"));
      snackBarStore.setOpen(true);
    } finally {
      setMixDialogBusy(false);
    }
  };

  const handleMixPreview = async () => {
    if (!mixMasterVocalBuf) return;
    setMixDialogBusy(true);
    try {
      const previewUrl = generateMixPreview(mixMasterVocalBuf);
      replaceMixPreviewUrl(previewUrl);
    } catch (e) {
      LOG.error(`プレビュー生成失敗。${e.message}\n${e.stack}`, "EditorView");
      const fallbackUrl = generateRawVocalPreview(mixMasterVocalBuf);
      replaceMixPreviewUrl(fallbackUrl);
      snackBarStore.setSeverity("error");
      snackBarStore.setValue(t("editor.synthesisError"));
      snackBarStore.setOpen(true);
    } finally {
      setMixDialogBusy(false);
    }
  };

  const handleMixConfirm = async () => {
    if (!mixMasterVocalBuf) return;
    setMixDialogBusy(true);
    try {
      const mixedBuf = buildMixMasterBuffer(mixMasterVocalBuf);
      if (mixMasterTarget === "play") {
        const url = URL.createObjectURL(
          new File([mixedBuf], "temp.wav", { type: "audio/wav" }),
        );
        setWavUrl(url);
        setPlayReady(true);
      } else if (mixMasterTarget === "download") {
        const dataUrl = URL.createObjectURL(
          new File([mixedBuf], "output.wav", { type: "audio/wav" }),
        );
        LOG.gtag("download", {
          downloadName: vb.name,
          downloadType: "master",
        });
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "output.wav";
        a.click();
      } else {
        movieWavBufRef.current = mixedBuf;
        setMovieExportDialogOpen(true);
      }
      setMixMasterDialogOpen(false);
      setMixMasterVocalBuf(null);
      replaceMixPreviewUrl(undefined);
    } catch (e) {
      LOG.error(`マスタリング確定失敗。${e.message}\n${e.stack}`, "EditorView");
      snackBarStore.setSeverity("error");
      snackBarStore.setValue(t("editor.synthesisError"));
      snackBarStore.setOpen(true);
    } finally {
      setMixDialogBusy(false);
    }
  };

  /**
   * 動画エクスポートを実行する処理
   * 事前に handleDownload 内で合成済みの WAV を movieWavBufRef に格納してから呼び出すこと
   */
  const handleVideoExportConfirm = async (
    imageFile: File | null,
    resolution: VideoResolution,
    background: BackgroundOptions,
    bgPaddingMode: BgPaddingMode,
    bgImageOpacity: number,
    portraitOptions: PortraitOptions | null,
    mainTextOptions: TextOptions | null,
    subTextOptions: TextOptions | null,
    lyricsOptions: LyricsOptions | null,
    pianorollOptions: PianorollVideoOptions | null,
    waveformOptions: WaveformEffectOptions | null,
  ) => {
    setMovieExportDialogOpen(false);
    const wavBuf = movieWavBufRef.current;
    if (!wavBuf) return;
    movieWavBufRef.current = null;
    LOG.info("動画エクスポート開始 (MP4 生成)", "EditorView");
    // React の再レンダリングを一度環成させてダイアログの閉じるアニメーションを開始させる
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    setSynthesisProgress(true);
    try {
      const mp4Buf = await generateMp4(
        wavBuf,
        imageFile,
        resolution,
        background,
        bgPaddingMode,
        bgImageOpacity,
        portraitOptions,
        mainTextOptions,
        subTextOptions,
        lyricsOptions,
        pianorollOptions ?? undefined,
        waveformOptions ?? undefined,
        (current, total) => {
          setSynthesisCount(current);
          setVideoExportTotal(total);
        },
      );
      setSynthesisProgress(false);
      setVideoExportTotal(undefined);
      LOG.gtag("movieDownload", {
        downloadName: vb.name,
        format: "mp4",
        resolution,
        bgPaddingMode,
        hasPianoroll: Boolean(pianorollOptions?.enabled),
        hasPortrait: Boolean(portraitOptions),
        hasMainText: Boolean(mainTextOptions),
        hasSubText: Boolean(subTextOptions),
        hasLyrics: Boolean(lyricsOptions),
      });
      const dataUrl = URL.createObjectURL(
        new File([mp4Buf], "output.mp4", { type: "video/mp4" }),
      );
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "output.mp4";
      a.click();
    } catch (e) {
      setSynthesisProgress(false);
      setVideoExportTotal(undefined);
      LOG.error(
        `動画エクスポートの失敗。${e.message}\n${e.stack}`,
        "EditorView",
      );
      snackBarStore.setSeverity("error");
      snackBarStore.setValue(t("editor.videoExport.notSupported"));
      snackBarStore.setOpen(true);
    }
  };

  /**
   * wavをダウンロードする際の動作
   */
  const handleDownload = async () => {
    if (synthesisProgress) {
      LOG.warn(
        "handleDownload UI上クリックできないはず。何かがおかしい",
        "EditorView",
      );
      return;
    }
    setPlayReady(false);

    if (exportMode === "movie") {
      await openMixMasterFlow("movie");
      return;
    }

    let dataUrl: string | undefined;

    if (exportMode === "master") {
      await openMixMasterFlow("download");
      return;
    } else {
      /**
       * vocalモードは常に無加工vocalを再合成して出力する。
       * 既存wavUrlはmaster処理結果が含まれる可能性があるため使わない。
       */
      dataUrl = await synthesis();
      setSynthesisProgress(false);
    }

    if (dataUrl !== undefined) {
      LOG.gtag("download", {
        downloadName: vb.name,
        downloadType: "vocal",
      });
      // 合成処理に成功した場合のみ実行
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "output.wav";
      a.click();
    }
  };

  /**
   * wavを生成し再生する処理
   */
  const handlePlay = async () => {
    if (synthesisProgress) {
      LOG.warn(
        "handlePlay UI上クリックできないはず。何かがおかしい",
        "EditorView",
      );
      return;
    }
    LOG.gtag("play", { playName: vb.name });
    if (playMode === "master") {
      await openMixMasterFlow("play");
      return;
    }
    if (wavUrl !== undefined) {
      LOG.info("再生開始", "EditorView");
      setPlaying(true);
      audioRef.current.play();
    } else {
      setPlayReady(true);
      if (backgroundAudioWav) {
        const realOffsetMs = getAudioTimeOffset() * 1000 - backgroundOffsetMs;
        await synthesis({
          wav: backgroundAudioWav,
          offsetMs: realOffsetMs,
          volume: backgroundVolume,
          mute: backgroundMuted,
        });
      } else {
        await synthesis();
      }
      setSynthesisProgress(false);
    }
  };

  /**
   * wavの再生を停止する処理
   */
  const handlePlayStop = () => {
    LOG.debug("再生終了", "EditorView");
    setPlaying(false);
    if (audioRef.current !== null) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (backgroundAudioRef.current !== null) {
      backgroundAudioRef.current.pause();
      backgroundAudioRef.current.currentTime = 0;
    }
    setPlayingMs(0);
  };

  /**
   * 再生にあわせてシークバーを動かす処理
   *
   * 頻繁に呼ばれる予定のためログは生成しない
   */
  const handleTimeUpdate = () => {
    setPlayingMs(audioRef.current.currentTime * 1000);
  };
  React.useEffect(() => {
    LOG.debug("wavUrlかplayReadyの更新を検知", "EditorView");
    if (wavUrl !== undefined && playReady) {
      LOG.info("再生開始", "EditorView");
      setPlayReady(false);
      setPlaying(true);
      audioRef.current.play();
    }
  }, [wavUrl, playReady]);

  /** 伴奏関係のデータが変更された際wavUrlを初期化する */
  React.useEffect(() => {
    LOG.debug("伴奏関係の設定変更を検知。wavUrlをクリア", "EditorView");
    setWavUrl(undefined);
  }, [
    backgroundOffsetMs,
    backgroundVolume,
    backgroundMuted,
    backgroundAudioWav,
  ]);

  /** playModeが変更された際wavUrlを初期化する */
  React.useEffect(() => {
    LOG.debug("playModeの変更を検知。wavUrlをクリア", "EditorView");
    setWavUrl(undefined);
  }, [playMode]);

  /** exportModeが変更された際wavUrlを初期化する */
  React.useEffect(() => {
    LOG.debug("exportModeの変更を検知。wavUrlをクリア", "EditorView");
    setWavUrl(undefined);
  }, [exportMode]);

  React.useEffect(() => {
    LOG.debug("mixMasterSettingsの変更を検知。wavUrlをクリア", "EditorView");
    setWavUrl(undefined);
  }, [mixMasterSettings]);

  React.useEffect(() => {
    return () => {
      if (mixPreviewUrlRef.current) {
        URL.revokeObjectURL(mixPreviewUrlRef.current);
      }
    };
  }, []);

  /** 現在選択中のノート部分に対して、伴奏のみを再生する処理 */
  const playBackgroundAudio = () => {
    LOG.info("伴奏のみ再生処理開始", "EditorView");
    // backgroundAudioRefが存在しない場合何もしない
    if (backgroundAudioRef.current === null) return;
    // ノートを選択していない場合何もしない
    if (selectNotesIndex.length === 0) return 0;
    /** 選択範囲の最小インデックス */
    const minIndex = Math.min(...selectNotesIndex);
    /** 選択範囲の最大インデックス */
    const maxIndex = Math.max(...selectNotesIndex);
    if (minIndex < 0 || minIndex >= notesLeftMs.length) return 0;
    /** 選択されたノートの最初の時間 */
    const noteOffsetMs = notesLeftMs[minIndex] - notes[minIndex].atPreutter;
    /** 選択されたノートの終了時間*/
    const noteEndMs = notesLeftMs[maxIndex] + notes[maxIndex].msLength;
    /** 再生開始時間、0でクランプ */
    const playStartMs = Math.max(0, noteOffsetMs - backgroundOffsetMs);
    /** 再生終了時間、オーディオ長でクランプ */
    const playEndMs = Math.min(
      noteEndMs - backgroundOffsetMs,
      (backgroundAudioRef.current.duration ?? Infinity) * 1000,
    );
    LOG.debug(`再生範囲: ${playStartMs} ms から ${playEndMs} ms`, "EditorView");
    setBackgroundPlayEndMs(playEndMs);
    // 再生時間をセット
    backgroundAudioRef.current.currentTime = playStartMs / 1000;
    // 音量セット
    backgroundAudioRef.current.volume = backgroundVolume;
    // 単体再生のため必ずミュート解除
    backgroundAudioRef.current.muted = false;
    // 再生
    backgroundAudioRef.current.play();
    setPlaying(true);
  };

  /** ノートの末尾から、指定時間伴奏を再生する処理 */
  const playBackgroundAudioFromNotesEnd = () => {
    // backgroundAudioRefが存在しない場合何もしない
    if (backgroundAudioRef.current === null) return;

    const lastNoteIndex = notes.length - 1;
    /** 再生開始時間=最後のノートの末尾。notes.length===0の場合は0 */
    const playStartMs =
      notes.length === 0
        ? 0
        : notesLeftMs[lastNoteIndex] + notes[lastNoteIndex].msLength;
    /** 小節数`backgroundPlayDuration`とBPM`notes[lastNoteIndex].tempo`を使って再生時間(ms)を求める。 */
    const backgroundPlayDurationMs =
      backgroundPlayDuration * (60000 / notes[lastNoteIndex].tempo) * 4;
    // 再生終了時間 playStartMs + backgroundPlayDurationMs、オーディオ長でクランプ
    const playEndMs = Math.min(
      playStartMs + backgroundPlayDurationMs,
      (backgroundAudioRef.current.duration ?? Infinity) * 1000,
    );
    LOG.debug(`再生範囲: ${playStartMs} ms から ${playEndMs} ms`, "EditorView");
    setBackgroundPlayEndMs(playEndMs);
    // 再生時間をセット
    backgroundAudioRef.current.currentTime = playStartMs / 1000;
    // 音量セット
    backgroundAudioRef.current.volume = backgroundVolume;
    // 単体再生のため必ずミュート解除
    backgroundAudioRef.current.muted = false;
    // 再生
    backgroundAudioRef.current.play();
    setPlaying(true);
  };

  /** バックグラウンドaudioの更新を検知し、終了時間を超えたら停止する処理 */
  const handleBackgroundAudioTimeUpdate = () => {
    setPlayingMs(backgroundAudioRef.current.currentTime * 1000);
    if (backgroundAudioRef.current.currentTime * 1000 >= backgroundPlayEndMs) {
      LOG.debug(
        `伴奏再生終了。終了時間: ${
          backgroundAudioRef.current.currentTime * 1000
        } ms`,
        "EditorView",
      );
      backgroundAudioRef.current.pause();
      setPlaying(false);
      setPlayingMs(0);
    }
  };

  return (
    <>
      <Pianoroll
        playing={playing}
        playingMs={playingMs}
        selectedNotesIndex={selectNotesIndex}
        setSelectedNotesIndes={setSelectNotesIndex}
        selectMode={selectMode}
        pitchTargetIndex={pitchTargetIndex}
        setPitchTargetIndex={setPitchTargetIndex}
        lyricTargetIndex={lyricTargetIndex}
        setLyricTargetIndex={setLyricTargetIndex}
        setTargetPoltament={setTargetPoltament}
        targetPoltament={targetPoltament}
        addNoteLength={addNoteLength}
        addNoteLyric={addNoteLyric}
        setNotesLeftMs={setNotesLeftMs}
        backgroundAudioWav={backgroundAudioWav}
        backgroundWavOffsetMs={backgroundOffsetMs}
      />
      <br />
      <br />
      <FooterMenu
        selectedNotesIndex={selectNotesIndex}
        setSelectedNotesIndex={setSelectNotesIndex}
        handlePlay={handlePlay}
        handleDownload={handleDownload}
        synthesisCount={synthesisCount}
        synthesisProgress={synthesisProgress}
        videoExportTotal={videoExportTotal}
        playing={playing}
        handlePlayStop={handlePlayStop}
        selectMode={selectMode}
        setSelectMode={setSelectMode}
        backgroundAudioWav={backgroundAudioWav}
        setBackgroundAudioWav={setBackgroundAudioWav}
        backgroundWavUrl={backgroundWavUrl}
        setBackgroundWavUrl={setBackgroundWavUrl}
        backgroundOffsetMs={backgroundOffsetMs}
        setBackgroundOffsetMs={setBackgroundOffsetMs}
        backgroundVolume={backgroundVolume}
        setBackgroundVolume={setBackgroundVolume}
        backgroundMuted={backgroundMuted}
        setBackgroundMuted={setBackgroundMuted}
        playBackgroundAudio={playBackgroundAudio}
        playBackgroundAudioFromNotesEnd={playBackgroundAudioFromNotesEnd}
        setBackgroundPlayDuration={setBackgroundPlayDuration}
      />
      {selectMode === "pitch" && (
        <PitchPortal
          targetIndex={targetPoltament}
          note={notes[pitchTargetIndex]}
        />
      )}

      {selectMode === "add" && (
        <AddNotePortal
          addNoteLength={addNoteLength}
          addNoteLyric={addNoteLyric}
          setAddNoteLength={setAddNoteLength}
          setAddNoteLyric={setAddNoteLyric}
        />
      )}
      {wavUrl !== undefined && (
        <>
          <audio
            src={wavUrl}
            ref={audioRef}
            data-testid="audio"
            onEnded={handlePlayStop}
            onTimeUpdate={handleTimeUpdate}
          ></audio>
        </>
      )}
      {backgroundWavUrl !== undefined && (
        <>
          <audio
            src={backgroundWavUrl}
            ref={backgroundAudioRef}
            data-testid="background-audio"
            onEnded={() => setPlaying(false)}
            onTimeUpdate={handleBackgroundAudioTimeUpdate}
          ></audio>
        </>
      )}
      <MixMasterDialog
        open={mixMasterDialogOpen}
        settings={mixMasterSettings}
        previewUrl={mixPreviewUrl}
        loading={mixDialogBusy}
        onClose={() => {
          setMixMasterDialogOpen(false);
          setMixMasterVocalBuf(null);
          replaceMixPreviewUrl(undefined);
        }}
        onChange={(settings) =>
          setMixMasterSettings(cloneMixMasterSettings(settings))
        }
        onPreview={handleMixPreview}
        onConfirm={handleMixConfirm}
      />
      <VideoExportDialog
        open={movieExportDialogOpen}
        onClose={() => setMovieExportDialogOpen(false)}
        onConfirm={handleVideoExportConfirm}
        synthesisProgress={synthesisProgress}
        portraitBlob={
          vb?.portrait ? new Blob([vb.portrait], { type: "image/png" }) : null
        }
        portraitNaturalHeight={vb?.portraitHeight}
        voiceIcon={vb?.image}
        notes={notes}
        notesLeftMs={notesLeftMs}
        selectNotesIndex={selectNotesIndex}
      />
    </>
  );
};

export const CheckWorkerReady = (synthesisWorker: SynthesisWorker): boolean => {
  return synthesisWorker.workersPool.workers.every(
    (w) => w.worker.isReady !== true,
  );
};

import React from "react";
import { useTranslation } from "react-i18next";
import { EDITOR_CONFIG } from "../../config/editor";
import { LOG } from "../../lib/Logging";
import { resampCache } from "../../lib/ResampCache";
import { SynthesisWorker } from "../../services/synthesis";
import { useCookieStore } from "../../store/cookieStore";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import { useSnackBarStore } from "../../store/snackBarStore";
import { AddNotePortal } from "./AddNotePortal";
import { FooterMenu } from "./FooterMenu/FooterMenu";
import { Pianoroll } from "./Pianoroll/Pianoroll";
import { PitchPortal } from "./PitchPortal/PitchPortal";

export const EditorView: React.FC = () => {
  const { t } = useTranslation();
  const { vb, notes, ustFlags, setNote } = useMusicProjectStore();
  const { defaultNote } = useCookieStore();
  const synthesisWorker = React.useMemo(() => new SynthesisWorker(), []);
  /**
   * ノートのインデックス一覧
   */
  const [selectNotesIndex, setSelectNotesIndex] = React.useState<Array<number>>(
    []
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
  const [selectMode, setSelectMode] = React.useState<
    "toggle" | "range" | "pitch" | "add"
  >("toggle");
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
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const snackBarStore = useSnackBarStore();

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    LOG.debug("vbかnotesかselectNotesIndexの更新を検知", "EditorView");
    LOG.debug("生成済みwavのクリア", "EditorView");
    setWavUrl(undefined);
  }, [vb, notes, selectNotesIndex]);

  React.useEffect(() => {
    LOG.debug("vbの更新を検知。全てのキャッシュクリア", "EditorView");
    resampCache.clear();
    makeCache();
  }, [vb]);

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
    notes.forEach((n) => {
      const request = n.getRequestParam(vb, ustFlags, defaultNote);
      if (request.resamp === undefined) return;
      const key = resampCache.createKey(request.resamp);
      if (!resampCache.checkKey(n.index, key)) {
        LOG.debug(
          `キャッシュ生成のために、既存のタスクのキャンセル。index:${n.index}`,
          "EditorView"
        );
        synthesisWorker.clearTask(n.index);
        LOG.debug(`キャッシュ生成開始。index:${n.index}`, "EditorView");
        synthesisWorker.resamp(request, vb, n.index).catch((error) => {
          LOG.error(
            `キャッシュ生成の失敗。input:${JSON.stringify(
              request.resamp
            )},error:${error.message}\n${error.stack}}`,
            "EditorView"
          );
        });
      }
    });
  };

  /** playとwavdownloadの共通処理 */
  const synthesis = async () => {
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
        setSynthesisCount
      );
      LOG.gtag("synthesis", {
        wavSize: wavBuf.byteLength,
        synthesisTime: Date.now() - synthesisStartTime,
      });
      const wavUrl_ = URL.createObjectURL(
        new File([wavBuf], "temp.wav", { type: "audio/wav" })
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

  /**
   * wavをダウンロードする際の動作
   */
  const handleDownload = async () => {
    if (synthesisProgress) {
      LOG.warn(
        "handleDownload UI上クリックできないはず。何かがおかしい",
        "EditorView"
      );
      return;
    }
    setPlayReady(false);
    const dataUrl = wavUrl ?? (await synthesis());
    setSynthesisProgress(false);
    if (dataUrl !== undefined) {
      LOG.gtag("download");
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
        "EditorView"
      );
      return;
    }
    if (wavUrl !== undefined) {
      LOG.info("再生開始", "EditorView");
      LOG.gtag("play");
      setPlaying(true);
      audioRef.current.play();
    } else {
      setPlayReady(true);
      await synthesis();
      setSynthesisProgress(false);
    }
  };

  /**
   * wavの再生を停止する処理
   */
  const handlePlayStop = () => {
    LOG.debug("再生終了", "EditorView");
    setPlaying(false);
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
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
        setTargetPoltament={setTargetPoltament}
        targetPoltament={targetPoltament}
        addNoteLength={addNoteLength}
        addNoteLyric={addNoteLyric}
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
        playing={playing}
        handlePlayStop={handlePlayStop}
        selectMode={selectMode}
        setSelectMode={setSelectMode}
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
    </>
  );
};

import React from "react";
import { useTranslation } from "react-i18next";
import { LOG } from "../../lib/Logging";
import { resampCache } from "../../lib/ResampCache";
import { SynthesisWorker } from "../../services/synthesis";
import { useCookieStore } from "../../store/cookieStore";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import { useSnackBarStore } from "../../store/snackBarStore";
import { FooterMenu } from "./FooterMenu/FooterMenu";
import { Pianoroll } from "./Pianoroll/Pianoroll";

export const EditorView: React.FC = () => {
  const { t } = useTranslation();
  const { vb, notes, ustFlags } = useMusicProjectStore();
  const { defaultNote } = useCookieStore();
  const synthesisWorker = React.useMemo(() => new SynthesisWorker(), []);
  /**
   * ノートのインデックス一覧
   *
   * TODO 将来的にはピアノロールビューにてノートを選択できるようにする。
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
  const [playingMs, setPlayingMs] = React.useState<number>(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const snackBarStore = useSnackBarStore();

  React.useEffect(() => {
    LOG.debug("vbかnotesの更新を検知", "EditorView");
    LOG.debug("生成済みwavのクリア", "EditorView");
    setWavUrl(undefined);
  }, [vb, notes]);

  React.useEffect(() => {
    LOG.debug("vbの更新を検知。全てのキャッシュクリア", "EditorView");
    resampCache.clear();
    makeCache();
  }, [vb]);

  React.useEffect(() => {
    LOG.debug("notesかustFlagsかdefaultNoteの更新検知", "EditorView");
    makeCache();
  }, [notes, ustFlags, defaultNote]);

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
    setSynthesisProgress(true);
    LOG.info("wavファイル生成完了", "EditorView");
    try {
      setSynthesisCount(0);
      const wavBuf = await synthesisWorker.synthesis(
        selectNotesIndex,
        setSynthesisCount
      );
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
      />
      <br />
      <br />
      <FooterMenu
        selectedNotesIndex={selectNotesIndex}
        handlePlay={handlePlay}
        handleDownload={handleDownload}
        synthesisCount={synthesisCount}
        synthesisProgress={synthesisProgress}
        playing={playing}
        handlePlayStop={handlePlayStop}
      />
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

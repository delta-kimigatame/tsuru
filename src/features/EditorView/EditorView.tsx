import React from "react";
import { useTranslation } from "react-i18next";
import { LOG } from "../../lib/Logging";
import { SynthesisWorker } from "../../services/synthesis";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import { useSnackBarStore } from "../../store/snackBarStore";
import { FooterMenu } from "./FooterMenu/FooterMenu";
import { Pianoroll } from "./Pianoroll/Pianoroll";

export const EditorView: React.FC = () => {
  const { t } = useTranslation();
  const { vb, notes } = useMusicProjectStore();
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
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const snackBarStore = useSnackBarStore();

  React.useEffect(() => {
    LOG.debug("vbかnotesの更新を検知", "EditorView");
    LOG.debug("生成済みwavのクリア", "EditorView");
    setWavUrl(undefined);
  }, [vb, notes]);

  /** playとwavdownloadの共通処理 */
  const synthesis = async () => {
    LOG.info("wavファイル生成", "EditorView");
    setSynthesisProgress(true);
    LOG.info("wavファイル生成完了", "EditorView");
    /** TODO
     * synthesisにsetSynthesisCountを渡せるようにする
     *
     * synthesisからさらにappendにsetSynthesisCountを渡し、appendのループを使って値を更新する
     */
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
      LOG.error(`合成処理の失敗。${e.message}`, "EditorView");
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
      audioRef.current.play();
    } else {
      setPlayReady(true);
      await synthesis();
      setSynthesisProgress(false);
    }
  };

  React.useEffect(() => {
    LOG.debug("wavUrlかplayReadyの更新を検知", "EditorView");
    if (wavUrl !== undefined && playReady) {
      LOG.info("再生開始", "EditorView");
      setPlayReady(false);
      audioRef.current.play();
    }
  }, [wavUrl, playReady]);
  return (
    <>
      <Pianoroll />
      <br />
      <br />
      <FooterMenu
        selectedNotesIndex={[]}
        handlePlay={handlePlay}
        handleDownload={handleDownload}
        synthesisCount={synthesisCount}
        synthesisProgress={synthesisProgress}
      />
      {wavUrl !== undefined && (
        <>
          <audio src={wavUrl} ref={audioRef} data-testid="audio"></audio>
        </>
      )}
    </>
  );
};

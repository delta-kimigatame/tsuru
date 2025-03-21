import "@testing-library/jest-dom";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import fs from "fs";
import JSZip from "jszip";
import React from "react";
import { GenerateWave } from "utauwav";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PIANOROLL_CONFIG } from "../../../src/config/pianoroll";
import { EditorView } from "../../../src/features/EditorView/EditorView";
import { LOG } from "../../../src/lib/Logging";
import { Note } from "../../../src/lib/Note";
import { resampCache } from "../../../src/lib/ResampCache";
import { Ust } from "../../../src/lib/Ust";
import { VoiceBank } from "../../../src/lib/VoiceBanks/VoiceBank";
import { SynthesisWorker } from "../../../src/services/synthesis";
import { useCookieStore } from "../../../src/store/cookieStore";
import { useMusicProjectStore } from "../../../src/store/musicProjectStore";
import { useSnackBarStore } from "../../../src/store/snackBarStore";
import { defaultParam } from "../../../src/types/note";
const createMinimumNote = (): Note => {
  const n = new Note();
  n.length = 480;
  n.lyric = "あ";
  n.tempo = 120;
  n.hasTempo = false;
  n.notenum = 60;
  return n;
};

describe("EditorView", () => {
  const getRequestParamSpy = vi
    .spyOn(Note.prototype, "getRequestParam")
    .mockImplementation((vb, ustFlags, defaultValue) => {
      // ダミーのResampRequestオブジェクトを返す例
      return {
        resamp: {
          inputWav: "dummy.wav",
          targetTone: "C4",
          velocity: 100,
          flags: "dummyFlags",
          offsetMs: 0,
          targetMs: 1000,
          fixedMs: 0,
          cutoffMs: 0,
          intensity: 100,
          modulation: 0,
          tempo: "120",
          pitches: "dummyPitches",
        },
      };
    });
  beforeEach(async () => {
    vi.resetAllMocks();
    window.scrollTo = vi.fn();
    // グローバルストアの状態は各ストアの単体テストで検証済みとして、ここでは必要最低限の初期化だけを行う
    const store = useMusicProjectStore.getState();
    store.setUst({} as Ust);
    store.setNotes([createMinimumNote(), createMinimumNote()]);
    LOG.clear();
    resampCache.clear();

    //vbについてはust読み込み時等の動作を考えると複雑なモックが必要になるため、実際のvbをロードしておく
    const buffer = fs.readFileSync(
      "./__tests__/__fixtures__/minimumTestVB.zip"
    );
    const zip = new JSZip();
    const td = new TextDecoder("shift-jis");
    await zip.loadAsync(buffer, {
      // @ts-expect-error 型の方がおかしい
      decodeFileName: (fileNameBinary: Uint8Array) => td.decode(fileNameBinary),
    });
    const vb = new VoiceBank(zip.files);
    await vb.initialize();
    store.setVb(vb);
  });

  it("初期状態ではwavUrlが未設定なので、audio要素が描画されていない", () => {
    render(<EditorView />);
    const audioElem = screen.queryByTestId("audio");
    expect(audioElem).toBeNull();
  });

  it("初期状態ではsynthesisProgressがfalseのため、FooterMenuのWAV保存タブは通常のラベルが表示される", async () => {
    render(<EditorView />);
    const wavTab = await screen.findByRole("tab", {
      name: /editor\.footer\.play/i,
    });
    // タブ内に CircularProgress を示す要素（role="progressbar" など）が含まれていないことを確認
    const progressIndicator = within(wavTab).queryByRole("progressbar");
    expect(progressIndicator).toBeNull();
    // なお、テスト環境によってはDownloadIconはSVG要素として表示されるため、
    // ここでは主に進捗インジケーターが表示されないことを確認する
  });

  it("初期状態ではplayingがfalseのため、FooterMenuの再生タブはPlayArrowアイコンが表示され、Pianorollのseekbarは描画されていない", async () => {
    render(<EditorView />);
    // 再生タブ（"再生"というラベル）を取得
    const playTab = await screen.findByRole("tab", {
      name: /editor\.footer\.play/i,
    });
    // PlayArrowアイコンが表示されていることを、タブ内のテキストや属性から確認
    expect(playTab).toHaveTextContent(/editor\.footer\.play/i);
    expect(playTab).not.toHaveTextContent(/editor\.footer\.playStop/i);

    // Pianorollについては、初期状態ではplayingがfalseなので、seekbarがレンダリングされないはず
    // ここでは、Pianoroll内のseekbarのコンテナにdata-testid="pianoroll-seekbar"を追加してあると仮定する
    const seekbar = screen.queryByTestId("pianoroll-seekbar");
    expect(seekbar).toBeNull();
  });

  it("初回レンダリング時に、[vb, notes]依存のuseEffectが実行されるはず", async () => {
    render(<EditorView />);
    expect(LOG.datas.some((d) => d.includes("生成済みwavのクリア"))).toBe(true);
  });

  it("初回レンダリング時に、[notes,ustFlags,defaultNote]依存のuseEffectが実行されるはず", async () => {
    render(<EditorView />);
    expect(
      LOG.datas.some((d) =>
        d.includes("notesかustFlagsかdefaultNoteの更新検知")
      )
    ).toBe(true);
  });
  it("初回レンダリング時に、[wavUrl, playReady]依存のuseEffectが実行されるはず", async () => {
    render(<EditorView />);
    expect(
      LOG.datas.some((d) => d.includes("wavUrlかplayReadyの更新を検知"))
    ).toBe(true);
  });

  it("vbの更新でキャッシュクリア用のuseEffectとmakeCacheが呼ばれるはず", async () => {
    render(<EditorView />);
    // vb更新により、'vbの更新を検知。全てのキャッシュクリア' のログが出力されるはず
    act(() => {
      LOG.clear(); //初回レンダリング時に検証対象のログが出るためいったん削除
      useMusicProjectStore.setState({ vb: {} as VoiceBank });
    });
    expect(
      LOG.datas.some((d) =>
        d.includes("vbの更新を検知。全てのキャッシュクリア")
      )
    ).toBe(true);
    // makeChacheの検知用。vbが非nullでnotes.length!==0なら必ず呼ばれるはず
    expect(getRequestParamSpy).toHaveBeenCalled();
  });

  it("notesの更新でmakeCache用のuseEffectが呼ばれる", async () => {
    render(<EditorView />);
    // notes更新により、'notesかustFlagsかdefaultNoteの更新検知' のログが出力されるはず
    const dummyNotes = [
      createMinimumNote(),
      createMinimumNote(),
      createMinimumNote(),
    ];
    act(() => {
      LOG.clear(); //初回レンダリング時に検証対象のログが出るためいったん削除
      useMusicProjectStore.setState({ notes: dummyNotes });
    });
    expect(
      LOG.datas.some((d) =>
        d.includes("notesかustFlagsかdefaultNoteの更新検知")
      )
    ).toBe(true);
    // makeChacheの検知用。vbが非nullでnotes.length!==0なら必ず呼ばれるはず
    expect(getRequestParamSpy).toHaveBeenCalled();
  });
  it("ustFlagsの更新でmakeCache用のuseEffectが呼ばれる", async () => {
    render(<EditorView />);
    act(() => {
      LOG.clear(); //初回レンダリング時に検証対象のログが出るためいったん削除
      useMusicProjectStore.setState({ ustFlags: "B50" });
    });
    expect(
      LOG.datas.some((d) =>
        d.includes("notesかustFlagsかdefaultNoteの更新検知")
      )
    ).toBe(true);
    // makeChacheの検知用。vbが非nullでnotes.length!==0なら必ず呼ばれるはず
    expect(getRequestParamSpy).toHaveBeenCalled();
  });
  it("defaultNoteの更新でmakeCache用のuseEffectが呼ばれる", async () => {
    render(<EditorView />);
    act(() => {
      LOG.clear(); //初回レンダリング時に検証対象のログが出るためいったん削除
      useCookieStore.setState({ defaultNote: {} as defaultParam });
    });
    expect(
      LOG.datas.some((d) =>
        d.includes("notesかustFlagsかdefaultNoteの更新検知")
      )
    ).toBe(true);
    // makeChacheの検知用。vbが非nullでnotes.length!==0なら必ず呼ばれるはず
    expect(getRequestParamSpy).toHaveBeenCalled();
  });

  it("WAV保存タブをクリックすると、合成進捗が '0/2' と表示されるタブが2つ見つかる", async () => {
    render(<EditorView />);
    // "editor.footer.wav" タブ（WAV保存タブ）を探してクリックする
    const wavTab = await screen.findByRole("tab", {
      name: /editor\.footer\.wav/i,
    });
    fireEvent.click(wavTab);

    // synthesisProgressがtrueの場合、WAV保存と再生タブに '0/2' が表示されるので、
    // その表示されるタブが2つあることを確認する
    const progressTabs = await screen.findAllByRole("tab", { name: /0\/2/i });
    expect(progressTabs).toHaveLength(2);
  });

  it("synthesis処理完了後、wavUrlが設定され、synthesisProgressがfalseになり、ダウンロード処理が実行される", async () => {
    // SynthesisWorker.prototype.synthesis をモックして、dummyBuffer を返す
    const dummyBuffer = new ArrayBuffer(8);
    const synthesisSpy = vi
      .spyOn(SynthesisWorker.prototype, "synthesis")
      .mockResolvedValue(dummyBuffer);

    // document.createElement("a") をモックして、click が呼ばれるか確認する
    const originalCreateElement = document.createElement.bind(document);
    const aClickSpy = vi.fn();
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tag: string) => {
        if (tag === "a") {
          return {
            href: "",
            download: "",
            click: aClickSpy,
          } as unknown as HTMLElement;
        }
        return originalCreateElement(tag);
      });

    // EditorView をレンダリングする
    render(<EditorView />);

    // "WAV保存" タブ（ラベルが "editor.footer.wav"）をクリックする
    const downloadTab = await screen.findByRole("tab", {
      name: /editor\.footer\.wav/i,
    });
    fireEvent.click(downloadTab);

    // 非同期処理が完了するまで待つ（synthesisが呼ばれ、wavUrlが設定される）
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // wavUrlが設定されているので、audio要素が描画されていることを確認
    const audioElem = screen.getByTestId("audio");
    expect(audioElem).toBeInTheDocument();

    // synthesisProgressが完了して false になっている（タブが有効になっている）ことを確認
    expect(downloadTab).not.toHaveAttribute("disabled");

    // ダウンロード処理内で a 要素が生成され、click() が呼ばれていることを確認
    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(aClickSpy).toHaveBeenCalled();

    // モックのクリーンアップ
    createElementSpy.mockRestore();
    synthesisSpy.mockRestore();
  });
  it("エラー発生時に、snackBarStoreの状態が適切に更新され、synthesisProgressがfalseになり、aClickSpyが呼ばれない", async () => {
    // SynthesisWorker.synthesisをエラーを返すようにモックする
    const synthesisSpy = vi
      .spyOn(SynthesisWorker.prototype, "synthesis")
      .mockRejectedValue(new Error("dummy error"));

    // document.createElement("a")のclickメソッドの呼び出しを確認するためのモック
    const originalCreateElement = document.createElement.bind(document);
    const aClickSpy = vi.fn();
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tag: string) => {
        if (tag === "a") {
          return {
            href: "",
            download: "",
            click: aClickSpy,
          } as unknown as HTMLElement;
        }
        return originalCreateElement(tag);
      });

    // EditorViewをレンダリングする
    render(<EditorView />);

    // "WAV保存"タブを探してクリックする（handleDownloadが呼ばれる）
    const downloadTab = await screen.findByRole("tab", {
      name: /editor\.footer\.wav/i,
    });
    fireEvent.click(downloadTab);

    // 非同期処理完了まで待機（短い待機でOK）
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // snackBarStoreの状態を取得して確認する
    const snackBarState = useSnackBarStore.getState();
    expect(snackBarState.severity).toBe("error");
    expect(snackBarState.value).toBe("editor.synthesisError");
    expect(snackBarState.open).toBe(true);

    // エラー発生後、synthesisProgressがfalseになっている（内部状態としてエラーログから間接検証）
    expect(LOG.datas.some((d) => d.includes("合成処理の失敗"))).toBe(true);

    // aClickSpyは呼ばれていないことを確認
    expect(aClickSpy).not.toHaveBeenCalled();
    // モックのクリーンアップ
    createElementSpy.mockRestore();
    synthesisSpy.mockRestore();
  });

  it("再生・停止のシナリオ：wavUrlが存在する場合、再生と停止の動作が正しく切り替わる", async () => {
    // ダミーwavBufを生成（1秒分のサンプル）
    const dummyWavBuf = GenerateWave(44100, 16, Array(44100).fill(0)).Output();

    // SynthesisWorker.synthesisが呼ばれた場合、dummyWavBufを返すようにモック
    const synthesisSpy = vi
      .spyOn(SynthesisWorker.prototype, "synthesis")
      .mockResolvedValue(dummyWavBuf);

    // EditorViewをレンダリング
    render(<EditorView />);

    // 初回、"editor.footer.play"タブをクリック
    const playTabBefore = await screen.findByRole("tab", {
      name: /editor\.footer\.play/i,
    });
    fireEvent.click(playTabBefore);
    // 非同期処理が完了するまで待つ（synthesisが呼ばれ、wavUrlが設定される）
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // wavUrlが設定されているので、audio要素が描画されていることを確認
    const audioElem = screen.getByTestId("audio");
    expect(audioElem).toBeInTheDocument();

    // wavUrl更新に伴い、内部で再生開始が行われ、LOGに"再生開始"が出るはず
    await waitFor(() => {
      expect(LOG.datas.some((data) => data.includes("再生開始"))).toBe(true);
    });

    // playingがtrueとなるため、"editor.footer.playStop"タブが表示される
    const playStopTab = await screen.findByRole("tab", {
      name: /editor\.footer\.playStop/i,
    });
    expect(playStopTab).toBeInTheDocument();

    // audio要素のonEndedイベントをシミュレートし、再生停止状態にする
    fireEvent.ended(audioElem);

    // onEnded後、playingがfalseとなり"editor.footer.play"タブが再び表示される
    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: /editor\.footer\.play/i })
      ).toBeInTheDocument();
    });

    // LOGをクリア
    LOG.clear();

    // 既にwavUrlがあるため、再度"editor.footer.play"タブをクリックすると synthesis は呼ばれず再生が開始される
    const playTabAgain = screen.getByRole("tab", {
      name: /editor\.footer\.play/i,
    });
    fireEvent.click(playTabAgain);
    await waitFor(() => {
      expect(LOG.datas.some((data) => data.includes("再生開始"))).toBe(true);
    });

    // 次に、"editor.footer.playStop"タブをクリックして停止動作を実行
    const playStopTabAgain = screen.getByRole("tab", {
      name: /editor\.footer\.playStop/i,
    });
    fireEvent.click(playStopTabAgain);

    // 停止後、playingがfalseになり再び"editor.footer.play"タブが表示されるはず
    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: /editor\.footer\.play/i })
      ).toBeInTheDocument();
    });
  });

  it("再生タブ押下時、synthesisの正常完了によりaudio要素が表示され、seekbarのx座標が更新され、再生停止後にx座標がリセットされる", async () => {
    // ダミーwavバッファを返すモック
    const dummyWavBuf = GenerateWave(44100, 16, Array(44100).fill(0)).Output();
    const synthesisSpy = vi
      .spyOn(SynthesisWorker.prototype, "synthesis")
      .mockResolvedValue(dummyWavBuf);

    // グローバル状態はbeforeEachで初期化済みとする（notes.length===2等）
    render(<EditorView />);

    // "editor.footer.play"タブを取得してクリック（handlePlayが呼ばれる）
    const playTab = await screen.findByRole("tab", {
      name: /editor\.footer\.play/i,
    });
    fireEvent.click(playTab);

    // synthesis開始によりLOGに"再生開始"が出力されるのを待つ
    await waitFor(() => {
      expect(LOG.datas.some((d) => d.includes("再生開始"))).toBe(true);
    });

    // audio要素が表示され、初期状態ではseekbarのx座標は"0"
    const audioElem = screen.getByTestId("audio") as HTMLAudioElement;
    const seekbarLine = screen
      .getByTestId("pianoroll-seekbar")
      .querySelector("line");
    expect(seekbarLine?.getAttribute("x1")).toBe("0");

    // 再生中なので、playingはtrue（※内部状態はFooterMenuで検証済み）

    // audio.currentTimeを0.5に設定してonTimeUpdateを発火
    act(() => {
      audioElem.currentTime = 0.5;
      fireEvent.timeUpdate(audioElem);
    });

    // horizontalZoomは初期値1と仮定。期待値は 480 * NOTES_WIDTH_RATE * 1
    const expectedX = (480 * PIANOROLL_CONFIG.NOTES_WIDTH_RATE).toString();
    await waitFor(() => {
      expect(seekbarLine?.getAttribute("x1")).toBe(expectedX);
    });

    // "editor.footer.play"タブをクリックするとhandlePlayStopが呼ばれる（再生停止）
    fireEvent.click(playTab);

    // onEndedが呼ばれることを想定し、audio要素のcurrentTimeをリセット（simulate onEnded）
    act(() => {
      audioElem.dispatchEvent(new Event("ended"));
    });
    fireEvent.click(playTab);
    // 一度playingがFalseになってもとのseekBarはアンマウントされているはず。
    // 再度seekBarを取得する。
    const seekbarLineReset = screen
      .getByTestId("pianoroll-seekbar")
      .querySelector("line");

    // 再生停止後、seekbarのx座標は再び"0"になっているはず
    await waitFor(() => {
      expect(seekbarLineReset?.getAttribute("x1")).toBe("0");
    });
  });
});

import { renderingConfig } from "../config/rendering";
import { resampWorkersCount } from "../config/workers";
import { LOG } from "../lib/Logging";
import { resampCache } from "../lib/ResampCache";
import { VoiceBank } from "../lib/VoiceBanks/VoiceBank";
import { Wavtool } from "../lib/Wavtool";
import { useCookieStore } from "../store/cookieStore";
import { useMusicProjectStore } from "../store/musicProjectStore";
import { AppendRequestBase, ResampRequest } from "../types/request";
import { ResampWorkerPool } from "./workerPool";

export class SynthesisWorker {
  /**
   * 設定ファイルで定義された数のresampworkerを予めloadしておき、適切にタスクを割り振るためのworker pool
   */
  workersPool: ResampWorkerPool;

  /**
   * resamplerの結果を格納し、wavtoolの実行順序を制御するためのque
   */
  resampResults: Array<Promise<Float64Array>>;

  /**
   * 音声合成における結合機
   */
  wavtool: Wavtool;

  /**
   * クラス初期化時にworker poolも初期化しておく
   */
  constructor() {
    LOG.debug("workerspoolの初期化", "synthesis,SynthesisWorker");
    this.workersPool = new ResampWorkerPool(resampWorkersCount);
    LOG.debug("wavtoolの初期化", "synthesis,SynthesisWorker");
    this.wavtool = new Wavtool();
  }

  /**
   * 編集中の楽譜データを用いて、wavファイルを生成する。
   * @param selectNotes 再生するノートのインデックス列。空の配列が渡された場合、全ノートが対象となる。
   * @returns 16bit/44100Hzのwavデータを表すArrayBuffer
   */
  synthesis = async (
    selectNotes: Array<number>,
    setSynthesisCount: (number) => void = (value) => {}
  ): Promise<ArrayBuffer> => {
    this.wavtool = new Wavtool();
    this.workersPool.clearTasks();
    const { vb, ust } = useMusicProjectStore.getState();
    const { defaultNote } = useCookieStore.getState();
    const requestParams = ust.getRequestParam(vb, defaultNote, selectNotes);
    const targetIndexes =
      selectNotes.length !== 0 ? selectNotes : ust.notes.map((n) => n.index);
    LOG.info("音声合成開始", "synthesis,SynthesisWorker");
    this.resampResults = requestParams.map((p, i) =>
      this.resamp(p, vb, targetIndexes[i])
    );
    await this.append(requestParams, 0, setSynthesisCount);
    LOG.info("音声合成終了", "synthesis,SynthesisWorker");
    /** 16bit/44100HzのWaveオブジェクトのbuffer */
    try {
      LOG.info("wavに変換", "synthesis,SynthesisWorker");
      const wavBuf = this.wavtool.output();
      return wavBuf;
    } catch (error) {
      LOG.error("wav変換に失敗しました", "synthesis,SynthesisWorker");
      throw error;
    }
  };

  /**
   * wavtoolに渡すためのwavデータ部分を表すFloat64ArrayのPromiseを返す。
   * 休符の場合0埋めで即解決し、音符の場合はresampWorkerに処理を渡して、完了次第解決する
   * @param param 合成パラメータ
   * @param vb 合成に使う音声ライブラリ
   * @param index 合成するノートのインデックス。キャッシュに使用
   * @returns 休符の場合0埋めで即解決し、音符の場合はresampWorkerの処理結果
   */
  resamp = async (
    param: {
      resamp: ResampRequest | undefined;
      append: AppendRequestBase;
    },
    vb: VoiceBank,
    index: number
  ): Promise<Float64Array> => {
    if (param.resamp === undefined) {
      /** 休符の場合0埋めで返す */
      const requireLength = Math.ceil(
        (param.append.length / 1000) * renderingConfig.frameRate
      );
      LOG.debug(`休符。長さ:${requireLength}`, "synthesis,SynthesisWorker");
      return new Float64Array(requireLength);
    } else {
      const key = resampCache.createKey(param.resamp);
      if (resampCache.checkKey(index, key)) {
        LOG.debug(
          `キャッシュヒット。index:${index},request:${JSON.stringify(
            param.resamp
          )}`,
          "synthesis,SynthesisWorker"
        );
        return resampCache.get(index, key);
      } else {
        LOG.debug(
          `workerpoolにセット。request:${JSON.stringify(param.resamp)}`,
          "synthesis,SynthesisWorker"
        );
        const promise = this.workersPool
          .runResamp(param.resamp, vb, index)
          .then((result) => {
            resampCache.set(index, key, result);
            return result;
          })
          .catch((error) => {
            if (error.message !== "Canceled") {
              throw error;
            }
            return new Float64Array(0);
          });
        return promise;
      }
    }
  };

  /**
   * ノートの頭から順番にwavを結合していき、全ての結合が終了したら解決するpromiseを返す
   * @param params 今回再生対象のすべての合成パラメータ
   * @param index 再帰的に呼び出した際、現在参照しているノートのインデックス
   * @returns appendの処理が完了したら解決するpromise
   */
  append = async (
    params: Array<{
      resamp: ResampRequest | undefined;
      append: AppendRequestBase;
    }>,
    index: number = 0,
    setSynthesisCount: (number) => void
  ): Promise<void> => {
    // 全てのタスクが処理済みの場合は終了
    if (index >= this.resampResults.length) {
      return;
    }
    let res: Float64Array;
    try {
      // 現在のノートのresamp結果を待つ
      res = await this.resampResults[index];
    } catch (error) {
      const errMsg = `resampResultsでエラー発生(index:${index}): ${error}`;
      LOG.error(errMsg, "synthesis,SynthesisWorker");
      throw new Error(errMsg);
    }
    try {
      LOG.debug(`wavtoolで結合。${index}`, "synthesis,SynthesisWorker");
      setSynthesisCount(index);
      this.wavtool.append({
        inputData: Array.from(res),
        ...params[index].append,
      });
      // 次のタスクを処理する
      await this.append(params, index + 1, setSynthesisCount);
    } catch (error) {
      const errMsg = `append処理でエラー発生(index:${index}): ${error}`;
      LOG.error(errMsg, "synthesis,SynthesisWorker");
      throw new Error(errMsg);
    }
  };

  /**
   * ノートインデックスを指定し、該当するタスクをキャンセルする
   * @param index ノートのインデックス
   */
  clearTask = (index: number) => {
    this.workersPool.clearTask(index);
  };
}

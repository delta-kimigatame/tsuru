import { renderingConfig } from "../config/rendering";
import { resampWorkersCount } from "../config/workers";
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
    this.workersPool = new ResampWorkerPool(resampWorkersCount);
    this.wavtool = new Wavtool();
  }

  /**
   * 編集中の楽譜データを用いて、wavファイルを生成する。
   * @param selectNotes 再生するノートのインデックス列。空の配列が渡された場合、全ノートが対象となる。
   * @returns 16bit/44100Hzのwavデータを表すArrayBuffer
   */
  synthesis = async (selectNotes: Array<number>): Promise<ArrayBuffer> => {
    const { vb, ust } = useMusicProjectStore.getState();
    const { defaultNote } = useCookieStore.getState();
    const requestParams = ust.getRequestParam(vb, defaultNote, selectNotes);
    this.resampResults = requestParams.map((p) => this.resamp(p, vb));
    await this.append(requestParams);
    /** 16bit/44100HzのWaveオブジェクトのbuffer */
    const wavBuf = this.wavtool.output();
    return wavBuf;
  };

  /**
   * wavtoolに渡すためのwavデータ部分を表すFloat64ArrayのPromiseを返す。
   * 休符の場合0埋めで即解決し、音符の場合はresampWorkerに処理を渡して、完了次第解決する
   * @param param 合成パラメータ
   * @param vb 合成に使う音声ライブラリ
   * @returns 休符の場合0埋めで即解決し、音符の場合はresampWorkerの処理結果
   */
  resamp = async (
    param: {
      resamp: ResampRequest | undefined;
      append: AppendRequestBase;
    },
    vb: VoiceBank
  ): Promise<Float64Array> => {
    if (param.resamp === undefined) {
      /** 休符の場合0埋めで返す */
      const requireLength = Math.ceil(
        (param.append.length / 1000) * renderingConfig.frameRate
      );
      return new Float64Array(requireLength);
    } else {
      return this.workersPool.runResamp(param.resamp, vb);
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
    index: number = 0
  ): Promise<void> => {
    // 全てのタスクが処理済みの場合は終了
    if (index >= this.resampResults.length) {
      return;
    }
    try {
      // 現在のノートのresamp結果を待つ
      const res = await this.resampResults[index];
      // 結果をwavtoolに追加
      console.log(`${index}`);
      this.wavtool.append({
        inputData: Array.from(res),
        ...params[index].append,
      });
      // 次のタスクを処理する
      await this.append(params, index + 1);
    } catch (error) {
      return Promise.reject(error);
    }
  };
}

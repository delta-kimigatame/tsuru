import { WaveProcessing } from "utauwav";
import { defaultParam } from "../types/note";
import { ResampRequest } from "../types/request";
import { Note } from "./Note";
import { VoiceBank } from "./VoiceBanks/VoiceBank";

/**
 * resamplerが出力した結果をキャッシュするためのシングルトン
 */
class ResampCache {
  private cache: { [index: number]: { key: string; data: Int16Array } };
  wp: WaveProcessing;
  constructor() {
    this.cache = {};
    this.wp = new WaveProcessing();
  }

  /**
   * indexとkeyの組がキャッシュされているか確認する
   * @param index noteのインデックス
   * @param key 対象noteのResampRequestを結合したキー
   * @returns indexが見つからなければfalse。indexとkeyの組が一致しなければfalse。一致すればtrue
   */
  checkKey = (index: number, key: string): boolean => {
    if (!(index in this.cache)) return false;
    return this.cache[index].key === key;
  };

  /**
   * インデックスが存在しないかインデックスとキャッシュの組が異なる場合キャッシュをInt16Arrayに変換して更新する
   * @param index noteのインデックス
   * @param key 対象noteのResampRequestを結合したキー
   * @param data 対象ノートのResamp出力。Float64Array
   */
  set = (index: number, key: string, data: Float64Array): void => {
    if (this.checkKey(index, key)) return;
    this.cache[index] = {
      key: key,
      data: Int16Array.from(
        this.wp.InverseLogicalNormalize(Array.from(data), 16)
      ),
    };
  };

  /**
   * 指定したインデックスとkeyがキャッシュに存在する場合、キャッシュのデータを最大1のFloat64Arrayに変換して返す
   * @param index noteのインデックス
   * @param key 対象noteのResampRequestを結合したキー
   * @returns 対象ノートのResamp出力。存在しない場合undefinedを返す
   */
  get = (index: number, key: string): Float64Array | undefined => {
    if (!this.checkKey(index, key)) return undefined;
    return Float64Array.from(
      this.wp.LogicalNormalize(Array.from(this.cache[index].data), 16)
    );
  };

  /**
   * resamplerのリクエストからキーを生成する
   * @param request resamplerのリクエスト
   * @returns キャッシュ用のキー
   */
  createKey = (request: ResampRequest): string => {
    return `${request.inputWav}|${request.targetTone}|${request.velocity}|${request.flags}|${request.offsetMs}|${request.targetMs}|${request.fixedMs}|${request.cutoffMs}|${request.intensity}|${request.modulation}|${request.tempo}|${request.pitches}`;
  };

  /**
   * ノートを与えてキャッシュの有無を確認する
   * @param note 確認対象のノート
   * @param vb UTAU音源
   * @param ustFlags ノートにフラグが設定されていない場合参照される楽譜全体のフラグ
   * @param defaultValue ノートに各値が設定されていない場合参照されるパラメータ
   * @returns ノートが休符の場合false,indexが存在しない場合やindexとキーの組が一致しない場合false,indexとキーの組が一致すればtrue
   */
  checkNote = (
    note: Note,
    vb: VoiceBank,
    ustFlags: string,
    defaultValue: defaultParam
  ): boolean => {
    const request = note.getRequestParam(vb, ustFlags, defaultValue).resamp;
    if (request === undefined) return false;
    return this.checkKey(note.index, this.createKey(request));
  };
}

export const resampCache = new ResampCache();

import { defaultParam } from "../types/note";
import { AppendRequestBase, ResampRequest } from "../types/request";
import { Note } from "./Note";
import { BaseVoiceBank } from "./VoiceBanks/BaseVoiceBank";

/**
 * phonemizerを作成するための抽象クラス
 *
 * このプロジェクトを継承した個別の処理はsrc/lib/Phonemizer[名前].tsに保存されることが期待されます。
 * phonemizer名はsrc/i18n/ja.tsなどの言語リソースファイルにおいて、phonemizer.[処理クラス名]に作成してください。
 */
export abstract class BasePhonemizer {
  /**
   * このphonemizerの名称
   */
  abstract name: string;

  constructor() {}

  /**
   * 合成に必要なパラメータを返す処理のphonemizer固有の実装部分
   * @param vb UTAU音源
   * @param note 合成するノート
   * @param flags プロジェクトのフラグ設定
   * @param defaultValue ノートのデフォルト値
   * @returns エンジンに渡すための値
   */
  protected abstract _getRequestParamm(
    vb: BaseVoiceBank,
    note: Note,
    flags: string,
    defaultValue: defaultParam
  ): {
    resamp: ResampRequest | undefined;
    append: AppendRequestBase;
  }[];
  /**
   * 内部ノートの最後の要素の長さを返す処理のphonemizer固有の実装部分
   * 内部ノートの最後の要素の長さは、次のノートの先行発声やオーバーラップを自動調節する処理に必要となる。
   * @param note 対象ノート
   * @returns ノート長(ms)
   */
  protected abstract _getLastLength(note: Note): number;

  /**
   * 内部ノートの最後のphonemeを返す処理のphonemizer固有の実装部分
   * @param note 対象ノート
   * @returns phoneme
   */
  protected abstract _getLastPhoneme(note: Note): string;

  /**
   * 原音設定値を読み込んでatPre,atOve,atStp,atAlias,atFileNameを更新する処理のphonemizer固有の実装部分
   * @param note 変更するノート
   * @param vb UTAU音源
   */
  protected abstract _applyOto(note: Note, vb: BaseVoiceBank): void;

  /**
   * pre,ove,stp,velocity,prev.length,prev.tempoを勘案して、atpre,atove,atstpを更新する処理のphonemizer固有の実装部分
   */
  protected abstract _autoFitParam(note: Note): void;

  /**
   * 合成に必要なパラメータを返す処理のエンドポイント
   * @param vb UTAU音源
   * @param note 合成するノート
   * @param flags プロジェクトのフラグ設定
   * @param defaultValue ノートのデフォルト値
   * @returns エンジンに渡すための値
   */
  public getRequestParam(
    vb: BaseVoiceBank,
    note: Note,
    flags: string,
    defaultValue: defaultParam
  ): {
    resamp: ResampRequest | undefined;
    append: AppendRequestBase;
  }[] {
    return this._getRequestParamm(vb, note, flags, defaultValue);
  }

  /**
   * 内部ノートの最後の要素の長さを返す処理のエンドポイント
   * 内部ノートの最後の要素の長さは、次のノートの先行発声やオーバーラップを自動調節する処理に必要となる。
   * @param note 対象ノート
   * @returns ノート長(ms)
   */
  public getLastLength(note: Note): number {
    return this._getLastLength(note);
  }

  /**
   * 内部ノートの最後のphonemeを返す処理のエンドポイント
   * @param note 対象ノート
   * @returns phoneme
   */
  public getLastPhoneme(note: Note | undefined): string {
    return this._getLastPhoneme(note);
  }

  /**
   * 原音設定値を読み込んでatPre,atOve,atStp,atAlias,atFileNameを更新する処理のエンドポイント
   * @param note 変更するノート
   * @param vb UTAU音源
   */
  public applyOto(note: Note, vb: BaseVoiceBank): void {
    this._applyOto(note, vb);
  }

  /**
   * pre,ove,stp,velocity,prev.length,prev.tempoを勘案して、atpre,atove,atstpを更新します。
   * @throws prev.length,prev.lyric,prev.tempoのいずれかが未定義の場合
   */
  public autoFitParam(note: Note): void {
    this._autoFitParam(note);
  }
}

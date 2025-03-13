import { CheckboxUIProp } from "../../types/batchProcess";
import { BaseBatchProcess } from "../BaseBatchProcess";
import { Note } from "../Note";

export interface ResetEditBatchProcessOptions {
  /** label,region,region_endのような情報関係パラメータの初期化要否 */
  info: boolean;
  /** pitches,pbStart,pbs,pby,pbm,pbwのようなピッチ関係パラメータの初期化要否 */
  pitch: boolean;
  /** intensityの初期化要否 */
  intensity: boolean;
  /** flagsの初期化要否 */
  flags: boolean;
  /** velocityの初期化要否 */
  velocity: boolean;
  /** envelopeの初期化要否 */
  envelope: boolean;
  /** vibratoの初期化要否 */
  vibrato: boolean;
  /** modulationの初期化要否 */
  modulation: boolean;
}

/**
 * 選択したノートをベタ打ちに戻します
 */
export class ResetEditBatchProcess extends BaseBatchProcess<ResetEditBatchProcessOptions> {
  title = "batchprocess.resetEdit.title";
  summary = "調声リセット";
  public override process(
    notes: Note[],
    options: ResetEditBatchProcessOptions
  ): Note[] {
    return super.process(notes, options);
  }

  protected _process(
    notes: Note[],
    options: ResetEditBatchProcessOptions
  ): Note[] {
    const newNotes = new Array<Note>();
    notes.forEach((n) => {
      const newNote = new Note();
      /**
       * 必ずコピーするパラメータ
       * これらのパラメータは必ず定義されていることが期待されている
       */
      newNote.index = n.index;
      newNote.lyric = n.lyric;
      newNote.length = n.length;
      newNote.tempo = n.tempo;
      newNote.hasTempo = n.hasTempo;
      if (!options.info) {
        /** 合成結果に直接影響しないメモ的パラメータのコピー */
        if (n.label !== undefined) {
          newNote.label = n.label;
        }
        if (n.region !== undefined) {
          newNote.region = n.region;
        }
        if (n.regionEnd !== undefined) {
          newNote.regionEnd = n.regionEnd;
        }
      }
      if (!options.pitch) {
        /** ピッチ関係パラメータのコピー */
        if (n.pitches !== undefined) {
          newNote.setPitches(n.pitches);
        }
        if (n.pbStart !== undefined) {
          newNote.pbStart = n.pbStart;
        }
        if (n.pbs !== undefined) {
          newNote.pbs = `${n.pbs.time};${n.pbs.height}}`;
        }
        if (n.pbw !== undefined) {
          newNote.setPbw(n.pbw);
        }
        if (n.pby !== undefined) {
          newNote.setPby(n.pby);
        }
        if (n.pbm !== undefined) {
          newNote.setPbm(n.pbm);
        }
      }
      if (!options.flags && n.flags !== undefined) {
        /** フラグ */
        newNote.flags = n.flags;
      }
      if (!options.intensity && n.intensity !== undefined) {
        /** 音量 */
        newNote.intensity = n.intensity;
      }
      if (!options.velocity && n.velocity !== undefined) {
        /** 子音速度 */
        newNote.velocity = n.velocity;
      }
      if (!options.envelope && n.envelope !== undefined) {
        /** エンベロープ */
        newNote.setEnvelope(n.envelope);
      }
      if (!options.vibrato && n.vibrato !== undefined) {
        /** ビブラート */
        newNote.vibrato = `${n.vibrato.length},${n.vibrato.cycle},${n.vibrato.depth},${n.vibrato.fadeInTime},${n.vibrato.fadeOutTime},${n.vibrato.phase},${n.vibrato.height},0`;
      }
      if (!options.modulation && n.modulation !== undefined) {
        /** モジュレーション */
        newNote.modulation = n.modulation;
      }
      newNotes.push(newNote);
    });
    return newNotes;
  }

  ui = [
    {
      key: "ResetEditInfo",
      labelKey: "batchprocess.resetEdit.info",
      inputType: "checkbox",
      defaultValue: true,
    } as CheckboxUIProp,
    {
      key: "ResetEditPitch",
      labelKey: "batchprocess.resetEdit.pitch",
      inputType: "checkbox",
      defaultValue: true,
    } as CheckboxUIProp,
    {
      key: "ResetEditIntensity",
      labelKey: "batchprocess.resetEdit.intensity",
      inputType: "checkbox",
      defaultValue: true,
    } as CheckboxUIProp,
    {
      key: "ResetEditFlags",
      labelKey: "batchprocess.resetEdit.flags",
      inputType: "checkbox",
      defaultValue: true,
    } as CheckboxUIProp,
    {
      key: "ResetEditVelocity",
      labelKey: "batchprocess.resetEdit.velocity",
      inputType: "checkbox",
      defaultValue: true,
    } as CheckboxUIProp,
    {
      key: "ResetEditEnvelope",
      labelKey: "batchprocess.resetEdit.envelope",
      inputType: "checkbox",
      defaultValue: true,
    } as CheckboxUIProp,
    {
      key: "ResetEditVibrato",
      labelKey: "batchprocess.resetEdit.vibrato",
      inputType: "checkbox",
      defaultValue: true,
    } as CheckboxUIProp,
    {
      key: "ResetEditModulation",
      labelKey: "batchprocess.resetEdit.modulation",
      inputType: "checkbox",
      defaultValue: true,
    } as CheckboxUIProp,
  ];
  initialOptions: ResetEditBatchProcessOptions = {
    info: true,
    pitch: true,
    intensity: true,
    flags: true,
    velocity: true,
    envelope: true,
    vibrato: true,
    modulation: true,
  };
}

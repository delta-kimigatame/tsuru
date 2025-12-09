import OtoRecord from "utauoto/dist/OtoRecord";
import { defaultNote } from "../../config/note";
import { defaultParam } from "../../types/note";
import { AppendRequestBase, ResampRequest } from "../../types/request";
import { noteNumToTone } from "../../utils/Notenum";
import { encodePitch } from "../../utils/pitch";
import { BasePhonemizer } from "../BasePhonemizer";
import { Note } from "../Note";
import { BaseVoiceBank } from "../VoiceBanks/BaseVoiceBank";

const reg = /^([^ぁ-んァ-ヶ]*)([ぁ-んァ-ヶ]+)([^ ]*)$/;
const VCVCheck = /[-aiuron] ([ぁ-んァ-ヶ]+)/;
const vowelA =
  /[あかさたなはまやらわがざだばぱぁゃゎアカサタナハマヤラワガザダバパァャヮ]$/;
const vowelI =
  /[いきしちにひみゐりぎじぢびぴぃイキシチニヒミヰリギジヂビピィ]$/;
const vowelU =
  /[うくすつぬふむゆるぅゅぐずづぶぷウクスツヌフムユルゥグズヅブプヴゥュ]$/;
const vowelE =
  /[えけせてねへめゑれぇげぜでべぺエケセテネヘメヱレェゲゼデベペ]$/;
const vowelO =
  /[おこそとのほもよろをごぞどぼぽぉょオコソトノホモヨロヲゴゾドボポォョ]$/;
const vowelN = /ん$/;
const CVVowels = /^[あいうえおん]$/;

export class JPCVorVCVPhonemizer extends BasePhonemizer {
  name = "phonemizer.JPCVorVCVPhonemizer";

  protected getOtoRecord(
    vb,
    prevPhoneme,
    lyric,
    notenum,
    voiceColor
  ): OtoRecord | null {
    /** 変換要否を判定する。!マークがある場合変換しない */
    if (lyric.includes("!")) {
      return vb.getOtoRecord(lyric.replace("!", ""), notenum, voiceColor);
    }
    /** 入力されている歌詞からCV部分を抽出する。CV部分はmatch[2]に格納されるはず */
    const match = reg.exec(lyric);
    if (!match) return vb.getOtoRecord(lyric, notenum, voiceColor);
    /** prefix.map無効フラグはmatch[2]に含まれてないため、別途含まれているか確認しておく*/
    const noPrefixMap: boolean = lyric.includes("?");

    /** suffix付き連続音のエイリアスの有無をチェックし、非nullならその値を返す */
    const withSuffixVCVRecord = vb.getOtoRecord(
      (noPrefixMap ? "?" : "") + prevPhoneme + " " + match[2] + match[3],
      notenum,
      voiceColor
    );
    if (withSuffixVCVRecord) return withSuffixVCVRecord;

    /** 連続音エイリアスの有無をチェックし、非nullならその値を返す */
    const VCVRecord = vb.getOtoRecord(
      (noPrefixMap ? "?" : "") + prevPhoneme + " " + match[2],
      notenum,
      voiceColor
    );
    if (VCVRecord) return VCVRecord;

    /** フレーズの先頭ノートではない場合、母音結合エイリアスの有無をチェックする */
    if (prevPhoneme !== "-") {
      const withSuffixAutoConnectCVRecord = vb.getOtoRecord(
        (noPrefixMap ? "?" : "") + "* " + match[2] + match[3],
        notenum,
        voiceColor
      );
      if (withSuffixAutoConnectCVRecord) return withSuffixAutoConnectCVRecord;
      const autoConnectCVRecord = vb.getOtoRecord(
        (noPrefixMap ? "?" : "") + "* " + match[2],
        notenum,
        voiceColor
      );
      if (autoConnectCVRecord) return autoConnectCVRecord;
    }

    /** 単独音用のエイリアスの有無をチェックする */
    const withSuffixCVRecord = vb.getOtoRecord(
      (noPrefixMap ? "?" : "") + match[2] + match[3],
      notenum,
      voiceColor
    );
    if (withSuffixCVRecord) return withSuffixCVRecord;

    if (withSuffixCVRecord) return withSuffixCVRecord;
    const CVRecord = vb.getOtoRecord(
      (noPrefixMap ? "?" : "") + match[2],
      notenum,
      voiceColor
    );

    if (CVRecord) return CVRecord;

    /** いずれにも該当しない場合、入力値を返す。戻り値はnullの場合もあり得る */
    return vb.getOtoRecord(lyric, notenum, voiceColor);
  }
  protected _getNotesCount(vb: BaseVoiceBank, note: Note): number {
    return 1;
  }

  protected _applyOto(note: Note, vb: BaseVoiceBank): void {
    if (note.lyric === undefined) {
      throw new Error("lyric is not initial.");
    } else if (note.notenum === undefined) {
      throw new Error("notenum is not initial.");
    }
    const prevPhoneme =
      note.prev !== undefined
        ? note.prev.phonemizer.getLastPhoneme(note.prev)
        : "-";
    const record = this.getOtoRecord(
      vb,
      prevPhoneme,
      note.lyric,
      note.notenum,
      note.voiceColor ? note.voiceColor : ""
    );
    if (record === null) {
      note.oto = undefined;
      note.otoPreutter = 0;
      note.otoOverlap = 0;
      note.atAlias = "R";
      note.atFilename = "";
    } else {
      note.oto = record;
      note.otoPreutter = record.pre;
      note.otoOverlap = record.overlap;
      note.atAlias = record.alias !== "" ? record.alias : note.lyric;
      note.atFilename =
        record.dirpath + (record.dirpath !== "" ? "/" : "") + record.filename;
    }
  }
  protected _autoFitParam(note: Note): void {
    const rate = note.velocityRate;
    if (note.prev === undefined) {
      note.atPreutter =
        note.preutter !== undefined
          ? note.preutter * rate
          : note.otoPreutter !== undefined
          ? note.otoPreutter * rate
          : undefined;
      note.atOverlap =
        note.overlap !== undefined
          ? note.overlap * rate
          : note.otoOverlap !== undefined
          ? note.otoOverlap * rate
          : undefined;
      note.atStp = note.stp !== undefined ? note.stp : 0;
      return;
    }
    if (note.prev.length === undefined) {
      throw new Error("prev length is not initial.");
    } else if (note.prev.tempo === undefined) {
      throw new Error("prev tempo is not initial.");
    } else if (note.prev.lyric === undefined) {
      throw new Error("prev lyric is not initial.");
    }
    const prevMsLength =
      note.prev.phonemizer.getLastLength(note.prev) *
      (note.prev.lyric === "R" ? 1 : 0.5);
    const realPreutter =
      (note.preutter !== undefined ? note.preutter : note.otoPreutter) * rate;
    const realOverlap =
      (note.overlap !== undefined ? note.overlap : note.otoOverlap) * rate;
    const realStp = note.stp !== undefined ? note.stp : 0;
    if (Number.isNaN(realPreutter) || Number.isNaN(realOverlap)) {
    } else if (prevMsLength < realPreutter - realOverlap) {
      note.atPreutter =
        (realPreutter / (realPreutter - realOverlap)) * prevMsLength;
      note.atOverlap =
        (realOverlap / (realPreutter - realOverlap)) * prevMsLength;
      note.atStp = realPreutter - note.atPreutter + realStp;
    } else {
      note.atPreutter = realPreutter;
      note.atOverlap = realOverlap;
      note.atStp = realStp;
    }

    /**自動クロスフェード */
    if (note.prev.lyric !== "R" && note.atOverlap >= 20) {
      if (note.prev.envelope === undefined)
        note.prev.setEnvelope(defaultNote.envelope);
      if (note.envelope === undefined) note.setEnvelope(defaultNote.envelope);
      note.prev.envelope.point[2] = note.atOverlap;
      note.prev.envelope.value[2] = 100;
      note.prev.envelope.point[3] = 0;
      note.prev.envelope.value[3] = 0;
      note.envelope.point[1] = note.atOverlap;
      note.envelope.value[1] = 100;
      note.envelope.point[0] = 0;
      note.envelope.value[0] = 0;
    }
  }

  protected _getLastPhoneme(note: Note | undefined): string {
    if (!note) return "-";
    const match = reg.exec(note.lyric);
    if (!match) return "-";
    else if (vowelA.test(match[2])) return "a";
    else if (vowelI.test(match[2])) return "i";
    else if (vowelU.test(match[2])) return "u";
    else if (vowelE.test(match[2])) return "e";
    else if (vowelO.test(match[2])) return "o";
    else if (vowelN.test(match[2])) return "n";
    else return "-";
  }
  protected _getLastLength(note: Note): number {
    return note.msLength;
  }

  protected _getRequestParamm(
    vb: BaseVoiceBank,
    note: Note,
    flags: string,
    defaultValue: defaultParam
  ): { resamp: ResampRequest | undefined; append: AppendRequestBase }[] {
    if (note.oto === undefined) {
      note.applyOto(vb);
    } else {
      note.autoFitParam();
    }
    const params = [{ resamp: undefined, append: undefined }];
    if (note.oto !== undefined && !note.direct) {
      params[0]["resamp"] = {
        inputWav:
          note.oto.dirpath !== ""
            ? note.oto.dirpath + "/" + note.oto.filename
            : note.oto.filename,
        targetTone: noteNumToTone(note.notenum),
        velocity:
          note.velocity !== undefined &&
          note.velocity !== null &&
          !Number.isNaN(note.velocity)
            ? note.velocity
            : defaultValue.velocity,
        flags:
          note.flags !== null && note.flags !== undefined && note.flags !== ""
            ? note.flags
            : flags,
        offsetMs: Math.max(0, note.oto.offset),
        targetMs: note.targetLength,
        fixedMs: note.oto.velocity,
        cutoffMs: note.oto.blank,
        intensity:
          note.intensity !== undefined &&
          note.intensity !== null &&
          !Number.isNaN(note.intensity)
            ? note.intensity
            : defaultValue.intensity,
        modulation:
          note.modulation !== undefined &&
          note.modulation !== null &&
          !Number.isNaN(note.modulation)
            ? note.modulation
            : defaultValue.modulation,
        tempo: `!${note.tempo.toFixed(2)}`,
        pitches: encodePitch(note.getRenderPitch()),
      } as ResampRequest;
    }
    if (note.oto !== undefined && note.direct) {
      params[0]["append"] = {
        inputWav:
          note.oto.dirpath !== ""
            ? note.oto.dirpath + "/" + note.oto.filename
            : note.oto.filename,
        stp: note.atStp + note.oto.offset,
        length: note.outputMs,
        envelope: note.envelope ? note.envelope : defaultValue.envelope,
        overlap: note.atOverlap,
      } as AppendRequestBase;
    } else if (note.oto !== undefined) {
      params[0]["append"] = {
        stp: note.atStp,
        length: note.outputMs,
        envelope: note.envelope ? note.envelope : defaultValue.envelope,
        overlap: note.atOverlap,
      } as AppendRequestBase;
    } else {
      params[0]["append"] = {
        stp: 0,
        length: note.outputMs,
        envelope: { point: [0, 0], value: [] },
        overlap: 0,
      } as AppendRequestBase;
    }
    return params;
  }
}

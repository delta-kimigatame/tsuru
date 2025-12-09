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

interface ConsonantParam {
  /** 子音要素のエイリアス */
  consonant: string;
  /** 子音要素に対応する単独音エイリアスの種類 */
  cvs: string[];
  /** ノート長決定方法の種類 stretchはVC要素の伸縮範囲、preutterは次のCV要素のpreutter値、valueはlengthValueの長さを参照する */
  type: "stretch" | "preutter" | "value";
  /** 子音長(ms) */
  lengthValue: number;
  /**クロスフェード要否 */
  crossfade: boolean;
}
const consonantParams: ConsonantParam[] = [
  {
    consonant: "k",
    cvs: ["k", "か", "く", "け", "こ"],
    type: "stretch",
    lengthValue: 100,
    crossfade: false,
  },
  {
    consonant: "ky",
    cvs: ["ky", "きゃ", "き", "きゅ", "きぇ", "きょ"],
    type: "stretch",
    lengthValue: 130,
    crossfade: false,
  },
  {
    consonant: "s",
    cvs: ["s", "さ", "すぃ", "す", "せ", "そ"],
    type: "preutter",
    lengthValue: 150,
    crossfade: true,
  },
  {
    consonant: "sh",
    cvs: ["sh", "しゃ", "し", "しゅ", "しぇ", "しょ"],
    type: "preutter",
    lengthValue: 200,
    crossfade: true,
  },
  {
    consonant: "t",
    cvs: ["t", "た", "とぅ", "て", "と"],
    type: "stretch",
    lengthValue: 100,
    crossfade: false,
  },
  {
    consonant: "ty",
    cvs: ["ty", "てゃ", "てぃ", "てゅ", "てぇ", "てょ"],
    type: "stretch",
    lengthValue: 75,
    crossfade: false,
  },
  {
    consonant: "ch",
    cvs: ["ch", "ちゃ", "ち", "ちゅ", "ちぇ", "ちょ"],
    type: "preutter",
    lengthValue: 150,
    crossfade: false,
  },
  {
    consonant: "ts",
    cvs: ["ts", "つ", "つぁ", "つぃ", "つぇ", "つぉ"],
    type: "preutter",
    lengthValue: 170,
    crossfade: false,
  },
  {
    consonant: "n",
    cvs: ["n", "な", "ぬ", "ね", "の"],
    type: "preutter",
    lengthValue: 70,
    crossfade: true,
  },
  {
    consonant: "ny",
    cvs: ["ny", "にゃ", "に", "にゅ", "にぇ", "にょ"],
    type: "preutter",
    lengthValue: 70,
    crossfade: true,
  },
  {
    consonant: "h",
    cvs: ["h", "は", "へ", "ほ"],
    type: "preutter",
    lengthValue: 110,
    crossfade: true,
  },
  {
    consonant: "hy",
    cvs: ["hy", "ひゃ", "ひ", "ひゅ", "ひぇ", "ひょ"],
    type: "preutter",
    lengthValue: 100,
    crossfade: true,
  },
  {
    consonant: "f",
    cvs: ["f", "ふぁ", "ふ", "ふぃ", "ふぇ", "ふぉ"],
    type: "preutter",
    lengthValue: 130,
    crossfade: true,
  },
  {
    consonant: "m",
    cvs: ["m", "ま", "む", "め", "も"],
    type: "preutter",
    lengthValue: 75,
    crossfade: true,
  },
  {
    consonant: "my",
    cvs: ["my", "みゃ", "み", "みゅ", "みぇ", "みょ"],
    type: "preutter",
    lengthValue: 60,
    crossfade: true,
  },
  {
    consonant: "y",
    cvs: ["y", "や", "ゆ", "いぇ", "よ", "いぃ"],
    type: "preutter",
    lengthValue: 30,
    crossfade: true,
  },
  {
    consonant: "r",
    cvs: ["r", "ら", "る", "れ", "ろ"],
    type: "preutter",
    lengthValue: 70,
    crossfade: true,
  },
  {
    consonant: "ry",
    cvs: ["ry", "りゃ", "り", "りゅ", "りぇ", "りょ"],
    type: "preutter",
    lengthValue: 70,
    crossfade: true,
  },
  {
    consonant: "w",
    cvs: ["w", "わ", "を", "うぃ", "うぇ", "うぉ"],
    type: "preutter",
    lengthValue: 50,
    crossfade: true,
  },
  {
    consonant: "g",
    cvs: ["g", "が", "ぐ", "げ", "ご"],
    type: "stretch",
    lengthValue: 80,
    crossfade: false,
  },
  {
    consonant: "gy",
    cvs: ["gy", "ぎゃ", "ぎ", "ぎゅ", "ぎぇ", "ぎょ"],
    type: "stretch",
    lengthValue: 60,
    crossfade: false,
  },
  {
    consonant: "z",
    cvs: ["z", "ざ", "ずぃ", "ず", "ぜ", "ぞ"],
    type: "preutter",
    lengthValue: 80,
    crossfade: true,
  },
  {
    consonant: "j",
    cvs: ["j", "じゃ", "じ", "じゅ", "じぇ", "じょ"],
    type: "preutter",
    lengthValue: 110,
    crossfade: true,
  },
  {
    consonant: "d",
    cvs: ["d", "だ", "どぅ", "で", "ど"],
    type: "stretch",
    lengthValue: 60,
    crossfade: false,
  },
  {
    consonant: "dy",
    cvs: ["dy", "でゃ", "でぃ", "でゅ", "でぇ", "でょ"],
    type: "stretch",
    lengthValue: 75,
    crossfade: false,
  },
  {
    consonant: "b",
    cvs: ["b", "ば", "ぶ", "べ", "ぼ"],
    type: "stretch",
    lengthValue: 50,
    crossfade: false,
  },
  {
    consonant: "by",
    cvs: ["by", "びゃ", "び", "びゅ", "びぇ", "びょ"],
    type: "stretch",
    lengthValue: 45,
    crossfade: false,
  },
  {
    consonant: "p",
    cvs: ["p", "ぱ", "ぷ", "ぺ", "ぽ"],
    type: "stretch",
    lengthValue: 100,
    crossfade: false,
  },
  {
    consonant: "py",
    cvs: ["py", "ぴゃ", "ぴ", "ぴゅ", "ぴぇ", "ぴょ"],
    type: "stretch",
    lengthValue: 100,
    crossfade: false,
  },
  {
    consonant: "ng",
    cvs: ["ng", "ガ", "グ", "ゲ", "ゴ"],
    type: "preutter",
    lengthValue: 50,
    crossfade: true,
  },
  {
    consonant: "ngy",
    cvs: ["ngy", "ギャ", "ギ", "ギュ", "ギェ", "ギョ"],
    type: "preutter",
    lengthValue: 40,
    crossfade: true,
  },
  {
    consonant: "v",
    cvs: ["v", "ヴぁ", "ヴ", "ヴぃ", "ヴぇ", "ヴぉ"],
    type: "preutter",
    lengthValue: 100,
    crossfade: true,
  },
  {
    consonant: "・",
    cvs: ["・あ", "・い", "・う", "・え", "・お", "・ん"],
    type: "stretch",
    lengthValue: 50,
    crossfade: false,
  },
];

export class JPAutoPhonemizer extends BasePhonemizer {
  name = "phonemizer.JPAutoPhonemizer";
  protected getOtoRecord(
    vb,
    prevPhoneme,
    lyric,
    notenum,
    voiceColor,
    vcMode: boolean = false
  ): OtoRecord | null {
    /** lyricが空文字列の場合nullを返す */
    if (lyric === "") {
      return null;
    }
    /** 変換要否を判定する。!マークがある場合変換しない */
    if (lyric.includes("!")) {
      return vb.getOtoRecord(lyric.replace("!", ""), notenum, voiceColor);
    }
    /** 入力されている歌詞からCV部分を抽出する。CV部分はmatch[2]に格納されるはず */
    const match = reg.exec(lyric);
    if (!match && !vcMode) return vb.getOtoRecord(lyric, notenum, voiceColor);
    const cvPart = vcMode ? lyric : match[2];
    const suffixPart = vcMode ? "" : match[3];
    /** prefix.map無効フラグはmatch[2]に含まれてないため、別途含まれているか確認しておく*/
    const noPrefixMap: boolean = lyric.includes("?");

    /** suffix付き連続音のエイリアスの有無をチェックし、非nullならその値を返す */
    const withSuffixVCVRecord = vb.getOtoRecord(
      (noPrefixMap ? "?" : "") + prevPhoneme + " " + cvPart + suffixPart,
      notenum,
      voiceColor
    );
    if (withSuffixVCVRecord) return withSuffixVCVRecord;

    /** 連続音エイリアスの有無をチェックし、非nullならその値を返す */
    const VCVRecord = vb.getOtoRecord(
      (noPrefixMap ? "?" : "") + prevPhoneme + " " + cvPart,
      notenum,
      voiceColor
    );
    if (VCVRecord) return VCVRecord;

    /** フレーズの先頭ノートではない場合、母音結合エイリアスの有無をチェックする */
    if (prevPhoneme !== "-") {
      const withSuffixAutoConnectCVRecord = vb.getOtoRecord(
        (noPrefixMap ? "?" : "") + "* " + cvPart + suffixPart,
        notenum,
        voiceColor
      );
      if (withSuffixAutoConnectCVRecord) return withSuffixAutoConnectCVRecord;
      const autoConnectCVRecord = vb.getOtoRecord(
        (noPrefixMap ? "?" : "") + "* " + cvPart,
        notenum,
        voiceColor
      );
      if (autoConnectCVRecord) return autoConnectCVRecord;
    }

    /** 単独音用のエイリアスの有無をチェックする */
    const withSuffixCVRecord = vb.getOtoRecord(
      (noPrefixMap ? "?" : "") + cvPart + suffixPart,
      notenum,
      voiceColor
    );
    if (withSuffixCVRecord) return withSuffixCVRecord;

    if (withSuffixCVRecord) return withSuffixCVRecord;
    const CVRecord = vb.getOtoRecord(
      (noPrefixMap ? "?" : "") + cvPart,
      notenum,
      voiceColor
    );

    if (CVRecord) return CVRecord;

    /** いずれにも該当しない場合、入力値を返す。戻り値はnullの場合もあり得る */
    return vb.getOtoRecord(lyric, notenum, voiceColor);
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

  /**
   * 次の子音を取得する
   * @param note 対象のノート
   * @returns
   */
  getNextConsonant(note: Note): ConsonantParam | null {
    if (!note) return null;
    /** 入力値がVCVの場合はnullを返す */
    const isVcv = VCVCheck.exec(note.lyric);
    if (isVcv) return null;
    /** 変換値がVCVの場合もnullを返す。ただしnote.otoが存在しない場合無視する */
    if (note.oto) {
      const isVcvConverted = VCVCheck.exec(note.oto.alias);
      if (isVcvConverted) return null;
    }
    /** CV要素が見つからなければnullを返す */
    const match = reg.exec(note.lyric);
    if (!match) return null;
    const cv = match[2];
    /** CV要素に対応するConsonantParamを探す */
    for (const consonantParam of consonantParams) {
      if (consonantParam.cvs.includes(cv)) {
        return consonantParam;
      }
    }
    return null;
  }
  protected _getNotesCount(vb: BaseVoiceBank, note: Note): number {
    /**
     * 次のノートの子音を確認し、nullが返ってきた場合はparamsは1つ。
     * 非nullが返ってきた場合、[lastPhoneme nextConsonant]がotoに存在するかチェックし、存在すればparamsを2つに分割する。
     * otoが存在しなければparamsは1つ。
     */
    const nextConsonant = this.getNextConsonant(note.next);
    const vcOtoRecord = this.getOtoRecord(
      vb,
      this.getLastPhoneme(note),
      nextConsonant ? nextConsonant.consonant : "",
      note.notenum,
      note.voiceColor ? note.voiceColor : "",
      true
    );
    if (vcOtoRecord !== null) {
      return 2;
    } else {
      return 1;
    }
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
    /**
     * 次のノートの子音を確認し、nullが返ってきた場合はparamsは1つ。
     * 非nullが返ってきた場合、[lastPhoneme nextConsonant]がotoに存在するかチェックし、存在すればparamsを2つに分割する。
     * otoが存在しなければparamsは1つ。
     */
    const nextConsonant = this.getNextConsonant(note.next);
    const vcOtoRecord = this.getOtoRecord(
      vb,
      this.getLastPhoneme(note),
      nextConsonant ? nextConsonant.consonant : "",
      note.notenum,
      note.voiceColor ? note.voiceColor : "",
      true
    );
    const params = [{ resamp: undefined, append: undefined }];
    let cvOutputMs = note.outputMs;
    let cvEnvelope = note.envelope ? note.envelope : defaultValue.envelope;
    const cvPitch = note.getRenderPitch();
    /** vcOtoRecordが非nullかつ、追加するVCの長さがノート全体の長さから固定範囲を除いたものより小さいならばparamsを追加し先に2つ目のparamsを設定する */
    if (vcOtoRecord !== null) {
      const vcTargetNoteLength = this.getVCTargetLength(
        note,
        vcOtoRecord,
        nextConsonant
      );
      const vcParams = this.vcAutoFitParam(
        note,
        vcOtoRecord,
        vcTargetNoteLength
      );
      if (vcTargetNoteLength <= note.targetLength - note.oto.velocity) {
        params.push({ resamp: undefined, append: undefined });
        const baseNotePitchOffset =
          (note.atPreutter ? note.atPreutter : 0) +
          (note.atStp ? note.atStp : 0);
        const dividerOffset = note.msLength - vcTargetNoteLength;
        const dividerParamOffset = vcParams.preutter + vcParams.stp;
        /**
         * cvPitchの前半部分を削除してvcPitchを得る
         * ノートの開始位置を0とすると、cvPitchは-baseNotePitchOffset(ms)から始まっている。
         * vcの0位置はノートの開始位置+dividerOffset(ms)であり、そこからdividerParamOffset(ms)分だけ前にずらした位置がvcPitchの0位置となる。
         * よって、vcPitchの0位置はcvPitchの-baseNotePitchOffset + dividerOffset - dividerParamOffset(ms)となる。
         * したがって、vcPitchの0位置までのcvPitch部分を削除すればよい。
         * cvPitchはnote.pitchSpan(s)で等間隔にサンプリングされているため、msをindexに変換するにはnote.pitchSpanで割る。
         */
        const vcPitchStartIndex = Math.floor(
          (-baseNotePitchOffset + dividerOffset - dividerParamOffset) /
            1000 /
            note.pitchSpan
        );
        const vcPitch = cvPitch.slice(vcPitchStartIndex);
        params[1]["resamp"] = {
          inputWav:
            vcOtoRecord.dirpath !== ""
              ? vcOtoRecord.dirpath + "/" + vcOtoRecord.filename
              : vcOtoRecord.filename,
          targetTone: noteNumToTone(note.notenum),
          velocity: 100 /** VCのベロシティは固定値 */,
          flags:
            note.flags !== null && note.flags !== undefined && note.flags !== ""
              ? note.flags
              : flags,
          offsetMs: Math.max(0, vcOtoRecord.offset),
          targetMs:
            Math.ceil((vcTargetNoteLength + vcParams.preutter) / 50) * 50,
          fixedMs: vcOtoRecord.velocity,
          cutoffMs: vcOtoRecord.blank,
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
          pitches: encodePitch(vcPitch),
        } as ResampRequest;
        params[1]["append"] = {
          stp: vcParams.stp,
          length: vcTargetNoteLength + vcParams.preutter,
          envelope: {
            point: [
              0,
              vcParams.overlap,
              nextConsonant.crossfade ? vcTargetNoteLength : 10,
              0,
            ],
            value: [0, 100, 100, 0],
          },
          overlap: vcParams.overlap,
        } as AppendRequestBase;
        cvOutputMs =
          cvOutputMs -
          vcTargetNoteLength -
          vcParams.preutter +
          vcParams.overlap;
        if (nextConsonant.crossfade) {
          cvEnvelope.point[1] = vcTargetNoteLength;
        }
        cvEnvelope.point[2] = vcParams.overlap;
        cvEnvelope.point[3] = 0;
        cvEnvelope.value[2] = 100;
        cvEnvelope.value[3] = 0;
      }
    }
    /**
     * 1つ目のparamsの設定
     * */
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
        pitches: encodePitch(cvPitch),
      } as ResampRequest;
    }
    if (note.oto !== undefined && note.direct) {
      params[0]["append"] = {
        inputWav:
          note.oto.dirpath !== ""
            ? note.oto.dirpath + "/" + note.oto.filename
            : note.oto.filename,
        stp: note.atStp + note.oto.offset,
        length: cvOutputMs,
        envelope: cvEnvelope,
        overlap: note.atOverlap,
      } as AppendRequestBase;
    } else if (note.oto !== undefined) {
      params[0]["append"] = {
        stp: note.atStp,
        length: cvOutputMs,
        envelope: cvEnvelope,
        overlap: note.atOverlap,
      } as AppendRequestBase;
    } else {
      params[0]["append"] = {
        stp: 0,
        length: cvOutputMs,
        envelope: { point: [0, 0], value: [] },
        overlap: 0,
      } as AppendRequestBase;
    }

    return params;
  }

  getVCTargetLength(
    note: Note,
    vcOtoRecord: OtoRecord,
    consonantParam: ConsonantParam
  ): number {
    if (consonantParam.type === "stretch") {
      /** stretchの場合vcOtoRecordのpreからblankの間の長さを返す。 */
      /** blankが負の数の場合、blankの絶対値はoffsetからblankまでの長さmsを意味する。 */
      if (vcOtoRecord.blank < 0) {
        return vcOtoRecord.blank * -1 - vcOtoRecord.pre;
      } else {
        if (note.next && note.next.oto.overlap < 0) {
          return note.next.oto.pre - note.next.oto.overlap;
        }
        /** blankが正の場合、blankはwavファイル末尾から左方向にブランクの位置をmsで表すが、wavの読込とかをここでするのは計算量的に好ましくないので、preutterの場合の設定を用いる */
        return note.next ? note.next.oto.pre : consonantParam.lengthValue;
      }
    } else if (consonantParam.type === "preutter") {
      /** preutterの場合、次のノートの原音設定上のpreutterを返す。nextがnullの場合はlengthValueを返す。更にnote.nextが存在し、note.next.oto.overlapが負の数の場合に限って、overlapを減ずる */
      if (note.next && note.next.oto.overlap < 0) {
        return note.next.oto.pre - note.next.oto.overlap;
      }
      return note.next ? note.next.oto.pre : consonantParam.lengthValue;
    } else {
      /** その他の場合は、consonantParamのlengthValueを返す */
      return consonantParam.lengthValue;
    }
  }

  vcAutoFitParam(
    note: Note,
    vcOtoRecord: OtoRecord,
    vcTargetNoteLength: number
  ): { preutter: number; overlap: number; stp: number } {
    const prevMsLength = note.msLength - vcTargetNoteLength;
    const realPreutter = vcOtoRecord.pre;
    const realOverlap = vcOtoRecord.overlap;
    const realStp = 0;
    const returnParams: { preutter: number; overlap: number; stp: number } = {
      preutter: 0,
      overlap: 0,
      stp: 0,
    };
    if (Number.isNaN(realPreutter) || Number.isNaN(realOverlap)) {
    } else if (prevMsLength < realPreutter - realOverlap) {
      returnParams.preutter =
        (realPreutter / (realPreutter - realOverlap)) * prevMsLength;
      returnParams.overlap =
        (realOverlap / (realPreutter - realOverlap)) * prevMsLength;
      returnParams.stp = realPreutter - returnParams.preutter + realStp;
    } else {
      returnParams.preutter = realPreutter;
      returnParams.overlap = realOverlap;
      returnParams.stp = realStp;
    }
    return returnParams;
  }
}

/**
 * ########## TODO ##########
 * - 前のノートとvoiceColorやsuffixが異なる場合、VCVよりCVVCを優先する処理(prevの情報が必要だが引数に与えられておらず、BasePhonemizer自体の修正が必要)
 */

import OtoRecord from "utauoto/dist/OtoRecord";
import { defaultNote } from "../../config/note";
import { defaultParam } from "../../types/note";
import { AppendRequestBase, ResampRequest } from "../../types/request";
import { noteNumToTone } from "../../utils/Notenum";
import { encodePitch } from "../../utils/pitch";
import { BasePhonemizer } from "../BasePhonemizer";
import { Note } from "../Note";
import { BaseVoiceBank } from "../VoiceBanks/BaseVoiceBank";
import { PresampConsonantParams } from "../VoiceBanks/Presamp";

const defaultVowelsReg = [
  {
    reg: /[あかさたなはまやらわがざだばぱぁゃゎアカサタナハマヤラワガザダバパァャヮ]$/,
    symbol: "a",
  },
  {
    reg: /[いきしちにひみゐりぎじぢびぴぃイキシチニヒミヰリギジヂビピィ]$/,
    symbol: "i",
  },
  {
    reg: /[うくすつぬふむゆるぅゅぐずづぶぷウクスツヌフムユルゥグズヅブプヴゥュ]$/,
    symbol: "u",
  },
  {
    reg: /[えけせてねへめゑれぇげぜでべぺエケセテネヘメヱレェゲゼデベペ]$/,
    symbol: "e",
  },
  {
    reg: /[おこそとのほもよろをごぞどぼぽぉょオコソトノホモヨロヲゴゾドボポォョ]$/,
    symbol: "o",
  },
  {
    reg: /ん$/,
    symbol: "n",
  },
];

export class JPPresampPhonemizer extends BasePhonemizer {
  name = "phonemizer.JPPresampPhonemizer";
  protected getOtoRecord(
    vb: BaseVoiceBank,
    prevPhoneme: string,
    note: Note,
    lyric: string,
    notenum: number,
    voiceColor: string,
    vcMode: boolean = false
  ): OtoRecord | null {
    /** vb.presampが存在する場合、vb.presamp.CVRegexをregとし、なければJPAutoと同じ初期値を使う */
    const reg: RegExp =
      vb.presamp !== undefined
        ? vb.presamp.CVRegex
        : /^([^ぁ-んァ-ヶ]*)([ぁ-んァ-ヶ]+)([^ ]*)$/;
    /** lyricが空文字列の場合nullを返す */
    if (lyric === "") {
      return null;
    }
    /** 1つ前のノートのsuffixPartを求める */
    const prevLyric = note.prev ? note.prev.lyric : "";
    const prevMatch = reg.exec(prevLyric);
    const prevSuffix = prevMatch ? prevMatch[3] : "";
    if (lyric === "R") {
      /**presamp.iniが存在しない場合nullを返す */
      if (!vb.presamp) {
        return null;
      }
      /** vb.presamp.endingTypeがnoneかfinalの場合nullを返す */
      if (
        vb.presamp.endingType === "none" ||
        vb.presamp.endingType === "final"
      ) {
        return null;
      }
      /** prevPhonemeが"-"の場合もnullを返す */
      if (prevPhoneme === "-") {
        return null;
      }
      /** prevPhonemeに対応する%V%を求める。prevPhonemeが"-"である以上必ず有効な値が見つかるはず */
      const vowelType = vb.presamp.vowels.find((v) => v.symbol === prevPhoneme);
      const vowelRepresentative = vowelType.representative;

      /** replaceを使って、suffix無しのエイリアスを求める。%v%→prevPhoneme、%V%→vowelLeader,%VCPAD%→vb.presa,p.alias.vcpad,%VCVPAD%→vb.presamp.alias.vcvpad */
      const alias = vb.presamp.alias.endingRest
        .replace(/%v%/g, prevPhoneme)
        .replace(/%V%/g, vowelRepresentative)
        .replace(/%VCPAD%/g, vb.presamp.alias.vcPad)
        .replace(/%VCVPAD%/g, vb.presamp.alias.vcvPad);

      const withSuffixEndingRecord = vb.getOtoRecord(
        alias + prevSuffix,
        notenum,
        voiceColor
      );
      if (withSuffixEndingRecord) return withSuffixEndingRecord;
      const endingRecord = vb.getOtoRecord(alias, notenum, voiceColor);
      if (endingRecord) return endingRecord;
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
    const mapPart = vb.getSuffix(notenum, voiceColor);
    const prevMapPart = vb.getSuffix(
      note.prev ? note.prev.notenum : notenum,
      note.prev ? note.prev.voiceColor : voiceColor
    );

    const currentConsonant = this.getNextConsonant(note, vb);
    /**
     * 前のノートとsuffix,map,voiceColorの結合値が異なる場合CVVC変換可能性をチェックする。
     * これらの条件下において、CVVC変換可能の場合、VCVよりも優先される
     * currentConsonantが存在しない場合、そもそもCVVC変換は不可能であるためチェックしない
     */
    if (
      currentConsonant &&
      note.prev !== null &&
      note.prev !== undefined &&
      note.prev.lyric !== "R" &&
      suffixPart + voiceColor + mapPart !==
        prevSuffix + note.prev?.voiceColor + prevMapPart
    ) {
      /** currentConsonantが存在しない場合、そもそも */
      /** 前のノートがVCを生成できるか */
      const vcOtoRecord = this.getOtoRecord(
        vb,
        this.getLastPhoneme(note.prev, vb),
        note.prev,
        currentConsonant.symbol,
        note.prev.notenum,
        note.prev.voiceColor ? note.prev.voiceColor : "",
        true
      );
      /** vcOtoRecordが見つからない場合、これ以上チェックしない */
      if (vcOtoRecord !== null) {
        const withSuffixCVRecord = vb.getOtoRecord(
          (noPrefixMap ? "?" : "") + cvPart + suffixPart,
          notenum,
          voiceColor
        );
        if (withSuffixCVRecord) return withSuffixCVRecord;

        const CVRecord = vb.getOtoRecord(
          (noPrefixMap ? "?" : "") + cvPart,
          notenum,
          voiceColor
        );

        if (CVRecord) return CVRecord;
      }
    }

    /** priorityが設定されている場合、VCVは生成しない */
    if (vb.presamp && !vb.presamp.priority.includes(cvPart)) {
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
    }
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
        ? note.prev.phonemizer.getLastPhoneme(note.prev, vb)
        : "-";
    const record = this.getOtoRecord(
      vb,
      prevPhoneme,
      note,
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
  protected _getLastPhoneme(note: Note | undefined, vb: BaseVoiceBank): string {
    if (!note) return "-";
    const reg: RegExp =
      vb.presamp !== undefined
        ? vb.presamp.CVRegex
        : /^([^ぁ-んァ-ヶ]*)([ぁ-んァ-ヶ]+)([^ ]*)$/;

    const vowelRegs =
      vb.presamp !== undefined ? vb.presamp.vowelRegs : defaultVowelsReg;
    const match = reg.exec(note.lyric);
    if (!match) return "-";

    const found = vowelRegs.find((v) => v.reg.test(match[2]));
    return found ? found.symbol : "-";
  }
  protected _getLastLength(note: Note): number {
    return note.msLength;
  }

  /**
   * 次の子音を取得する
   * @param note 対象のノート
   * @returns
   */
  getNextConsonant(
    note: Note,
    vb: BaseVoiceBank
  ): PresampConsonantParams | null {
    if (!note) return null;
    if (vb.presamp === undefined) return null;
    const VCVCheck: RegExp = vb.presamp.VCVRegExp;
    const reg: RegExp = vb.presamp.CVRegex;
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
    for (const consonantParam of vb.presamp.consonants) {
      if (consonantParam.CVs.includes(cv)) {
        return consonantParam;
      }
    }
    return null;
  }

  getNextPriority(note: Note, vb: BaseVoiceBank): boolean {
    if (!note) return false;
    if (vb.presamp === undefined) return false;
    const VCVCheck: RegExp = vb.presamp.VCVRegExp;
    const reg: RegExp = vb.presamp.CVRegex;
    /** 入力値がVCVの場合はnullを返す */
    const isVcv = VCVCheck.exec(note.lyric);
    if (isVcv) return false;
    /** CV要素が見つからなければnullを返す */
    const match = reg.exec(note.lyric);
    if (!match) return false;
    const cv = match[2];
    return vb.presamp.priority.includes(cv);
  }

  protected _getNotesCount(vb: BaseVoiceBank, note: Note): number {
    /**
     * 次のノートの子音を確認し、nullが返ってきた場合はparamsは1つ。
     * 非nullが返ってきた場合、[lastPhoneme nextConsonant]がotoに存在するかチェックし、存在すればparamsを2つに分割する。
     * otoが存在しなければparamsは1つ。
     */
    const nextConsonant = this.getNextConsonant(note.next, vb);
    const vcOtoRecord = this.getOtoRecord(
      vb,
      this.getLastPhoneme(note, vb),
      note,
      nextConsonant ? nextConsonant.symbol : "",
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
    const nextConsonant = this.getNextConsonant(note.next, vb);
    const vcOtoRecord = this.getOtoRecord(
      vb,
      this.getLastPhoneme(note, vb),
      note,
      nextConsonant ? nextConsonant.symbol : "",
      note.notenum,
      note.voiceColor ? note.voiceColor : "",
      true
    );
    const params = [{ resamp: undefined, append: undefined }];
    let cvOutputMs = note.outputMs;
    let cvEnvelope = note.envelope ? note.envelope : defaultValue.envelope;
    const cvPitch = note.getRenderPitch();
    /** vcOtoRecordが非nullかつ、追加するVCの長さがノート全体の長さから固定範囲を除いたものより小さいならばparamsを追加し先に2つ目のparamsを設定する
     * また、vcOtoRecordが非nullかつ、次のノートのpriority設定がtrueの場合もparamsを追加し2つ目のparamsを設定する
     */
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
      if (
        vcTargetNoteLength <= note.targetLength - (note.oto?.velocity ?? 0) ||
        this.getNextPriority(note.next, vb)
      ) {
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
    consonantParam: PresampConsonantParams
  ): number {
    if (!consonantParam.useCVLength) {
      /** stretchの場合vcOtoRecordのpreからblankの間の長さを返す。 */
      /** blankが負の数の場合、blankの絶対値はoffsetからblankまでの長さmsを意味する。 */
      if (vcOtoRecord.blank < 0) {
        return vcOtoRecord.blank * -1 - vcOtoRecord.pre;
      } else {
        if (note.next && note.next.oto.overlap < 0) {
          return note.next.oto.pre - note.next.oto.overlap;
        }
        /** blankが正の場合、blankはwavファイル末尾から左方向にブランクの位置をmsで表すが、wavの読込とかをここでするのは計算量的に好ましくないので、preutterの場合の設定を用いる */
        return note.next ? note.next.oto.pre : 60;
      }
    } else {
      /** preutterの場合、次のノートの原音設定上のpreutterを返す。nextがnullの場合はlengthValueを返す。更にnote.nextが存在し、note.next.oto.overlapが負の数の場合に限って、overlapを減ずる */
      if (note.next && note.next.oto.overlap < 0) {
        return note.next.oto.pre - note.next.oto.overlap;
      }
      return note.next ? note.next.oto.pre : 60;
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
    /** 各パラメータ算出後に、preutterでoverlapを上書きする */
    returnParams.overlap = returnParams.preutter;
    return returnParams;
  }
}

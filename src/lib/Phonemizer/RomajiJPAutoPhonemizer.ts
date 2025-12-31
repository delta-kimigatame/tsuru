import OtoRecord from "utauoto/dist/OtoRecord";
import { Note } from "../Note";
import { BaseVoiceBank } from "../VoiceBanks/BaseVoiceBank";
import { JPAutoPhonemizer } from "./JPAutoPhonemizer";

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

export class RomajiJPAutoPhonemizer extends JPAutoPhonemizer {
  name = "phonemizer.RomajiJPAutoPhonemizer";

  private romajiToHiraganaTable: { [key: string]: string } = {
    a: "あ",
    i: "い",
    u: "う",
    e: "え",
    o: "お",
    ka: "か",
    ki: "き",
    ku: "く",
    ke: "け",
    ko: "こ",
    sa: "さ",
    si: "すぃ",
    shi: "し",
    su: "す",
    se: "せ",
    so: "そ",
    ta: "た",
    ti: "てぃ",
    tu: "とぅ",
    chi: "ち",
    tsu: "つ",
    te: "て",
    to: "と",
    na: "な",
    ni: "に",
    nu: "ぬ",
    ne: "ね",
    no: "の",
    ha: "は",
    hi: "ひ",
    hu: "ふ",
    fu: "ふ",
    he: "へ",
    ho: "ほ",
    ma: "ま",
    mi: "み",
    mu: "む",
    me: "め",
    mo: "も",
    ya: "や",
    yu: "ゆ",
    yo: "よ",
    ra: "ら",
    ri: "り",
    ru: "る",
    re: "れ",
    ro: "ろ",
    wa: "わ",
    wo: "を",
    n: "ん",
    ga: "が",
    gi: "ぎ",
    gu: "ぐ",
    ge: "げ",
    go: "ご",
    za: "ざ",
    ji: "じ",
    zu: "ず",
    ze: "ぜ",
    zo: "ぞ",
    da: "だ",
    di: "ぢ",
    du: "づ",
    de: "で",
    do: "ど",
    ba: "ば",
    bi: "び",
    bu: "ぶ",
    be: "べ",
    bo: "ぼ",
    pa: "ぱ",
    pi: "ぴ",
    pu: "ぷ",
    pe: "ぺ",
    po: "ぽ",
    kya: "きゃ",
    kyu: "きゅ",
    kye: "きぇ",
    kyo: "きょ",
    sha: "しゃ",
    shu: "しゅ",
    she: "しぇ",
    sho: "しょ",
    cha: "ちゃ",
    chu: "ちゅ",
    che: "ちぇ",
    cho: "ちょ",
    tya: "てゃ",
    tyu: "てゅ",
    tye: "てぇ",
    tyo: "てょ",
    nya: "にゃ",
    nyu: "にゅ",
    nye: "にぇ",
    nyo: "にょ",
    hya: "ひゃ",
    hyu: "ひゅ",
    hye: "ひぇ",
    hyo: "ひょ",
    mya: "みゃ",
    myu: "みゅ",
    mye: "みぇ",
    myo: "みょ",
    rya: "りゃ",
    ryu: "りゅ",
    rye: "りぇ",
    ryo: "りょ",
    kwa: "くゎ",
    kwi: "くぃ",
    kwe: "くぇ",
    kwo: "くぉ",
    gya: "ぎゃ",
    gyu: "ぎゅ",
    gye: "ぎぇ",
    gyo: "ぎょ",
    ja: "じゃ",
    ju: "じゅ",
    je: "じぇ",
    jo: "じょ",
    dya: "ぢゃ",
    dyu: "ぢゅ",
    dye: "ぢぇ",
    dyo: "ぢょ",
    bya: "びゃ",
    byu: "びゅ",
    bye: "びぇ",
    byo: "びょ",
    pya: "ぴゃ",
    pyu: "ぴゅ",
    pye: "ぴぇ",
    pyo: "ぴょ",
    gwa: "ぐゎ",
    gwi: "ぐぃ",
    gwe: "ぐぇ",
    gwo: "ぐぉ",
    va: "ヴぁ",
    vi: "ヴぃ",
    vu: "ヴ",
    ve: "ヴぇ",
    vo: "ヴぉ",
  };

  private convertRomajiToHiragana(romaji: string): string {
    return this.romajiToHiraganaTable[romaji] || romaji;
  }

  protected getOtoRecord(
    vb,
    prevPhoneme,
    lyric,
    notenum,
    voiceColor,
    vcMode: boolean = false
  ): OtoRecord | null {
    const hiraganaLyric = this.convertRomajiToHiragana(lyric);
    return super.getOtoRecord(
      vb,
      prevPhoneme,
      hiraganaLyric,
      notenum,
      voiceColor,
      vcMode
    );
  }

  protected _getLastPhoneme(note: Note | undefined, vb: BaseVoiceBank): string {
    if (!note) return "-";
    const hiraganaLyric = this.convertRomajiToHiragana(note.lyric);
    const match = reg.exec(hiraganaLyric);
    if (!match) return "-";
    else if (vowelA.test(match[2])) return "a";
    else if (vowelI.test(match[2])) return "i";
    else if (vowelU.test(match[2])) return "u";
    else if (vowelE.test(match[2])) return "e";
    else if (vowelO.test(match[2])) return "o";
    else if (vowelN.test(match[2])) return "n";
    else return "-";
  }

  /**
   * 次の子音を取得する
   * @param note 対象のノート
   * @returns
   */
  getNextConsonant(note: Note): ConsonantParam | null {
    if (!note) return null;
    const hiraganaLyric = this.convertRomajiToHiragana(note.lyric);
    /** 入力値がVCVの場合はnullを返す */
    const isVcv = VCVCheck.exec(hiraganaLyric);
    if (isVcv) return null;
    /** 変換値がVCVの場合もnullを返す。ただしnote.otoが存在しない場合無視する */
    if (note.oto) {
      const isVcvConverted = VCVCheck.exec(note.oto.alias);
      if (isVcvConverted) return null;
    }
    /** CV要素が見つからなければnullを返す */
    const match = reg.exec(hiraganaLyric);
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
}

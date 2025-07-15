import OtoRecord from "utauoto/dist/OtoRecord";
import { Note } from "../Note";
import { JPCVorVCVPhonemizer } from "./JPCVorVCVPhonemizer";

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

export class RomajiJPCVorVCVPhonemizer extends JPCVorVCVPhonemizer {
  name = "phonemizer.RomajiJPCVorVCVPhonemizer";
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
  protected _getLastPhoneme(note: Note | undefined): string {
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

  protected getOtoRecord(
    vb,
    prevPhoneme,
    lyric,
    notenum,
    voiceColor
  ): OtoRecord | null {
    const hiraganaLyric = this.convertRomajiToHiragana(lyric);
    /** 変換要否を判定する。!マークがある場合変換しない */
    if (hiraganaLyric.includes("!")) {
      return vb.getOtoRecord(
        hiraganaLyric.replace("!", ""),
        notenum,
        voiceColor
      );
    }
    /** 入力されている歌詞からCV部分を抽出する。CV部分はmatch[2]に格納されるはず */
    const match = reg.exec(hiraganaLyric);
    if (!match) return vb.getOtoRecord(hiraganaLyric, notenum, voiceColor);
    /** prefix.map無効フラグはmatch[2]に含まれてないため、別途含まれているか確認しておく*/
    const noPrefixMap: boolean = hiraganaLyric.includes("?");

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
    return vb.getOtoRecord(hiraganaLyric, notenum, voiceColor);
  }
}

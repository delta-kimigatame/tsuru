import { defaultNote } from "../../config/note";
import { PaperGroup } from "../../types/batchProcess";
import { BaseBatchProcess } from "../BaseBatchProcess";
import { Note } from "../Note";

const lyricModeOptions = ["CV", "VCV"] as const;
type LyricModeOptions = (typeof lyricModeOptions)[number];

const vowelConnectOptions = ["*", "param", "none"] as const;
type VowelConnectOptions = (typeof vowelConnectOptions)[number];

const envelopeTypeOptions = ["vcvCrossFade", "allCrossFade", "reset"] as const;
export type EnvelopeTypeOptions = (typeof envelopeTypeOptions)[number];

const reg = /^([^ ]*)(?:[-aiuron*] )([ぁ-んァ-ヶ]+)([^ ]*)$/;
const VCVCheck = /[-aiuron] ([ぁ-んァ-ヶ]+)/;
const vowelA =
  /[あかさたなはまやらわがざだばぱぁゃゎアカサタナハマヤラワガザダバパァャヮ]$/;
const vowelI =
  /[いきしちにひみゐりぎじぢびぴぃイキシチニヒミヰリギジヂビピィ]$/;
const vowelU =
  /[うくすつぬふむゆるぅぐずづぶぷウクスツヌフムユルゥグズヅブプヴ]$/;
const vowelE =
  /[えけせてねへめゑれぇげぜでべぺエケセテネヘメヱレェゲゼデベペ]$/;
const vowelO =
  /[おこそとのほもよろをごぞどぼぽぉオコソトノホモヨロヲゴゾドボポォ]$/;
const vowelN = /ん$/;
const CVVowels = /^[あいうえおん]$/;
export interface LyricOptions {
  /** モード */
  mode: LyricModeOptions;
  /** 日本語音源にあまり含まれていない文字「を」、「ぢ」、「づ」をそれぞれ同音の「お」、「じ」、「ず」に置き換えるか判断するフラグ */
  replace: boolean;
  /** CVモードの際、休符の後のノートに[- CV]を採用するか否か */
  useHeadingCV: boolean;
  /** 母音結合のタイプ */
  vowelConnect: VowelConnectOptions;
}

export interface PitchOptions {
  /** ノート頭からピッチベンドの開始までの時間をmsで表す。-1倍したものがpbsTimeになる */
  timing: number;
  /** ピッチベンド始点から終点までの時間をmsで表す。pbw[0]の値になる */
  speed: number;
}

export interface VivratoParam {
  /** 処理の要否 */
  isProcess: boolean;
  /** 処理を実行するlengthの閾値 */
  threshold: number;
  /** TODO 将来的にどのようなビブラートをかけるかをパラメータとして追加する */
}

export interface VivratoOptions {
  /** 全てのノートに軽くかける処理 */
  default: VivratoParam;
  /** 長いノートにかける処理 */
  long: VivratoParam;
  /** 休符の前など最後のノートにかける処理 */
  ending: VivratoParam;
}

export interface PreprocessingBatchProcessOptions {
  /** 歌詞の変更を行うか */
  lyric: boolean;
  /** 歌詞変換に関わるパラメータ */
  lyricOptions?: LyricOptions;
  /** ピッチの処理を行うか */
  pitch: boolean;
  /** ピッチ処理に関わるパラメータ */
  pitchOptions?: PitchOptions;
  /** ビブラート設定を行うか */
  vibrato: boolean;
  /** ビブラート設定に関わるパラメータ */
  vibratoOptions?: VivratoOptions;
  /** envelopeの一括設定を行うか */
  envelope: boolean;
  /** envelopeの処理の種類 */
  envelopeType?: EnvelopeTypeOptions;
  /** velocity一括設定を行うか */
  velocity: boolean;
  /** velocity一括設定の値 */
  velocityValue?: number;
  /** intensity一括設定を行うか */
  intensity: boolean;
  /** intensity一括設定の値 */
  intensityValue?: number;
  /** modulation一括設定を行うか */
  modulation: boolean;
  /** modulation一括設定の値 */
  modulationValue?: number;
  /** flags一括設定を行うか */
  flags: boolean;
  /** flags一括設定の値 */
  flagsValue?: string;
}

export class PreprocessingBatchProcess extends BaseBatchProcess<PreprocessingBatchProcessOptions> {
  title = "batchprocess.preprocessing.title";
  summary = "おまかせ下処理";
  public override process(
    notes: Note[],
    options: PreprocessingBatchProcessOptions
  ): Note[] {
    return super.process(notes, options);
  }
  protected _process(
    notes: Note[],
    options: PreprocessingBatchProcessOptions
  ): Note[] {
    const newNotes = notes.map((n) => n.deepCopy());
    newNotes.forEach((n) => {
      if (options.lyric && options.lyricOptions !== undefined) {
        /** lyricの処理 */
        this.lyricProcess(n, options.lyricOptions);
      }
      if (
        options.pitch &&
        options.pitchOptions !== undefined &&
        n.lyric !== "R"
      ) {
        /** pitchの処理 */
        n.pbsTime = options.pitchOptions.timing;
        n.pbsHeight = 0;
        n.setPbw([options.pitchOptions.speed]);
        n.setPbm([""]);
        n.setPby([0]);
      }
      if (options.vibrato && options.vibratoOptions !== undefined) {
        /** vibratoの処理 */
        this.vibratoProcess(n, options.vibratoOptions);
      }
      if (options.envelope && options.envelopeType !== undefined) {
        /** envelopeの処理 */
        this.envelopeProcess(n, options.envelopeType);
      }
      if (
        options.intensity &&
        options.intensityValue !== undefined &&
        n.lyric !== "R"
      ) {
        /** intensityの処理 */
        n.intensity = options.intensityValue;
      }
      if (
        options.velocity &&
        options.velocityValue !== undefined &&
        n.lyric !== "R"
      ) {
        /** velocityの処理 */
        n.velocity = options.velocityValue;
      }
      if (
        options.modulation &&
        options.modulationValue !== undefined &&
        n.lyric !== "R"
      ) {
        /** modulationの処理 */
        n.modulation = options.modulationValue;
      }
      if (
        options.flags &&
        options.flagsValue !== undefined &&
        n.lyric !== "R"
      ) {
        /** flagsの処理 */
        n.flags = options.flagsValue;
      }
    });
    return newNotes;
  }

  /**
   * 設定に基づいて`n.lyric`を変換する。
   * 日本語音源におけるlyricは`${prefix}(?:[-aiuron*] )${alias}${suffix}`にマッチすることが期待される。
   * なお、aliasはひらがなもしくはカタカナであり、prefixはフォルダパス、suffixはアンダーバーや英数字や漢字が想定される。
   *
   * 単独音(モードCV)での戻り値は基本的に`${alias}`となるが、`options.useHeadingCV`と`options.vowelConnect`によっては特殊な値を返す。
   * 連続音(モードVCV)では`(?:[-aiuron] )${alias}`を返す。なお[-aiuron]は1つ前のノートの歌詞のエイリアス部分の末尾によって決定され、いずれにも該当しない場合を-とする。
   *
   * @param n 歌詞を変換するノート
   * @param options 変換オプション
   */
  lyricProcess = (n: Note, options: LyricOptions) => {
    if (options.replace) {
      /** 歌詞の置き換え処理 */
      n.lyric = n.lyric
        .replace("を", "お")
        .replace("ぢ", "じ")
        .replace("づ", "ず");
    }
    /**
     * 日本語音源のlyricとして想定されるパターン。
     * match[1]はprefix
     * match[2]は実際のlyric
     * match[3]はsuffixを表す。
     * prefixとsuffixは基本的に音源固有のパラメータであり、本動作時に削除されることが期待される。
     * なお、match[1]とmatch[2]の間の(?:[-aiuron*] )はVCVやHeadingCV、vowelConect等で使われる。
     * マッチしない場合は日本語音源として想定されるlyricではないため変換の対象外とする。
     */
    const match = reg.exec(n.lyric);
    if (!match) {
      /** マッチしない場合何もしない */
    } else if (options.mode === "CV") {
      if (
        options.useHeadingCV &&
        (n.prev === undefined || n.prev.lyric === "R")
      ) {
        /** 先頭音用aliasを使い[- CV]にする */
        n.lyric = `- ${match[2]}`;
      } else if (
        options.vowelConnect === "*" &&
        CVVowels.test(match[2]) &&
        !(n.prev === undefined || n.prev.lyric === "R")
      ) {
        /** 母音結合用aliasを使い[* CV]にする */
        n.lyric = `* ${match[2]}`;
      } else {
        n.lyric = `${match[2]}`;
        if (options.vowelConnect === "param") {
          /**
           * パラメータ母音結合
           * 母音結合用のaliasが設定されていない場合にタイミング関係パラメータを用いて疑似的な母音結合を行う。
           */
          n.stp = 50;
          n.preutter = 25;
          n.overlap = 50;
        }
      }
    } else if (options.mode === "VCV") {
      const prevLyric = n.prev === undefined ? "R" : n.prev.lyric;
      const prevMatch = reg.exec(prevLyric);
      if (!prevMatch) {
        /** 前のノートが特にマッチしない場合先頭音と思われる。 */
        n.lyric = `- ${match[2]}`;
      } else if (vowelA.test(prevMatch[2])) {
        /** 前のノートのalias部分の母音はあ */
        n.lyric = `a ${match[2]}`;
      } else if (vowelI.test(prevMatch[2])) {
        /** 前のノートのalias部分の母音はい */
        n.lyric = `i ${match[2]}`;
      } else if (vowelU.test(prevMatch[2])) {
        /** 前のノートのalias部分の母音はう */
        n.lyric = `u ${match[2]}`;
      } else if (vowelE.test(prevMatch[2])) {
        /** 前のノートのalias部分の母音はえ */
        n.lyric = `e ${match[2]}`;
      } else if (vowelO.test(prevMatch[2])) {
        /** 前のノートのalias部分の母音はお */
        n.lyric = `o ${match[2]}`;
      } else if (vowelN.test(prevMatch[2])) {
        /** 前のノートのalias部分の母音はん */
        n.lyric = `n ${match[2]}`;
      } else {
        /** ここには来ないことを期待しているが念のため例外処理として実装 */
        this.log(
          `開発者の意図しない例外。lyric:${n.lyric}、prevLyric:${prevLyric}`
        );
        n.lyric = `- ${match[2]}`;
      }
    }
  };

  /**
   * 設定に従ってエンベロープを変更する。
   * optionが`reset`の場合、envelopeは全て初期値とします。
   * optionが`allCrossFade`の場合すべてのenvelopeをp2,p3クロスフェードします、
   * optionが`vcvCrossFade`の場合、当該ノートがVCVに該当する場合はp2,p3クロスフェードを、そうでない場合は初期化をします。
   *
   * @param n 変更対象のノート
   * @param option 設定値
   */
  envelopeProcess = (n: Note, option: EnvelopeTypeOptions) => {
    if (option === "reset") {
      n.setEnvelope(undefined);
    } else if (option === "allCrossFade") {
      this.envelopeCrossfade(n);
    } else if (option === "vcvCrossFade") {
      if (VCVCheck.test(n.lyric)) {
        this.envelopeCrossfade(n);
      } else {
        n.setEnvelope(undefined);
      }
    }
  };

  /**
   * エンベロープをp2,p3クロスフェードする。
   * p2,p3クロスフェードとは`{point:[0,n.atOverlap,n.next.atOverlap],value:{0,100,100,0}}`の状態を基本とする。
   * ただし、前のノートが休符(`n.prev.lyric==="R"`)の場合やn.atOverlapが見つからない場合p2は初期値とする。
   * また、次のノートがない場合やatOverlap値を持っていない場合p3は初期値とする。
   * @param n
   */
  envelopeCrossfade = (n: Note): void => {
    const defaultP2 = defaultNote.envelope.point[1];
    const defaultP3 = defaultNote.envelope.point[2];
    // n.next が存在し、かつ atOverlap が定義されていればそれを、そうでなければ defaultP3
    const nextOverlap =
      n.next === undefined ||
      n.next.lyric === "R" ||
      n.next.atOverlap === undefined ||
      n.next.atOverlap <= 0
        ? defaultP3
        : n.next.atOverlap;
    /** 前のノートが存在しないか、前のノートが休符か、このノートにatOverlap値がなければデフォルト値を設定する。 */
    const overlap =
      n.prev === undefined ||
      n.prev.lyric === "R" ||
      n.atOverlap === undefined ||
      n.atOverlap <= 0
        ? defaultP2
        : n.atOverlap;
    n.setEnvelope({
      point: [0, overlap, nextOverlap],
      value: [0, 100, 100, 0],
    });
  };

  /**
   * オプションに従ってビブラートを設定する。
   * @param n 対象のノート
   * @param options 設定
   */
  vibratoProcess = (n: Note, options: VivratoOptions) => {
    /** 次のノートが存在しない場合、このノートはendingと言えるので、後の判定が楽になるように休符とみなす。 */
    const nextLyrics = n.next === undefined ? "R" : n.next.lyric;
    if (n.lyric === "R") {
      /** ノート自体の歌詞がRの場合設定に関わらずビブラートを消去 */
      n.vibrato = undefined;
    } else if (
      nextLyrics === "R" &&
      options.ending.isProcess &&
      n.length >= options.ending.threshold
    ) {
      /** 次のノートが休符かつendingビブラートがtrueかつノート長が閾値以上の場合、ending設定 */
      n.vibrato = "70,180,65,10,10,50,0,0";
    } else if (options.long.isProcess && n.length >= options.long.threshold) {
      /** longビブラートがtrueかつノート長が閾値以上の場合、long設定 */
      n.vibrato = "70,160,50,10,10,50,0,0";
    } else if (
      options.default.isProcess &&
      n.length >= options.default.threshold
    ) {
      /** defaultビブラートがtrueかつノート長が閾値以上の場合、default設定 */
      n.vibrato = "80,200,20,20,20,00,0,0";
    } else {
      /** いずれにも該当しなければ値の初期化 */
      n.vibrato = undefined;
    }
  };

  ui = [
    {
      titleKey: "batchprocess.preprocessing.lyric.title",
      items: [
        {
          key: "lyric",
          labelKey: "batchprocess.preprocessing.lyric.lyric",
          inputType: "switch",
          defaultValue: true,
        },
        {
          key: "lyricOptions.mode",
          labelKey: "batchprocess.preprocessing.lyric.mode",
          inputType: "select",
          options: lyricModeOptions,
          displayOptionKey: "batchprocess.preprocessing.lyric.modeOptions",
          defaultValue: "VCV",
        },
        {
          key: "lyricOptions.replace",
          labelKey: "batchprocess.preprocessing.lyric.replace",
          inputType: "checkbox",
          defaultValue: true,
        },
        {
          key: "lyricOptions.useHeading",
          labelKey: "batchprocess.preprocessing.lyric.useHeadingCV",
          inputType: "checkbox",
          defaultValue: true,
        },
        {
          key: "lyricOptions.vowelConnect",
          labelKey: "batchprocess.preprocessing.lyric.vowelConnect",
          inputType: "select",
          options: vowelConnectOptions,
          displayOptionKey:
            "batchprocess.preprocessing.lyric.vowelConnectOptions",
          defaultValue: "*",
        },
      ],
    } as PaperGroup,
    {
      titleKey: "batchprocess.preprocessing.pitch.title",
      items: [
        {
          key: "pitch",
          labelKey: "batchprocess.preprocessing.pitch.pitch",
          inputType: "switch",
          defaultValue: true,
        },
        {
          key: "pitchOptions.speed",
          labelKey: "batchprocess.preprocessing.pitch.speed",
          inputType: "select",
          options: [60, 80, 100, 130, 160],
          displayOptionKey: "batchprocess.preprocessing.pitch.speedOptions",
          defaultValue: 60,
        },
        {
          key: "pitchOptions.timing",
          labelKey: "batchprocess.preprocessing.pitch.timing",
          inputType: "select",
          options: [60, 45, 30, 15, 0],
          displayOptionKey: "batchprocess.preprocessing.pitch.timingOptions",
          defaultValue: 45,
        },
      ],
    } as PaperGroup,
    {
      titleKey: "batchprocess.preprocessing.vibrato.title",
      items: [
        {
          key: "vibrato",
          labelKey: "batchprocess.preprocessing.vibrato.vibrato",
          inputType: "switch",
          defaultValue: true,
        },
        {
          key: "vibratoOptions.default.isProcess",
          labelKey: "batchprocess.preprocessing.vibrato.default",
          inputType: "checkbox",
          defaultValue: false,
        },
        {
          key: "vibratoOptions.default.threshold",
          labelKey: "batchprocess.preprocessing.vibrato.defaultThreshold",
          inputType: "select",
          options: [480, 720, 960, 1200, 1440], //四分音符、付点四分音符、二分音符、付点二分音符、全音符
          displayOptionKey:
            "batchprocess.preprocessing.vibrato.thresholdOptions",
          defaultValue: 720,
        },
        {
          key: "vibratoOptions.long.isProcess",
          labelKey: "batchprocess.preprocessing.vibrato.long",
          inputType: "checkbox",
          defaultValue: true,
        },
        {
          key: "vibratoOptions.long.threshold",
          labelKey: "batchprocess.preprocessing.vibrato.longThreshold",
          inputType: "select",
          options: [480, 720, 960, 1200, 1440], //四分音符、付点四分音符、二分音符、付点二分音符、全音符
          displayOptionKey:
            "batchprocess.preprocessing.vibrato.thresholdOptions",
          defaultValue: 960,
        },
        {
          key: "vibratoOptions.ending.isProcess",
          labelKey: "batchprocess.preprocessing.vibrato.ending",
          inputType: "checkbox",
          defaultValue: true,
        },
        {
          key: "vibratoOptions.ending.threshold",
          labelKey: "batchprocess.preprocessing.vibrato.endingThreshold",
          inputType: "select",
          options: [480, 720, 960, 1200, 1440], //四分音符、付点四分音符、二分音符、付点二分音符、全音符
          displayOptionKey:
            "batchprocess.preprocessing.vibrato.thresholdOptions",
          defaultValue: 960,
        },
      ],
    } as PaperGroup,
    {
      titleKey: "batchprocess.preprocessing.envelope.title",
      items: [
        {
          key: "envelope",
          labelKey: "batchprocess.preprocessing.envelope.envelope",
          inputType: "switch",
          defaultValue: true,
        },
        {
          key: "envelopeType",
          labelKey: "batchprocess.preprocessing.envelope.type",
          inputType: "select",
          options: envelopeTypeOptions,
          displayOptionKey: "batchprocess.preprocessing.envelope.option",
          defaultValue: "vcvCrossFade",
        },
      ],
    } as PaperGroup,
    {
      titleKey: "batchprocess.preprocessing.velocity.title",
      items: [
        {
          key: "velocity",
          labelKey: "batchprocess.preprocessing.velocity.velocity",
          inputType: "switch",
          defaultValue: false,
        },
        {
          key: "velocityValue",
          labelKey: "batchprocess.preprocessing.velocity.value",
          inputType: "slider",
          min: 0,
          max: 200,
          step: 1,
          defaultValue: 100,
        },
      ],
    } as PaperGroup,
    {
      titleKey: "batchprocess.preprocessing.intensity.title",
      items: [
        {
          key: "intensity",
          labelKey: "batchprocess.preprocessing.intensity.intensity",
          inputType: "switch",
          defaultValue: false,
        },
        {
          key: "intensityValue",
          labelKey: "batchprocess.preprocessing.intensity.value",
          inputType: "slider",
          min: 0,
          max: 200,
          step: 1,
          defaultValue: 100,
        },
      ],
    } as PaperGroup,
    {
      titleKey: "batchprocess.preprocessing.modulation.title",
      items: [
        {
          key: "modulation",
          labelKey: "batchprocess.preprocessing.modulation.modulation",
          inputType: "switch",
          defaultValue: true,
        },
        {
          key: "modulationValue",
          labelKey: "batchprocess.preprocessing.modulation.value",
          inputType: "slider",
          min: -100,
          max: 100,
          step: 1,
          defaultValue: 0,
        },
      ],
    } as PaperGroup,
    {
      titleKey: "batchprocess.preprocessing.flags.title",
      items: [
        {
          key: "flags",
          labelKey: "batchprocess.preprocessing.flags.flags",
          inputType: "switch",
          defaultValue: false,
        },
        {
          key: "flagsValue",
          labelKey: "batchprocess.preprocessing.flags.value",
          inputType: "textbox-string",
          defaultValue: "",
        },
      ],
    } as PaperGroup,
  ];

  initialOptions: PreprocessingBatchProcessOptions = {
    lyric: true,
    lyricOptions: {
      mode: "VCV",
      vowelConnect: "*",
      useHeadingCV: true,
      replace: true,
    },
    pitch: true,
    pitchOptions: { timing: 45, speed: 60 },
    vibrato: true,
    vibratoOptions: {
      default: { isProcess: false, threshold: 720 },
      long: { isProcess: true, threshold: 960 },
      ending: { isProcess: true, threshold: 960 },
    },
    envelope: true,
    envelopeType: "vcvCrossFade",
    velocity: false,
    velocityValue: 100,
    intensity: false,
    intensityValue: 100,
    modulation: true,
    modulationValue: 0,
    flags: false,
    flagsValue: "",
  };
}

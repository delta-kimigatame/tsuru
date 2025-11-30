/**
 * UTAU音源用presamp.iniファイルを扱う
 * 本来のpresamp.iniには、アプリの動作に関する設定と音源に関する設定が混在しているが、
 * 本クラスでは音源に関する設定のみを扱う。
 */

export class Presamp {
  /** 母音に関する設定 */
  vowels: {
    /** 母音を代表するローマ字。 */
    symbol: string;
    /** 母音を代表するCV */
    representative: string;
    /** 当該母音に該当するCV群。後方一致で使用 */
    CVs: string[];
    /** 母音の音量 */
    volume: number;
  }[];
  /** 子音に関する設定 */
  consonants: {
    /** 子音を代表するローマ字。 */
    symbol: string;
    /** 当該子音に該当するCV群。完全一致で使用 */
    CVs: string[];
    /** クロスフェードの仕様 */
    crossfade: boolean;
    /** VCの長さにCVを使用する */
    useCVLength: boolean;
    /** VCVが存在する場合においてもCVVCを優先するかの設定 */
    prioritizeCVVC: boolean;
  }[];

  /** 歌詞の置き換えに関する設定 */
  replacements: { [key: string]: string };

  /** presampにおいて、変換する際のルール */
  alias: {
    /** 連続音の定義 */
    vcv: string;
    /** 休符の次の単独音の定義 */
    beginingCv: string;
    /** 母音結合単独音の定義 */
    crossCv: string;
    /** VCの定義 */
    vc: string;
    /** 単独音の定義 */
    cv: string;
    /** ロングトーン用母音の定義 */
    longV: string;
    /** VCのvとCの間に置かれる文字列の定義 */
    vcPad: string;
    /** VCVのvとCVの間に置かれる文字列の定義 */
    vcvPad: string;
    /** 休符を変換する形の語尾音源の定義 */
    endingRest: string;
    /** 最終ノートに付け足す形の語尾音源の定義 */
    endingFinal: string;
  };

  //presamp.iniにあったpre,su,num,append,pitchはutaletでは扱わない。

  /** 歌詞変換ルールの優先順位(通常) */
  normalPriority: string[];
  /** 歌詞変換ルールの優先順位(ボイスカラーが異なる) */
  differentVoiceColorPriority: string[];
  /** 歌詞変更ルールの優先順位(prefixmapが異なる) */
  differentPrefixMapPriority: string[];
  // presamp.iniにあったsplit,mustvcについては、phonemizer側で定義する。

  /** 子音のみで構成されるノートに付与されるフラグ文字列 */
  consonantFlags: string;

  /** 語尾の種類 */
  endingType: "none" | "rest" | "final" | "auto";

  /** デフォルト値で初期化 */
  constructor() {
    this.vowels = [];
    this.consonants = [];
    this.replacements = {};
    this.normalPriority = ["VCV", "CVVC", "crossCV", "CV", "beginingCV"];
    this.differentVoiceColorPriority = [
      "CVVC",
      "VCV",
      "crossCV",
      "CV",
      "beginingCV",
    ];
    this.differentPrefixMapPriority = [
      "CVVC",
      "VCV",
      "crossCV",
      "CV",
      "beginingCV",
    ];
    this.consonantFlags = "P0";
    this.endingType = "none";
  }

  /** presamp.iniのテキストデータを読み込む */
  parseIni(text: string) {
    //bomサインの削除
    if (text.charCodeAt(0) === 0xfeff) {
      text = text.slice(1);
    }
    const lines = text.replace(/\r/g, "").split("\n");
    let normalPriorityInitialized = false;
    let differentVoiceColorPriorityInitialized = false;
    let differentPrefixMapPriorityInitialized = false;
    let section:
      | ""
      | "vowel"
      | "consonant"
      | "priority"
      | "replacement"
      | "alias"
      | "normalPriority"
      | "differentVoiceColorPriority"
      | "differentPrefixMapPriority"
      | "consonantFlags"
      | "useCVLength"
      | "endingType1"
      | "endingType2"
      | "VCPAD"
      | "endingType"
      | "endingMode" = "";
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("[VOWEL]")) {
        section = "vowel";
      } else if (lines[i].startsWith("[CONSONANT]")) {
        section = "consonant";
      } else if (lines[i].startsWith("[PRIORITY]")) {
        section = "priority";
      } else if (lines[i].startsWith("[REPLACE]")) {
        section = "replacement";
      } else if (lines[i].startsWith("[ALIAS]")) {
        section = "alias";
      } else if (
        lines[i].startsWith("[PRE]") ||
        lines[i].startsWith("[SU]") ||
        lines[i].startsWith("[NUM]") ||
        lines[i].startsWith("[APPEND]") ||
        lines[i].startsWith("[PITCH]") ||
        lines[i].startsWith("[SPLIT]") ||
        lines[i].startsWith("[MUSTVC]")
      ) {
        /**utaletでは扱わない音源関係のセクション */
        section = "";
      } else if (lines[i].startsWith("[ALIAS_PRIORITY]")) {
        section = "normalPriority";
      } else if (lines[i].startsWith("[ALIAS_PRIORITY_DIFAPPEND]")) {
        section = "differentVoiceColorPriority";
      } else if (lines[i].startsWith("[ALIAS_PRIORITY_DIFPITCH]")) {
        section = "differentPrefixMapPriority";
      } else if (lines[i].startsWith("[CFLAGS]")) {
        section = "consonantFlags";
      } else if (lines[i].startsWith("[VCLENGTH]")) {
        section = "useCVLength";
      } else if (lines[i].startsWith("[ENDINGTYPE1]")) {
        section = "endingType1";
      } else if (lines[i].startsWith("[ENDINGTYPE2]")) {
        section = "endingType2";
      } else if (lines[i].startsWith("[ENDINGTYPE]")) {
        section = "endingType";
      } else if (lines[i].startsWith("[VCPAD]")) {
        section = "VCPAD";
      } else if (lines[i].startsWith("[ENDFLAG]")) {
        section = "endingMode";
      } else if (lines[i].startsWith("[")) {
        /** 音源関係以外のセクション */
        section = "";
      } else if (section === "vowel") {
        const [symbol, representative, CVs, volume] = lines[i].split("=");
        this.vowels.push({
          symbol: symbol,
          representative: representative,
          CVs: CVs.split(","),
          volume: parseFloat(volume),
        });
      } else if (section === "consonant") {
        /** useCVLengthは存在しない場合もある */
        const [symbol, cvs, crossfade, useCVLength] = lines[i].split("=");
        this.consonants.push({
          symbol: symbol,
          CVs: cvs.split(","),
          crossfade: crossfade === "1",
          useCVLength: useCVLength === "1",
          prioritizeCVVC: false,
        });
      } else if (section === "priority") {
        const prioritizeConsonants = lines[i].split(",");
        this.consonants = this.consonants.map((c) => {
          return {
            ...c,
            prioritizeCVVC: prioritizeConsonants.includes(c.symbol),
          };
        });
      } else if (section === "replacement") {
        const [from, to] = lines[i].split("=");
        this.replacements[from] = to;
      } else if (section === "alias") {
        if (lines[i].startsWith("VCV=")) {
          this.alias.vcv = lines[i].replace("VCV=", "");
        } else if (lines[i].startsWith("BEGINING_CV=")) {
          this.alias.beginingCv = lines[i].replace("BEGINING_CV=", "");
        } else if (lines[i].startsWith("CROSS_CV=")) {
          this.alias.crossCv = lines[i].replace("CROSS_CV=", "");
        } else if (lines[i].startsWith("VC=")) {
          this.alias.vc = lines[i].replace("VC=", "");
        } else if (lines[i].startsWith("CV=")) {
          this.alias.cv = lines[i].replace("CV=", "");
        } else if (lines[i].startsWith("LONG_V=")) {
          this.alias.longV = lines[i].replace("LONG_V=", "");
        } else if (lines[i].startsWith("VCPAD=")) {
          this.alias.vcPad = lines[i].replace("VCPAD=", "");
        } else if (lines[i].startsWith("VCVPAD=")) {
          this.alias.vcvPad = lines[i].replace("VCVPAD=", "");
        } else if (lines[i].startsWith("ENDING1=")) {
          this.alias.endingRest = lines[i].replace("ENDING1", "");
        } else if (lines[i].startsWith("ENDING2=")) {
          this.alias.endingFinal = lines[i].replace("ENDING2", "");
        }
      } else if (section === "normalPriority") {
        if (!normalPriorityInitialized) {
          this.normalPriority = [];
          normalPriorityInitialized = true;
        }
        this.normalPriority.push(lines[i]);
      } else if (section === "differentVoiceColorPriority") {
        if (!differentVoiceColorPriorityInitialized) {
          this.differentVoiceColorPriority = [];
          differentVoiceColorPriorityInitialized = true;
        }
        this.differentVoiceColorPriority.push(lines[i]);
      } else if (section === "differentPrefixMapPriority") {
        if (!differentPrefixMapPriorityInitialized) {
          this.differentPrefixMapPriority = [];
          differentPrefixMapPriorityInitialized = true;
        }
        this.differentPrefixMapPriority.push(lines[i]);
      } else if (section === "consonantFlags") {
        this.consonantFlags = lines[i];
      } else if (section === "useCVLength") {
        if (lines[i] === "1") {
          this.consonants = this.consonants.map((c) => {
            return {
              ...c,
              useCVLength: true,
            };
          });
        }
      } else if (section === "endingType1") {
        this.alias.endingRest = lines[i];
      } else if (section === "endingType2") {
        this.alias.endingFinal = lines[i];
      } else if (section === "endingType") {
        this.alias.endingRest = lines[i];
      } else if (section === "VCPAD") {
        this.alias.vcPad = lines[i];
      } else if (section === "endingMode") {
        if (lines[i] === "0") {
          this.endingType = "none";
        } else if (lines[i] === "1") {
          this.endingType = "rest";
        } else if (lines[i] === "2") {
          this.endingType = "final";
        } else if (lines[i] === "3") {
          this.endingType = "auto";
        }
      }
    }
  }

  /** 母音単体ノートを判別する正規表現 */
  get CVVowels(): RegExp {
    const representatives =
      "^" + this.vowels.map((v) => v.representative).join("") + "$";
    return new RegExp(representatives);
  }

  /** CVに該当する部分を特定する正規表現。CVには1文字の物もあれば2文字以上のものもあるが、いずれかに完全一致すればCVといえる。 */
  get CVRegex(): RegExp {
    const pattern = this.alias.cv.split(",");
    const cvs: string[] = [];
    if ("%CV%" in pattern) {
      /** %CV%が設定されている場合、consonants.CVsに含まれる内容はすべてCVといえる */
      cvs.push(...this.consonants.flatMap((c) => c.CVs));
    }
    if ("%v%" in pattern) {
      /* %v%が設定されている場合、vowels.symbolに含まれる内容はすべてCVといえる */
      cvs.push(...this.vowels.map((v) => v.symbol));
    }
    if ("%V%" in pattern) {
      /* %V%が設定されている場合、vowels.representativeに含まれる内容はすべてCVといえる */
      cvs.push(...this.vowels.map((v) => v.representative));
    }
    if ("%c%" in pattern) {
      /* %c%が設定されている場合、consonants.symbolに含まれる内容はすべてCVといえる */
      cvs.push(...this.consonants.map((c) => c.symbol));
    }
    const uniqueCvs = Array.from(new Set(cvs));
    const cvsPattern = "^(" + uniqueCvs.join("|") + ")$";
    return new RegExp(cvsPattern);
  }

  /**
   * 母音の正規表現と対応する母音記号の一覧
   * この正規表現は後方一致で使用する。
   */
  get vowelRegs(): { reg: RegExp; symbol: string }[] {
    return this.vowels.map((v) => {
      return {
        reg: new RegExp(
          v.CVs.map((c) => c.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")).join(
            "|"
          ) + "$"
        ),
        symbol: v.symbol,
      };
    });
  }

  /**
   * VCV判定用のregExp、本来であればalias.vcvから柔軟な設定を可能にするべきだが、めんどくさい割に誰も使わないので無視して
   * %v%%VCVPad%%CV%の形に固定する。
   * */
  get VCVRegExp(): RegExp {
    const vPart = this.vowels.map((v) => v.symbol).join("|");

    const cvPart = this.CVRegex.source.slice(1, -1); // ^と$  を削除

    const vcvPadPart = this.alias.vcvPad;

    return new RegExp(`^(${vPart})${vcvPadPart}(${cvPart})$`);
  }
}

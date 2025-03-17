export const translationJa = {
  header: {
    clickInfo: "音源が未選択です。音源を選択して始めよう!",
  },
  language: {
    ja: "日本語",
    en: "英語",
  },
  theme: {
    system: "端末設定にあわせる",
    light: "ライトモード",
    dark: "ダークモード",
  },
  menu: {
    toDarkMode: "ダークモードにする",
    toLightMode: "ライトモードにする",
    changeLanguage: "言語設定",
    showLog: "操作ログ表示",
    logAttention:
      "ログは自動では送信されません。必要に応じて開発者に送付してください。",
  },
  top: {
    catchphrase: "さあ!UTAおう!",
    descriptions: [
      "UTAletはUTAU音源を用いたブラウザベースの歌声合成ツールです。",
      "日本語の単独音と連続音が想定されています。",
    ],
    selectZipButtonText: "UTAU音源のzipファイルを選択",
    selectZipButtonDescription:
      "「UTAU音源のzipファイルを選択」をクリックすると、利用規約に同意したとみなします。",
    rule: "利用規約",
    ruleDescription: "声の権利者から許諾を得た音源のみご利用できます。",
    ruleDescription2:
      "人力音源はNGです。UTAUのために録音した音源なら利用規約で禁止されていなければOK",
    privacy: "プライバシーポリシー",
    privacyAnalytics: `当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を使用しています。
      このGoogleアナリティクスはデータの収集のためにCookieを使用しています。
      このデータは匿名で収集されており、個人を特定するものではありません。`,
    privacyCookie:
      "ユーザー体験を向上させるため、表示方法や操作方法のカスタマイズを行うためにCookieを使用します。これらのデータは収集されず、サイト内での利便性向上のみに使用されます。",
    privacyOffline:
      "本サービスは完全オフラインでも動作し、サーバーとの通信は一切行いません。",
    privacyWorker:
      "本サイトで使用されるワーカーは、プライバシーに関わるデータを収集しません。",
    history: "更新履歴",
    changelog: ["2025/03/** 初版公開"],
  },
  loadVBDialog: {
    title: "ZIP読込",
    encodeCheck: "文字化け確認",
    encoding: "文字コード",
    submit: "OK",
    error: "読込失敗しました。このファイルはUTAU音源ではありません。",
  },
  infoVBDialog: {
    characterInfo: {
      name: "音源名",
      author: "管理者",
      web: "webサイト",
      version: "バージョン情報",
      voice: "音声提供者",
      otoCounts: "エイリアスの数",
    },
    TextTabs: {
      notFound: "音源フォルダ内にテキストファイルが見つかりませんでした",
    },
    TextTabContent: {
      error: "テキストファイルの読み込みに失敗しました。",
    },
    agreeButton: "全規約に同意",
  },
  editor: {
    footer: {
      project: "ust読込",
      zoom: "拡大縮小",
      batchprocess: "一括処理",
      play: "再生",
      wav: "wav保存",
      ustLoadError:
        "ustファイルの読み込みに失敗しました。ファイルを確認してください。",
      verticalZoomIn: "拡大(縦)",
      verticalZoomOut: "縮小(縦)",
      horizontalZoomIn: "拡大(横)",
      horizontalZoomOut: "縮小(横)",
    },
  },
  batchprocess: {
    octaveUp: "1オクターブ上げる",
    octaveDown: "1オクターブ下げる",
    envelopeNormalize: "エンベロープ正規化",
    resetEdit: {
      title: "調声リセット",
      info: "ラベルをリセット",
      pitch: "ピッチをリセット",
      intensity: "音量をリセット",
      flags: "フラグのリセット",
      velocity: "子音速度をリセット",
      envelope: "エンベロープをリセット",
      vibrato: "ビブラートをリセット",
      modulation: "モジュレーションをリセット",
    },
    preprocessing: {
      title: "おまかせ下処理",
      lyric: {
        title: "歌詞",
        lyric: "歌詞を変更する",
        mode: "aa",
        modeOptions: ["単独音", "連続音"],
        replace: "「を」「ぢ」「づ」を「お」「じ」「ず」に置き換える",
        useHeadingCV: "単独音モードの時、先頭のノートを[- あ]の形式にする",
        vowelConnect: "母音結合(単独音モード)",
        vowelConnectOptions: [
          "母音結合用形式[* あ]を使う",
          "[あ]をそのまま使う",
          "[あ]のパラメータを自動調整する",
        ],
      },
      pitch: {
        title: "ピッチ",
        pitch: "ピッチを一括設定する",
        speed: "音程が変わるはやさ",
        speedOptions: [
          "すごくはやめ",
          "はやめ",
          "ふつう",
          "ゆっくり",
          "すごくゆっくり",
        ],
        timing: "音程が変わるタイミング",
        timingOptions: [
          "すごくはやめ",
          "はやめ",
          "まんなか",
          "おそめ",
          "すごくおそめ",
        ],
      },
      vibrato: {
        title: "ビブラート",
        vibrato: "ビブラートをかける",
        default: "全てのノートに浅くかける",
        defaultThreshold: "対象ノート長(浅くかける)",
        long: "長いノートに深くかける",
        longThreshold: "対象ノート長(長いノート)",
        ending: "休符の前のノートに長く深くかける",
        endingThreshold: "対象ノート長(休符前)",
        thresholdOptions: [
          "四分音符(480)",
          "付点四分音符(720)",
          "二分音符(960)",
          "付点二分音符(1440)",
          "全音符(1930)",
        ],
      },
      envelope: {
        title: "エンベロープ",
        envelope: "エンベロープを自動修正する",
        type: "自動修正の種類",
        option: [
          "連続音のみクロスフェード",
          "全てのノートをクロスフェード",
          "初期化",
        ],
      },
      velocity: {
        title: "子音速度",
        velocity: "子音速度を一括設定する",
        value: "子音速度(大きいほど速い)",
      },
      intensity: {
        title: "音量",
        intensity: "音量を一括設定する",
        value: "音量",
      },
      modulation: {
        title: "モジュレーション",
        modulation: "モジュレーションを一括設定する",
        value: "モジュレーション(原音の音程のゆれ、理由がなければ0推奨)",
      },
      flags: {
        title: "フラグ(UTAletではフラグ未対応)",
        flags: "フラグを一括設定する",
        value:
          "フラグ(エンジンによって異なります。UTAlet標準エンジンでは未対応)",
      },
    },
    process: "実行",
  },
  footer: {
    disclaimer:
      "UTAUは飴屋／菖蒲氏によって公開されている、Windows向けに作成された歌声合成ソフトウェアです。",
    disclaimer2: "本ソフトウェアはUTAU公式とは無関係です。",
    developerx: "開発者Xアカウント",
    github: "github",
    discord: "discord",
  },
  xbutton: {
    share: "共有",
  },
  error: {
    title: "エラー",
    message:
      "予期せぬエラーが生じました。下記のボタンからlogをダウンロードし、開発者に送付してください。",
    download: "ログをダウンロード",
    log: "操作ログ",
  },
};

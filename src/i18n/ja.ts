export const translationJa = {
  language: {
    ja: "日本語",
    en: "英語",
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
    description: "GakuyaはUTAU音源のためのパッケージングツールです。",
    selectZipButtonText: "利用規約に同意して、UTAU音源のzipファイルを選択",
    rule: "利用規約",
    ruleDescription: "声の権利者から許諾を得た音源のみご利用できます。",
    ruleDescription2:
      "人力音源はNGです。UTAUのために録音した音源なら利用規約で禁止されていなければOK",
    privacy: "プライバシーポリシー",
    privacyAnalytics: `当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を使用しています。
      このGoogleアナリティクスはデータの収集のためにCookieを使用しています。
      このデータは匿名で収集されており、個人を特定するものではありません。`,
    privacyCookie:
      "当サイトでは、表示方法をカスタマイズするためにcookieを使用します。",
    history: "更新履歴",
    changelog: ["2025/02/17 ファイル一覧タブの追加", "2025/02/13 初版公開"],
  },
  editor: {
    file_check: {
      title: "ファイルの確認",
      all: "全て選択",
      file_list: "ファイル一覧",
      contentsdir: {
        title: "音源ルート(インストールしたいファイルが入っているフォルダ)",
        description:
          "この設定を変更すると、character.txt,character.yaml,readme.txt,install.txt,prefix.mapの編集内容が破棄されます。",
      },
      remove: {
        title: "不要ファイルの削除",
        read: "$readの削除",
        uspec: "UTAU 原音設定キャッシュファイル(*.uspec)の削除",
        setparam: "setParamキャッシュファイル(oto.setParam-Scache)の削除",
        vlabeler: "vLabelerキャッシュフォルダ(*.lbp.caches/)の削除",
      },
      frq: {
        title: "周波数表ファイル",
        description:
          "基本的にはfrq以外削除します。周波数表の手動修正をしている場合残してください。",
        frq: "UTAU標準周波数表 *.frqが存在しない場合生成",
        pmk: "tipsエンジン周波数表 *.pmkを削除",
        frc: "model4エンジン周波数表 *.frcを削除(利用規約で配布禁止)",
        vs4ufrq: "VS4Uエンジン周波数表 *.vs4ufrqを削除",
        world: "w4uエンジン周波数表 *.dio,*.stac,*.platinumを削除",
        llsm: "moresampler解析ファイル *.llsmを削除",
        mrq: "moresampler解析ファイル *.mrqを削除",
      },
      oto: {
        title: "oto.ini",
        root: "音源ルートにoto.iniが存在しない場合、空のファイルを生成",
      },
      wav: {
        title: "音声データ",
        description: "基本的には全てチェックする",
        stereo: "ステレオ音源をモノラルに変換する",
        sampleRate: "サンプリング周波数を44,100にする",
        depth: "bit深度を16bitにする",
        dcoffset: "DCオフセットを除去する。",
      },
    },
    character: {
      title: "キャラクター",
      description: "音源の情報です。必ず必要になります。",
      check: "character.txtを作成・更新する(存在しなければ必ず作成)",
      convertBmp: "画像を選択してUTAUアイコンに変換(bmp/jpg/gif/png)",
      field: {
        name: "音源名",
        image: "アイコン画像(bmp/jpg/gif)",
        sample: "サンプル音声",
        author: "管理者",
        web: "webサイト",
        version: "バージョン情報",
        convertBmp: "zip外の画像を選択(bmp/jpg/gif/png)",
        uploadSample: "zip外の音声を選択(wav)",
      },
    },
    characterYaml: {
      description: "OpenUtau向けの追加設定です。",
      check: "character.yamlを作成・更新する",
      TextFileEncoding: "文字コードを表示する(shift-jis)",
      Portrait: "立ち絵イラスト",
      PortraitUpload: "zip外の画像を選択(png)",
      PortraitOpacity: "立ち絵の透明度",
      PortraitHeight: "立ち絵の高さ",
      Voice: "音声提供者",
    },
    readme: {
      title: "説明書・利用規約",
      check: "readme.txtを作成・更新する",
      description:
        "初めてこの音源を使う際に表示されます。利用規約や音源の説明を書くといいでしょう。",
    },
    install: {
      title: "インストール設定",
      check: "install.txtを作成・更新する",
      description:
        "UTAUにドラッグ&ドロップでインストールできるようになります。",
      field: {
        folder: "インストール先フォルダ",
        contentsdir: "インストールしたいファイルが入っているフォルダ",
        description: "インストール時の1行説明",
      },
    },
    prefixmap: {
      title: "prefix.map",
      description: "音高毎に自動で音源を切り替えるための設定です。",
      description2: "Voice Colorは本家UTAUでは使えません。",
      check: "prefix.mapを作成・更新する",
      header: {
        tone: "音階",
        prefix: "prefix",
        suffix: "suffix",
      },
      voiceColor: "Voice Color",
      add: "追加",
      change: "変更",
      delete: "削除",
      all: "全て選択",
      cancel: "選択解除",
      set: "セット",
      clear: "クリア",
    },
    output: "zipファイルを生成する",
    download: "ダウンロード",
  },
  footer: {
    disclaimer:
      "UTAUは飴屋／菖蒲氏によって公開されている、Windows向けに作成された歌声合成ソフトウェアです。",
    disclaimer2: "本ソフトウェアはUTAU公式とは無関係です。",
    developerx: "開発者Xアカウント",
    github: "github",
    discord: "discord",
  },
  loadZipDialog: {
    title: "ZIP読込",
    encodeCheck: "文字化け確認",
    encoding: "文字コード",
    reload: "指定文字コードで再読込",
    submit: "OK",
    error: "読込失敗",
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

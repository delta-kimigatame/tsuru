# TSURU(TypeScript Utau Rendering Unit)

飴屋／菖蒲氏によって公開されている、Windows 向けに作成された歌声合成ソフトウェア「UTAU」の使用体験をモバイルユーザーに提供するための web アプリです。

「UTAU」は誰もが自分の声を提供できる歌声合成ソフトウェアであり、録音し、音声合成し、公開するプロセスには創作の楽しさが全て詰まっています。近年の PC を持っていない若いユーザーが UTAU 界隈に参画すれば、UTAU はもっともっと楽しくなるでしょう。そういうプロジェクトです。

UTAU 公式サイト(http://utau2008.web.fc2.com/)

公開先 web サイト UTAlet (https://k-uta.jp/utalet/)

# 特徴(現時点の主要な機能)

- UTAU に互換する日本語単独音もしくは日本語連続音を扱います。
- ust(UTAU Sequence Text: UTAU のための楽譜)を読み込めます。
- 読み込んだ音源で読み込んだ UST に従って音声を再生したりダウンロードできます。
- ust を読み込んだ音源に合わせるため、最低限の一括処理機能を提供します。
  - その他の編集機能はまだありません。
- 読み込んだ音源の情報や同梱のテキストファイルを表示する機能を持ち、同梱のテキストファイルに同意しなければ音声合成ができません。これで音声権利者も安心です。

# 開発ポリシー

- このプロジェクトは基本的には本家 UTAU への互換を目指します。
- そのうえで、一部の機能については OpenUtau(https://github.com/stakira/OpenUtau)を参考に拡張します。
- 仕様の乱立を避けるため、利便性の向上を図るためであっても独自仕様の導入は慎重に判断します。
- UTAU 以外の音声合成、特に AI を用いるものへの拡張は予定されません。
- 実装の優先順位は「PC を持っていないユーザーが成功体験を積む」ための物を優先します。
- ユーザーインターフェースはモバイルでの利用を念頭に作成します。
- 完全オフラインで動作する PWA アプリとし、サーバーとは静的データのサーブと google アナリティクス以外通信を行いません。

# 開発開始時

リポジトリをクローンし`npm install`を行ってください。

開発時の Node.js のバージョンは v20.11.1 です。

# 開発に参加する方法

- 企画検討中

# ドキュメンテーション

Typedoc と storybook で行います。

- Api リファレンス(https://delta-kimigatame.github.io/tsuru/)
- storybook(https://k-uta.jp/utaletStoryBook/)

# ライセンス情報

MIT ライセンスを採用します。

# 関連プロジェクト

- 原音設定するための web アプリ LABERU(https://k-uta.jp/laberu/) (https://github.com/delta-kimigatame/ReactOtoEditor)
- UTAU 音源をパッケージングするための web アプリ GAKUYA(https://k-uta.jp/gakuya/) (https://github.com/delta-kimigatame/GakuyaWeb)

# 関連リポジトリ

- wav データを扱う utauwav(https://github.com/delta-kimigatame/UtauWav)
- 原音設定データを扱う utauoto(https://github.com/delta-kimigatame/UtauOto)
- ブラウザ上で world による音声合成を実現する TSWorld(https://github.com/delta-kimigatame/TSWorld)

# 開発者連絡先

- デルタ＠きみがため sankaku.kuro@gmail.com
- 開発者 X (https://x.com/delta_kuro/)
- サポート discord (https://discord.gg/aqZRj3CRcm)

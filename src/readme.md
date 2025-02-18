# 開発指針
* components/ #UIコンポーネント ロジックと状態は含まない
* features/ #機能毎にまとめたコンポーネントとロジック
* lib/ #プロジェクトや音声データを扱うためのクラスライブラリ
* utils/ #ファイル名の正規化などを行う純粋関数
* types/ #interfaceをまとめる
* hooks/ #状態管理
* store/ #Zustandを用いたグローバル状態
* services/ #ファイルの読書など外部とのデータ処理
* i18n/ #言語リソース
* config/ #環境設定・定数
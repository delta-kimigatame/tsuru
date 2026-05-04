/** ピアノロールに関する設定 */
export const PIANOROLL_CONFIG = {
  // UTAU仕様に基づく鍵盤数（C1〜B7で84鍵盤）
  KEY_COUNT: 84,
  // 1鍵盤あたりの高さ（ピクセル単位、タップ要素の推奨サイズ約44ピクセル）
  KEY_HEIGHT: 44,
  // 全体の高さ
  TOTAL_HEIGHT: 84 * 44,
  // 黒鍵として扱う余りのリスト（キー番号を12で割った余りがこれに該当する場合を黒鍵とする）
  BLACK_KEY_REMAINDERS: [1, 3, 5, 8, 10],
  // キャンバス横幅の初期値
  INITIAL_CANVAS_WIDTH: 1,
  // ピアノロールの横線の幅(1音高毎)
  HORIZONTAL_SEPARATOR_WIDTH: 0.2,
  // ピアノロールの横線の幅(1オクターブ毎)
  HORIZONTAL_SEPARATOR_WIDTH_OCTAVE: 1,
  // ピアノロールの縦線の幅(1拍毎)
  VERTICAL_SEPARATOR_WIDTH: 0.2,
  // ピアノロールの縦線の幅(1小節毎)
  VERTICAL_SEPARATOR_WIDTH_MEASURE: 0.5,
  // canvas要素1つあたりの最大横幅
  CANVAS_MAX_WIDTH: 4096,
  // CSSで拡大する前1ピクセル当たりの長さ
  LENGTH_PER_PIXEL: 1,
  // ノート描画時のX軸方向への引き延ばし倍率。375pixelの画面に1小節(length=1920)が収まる
  NOTES_WIDTH_RATE: (375 - 50) / 1920,
  // ノートの枠線の幅
  NOTES_BORDER_WIDTH: 1,
  // 歌詞の文字サイズ
  LYRIC_FONT_SIZE: 14,
  // テンポやラベルの文字サイズ
  TEMPO_FONT_SIZE: 10,
  // 歌詞の左パディング
  LYRIC_PADDING_LEFT: 4,
  // 音高名を表示する部分
  TONEMAP_WIDTH: 50,
  // シークバーの太さ
  SEEKBAR_WIDTH: 1,
  // ピアノロールの波形の高さ
  WAVFORM_HEIGHT: 100,
  // 再生時間（秒）のプレビュー音の長さ
  PREVIEW_TONE_DURATION: 0.2,
  // プレビュー音の音量(0.0～1.0)
  PREVIEW_TONE_VOLUME: 0.3,
  // 末尾に追加する小節数
  EXTRA_MEASURE_COUNT: 8,
  // 末尾に追加する拍数
  EXTRA_BEATS_COUNT: 8 * 4,
};

/** 動画エクスポート用ピアノロール設定 */
export const PIANOROLL_VIDEO_LAYOUTS = [
  "full",
  "portraitMiddleThird",
  "portraitSafeArea",
  "landscapeEighty",
] as const;

/** 動画エクスポート時のピアノロール表示デフォルト */
export const DEFAULT_PIANOROLL_VIDEO_ENABLED = false;

/** 動画エクスポート時のピアノロールレイアウトデフォルト */
export const DEFAULT_PIANOROLL_VIDEO_LAYOUT = "full";

/** 動画エクスポート用ズーム候補 */
export const PIANOROLL_VIDEO_VERTICAL_ZOOM_STEPS: number[] = [
  0.25, 0.5, 0.75, 1,
];
export const PIANOROLL_VIDEO_HORIZONTAL_ZOOM_STEPS: number[] = [
  0.01, 0.1, 0.25, 0.5, 1, 2, 4,
];

/** 動画エクスポート用レイアウトパラメータ */
export const PIANOROLL_VIDEO_LAYOUT_CONFIG = {
  portraitMiddleThirdHeightRatio: 1 / 3,
  portraitSafeAreaLeft: 48,
  portraitSafeAreaTop: 48,
  portraitSafeAreaRight: 240,
  portraitSafeAreaBottom: 360,
  landscapeMargin: 48,
  landscapeWidthRatio: 0.8,
  landscapeHeightRatio: 0.8,
};

/** 動画エクスポート用スクロール制御パラメータ */
export const PIANOROLL_VIDEO_SCROLL_CONFIG = {
  rightHalfStartRatio: 0.5,
  marginRatio: 0.1,
  yOffsetLerpFactor: 0.03,
};

/** 動画エクスポート用テキスト描画パラメータ */
export const PIANOROLL_VIDEO_TEXT_CONFIG = {
  fontFamily: '"Noto Sans JP", "Roboto", sans-serif',
  keyboardFontMinSize: 11,
  keyboardFontScale: 0.9,
  keyboardToneTextOffsetX: 4,
  missingOtoMarker: "?",
  missingOtoMarkerYRatio: 0.2,
  tempoTextOffsetX: 4,
  tempoTextYRatio: 0.85,
  labelTextYRatio: 0.65,
};

/** 動画エクスポート用アイコン描画パラメータ */
export const PIANOROLL_VIDEO_ICON_CONFIG = {
  size: 40,
  padding: 8,
  backgroundPadding: 2,
  backgroundColor: "rgba(255,255,255,0.85)",
  fallbackSrc: "./static/logo192.png",
  voiceIconMimeType: "image/bmp",
};

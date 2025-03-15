/** ピアノロールに関する設定 */
export const PIANOROLL_CONFIG = {
  // UTAU仕様に基づく鍵盤数（C1〜B7で84鍵盤）
  KEY_COUNT: 84,
  // 1鍵盤あたりの高さ（ピクセル単位、タップ要素の推奨サイズ約44ピクセル）
  KEY_HEIGHT: 44,
  // 全体の高さ
  TOTAL_HEIGHT: 84 * 44,
  // 黒鍵として扱う余りのリスト（キー番号を12で割った余りがこれに該当する場合を黒鍵とする）
  BLACK_KEY_REMAINDERS: [1, 3, 6, 8, 10],
  // キャンバス横幅の初期値
  INITIAL_CANVAS_WIDTH: 1,
  // ピアノロールの横線の幅(1音高毎)
  HORIZONTAL_SEPARATOR_WIDTH: 0.2,
  // ピアノロールの横線の幅(1オクターブ毎)
  HORIZONTAL_SEPARATOR_WIDTH_OCTAVE: 1,
};

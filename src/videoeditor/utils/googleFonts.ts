/** videoeditor専用 Google Fonts カタログ。全フォントは全レイヤー（title/credit/lyrics）で使用可能。 */

export interface GoogleFont {
  /** Canvas / CSS で使う font-family 名 */
  family: string;
  /** Google Fonts の URL スラグ（スペースは + に変換） */
  slug: string;
  /** カテゴリ i18n キー */
  categoryKey: string;
  /** 読み込むウェイト（例: "400;700"） */
  weights: string;
}

export const GOOGLE_FONTS: GoogleFont[] = [
  // ゴシック体
  {
    family: "Noto Sans JP",
    slug: "Noto+Sans+JP",
    categoryKey: "font.category.gothic",
    weights: "400;700",
  },
  {
    family: "BIZ UDPGothic",
    slug: "BIZ+UDPGothic",
    categoryKey: "font.category.gothic",
    weights: "400;700",
  },
  {
    family: "M PLUS 1p",
    slug: "M+PLUS+1p",
    categoryKey: "font.category.gothic",
    weights: "400;700",
  },
  {
    family: "Kosugi Maru",
    slug: "Kosugi+Maru",
    categoryKey: "font.category.gothic",
    weights: "400",
  },
  // 明朝体
  {
    family: "Noto Serif JP",
    slug: "Noto+Serif+JP",
    categoryKey: "font.category.serif",
    weights: "400;700",
  },
  {
    family: "Shippori Mincho",
    slug: "Shippori+Mincho",
    categoryKey: "font.category.serif",
    weights: "400;700",
  },
  {
    family: "Zen Old Mincho",
    slug: "Zen+Old+Mincho",
    categoryKey: "font.category.serif",
    weights: "400;700",
  },
  {
    family: "BIZ UDMincho",
    slug: "BIZ+UDMincho",
    categoryKey: "font.category.serif",
    weights: "400;700",
  },
  {
    family: "Hina Mincho",
    slug: "Hina+Mincho",
    categoryKey: "font.category.serif",
    weights: "400",
  },
  {
    family: "Kaisei Tokumin",
    slug: "Kaisei+Tokumin",
    categoryKey: "font.category.serif",
    weights: "400;700",
  },
  {
    family: "Kaisei HarunoUmi",
    slug: "Kaisei+HarunoUmi",
    categoryKey: "font.category.serif",
    weights: "400;700",
  },
  {
    family: "Zen Antique",
    slug: "Zen+Antique",
    categoryKey: "font.category.serif",
    weights: "400",
  },
  {
    family: "Zen Antique Soft",
    slug: "Zen+Antique+Soft",
    categoryKey: "font.category.serif",
    weights: "400",
  },
  // ディスプレイ
  {
    family: "Rampart One",
    slug: "Rampart+One",
    categoryKey: "font.category.display",
    weights: "400",
  },
  {
    family: "Hachi Maru Pop",
    slug: "Hachi+Maru+Pop",
    categoryKey: "font.category.display",
    weights: "400",
  },
  {
    family: "RocknRoll One",
    slug: "RocknRoll+One",
    categoryKey: "font.category.display",
    weights: "400",
  },
  {
    family: "Reggae One",
    slug: "Reggae+One",
    categoryKey: "font.category.display",
    weights: "400",
  },
  {
    family: "Yuji Boku",
    slug: "Yuji+Boku",
    categoryKey: "font.category.display",
    weights: "400",
  },
  {
    family: "Mochiy Pop P One",
    slug: "Mochiy+Pop+P+One",
    categoryKey: "font.category.display",
    weights: "400",
  },
  {
    family: "Zen Maru Gothic",
    slug: "Zen+Maru+Gothic",
    categoryKey: "font.category.display",
    weights: "400;500;700",
  },
  // 手書き
  {
    family: "Yomogi",
    slug: "Yomogi",
    categoryKey: "font.category.handwritten",
    weights: "400",
  },
  {
    family: "Klee One",
    slug: "Klee+One",
    categoryKey: "font.category.handwritten",
    weights: "400;600",
  },
  {
    family: "Yuji Syuku",
    slug: "Yuji+Syuku",
    categoryKey: "font.category.handwritten",
    weights: "400",
  },
  {
    family: "Zen Kurenaido",
    slug: "Zen+Kurenaido",
    categoryKey: "font.category.handwritten",
    weights: "400",
  },
  {
    family: "Yusei Magic",
    slug: "Yusei+Magic",
    categoryKey: "font.category.handwritten",
    weights: "400",
  },
  {
    family: "New Tegomin",
    slug: "New+Tegomin",
    categoryKey: "font.category.handwritten",
    weights: "400",
  },
  // エレガント
  {
    family: "Kaisei Decol",
    slug: "Kaisei+Decol",
    categoryKey: "font.category.elegant",
    weights: "400;700",
  },
  {
    family: "Kaisei Opti",
    slug: "Kaisei+Opti",
    categoryKey: "font.category.elegant",
    weights: "400;700",
  },
  {
    family: "Sawarabi Mincho",
    slug: "Sawarabi+Mincho",
    categoryKey: "font.category.elegant",
    weights: "400",
  },
  // レトロ
  {
    family: "DotGothic16",
    slug: "DotGothic16",
    categoryKey: "font.category.retro",
    weights: "400",
  },
  {
    family: "Yuji Mai",
    slug: "Yuji+Mai",
    categoryKey: "font.category.retro",
    weights: "400",
  },
  {
    family: "Mochiy Pop One",
    slug: "Mochiy+Pop+One",
    categoryKey: "font.category.retro",
    weights: "400",
  },
  {
    family: "Kiwi Maru",
    slug: "Kiwi+Maru",
    categoryKey: "font.category.retro",
    weights: "400",
  },
  {
    family: "M PLUS Rounded 1c",
    slug: "M+PLUS+Rounded+1c",
    categoryKey: "font.category.retro",
    weights: "400;700",
  },
  // テック
  {
    family: "Zen Kaku Gothic New",
    slug: "Zen+Kaku+Gothic+New",
    categoryKey: "font.category.tech",
    weights: "400;700",
  },
  {
    family: "Dela Gothic One",
    slug: "Dela+Gothic+One",
    categoryKey: "font.category.tech",
    weights: "400",
  },
  {
    family: "Stick",
    slug: "Stick",
    categoryKey: "font.category.tech",
    weights: "400",
  },
  {
    family: "Murecho",
    slug: "Murecho",
    categoryKey: "font.category.tech",
    weights: "400;700",
  },
];

/** カテゴリ i18n キー一覧（表示順） */
export const FONT_CATEGORY_KEYS = [
  "font.category.gothic",
  "font.category.serif",
  "font.category.display",
  "font.category.handwritten",
  "font.category.elegant",
  "font.category.retro",
  "font.category.tech",
] as const;

/** デフォルトフォント（空文字 = システムフォールバック） */
export const DEFAULT_FONT_FAMILY = "";

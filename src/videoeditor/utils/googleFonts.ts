/** videoeditor専用 Google Fonts カタログ。全フォントは全レイヤー（title/credit/lyrics）で使用可能。 */

export interface GoogleFont {
  /** Canvas / CSS で使う font-family 名 */
  family: string;
  /** Google Fonts の URL スラグ（スペースは + に変換） */
  slug: string;
  /** カテゴリ（UI グルーピング用） */
  category: string;
  /** 読み込むウェイト（例: "400;700"） */
  weights: string;
}

export const GOOGLE_FONTS: GoogleFont[] = [
  // Sans / neutral
  {
    family: "Noto Sans JP",
    slug: "Noto+Sans+JP",
    category: "サンセリフ",
    weights: "400;700",
  },
  {
    family: "BIZ UDPGothic",
    slug: "BIZ+UDPGothic",
    category: "サンセリフ",
    weights: "400;700",
  },
  {
    family: "M PLUS 1p",
    slug: "M+PLUS+1p",
    category: "サンセリフ",
    weights: "400;700",
  },
  {
    family: "Kosugi Maru",
    slug: "Kosugi+Maru",
    category: "サンセリフ",
    weights: "400",
  },
  // Mincho / literary
  {
    family: "Noto Serif JP",
    slug: "Noto+Serif+JP",
    category: "明朝",
    weights: "400;700",
  },
  {
    family: "Shippori Mincho",
    slug: "Shippori+Mincho",
    category: "明朝",
    weights: "400;700",
  },
  {
    family: "Zen Old Mincho",
    slug: "Zen+Old+Mincho",
    category: "明朝",
    weights: "400;700",
  },
  // Display / impactful
  {
    family: "Rampart One",
    slug: "Rampart+One",
    category: "ディスプレイ",
    weights: "400",
  },
  {
    family: "Hachi Maru Pop",
    slug: "Hachi+Maru+Pop",
    category: "ディスプレイ",
    weights: "400",
  },
  {
    family: "RocknRoll One",
    slug: "RocknRoll+One",
    category: "ディスプレイ",
    weights: "400",
  },
  {
    family: "Reggae One",
    slug: "Reggae+One",
    category: "ディスプレイ",
    weights: "400",
  },
  // Handwritten / warm
  { family: "Yomogi", slug: "Yomogi", category: "手書き", weights: "400" },
  {
    family: "Klee One",
    slug: "Klee+One",
    category: "手書き",
    weights: "400;600",
  },
  {
    family: "Yuji Syuku",
    slug: "Yuji+Syuku",
    category: "手書き",
    weights: "400",
  },
  {
    family: "Zen Kurenaido",
    slug: "Zen+Kurenaido",
    category: "手書き",
    weights: "400",
  },
  // Elegant / credits
  {
    family: "Kaisei Decol",
    slug: "Kaisei+Decol",
    category: "エレガント",
    weights: "400;700",
  },
  {
    family: "Kaisei Opti",
    slug: "Kaisei+Opti",
    category: "エレガント",
    weights: "400;700",
  },
  {
    family: "Sawarabi Mincho",
    slug: "Sawarabi+Mincho",
    category: "エレガント",
    weights: "400",
  },
  // Retro / characterful
  {
    family: "DotGothic16",
    slug: "DotGothic16",
    category: "レトロ",
    weights: "400",
  },
  { family: "Yuji Mai", slug: "Yuji+Mai", category: "レトロ", weights: "400" },
  {
    family: "Mochiy Pop One",
    slug: "Mochiy+Pop+One",
    category: "レトロ",
    weights: "400",
  },
  // Tech / modern
  {
    family: "Zen Kaku Gothic New",
    slug: "Zen+Kaku+Gothic+New",
    category: "テック",
    weights: "400;700",
  },
  {
    family: "Dela Gothic One",
    slug: "Dela+Gothic+One",
    category: "テック",
    weights: "400",
  },
  { family: "Stick", slug: "Stick", category: "テック", weights: "400" },
];

/** カテゴリ一覧（表示順） */
export const FONT_CATEGORIES = [
  "サンセリフ",
  "明朝",
  "ディスプレイ",
  "手書き",
  "エレガント",
  "レトロ",
  "テック",
] as const;

/** デフォルトフォント（空文字 = システムフォールバック） */
export const DEFAULT_FONT_FAMILY = "";

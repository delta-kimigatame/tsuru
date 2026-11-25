import type { ResampEngineName } from "../lib/ResampEngine";
import type { FlagKeys } from "../utils/parseFlags";

/**
 * 各resampエンジンが解釈するフラグ定義。
 * 各エンジン(Resamp / Fave)の flagKeys と、ヘルプ画面の表示はどちらもここを参照する。
 * フラグを追加・変更する場合はここと、i18nの resampler.flagEffect.{エンジン}.{フラグ} を更新すること。
 *
 * このファイルは型以外をimportしないこと。
 * エンジン本体(WORLD等)をimportすると、メインバンドルに含まれてしまうため。
 */
export const RESAMPLER_FLAGS: Record<ResampEngineName, FlagKeys[]> = {
  resamp: [
    { name: "G", type: "bool", default: undefined }, // Generateフラグ、周波数表を強制的に再生成
    { name: "g", type: "number", min: -100, max: 100, default: 0 }, // genderフラグ、スペクトル包絡全体をワープ
    { name: "B", type: "number", min: 0, max: 100, default: 50 }, // Breath、現在の実装では簡易的に非周期性指標の増減
    { name: "t", type: "number", min: -100, max: 100, default: 0 }, // toneフラグ、音高をcent単位で調整
    { name: "P", type: "number", min: 0, max: 100, default: 86 }, // ピークコンプレッサーの強さ。0で無し、100で-6dBに正規化
    { name: "e", type: "bool", default: undefined }, // 伸縮方法フラグ、trueでworldStretchのeFlagをtrueにして伸縮。falseでeFlagをfalseにして伸縮。eFlagがtrueのとき、伸ばす際は元のフレームを等間隔に複製するのではなく、複製するフレームを交互に前後から選ぶ方法で伸ばす。これにより、より自然な伸び方になることがある。
    { name: "w", type: "number", min: 0, max: 100, default: 0 }, // グロウルの強さ。
    { name: "O", type: "number", min: -100, max: 100, default: 0 }, // Openingフラグ。F1付近のスペクトルワープで疑似的に開口度を調整する。+で開く、-で閉じる。
    { name: "T", type: "number", min: -100, max: 100, default: 0 }, // Tensionフラグ。F2付近のスペクトルワープで疑似的に張りを調整する。+で張る、-で緩める。
    { name: "S", type: "number", min: -100, max: 100, default: 0 }, // Sharpフラグ。0は素通し、100に近いほどフォルマント強調
    { name: "b", type: "number", min: -100, max: 100, default: 0 }, // ブライトネスフラグ。スペクトルティルトでブライトネスを調整する。-で暗く、+で明るくする。
    { name: "Mo", type: "number", min: -100, max: 100, default: 0, alias: "O" }, // moresampler互換性のためのOフラグのエイリアス。OがなくMoがあれば、MoをOとして扱う。
    { name: "Mt", type: "number", min: -100, max: 100, default: 0, alias: "T" }, // moresampler互換性のためのTフラグのエイリアス。TがなくMtがあれば、MtをTとして扱う。
    { name: "MG", type: "number", min: -100, max: 100, default: 0, alias: "w" }, // moresampler互換性のためのwフラグのエイリアス。wがなくMGがあれば、MGをwとして扱う。
    { name: "ME", type: "number", min: -100, max: 100, default: 0, alias: "S" }, // moresampler互換性のためのSフラグのエイリアス。SがなくMEがあれば、MEをSとして扱う。
  ],
  fave: [
    { name: "G", type: "bool", default: undefined }, // Generateフラグ、周波数表を強制的に再生成
    { name: "g", type: "number", min: -100, max: 100, default: 0 }, // genderフラグ、スペクトル包絡全体をワープ
    { name: "B", type: "number", min: 0, max: 100, default: 50 }, // Breath、現在の実装では簡易的に非周期性指標の増減
    { name: "O", type: "number", min: -100, max: 100, default: 0 }, // Openingフラグ。低域側の包絡を中心に増減
    { name: "T", type: "number", min: -100, max: 100, default: 0 }, // Tensionフラグ。中域(F2付近)の包絡を中心に増減
    { name: "S", type: "number", min: -100, max: 100, default: 0 }, // Sharpフラグ。高域寄りの明瞭感を増減
    { name: "b", type: "number", min: -100, max: 100, default: 0 }, // Brightnessフラグ。スペクトルティルトで明るさを増減
    { name: "H", type: "number", min: 0, max: 100, default: 0 }, // ローパスフラグ。8kHz以上の通過量を0..100で指定する(0で無効、100で遮断)
    { name: "t", type: "number", min: -100, max: 100, default: 0 }, // toneフラグ、音高をcent単位で調整
    { name: "P", type: "number", min: 0, max: 100, default: 86 }, // ピークコンプレッサーの強さ。0で無し、100で-6dBに正規化
    { name: "w", type: "number", min: 0, max: 100, default: 0 }, // グロウルの強さ。
    { name: "N", type: "bool", default: undefined }, // NoFormantFilter、フォルマントフィルタを無視する
    { name: "s", type: "number", min: 0, max: 100, default: 20 }, // エンベロープのガウスぼかしにおけるシグマ値。20で1σ。0でぼかしなし
    { name: "Mo", type: "number", min: -100, max: 100, default: 0, alias: "O" }, // moresampler互換性のためのOフラグのエイリアス。OがなくMoがあれば、MoをOとして扱う。
    { name: "Mt", type: "number", min: -100, max: 100, default: 0, alias: "T" }, // moresampler互換性のためのTフラグのエイリアス。TがなくMtがあれば、MtをTとして扱う。
    { name: "MG", type: "number", min: -100, max: 100, default: 0, alias: "w" }, // moresampler互換性のためのwフラグのエイリアス。wがなくMGがあれば、MGをwとして扱う。
    { name: "ME", type: "number", min: -100, max: 100, default: 0, alias: "S" }, // moresampler互換性のためのSフラグのエイリアス。SがなくMEがあれば、MEをSとして扱う。
  ],
};

/** 各UI要素が共通してもつパラメータ */
export interface BaseUIProp {
  /** 設定項目の一意なの識別子 */
  key: string;
  /** i18n用のラベルキー */
  labelKey: string;
  /** 各インターフェースを識別するための識別子 */
  inputType: string;
}

/**
 * チェックボックス
 * booleanのうち、複数の項目から選択するような場合に使用
 * */
export interface CheckboxUIProp extends BaseUIProp {
  inputType: "checkbox";
  /** 初期値 */
  defaultValue?: boolean;
}

/**
 * スイッチ
 * booleanのうち、機能自体のオンオフに関わるような場合に使用
 */
export interface SwitchUIProp extends BaseUIProp {
  inputType: "switch";
  /** 初期値 */
  defaultValue?: boolean;
}

/**
 * セレクトボックス
 * 複数の値から選択するような場合に使用。
 * スマホでの利用がメインのため、基本的にラジオボタンは用いず、複数からの選択はすべてセレクトボックス
 */
export interface SelectUIProp<T = string | number> extends BaseUIProp {
  inputType: "select";
  /** 選択肢のリスト */
  options: T[];
  /** 各選択肢ラベルのi18nキー。i18n側でoptionsと同じ長さのリストを定義する */
  displayOptionKey: string;
  /** 初期値 */
  defaultValue?: string;
}

/**
 * スライダー
 * 数値を扱う要素のうち、最大・最小が明確な要素
 * 具体的には0～200の整数をとるintensity,velocityや-100～100をとるmodulation等を想定
 */
export interface SliderUIProp extends BaseUIProp {
  inputType: "slider";
  /** 最小値 */
  min: number;
  /** 最大値 */
  max: number;
  /** 刻み値 */
  step: number;
  /** 初期値 */
  defaultValue?: number;
}

/**
 * テキストボックス(数値)
 * 数値を扱う要素のうち、最大・最小のいずれかもしくは両方が明確ではない要素。
 * 具体的にはpreutter,stp(正の数だが最大値は状況により異なる)やoverlap(最大も最小も不明確)など
 */
export interface TextBoxNumberUIProp extends BaseUIProp {
  inputType: "textbox-number";
  /** 最小値 */
  min?: number;
  /** 最大値 */
  max?: number;
  /** 初期値 */
  defaultValue?: number;
}

/**
 * テキストボックス(文字列)
 */
export interface TextBoxStringUIProp extends BaseUIProp {
  inputType: "textbox-string";
  /** 初期値 */
  defaultValue?: string;
}

/**
 * UI要素を統合するユニオン型
 */
export type UIProp =
  | CheckboxUIProp
  | SwitchUIProp
  | SelectUIProp
  | SliderUIProp
  | TextBoxNumberUIProp
  | TextBoxStringUIProp;

export interface PaperGroup<T extends UIProp = UIProp> {
  /** グループのタイトルのi18nキー */
  titleKey: string;
  /** 子要素のリスト */
  items: T[];
}

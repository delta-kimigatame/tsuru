/**
 * 1次元配列を線形補間する
 * @param values 元の値列
 * @param timeAxis 元の時間軸
 * @param newTimeAxis 新しい時間軸
 * @returns 新しい時間軸に沿った値列
 */
export const interp1d = (
  values: Array<number>,
  timeAxis: Array<number>,
  newTimeAxis: Array<number>,
): Array<number> => {
  const newValues = new Array<number>();
  newTimeAxis.map((t) => {
    const indexTemp = timeAxis.findIndex((v) => v >= t);
    const index = indexTemp === -1 ? timeAxis.length - 1 : indexTemp;
    const prevTime = index !== 0 ? timeAxis[index - 1] : 0;
    const range = timeAxis[index] - prevTime;
    const prevValue = index !== 0 ? values[index - 1] : 0;
    const rate = range !== 0 ? (t - prevTime) / range : 1;
    newValues.push(prevValue * (1 - rate) + values[index] * rate);
  });
  return newValues;
};
/**
 * 2次元配列を1次線形補間する
 * @param values 元の値列
 * @param timeAxis 元の時間軸
 * @param newTimeAxis 新しい時間軸
 * @returns 新しい時間軸に沿った値列
 */
export const interp1dArray = (
  values: Array<Array<number>>,
  timeAxis: Array<number>,
  newTimeAxis: Array<number>,
): Array<Array<number>> => {
  const newValues = new Array<Array<number>>();
  newTimeAxis.map((t) => {
    const indexTemp = timeAxis.findIndex((v) => v >= t);
    const index = indexTemp === -1 ? timeAxis.length - 1 : indexTemp;
    const prevTime = index !== 0 ? timeAxis[index - 1] : 0;
    const range = timeAxis[index] - prevTime;
    const rate = range !== 0 ? (t - prevTime) / range : 1;
    const temps: Array<number> = values[index].map((v, i) => {
      return v * rate + (index === 0 ? 0 : values[index - 1][i]) * (1 - rate);
    });
    newValues.push(temps);
  });
  return newValues;
};

/**
 * range間隔の時間軸を生成する
 * @param range 間隔
 * @param min 最初の値
 * @param max 最後の値
 */
export const makeTimeAxis = (
  range: number,
  min: number,
  max: number,
): Array<number> => {
  const length = Math.ceil((max - min) / range) + 1;
  const timeAxis = [...Array(length)].map((v, i) => i * range + min);
  return timeAxis;
};

/**
 * 等間隔の離散データを自然三次スプラインで補間する補間器。
 */
export class CubicSplineInterpolator {
  /** 補間元データ。インデックスがそのままx座標となる。 */
  private readonly data: Array<number>;

  /** 各区間の三次項係数。 */
  private readonly a: Array<number>;

  /** 各区間の二次項係数。 */
  private readonly b: Array<number>;

  /** 各区間の一次項係数。 */
  private readonly c: Array<number>;

  /** 各区間の定数項係数。 */
  private readonly d: Array<number>;

  /**
   * 補間器を生成する。
   * @param data 等間隔で配置された補間元データ
   * @throw RangeError dataが空の場合
   */
  constructor(data: Array<number>) {
    if (data.length === 0) {
      throw new RangeError("補間元データが空です。");
    }

    this.data = data;

    const length = data.length;
    if (length === 1) {
      this.a = [0];
      this.b = [0];
      this.c = [0];
      this.d = [data[0]];
      return;
    }

    const intervalCount = length - 1;
    const secondDerivative = this.CalculateSecondDerivatives(data);
    this.a = new Array<number>(intervalCount);
    this.b = new Array<number>(intervalCount);
    this.c = new Array<number>(intervalCount);
    this.d = new Array<number>(intervalCount);

    for (let i = 0; i < intervalCount; i++) {
      const width = 1;
      this.a[i] = (secondDerivative[i + 1] - secondDerivative[i]) / (6 * width);
      this.b[i] = secondDerivative[i] / 2;
      this.c[i] =
        data[i + 1] -
        data[i] -
        ((secondDerivative[i + 1] + 2 * secondDerivative[i]) * width * width) /
          6;
      this.d[i] = data[i];
    }
  }

  /**
   * 自然三次スプラインの各データ点における二階微分を計算する。
   * @param data 等間隔で配置された補間元データ
   * @returns 各データ点における二階微分
   */
  private CalculateSecondDerivatives(data: Array<number>): Array<number> {
    const length = data.length;
    const secondDerivative = new Array<number>(length).fill(0);
    if (length === 2) {
      return secondDerivative;
    }

    const intervalCount = length - 1;
    const diagonal = new Array<number>(length).fill(4);
    const upper = new Array<number>(length).fill(1);
    const lower = new Array<number>(length).fill(1);
    diagonal[0] = 1;
    diagonal[length - 1] = 1;
    upper[0] = 0;
    lower[length - 1] = 0;

    const rightSide = new Array<number>(length).fill(0);
    for (let i = 1; i < intervalCount; i++) {
      rightSide[i] = 6 * (data[i + 1] - 2 * data[i] + data[i - 1]);
    }

    for (let i = 1; i < length - 1; i++) {
      const factor = lower[i] / diagonal[i - 1];
      diagonal[i] -= factor * upper[i - 1];
      rightSide[i] -= factor * rightSide[i - 1];
    }

    for (let i = length - 2; i > 0; i--) {
      const factor = upper[i] / diagonal[i + 1];
      rightSide[i] -= factor * rightSide[i + 1];
    }

    for (let i = 0; i < length; i++) {
      secondDerivative[i] = rightSide[i] / diagonal[i];
    }

    return secondDerivative;
  }

  /**
   * 指定したインデックス位置で補間値を取得する。
   * 範囲外の位置は補間範囲の端にクランプする。
   * @param index 補間元データの0から始まるインデックス位置
   * @returns 補間値
   */
  Interpolate(index: number): number {
    if (!Number.isFinite(index)) {
      throw new RangeError("補間位置は有限数である必要があります。");
    }

    const lastIndex = this.data.length - 1;
    if (index <= 0) {
      return this.data[0];
    }
    if (index >= lastIndex) {
      return this.data[lastIndex];
    }

    const intervalIndex = Math.floor(index);
    const offset = index - intervalIndex;
    return (
      this.a[intervalIndex] * offset ** 3 +
      this.b[intervalIndex] * offset ** 2 +
      this.c[intervalIndex] * offset +
      this.d[intervalIndex]
    );
  }

  /**
   * 指定したインデックス位置の配列をまとめて補間する。
   * @param indexes 補間元データの0から始まるインデックス位置の配列
   * @returns 補間値の配列
   */
  InterpolateArray(indexes: Array<number>): Array<number> {
    return indexes.map((index) => this.Interpolate(index));
  }
}

/**
 * 等間隔の離散データを自然三次スプラインで補間する。
 * 補間位置がデータ範囲外の場合、補間範囲の端の値を返す。
 * @param data 等間隔で配置された補間元データ
 * @param index 補間元データの0から始まるインデックス位置
 * @returns 補間値
 */
export const CubicSplineInterpolation = (
  data: Array<number>,
  index: number,
): number => new CubicSplineInterpolator(data).Interpolate(index);

/**
 * CubicSplineInterpolationの別名。
 * @param data 等間隔で配置された補間元データ
 * @param index 補間元データの0から始まるインデックス位置
 * @returns 補間値
 */
export const CubicSpline = CubicSplineInterpolation;

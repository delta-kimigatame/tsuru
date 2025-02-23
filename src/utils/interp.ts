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
  newTimeAxis: Array<number>
): Array<number> => {
  const newValues = new Array<number>();
  newTimeAxis.map((t) => {
    const _index = timeAxis.findIndex((v) => v >= t);
    const index = _index === -1 ? timeAxis.length - 1 : _index;
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
  newTimeAxis: Array<number>
): Array<Array<number>> => {
  const newValues = new Array<Array<number>>();
  newTimeAxis.map((t) => {
    const _index = timeAxis.findIndex((v) => v >= t);
    const index = _index === -1 ? timeAxis.length - 1 : _index;
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
  max: number
): Array<number> => {
  const length = Math.ceil((max - min) / range) + 1;
  const timeAxis = [...Array(length)].map((v, i) => i * range + min);
  return timeAxis;
};

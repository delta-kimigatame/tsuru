import { Wave, WaveAnalyse } from "utauwav";
export const estimateBeatOffset = (wave: Wave, bpm: number): number => {
  const wa = new WaveAnalyse();
  const frameSize = 2048; // FFT窓サイズ
  const hopSize = 512; // フレームのステップ（小さくすると時間分解能が上がる）
  //**波形データの最大振幅 */
  const denom = Math.pow(2, wave.bitDepth - 1);
  //** ステレオの場合モノラルに変換し、正規化した波形データ */
  const samples = wave.data.map((f, i) => {
    const value = f + (wave.rData ? wave.rData[i] : 0) / 2;
    return value / denom;
  });
  const spectrogram = wa.Spectrogram(samples, frameSize, "hanning", hopSize);
  /** 各フレームの総パワー（線形値での合計） */
  const framesMagnitude = new Float32Array(spectrogram.length);
  for (let frameIndex = 0; frameIndex < spectrogram.length; frameIndex++) {
    const frame = spectrogram[frameIndex];
    // 対数パワーを線形パワーに戻してから合計
    let sumLinearPower = 0;
    for (let i = 0; i < frame.length; i++) {
      // 5 * log10(power) -> power = 10^(value/5)
      sumLinearPower += Math.pow(10, frame[i] / 5);
    }
    // 平均
    framesMagnitude[frameIndex] = sumLinearPower / frame.length;
  }

  /** スペクトルフラックス */
  const odf = new Float32Array(framesMagnitude.length);
  for (let index = 1; index < framesMagnitude.length; index++) {
    const diff = framesMagnitude[index] - framesMagnitude[index - 1];
    odf[index] = diff > 0 ? diff : 0;
  }
  const period = (60 / bpm) * 4; // 1 小節の長さ (s)
  const hopTime = hopSize / wave.sampleRate; // ODF 1 フレームの秒数
  const odfDuration = odf.length * hopTime;

  // τ (offset) は [0, period) を細かく走査
  const steps = 480 * 4; // 1 小節を480分割 = 高精度
  let bestTau = 0;
  let bestScore = -Infinity;

  for (let i = 0; i < steps; i++) {
    const tau = (period * i) / steps;
    let score = 0;

    // gridTimes = tau + k * period を評価
    for (let t = tau; t < odfDuration; t += period) {
      const idx = Math.floor(t / hopTime);
      if (idx >= 0 && idx < odf.length) {
        score += odf[idx];
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestTau = tau;
    }
  }

  return Math.floor(bestTau * 1000); // ms単位の offset
};

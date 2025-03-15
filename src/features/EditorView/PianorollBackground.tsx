import React from "react";
import { COLOR_PALLET } from "../../config/pallet";
import { PIANOROLL_CONFIG } from "../../config/pianoroll";
import { useThemeMode } from "../../hooks/useThemeMode";
import { LOG } from "../../lib/Logging";
import { useCookieStore } from "../../store/cookieStore";

/**
 * ピアノロールの背景部分
 */
export const PianorollBackground: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { colorTheme, verticalZoom } = useCookieStore();
  const mode = useThemeMode();
  React.useEffect(() => {
    LOG.debug(
      "modeかcolorThemeかverticalZoomの更新を検知",
      "PianorollBackground"
    );
    const canvas = canvasRef.current;
    if (!canvas) {
      LOG.debug("canvasの初期化が未完了", "PianorollBackground");
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    LOG.info(
      `palletの取得。mode:${mode}、colorTheme:${colorTheme}`,
      "PianorollBackground"
    );
    const pallet = COLOR_PALLET[colorTheme][mode];
    const key_height = PIANOROLL_CONFIG.KEY_HEIGHT * verticalZoom;
    ctx.clearRect(
      0,
      0,
      PIANOROLL_CONFIG.INITIAL_CANVAS_WIDTH,
      PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom
    );
    for (let i = 0; i < PIANOROLL_CONFIG.KEY_COUNT; i++) {
      ctx.fillStyle = PIANOROLL_CONFIG.BLACK_KEY_REMAINDERS.includes(i % 12)
        ? pallet.blackKey
        : pallet.whiteKey;
      ctx.fillRect(
        0,
        i * key_height,
        PIANOROLL_CONFIG.INITIAL_CANVAS_WIDTH,
        key_height
      );
      ctx.strokeStyle = pallet.horizontalSeparator;
      ctx.lineWidth =
        i % 12 === 0
          ? PIANOROLL_CONFIG.HORIZONTAL_SEPARATOR_WIDTH_OCTAVE
          : PIANOROLL_CONFIG.HORIZONTAL_SEPARATOR_WIDTH;
      ctx.beginPath();
      ctx.moveTo(0, i * key_height);
      ctx.lineTo(PIANOROLL_CONFIG.INITIAL_CANVAS_WIDTH, i * key_height);
      ctx.stroke();
    }
    LOG.info("ピアノロール背景の描画完了", "PianorollBackground");
    // 音高毎に1pixelの区切り線を引いたほうがいいかもしれない。storybookを見ながら調整する
  }, [mode, colorTheme, verticalZoom]);
  return (
    <canvas
      ref={canvasRef}
      width={PIANOROLL_CONFIG.INITIAL_CANVAS_WIDTH}
      height={PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: PIANOROLL_CONFIG.TOTAL_HEIGHT * verticalZoom,
      }}
    />
  );
};

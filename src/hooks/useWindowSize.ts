import React from "react";

interface WindowSize {
  width: number;
  height: number;
}

/**
 * 画面サイズの変更を検知し、最新の画面サイズを返す機能を提供するカスタムフック
 * @returns 画面サイズ
 */
export const useWindowSize = (): WindowSize => {
  // 初期値はwindowが存在する場合とし、存在しない場合は0に設定
  const getSize = (): WindowSize => ({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const [windowSize, setWindowSize] = React.useState<WindowSize>(getSize);

  React.useEffect(() => {
    // windowが存在しない場合は何もしない
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowSize(getSize());
    };

    window.addEventListener("resize", handleResize);
    // 初回のリサイズイベント発火で最新のサイズを取得
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowSize;
};

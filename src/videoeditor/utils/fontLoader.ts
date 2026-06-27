import { GOOGLE_FONTS } from "./googleFonts";

/** ロード済みフォントファミリーを管理するセット */
const loadedFonts = new Set<string>();
/** ロード中のPromiseキャッシュ（重複リクエスト防止） */
const loadingPromises = new Map<string, Promise<void>>();

const LOAD_TIMEOUT_MS = 8000;

/**
 * Google Fonts から指定ファミリーを遅延ロードする。
 * 既にロード済みの場合は即座に resolve する。
 * カタログに存在しないファミリーは無操作で resolve する。
 */
export const loadGoogleFont = (family: string): Promise<void> => {
  if (!family) return Promise.resolve();
  if (loadedFonts.has(family)) return Promise.resolve();
  if (loadingPromises.has(family)) return loadingPromises.get(family)!;

  const font = GOOGLE_FONTS.find((f) => f.family === family);
  if (!font) return Promise.resolve();

  const url = `https://fonts.googleapis.com/css2?family=${font.slug}:wght@${font.weights}&display=swap`;

  const promise: Promise<void> = new Promise<void>((resolve) => {
    // 既に同じ href の link が存在する場合は再挿入しない
    const existing = document.querySelector<HTMLLinkElement>(
      `link[data-gf="${family}"]`,
    );
    if (!existing) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.dataset["gf"] = family;
      document.head.appendChild(link);
    }

    // document.fonts.ready は全フォント完了を待つため、
    // check() でターゲットフォントの準備完了をポーリングする
    const check = () => document.fonts.check(`16px "${family}"`);

    if (check()) {
      loadedFonts.add(family);
      resolve();
      return;
    }

    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      loadedFonts.add(family);
      loadingPromises.delete(family);
      resolve();
    };

    // タイムアウト（フォールバックとして続行）
    const timer = setTimeout(done, LOAD_TIMEOUT_MS);

    document.fonts.ready.then(() => {
      clearTimeout(timer);
      done();
    });
  });

  loadingPromises.set(family, promise);
  return promise;
};

/** ロード済みかどうかを同期チェック */
export const isFontLoaded = (family: string): boolean =>
  !family || loadedFonts.has(family);

/** ロード状態（for UI feedback） */
export type FontLoadState = "idle" | "loading" | "loaded" | "error";

/**
 * フォントをロードし、状態を setState コールバックで通知する。
 * @returns cleanup 不要のため void
 */
export const loadGoogleFontWithState = (
  family: string,
  setState: (s: FontLoadState) => void,
): void => {
  if (!family) {
    setState("idle");
    return;
  }
  if (isFontLoaded(family)) {
    setState("loaded");
    return;
  }
  setState("loading");
  loadGoogleFont(family).then(
    () => setState("loaded"),
    () => setState("error"),
  );
};

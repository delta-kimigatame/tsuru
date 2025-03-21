import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@mui/material";
import { BasePaper } from "../../components/common/BasePaper";
import { LOG } from "../../lib/Logging";

/**
 * トップビューに表示する、インストールボタンを含むペーパー
 * iosの場合はインストールボタンの代わりに案内画像を表示する
 */
export const InstallPaper: React.FC = () => {
  const { t } = useTranslation();
  const [isIOS, setIsIOS] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<Event | null>(
    null
  );
  const [isInstalled, setIsInstalled] = React.useState<boolean>(false);
  React.useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod|macintosh/.test(userAgent)) {
      LOG.debug("iOS", "InstallPaper");
      setIsIOS(true);
    }

    // beforeinstallprompt イベントをキャッチしてインストールプロンプトを保持
    const beforeInstallPromptHandler = (e: Event) => {
      LOG.debug("インストールイベントのキャッチ", "InstallPaper");
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("appinstalled", () => {
      LOG.debug("インストール済み", "InstallPaper");
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        beforeInstallPromptHandler
      );
  }, []);

  const handleClick = async () => {
    LOG.debug("クリック", "InstallPaper");
    if (deferredPrompt) {
      (deferredPrompt as any).prompt();
      const choiceResult = await (deferredPrompt as any).userChoice;
      if (choiceResult.outcome === "accepted") {
        LOG.info("インストール開始", "InstallPaper");
      } else {
        LOG.info("インストールキャンセル", "InstallPaper");
      }
      setDeferredPrompt(null);
    }
  };
  if (isInstalled) return null;

  /** TODO 画像を作成する */
  return (
    <BasePaper title={t("top.install")}>
      {isIOS ? (
        <img
          src={"./static/iosInstall.png"}
          alt="iosの場合 ホーム画面に追加を選択してインストールできます"
          style={{ maxWidth: "100%" }}
        />
      ) : (
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleClick}
          size="large"
          disabled={deferredPrompt === null}
        >
          {t("top.install")}
        </Button>
      )}
    </BasePaper>
  );
};

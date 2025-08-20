import CachedIcon from "@mui/icons-material/Cached";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  HeaderMenuItemBase,
  HeaderMenuItemProps,
} from "../../../components/Header/HeaderMenuItemBase";
import { LOG } from "../../../lib/Logging";
export const HeaderMenuClearCache: React.FC<HeaderMenuItemProps> = (props) => {
  const { t } = useTranslation();
  const handleClick = () => {
    LOG.debug("click", "HeaderMenuClearCache");
    LOG.info("アプリのキャッシュクリア", "HeaderMenuClearCache");
    clearAppCache();
  };

  const clearAppCache = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      LOG.info("swクリア", "HeaderMenuClearCache");
    } else {
      LOG.debug("sw未登録", "HeaderMenuClearCache");
    }
    const cacheKeys = await caches.keys();
    for (const key of cacheKeys) {
      await caches.delete(key);
      LOG.debug("キャッシュクリア${key}", "HeaderMenuClearCache");
    }
    LOG.info("アプリのキャッシュクリア完了", "HeaderMenuClearCache");
    props.onMenuClose();
    window.location.reload();
  };
  return (
    <>
      <HeaderMenuItemBase
        onClick={handleClick}
        icon={<CachedIcon />}
        text={t("menu.clearAppCache")}
      />
    </>
  );
};

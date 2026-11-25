import React from "react";
import { useTranslation } from "react-i18next";
import { LOG } from "../lib/Logging";
import { ResampEngineName } from "../lib/ResampEngine";
import { useCookieStore } from "../store/cookieStore";
import { useSnackBarStore } from "../store/snackBarStore";

/**
 * resampエンジンを切り替える処理をまとめたhook。
 *
 * cookieを更新して新しいエンジンを読み込み、読込中は`loading`がtrueになる。
 * 読込に失敗(タイムアウト)した場合はスナックバーで通知し、元のエンジンへ切り戻して再読込する。
 * 切り戻しの再読込が終わった時点で`loading`がfalseに戻る。
 * @param reloadResampler 新しいresamplerを読み込むコールバック。読込失敗時にrejectする。
 */
export const useResamplerSwitch = (reloadResampler?: () => Promise<void>) => {
  const { t } = useTranslation();
  const { resampEngine, setResampEngine } = useCookieStore();
  const snackBarStore = useSnackBarStore();
  const [loading, setLoading] = React.useState<boolean>(false);

  /**
   * 指定したエンジンに切り替える。現在のエンジンと同じ場合は何もしない。
   */
  const switchEngine = async (engine: ResampEngineName): Promise<void> => {
    if (engine === resampEngine) {
      return;
    }
    const previousEngine = resampEngine;
    LOG.info(
      `resampエンジンを変更: ${previousEngine} -> ${engine}`,
      "useResamplerSwitch",
    );
    setResampEngine(engine);
    if (!reloadResampler) {
      return;
    }
    setLoading(true);
    try {
      await reloadResampler();
    } catch (e) {
      LOG.error(
        `resampler(${engine})の読込に失敗しました。${previousEngine}に戻します。${e}`,
        "useResamplerSwitch",
      );
      snackBarStore.setSeverity("error");
      snackBarStore.setValue(t("resampler.loadError"));
      snackBarStore.setOpen(true);
      setResampEngine(previousEngine);
      try {
        await reloadResampler();
      } catch (e2) {
        LOG.error(
          `元のresampler(${previousEngine})の再読込にも失敗しました。${e2}`,
          "useResamplerSwitch",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, switchEngine };
};

import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import HelpIcon from "@mui/icons-material/Help";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useResamplerSwitch } from "../../../hooks/useResamplerSwitch";
import { ResampEngineName } from "../../../lib/ResampEngine";
import { useCookieStore } from "../../../store/cookieStore";
import { ResamplerHelpDialog } from "../ResamplerHelpDialog";
import { ResamplerLoadingModal } from "../ResamplerLoadingModal";

/** メニューに表示するエンジンの一覧 */
const RESAMP_ENGINES: ReadonlyArray<ResampEngineName> = ["resamp", "fave"];

export interface FooterResamplerMenuProps {
  /** メニューの表示位置 */
  anchor: HTMLElement | null;
  /** メニューを閉じるためのコールバック */
  handleClose: () => void;
  /** エンジン変更後に新しいresamplerを読み込む。完了時に解決され、読込失敗(タイムアウト)時はrejectするコールバック */
  reloadResampler?: () => Promise<void>;
}

export const FooterResamplerMenu: React.FC<FooterResamplerMenuProps> = (
  props,
) => {
  const { t } = useTranslation();
  const { resampEngine } = useCookieStore();
  const { loading, switchEngine } = useResamplerSwitch(props.reloadResampler);
  /** ヘルプダイアログの開閉状態 */
  const [helpOpen, setHelpOpen] = React.useState<boolean>(false);
  /** ヘルプダイアログに表示するエンジン。閉じるアニメーション中も表示を保つため開閉状態とは別に持つ */
  const [helpEngine, setHelpEngine] = React.useState<ResampEngineName>(
    RESAMP_ENGINES[0],
  );

  const handleClick = (engine: ResampEngineName) => {
    props.handleClose();
    switchEngine(engine);
  };

  /** ヘルプアイコンをクリックした際の動作。ヘルプダイアログを開く */
  const handleHelpClick = (e: React.MouseEvent, engine: ResampEngineName) => {
    e.stopPropagation();
    setHelpEngine(engine);
    setHelpOpen(true);
  };

  /** ヘルプダイアログを閉じる際の動作。メニューも閉じる */
  const handleHelpClose = () => {
    setHelpOpen(false);
    props.handleClose();
  };

  return (
    <>
      <Menu
        anchorEl={props.anchor}
        open={Boolean(props.anchor)}
        onClose={props.handleClose}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      >
        {RESAMP_ENGINES.map((engine) => (
          <MenuItem key={engine} onClick={() => handleClick(engine)}>
            <ListItemIcon>
              {resampEngine === engine ? (
                <CheckBoxIcon />
              ) : (
                <CheckBoxOutlineBlankIcon />
              )}
            </ListItemIcon>
            <ListItemText>{t(`resampler.${engine}`)}</ListItemText>
            <HelpIcon
              aria-label={t("resampler.help")}
              onClick={(e) => handleHelpClick(e, engine)}
              sx={{ ml: 2 }}
            />
          </MenuItem>
        ))}
      </Menu>
      <ResamplerHelpDialog
        open={helpOpen}
        engine={helpEngine}
        handleClose={handleHelpClose}
        handleSelectEngine={switchEngine}
      />
      <ResamplerLoadingModal open={loading} />
    </>
  );
};

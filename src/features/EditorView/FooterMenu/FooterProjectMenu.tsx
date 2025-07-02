import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { LOG } from "../../../lib/Logging";
import { dumpNotes } from "../../../lib/Note";
import { undoManager } from "../../../lib/UndoManager";
import { Ust } from "../../../lib/Ust";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { useSnackBarStore } from "../../../store/snackBarStore";
import { ProjectSettingDialog } from "../ProjectSettingDialog";

export const FooterProjectMenu: React.FC<FooterProjectMenuProps> = ({
  anchor,
  handleClose,
  setUstLoadProgress,
}) => {
  const { t } = useTranslation();
  /** 隠し表示する<input>へのref */
  const inputRef = React.useRef<HTMLInputElement>(null);
  const {
    ust,
    setUst,
    setUstTempo,
    setUstFlags,
    vb,
    notes,
    setNotes,
    ustFlags,
    ustTempo,
    clearUst,
  } = useMusicProjectStore();
  const snackBarStore = useSnackBarStore();
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  /**
   * inputのファイルを変更した際の動作
   * nullやファイル数が0の場合何もせず終了する。
   * ファイルが含まれている場合、1つ目のファイルをreadFileにセットする。
   * 実際のファイルの読込はloadVBDialogで行う。
   * @param e
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      LOG.warn("ustの読込がキャンセルされたか失敗しました", "FooterMenu");
      return;
    }
    setUstLoadProgress(true);
    LOG.info(`ustの選択:${e.target.files[0].name}`, "FooterMenu");
    LoadUst(e.target.files[0]);
  };

  /**
   * ustファイルを非同期で読み込み、グローバルな状態ust,notes,ustTempo,ustFlagsを更新する
   * @param file 選択されたustファイル
   */
  const LoadUst = async (file: File): Promise<void> => {
    try {
      LOG.info(`ustの読込開始`, "FooterMenu");
      const ust = new Ust();
      const buf = await file.arrayBuffer();
      await ust.load(buf);
      LOG.info(
        `ustの読込完了。ノート数:${ust.notes.length},bpm=:${ust.tempo},flags:${ust.flags}`,
        "FooterProjectMenu"
      );
      setUst(ust);
      setUstTempo(ust.tempo);
      setUstFlags(ust.flags);
      if (vb !== null) {
        notes.forEach((n) => n.applyOto(vb));
      } else {
        LOG.warn(
          `vbがロードされていません。テスト以外では必ず事前にロードされるはずなので何かがおかしい`,
          "FooterProjectMenu"
        );
      }
      setNotes(ust.notes);
      setUstLoadProgress(false);
      undoManager.clear();
    } catch (e) {
      LOG.warn(`ustの読込失敗。${e}`, "FooterProjectMenu");
      snackBarStore.setSeverity("error");
      snackBarStore.setValue(t("editor.footer.ustLoadError"));
      snackBarStore.setOpen(true);
      setUstLoadProgress(false);
    }
  };

  /**
   * ust読込をクリックした際の動作。
   * 不可視のinputのクリックイベントを発火する
   */
  const handleLoadUstClick = () => {
    LOG.debug("click LoadUst", "FooterProjectMenu");
    /** ファイル読み込みの発火 */
    LOG.info("ustファイルの選択", "FooterProjectMenu");
    inputRef.current.click();
    handleClose();
  };

  /**
   * ust保存をクリックした際の動作。
   */
  const handleSaveUstClick = () => {
    LOG.debug("click Save Ust", "FooterProjectMenu");
    LOG.gtag("SaveUst", { ustName: vb.name });
    const outputUst = dumpNotes(notes, ustTempo, ustFlags);
    const ustFile = new File([outputUst], `output_${new Date().toJSON()}.ust`, {
      type: "text/plane;charset=utf-8",
    });
    const url = URL.createObjectURL(ustFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = ustFile.name;
    a.click();
    handleClose();
  };

  /**
   * プロジェクト設定をクリックした際の動作
   */
  const handleProjectSettingClick = () => {
    LOG.debug("click Project Setting", "FooterProjectMenu");
    setDialogOpen(true);
    handleClose();
  };

  const handleDialogClose = () => {
    LOG.debug("dialogを閉じる", "FooterProjectMenu");
    setDialogOpen(false);
  };

  /** ustを初期化する処理 */
  const handleClearProjectClick = () => {
    LOG.debug("click Clear Project", "FooterProjectMenu");
    clearUst();
    handleClose();
  };

  return (
    <>
      <input
        type="file"
        onChange={handleFileChange}
        hidden
        ref={inputRef}
        accept=".ust"
        data-testid="ust-file-input"
      ></input>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      >
        <MenuItem onClick={handleLoadUstClick}>
          <ListItemIcon>
            <LibraryMusicIcon />
          </ListItemIcon>
          <ListItemText>{t("editor.footer.loadUst")}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSaveUstClick} disabled={ust === null}>
          <ListItemIcon>
            <SaveAltIcon />
          </ListItemIcon>
          <ListItemText>{t("editor.footer.saveUst")}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleProjectSettingClick} disabled={ust === null}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText>{t("editor.footer.prjectSetting")}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClearProjectClick} disabled={ust === null}>
          <ListItemIcon>
            <DeleteForeverIcon />
          </ListItemIcon>
          <ListItemText>{t("editor.footer.clearProject")}</ListItemText>
        </MenuItem>
      </Menu>
      <ProjectSettingDialog open={dialogOpen} handleClose={handleDialogClose} />
    </>
  );
};

export interface FooterProjectMenuProps {
  /** メニューの表示位置 */
  anchor: HTMLElement | null;
  /** メニューを閉じるためのコールバック */
  handleClose: () => void;
  /** 読込中の状態を伝えるためのコールバック */
  setUstLoadProgress: (progress: boolean) => void;
}

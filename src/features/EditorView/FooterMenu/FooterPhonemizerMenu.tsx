import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { BasePhonemizer } from "../../../lib/BasePhonemizer";
import { LOG } from "../../../lib/Logging";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { loadPhonemizerClasses } from "../../../utils/loadPhonemizer";

export interface FooterPhonemizerMenuProps {
  /** メニューの表示位置 */
  anchor: HTMLElement | null;
  /** メニューを閉じるためのコールバック */
  handleClose: () => void;
}

export const FooterPhonemizerMenu: React.FC<FooterPhonemizerMenuProps> = (
  props
) => {
  const { t } = useTranslation();
  const [phonemizers, setPhonemizers] = React.useState<
    Array<{ name: string; cls: new () => BasePhonemizer }>
  >([]);
  const { phonemizer, setPhonemizer } = useMusicProjectStore();
  React.useEffect(() => {
    LOG.debug(`コンポーネントマウント`, "FooterPhonemizerMenu");
    loadPhonemizerClasses().then((results) => {
      LOG.debug(`Phonemizerの一覧取得`, "FooterPhonemizerMenu");
      setPhonemizers(results);
    });
  }, []);

  const handleClick = (p: new () => BasePhonemizer) => {
    const newPhonemizer = new p();
    setPhonemizer(newPhonemizer);
    props.handleClose();
  };
  return (
    <Menu
      anchorEl={props.anchor}
      open={Boolean(props.anchor)}
      onClose={props.handleClose}
      anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
    >
      {phonemizers.map((p, i) => (
        <MenuItem key={i} onClick={() => handleClick(p.cls)}>
          <ListItemIcon>
            {phonemizer.name === p.name ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )}
          </ListItemIcon>
          <ListItemText>{t(p.name)}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
};

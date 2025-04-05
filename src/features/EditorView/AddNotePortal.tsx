import { Box, Fab, MenuItem } from "@mui/material";
import Portal from "@mui/material/Portal";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import React from "react";
import { useTranslation } from "react-i18next";
import { EDITOR_CONFIG } from "../../config/editor";
import { useVerticalFooterMenu } from "../../hooks/useVerticalFooterMenu";
import { LOG } from "../../lib/Logging";

const LENGTHES = [
  "1920",
  "1440",
  "960",
  "480",
  "320",
  "240",
  "160",
  "120",
  "80",
  "60",
  "30",
] as const;

export const AddNotePortal: React.FC<AddNotePortalProps> = (props) => {
  const { t } = useTranslation();
  const verticalMenu = useVerticalFooterMenu();
  const handleClick = () => {
    if (props.addNoteLyric === "R") {
      LOG.debug("追加するノートを音符に変更", "AddNotePortal");
      props.setAddNoteLyric("あ");
    } else {
      LOG.debug("追加するノートを休符に変更", "AddNotePortal");
      props.setAddNoteLyric("R");
    }
  };

  const handleChange = (e: SelectChangeEvent) => {
    LOG.debug(`追加するノート長を変更:${e.target.value}`, "AddNotePortal");
    props.setAddNoteLength(parseInt(e.target.value));
  };
  return (
    <Portal>
      <Box data-testid="addNotePortal">
        <Box
          sx={{
            position: "fixed",
            bottom: !verticalMenu ? EDITOR_CONFIG.FOOTER_MENU_SIZE : 0,
            right: verticalMenu
              ? EDITOR_CONFIG.FOOTER_MENU_SIZE +
                EDITOR_CONFIG.SLIDER_PADDING * 2
              : EDITOR_CONFIG.SLIDER_PADDING * 2,
            zIndex: 100,
          }}
        >
          <Select
            value={props.addNoteLength.toString()}
            onChange={handleChange}
            data-testid="addNoteLengthSelect"
            sx={{ m: 1 }}
          >
            {LENGTHES.map((l, i) => (
              <MenuItem key={i} value={l}>
                {t("editor.noteAddPortal.length" + l)}
              </MenuItem>
            ))}
          </Select>
          <Fab
            size="small"
            color="default"
            aria-label="addNoteLyricFab"
            data-testid="addNoteLyricFab"
            onClick={handleClick}
          >
            {props.addNoteLyric}
          </Fab>
        </Box>
      </Box>
    </Portal>
  );
};
export interface AddNotePortalProps {
  addNoteLength: number;
  setAddNoteLength: (number) => void;
  addNoteLyric: string;
  setAddNoteLyric: (string) => void;
}

import { Menu, TextField } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useMusicProjectStore } from "../../store/musicProjectStore";

export const LyricTextBox: React.FC<LyricTextBoxProps> = (props) => {
  const { t } = useTranslation();
  const { notes, setNoteProperty } = useMusicProjectStore();
  const [lyric, setLyric] = React.useState("");

  const handleMenuClose = () => {
    setNoteProperty(props.targetNoteIndex, "lyric", lyric);
    props.setTargetNoteIndex(undefined);
  };

  React.useEffect(() => {
    if (props.targetNoteIndex === undefined) {
      setLyric("");
    } else {
      setLyric(notes[props.targetNoteIndex].lyric);
    }
  }, [props.targetNoteIndex]);
  return (
    <>
      {props.targetNoteIndex !== undefined && (
        <Menu
          open={props.targetNoteIndex !== undefined}
          anchorReference="anchorPosition"
          onClose={handleMenuClose}
          sx={{ userSelect: "none" }}
          anchorPosition={{
            top: props.lyricAnchor.y,
            left: props.lyricAnchor.x,
          }}
        >
          <TextField
            variant="outlined"
            type="text"
            label={t("editor.noteProperty.lyric")}
            data-testid="propertyLyric"
            value={lyric}
            onChange={(e) => setLyric(e.target.value)}
          />
        </Menu>
      )}
    </>
  );
};
export interface LyricTextBoxProps {
  targetNoteIndex: number | undefined;
  setTargetNoteIndex: (index: number | undefined) => void;
  lyricAnchor: {
    x: number;
    y: number;
  } | null;
}

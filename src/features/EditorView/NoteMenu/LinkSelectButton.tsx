import LinkIcon from "@mui/icons-material/Link";
import { IconButton } from "@mui/material";
import React from "react";
import { LOG } from "../../../lib/Logging";
import { useMusicProjectStore } from "../../../store/musicProjectStore";

export const LinkSelectButton: React.FC<LinkSelectButtonProps> = (props) => {
  const { notes } = useMusicProjectStore();

  const handleLinkSelectButtonClick = () => {
    // selectedNotesIndexの長さが1のはず
    LOG.debug(
      `フレーズ選択 targetIndex:${props.selectedNotesIndex[0]}`,
      "LinkSelectButton"
    );

    if (notes[props.selectedNotesIndex[0]].lyric === "R") {
      props.handleMenuClose();
      return;
    }
    const selectedNoteIndex: number[] = [props.selectedNotesIndex[0]];
    /** props.selectedNotesIndex[0]からデクリメントしていき、歌詞がRになるまで選択する。1つ目のRは含む */
    for (let i = props.selectedNotesIndex[0] - 1; i >= 0; i--) {
      selectedNoteIndex.unshift(i);
      if (notes[i].lyric === "R") {
        break;
      }
    }

    /** props.selectedNotesIndex[0]からインクリメントしていき、歌詞がRになるまで選択する。1つ目のRは含む */
    for (let i = props.selectedNotesIndex[0] + 1; i < notes.length; i++) {
      selectedNoteIndex.push(i);
      if (notes[i].lyric === "R") {
        break;
      }
    }
    props.setSelectedNotesIndex(selectedNoteIndex);
    props.handleMenuClose();
  };

  return (
    <IconButton
      disabled={props.selectedNotesIndex.length !== 1}
      onClick={handleLinkSelectButtonClick}
      data-testid="EditButton"
    >
      <LinkIcon />
    </IconButton>
  );
};

export interface LinkSelectButtonProps {
  selectedNotesIndex: Array<number>;
  setSelectedNotesIndex?: (indexes: number[]) => void;
  handleMenuClose: () => void;
}

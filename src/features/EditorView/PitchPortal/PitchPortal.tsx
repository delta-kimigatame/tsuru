import { Box } from "@mui/material";
import Portal from "@mui/material/Portal";
import React from "react";
import { EDITOR_CONFIG } from "../../../config/editor";
import { useVerticalFooterMenu } from "../../../hooks/useVerticalFooterMenu";
import { Note } from "../../../lib/Note";
import { undoManager } from "../../../lib/UndoManager";
import { useMusicProjectStore } from "../../../store/musicProjectStore";
import { PitchHorizontalSlider } from "./PitchHorizontalSlider";
import { PitchVerticalSlider } from "./PitchVerticalSlider";
import { PoltamentAddFab } from "./PoltamentAddFab";
import { PoltamentRemoveFab } from "./PoltamentRemoveFab";
import { RotateModeFab } from "./RotateModeFab";

export const PitchPortal: React.FC<PitchPortalProps> = (props) => {
  const verticalMenu = useVerticalFooterMenu();
  const { notes } = useMusicProjectStore();
  const [hasUpdate, setHasUpdate] = React.useState<boolean>(false);
  const [initialUndoIndex, setInitialUndoIndex] = React.useState<
    number | undefined
  >(undefined);
  const [initialUndoNote, setInitialUndoNote] = React.useState<
    Note | undefined
  >(undefined);
  React.useEffect(() => {
    if (props.note === undefined) {
      //コンポーネントマウント時もしくはピッチ編集モードを抜けたとき
      setUndoManager(initialUndoNote, notes);
      //共通動作
      setInitialUndoIndex(undefined);
      setInitialUndoNote(undefined);
    } else if (props.targetIndex === undefined) {
      //ピッチ編集モードに入った時か操作対象ノートが変更されたとき
      setUndoManager(initialUndoNote, notes);
      setInitialUndoIndex(undefined);
      setInitialUndoNote(props.note);
    } else {
      //操作対象ポルタメントが初期設定されたか変更されたとき
      setUndoManager(initialUndoNote, notes);
      setInitialUndoIndex(props.targetIndex);
      setInitialUndoNote(props.note);
    }
    setHasUpdate(false);
  }, [props.targetIndex, props.note]);

  const setUndoManager = (oldNote: Note, notes: Note[]) => {
    if (
      initialUndoIndex !== undefined &&
      initialUndoNote !== undefined &&
      hasUpdate
    ) {
      const newNote = notes[oldNote.index];
      /**
       * 一連の累積的な処理の登録であるため、個別のパラメータは記録せず、直接編集前後のノートを返す形でundoManagerに登録する。
       * undoおよびredoはNote[]を返すことが期待されるため、Note[]にして返す
       * */
      undoManager.register({
        undo: (oldNote: Note): Note[] => [oldNote],
        undoArgs: oldNote.deepCopy(),
        redo: (newNote: Note): Note[] => [newNote],
        redoArgs: newNote.deepCopy(),
        summary: `ピッチの編集。ノートインデックス${initialUndoNote.index},ポルタメントのインデックス:${initialUndoIndex}`,
      });
    }
  };

  return (
    <>
      {props.note !== undefined && props.note.pbw !== undefined && (
        <Portal>
          <Box data-testid="pitchPortal">
            <PitchHorizontalSlider {...props} setHasUpdate={setHasUpdate} />
            {props.targetIndex !== undefined && (
              <Box
                sx={{
                  position: "fixed",
                  bottom:
                    (!verticalMenu ? EDITOR_CONFIG.FOOTER_MENU_SIZE : 0) +
                    EDITOR_CONFIG.SLIDER_SIZE,
                  right: verticalMenu
                    ? EDITOR_CONFIG.FOOTER_MENU_SIZE +
                      EDITOR_CONFIG.SLIDER_PADDING * 2
                    : EDITOR_CONFIG.SLIDER_PADDING * 2,
                  zIndex: 100,
                }}
              >
                <RotateModeFab {...props} />
                <PoltamentRemoveFab {...props} />
                <PoltamentAddFab {...props} />
              </Box>
            )}
            <PitchVerticalSlider {...props} setHasUpdate={setHasUpdate} />
          </Box>
        </Portal>
      )}
    </>
  );
};

export interface PitchPortalProps {
  targetIndex: number | undefined;
  note: Note | undefined;
}

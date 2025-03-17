import { LOG } from "../lib/Logging";
import { Note } from "../lib/Note";
import { VoiceBank } from "../lib/VoiceBanks/VoiceBank";

/**
 * バッチプロセスを実行し、結果のノートを更新する共通処理。
 * 結果はsetNoteを通して反映される
 *
 * @param selectedNotesIndex 選択されているノートのインデックス。空配列の場合は全ノート対象。
 * @param notes 現在のノート配列
 * @param setNote ノートを更新するための関数。(index, note) を受け取る。
 * @param vb vb(音源)情報。存在しない場合は適用せず警告ログを出す。
 * @param processFn バッチプロセス実行関数。targetNotes と任意の options を受け取り結果のノート配列を返す。
 * @param options オプション（バッチプロセスによって必要な場合のみ使用）
 */
export function executeBatchProcess<TOptions>(
  selectedNotesIndex: number[],
  notes: Note[],
  setNote: (index: number, note: Note) => void,
  vb: VoiceBank | null,
  processFn: (targetNotes: Note[], options?: TOptions) => Note[],
  options: TOptions
) {
  // 対象ノートの抽出：選択があればそのノート、なければ全ノート
  const targetNotes =
    selectedNotesIndex.length > 0
      ? selectedNotesIndex.map((idx) => notes[idx])
      : notes;
  LOG.info(
    `selectedIndex:${selectedNotesIndex}、selectedNotes:${selectedNotesIndex.length}、target:${targetNotes.length}`,
    "executeBatchProcess"
  );
  LOG.info("バッチ処理の実行", "executeBatchProcess");
  const resultNotes = processFn(targetNotes, options);
  LOG.info("バッチ処理の実行完了", "executeBatchProcess");
  if (vb !== null) {
    LOG.info("バッチ処理実行結果にoto.iniの適用", "executeBatchProcess");
    resultNotes.forEach((n) => n.applyOto(vb));
  } else {
    LOG.warn(
      `vbがロードされていません。テスト以外では必ず事前にロードされるはずなので何かがおかしい`,
      "executeBatchProcess"
    );
  }
  if (selectedNotesIndex.length > 0) {
    LOG.info("選択されたノートの更新", "executeBatchProcess");
    selectedNotesIndex.forEach((idx, i) => {
      setNote(idx, resultNotes[i]);
      if (idx !== 0) {
        resultNotes[i].prev = notes[idx - 1];
        notes[idx - 1].next = resultNotes[i];
      }
    });
  } else {
    LOG.info("全てのノートの更新", "executeBatchProcess");
    notes.forEach((_, idx) => {
      if (idx !== 0) {
        resultNotes[idx].prev = resultNotes[idx - 1];
        resultNotes[idx - 1].next = resultNotes[idx];
      }
      setNote(idx, resultNotes[idx]);
    });
  }
}

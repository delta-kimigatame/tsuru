import * as React from "react";
import { LoadVBDialog } from "../LoadVBDialog/LoadVBDialog";
import { SelectVBButton } from "./SelectVbButton";

/**
 * 音源を選択し読み込む一連の処理をまとめたコンポーネント。
 * topView上に表示され、多くのユーザーが最初に操作するボタンとなる。
 */
export const LoadVBUnit: React.FC = () => {
  /** 読込中判定 */
  const [processing, setProcessing] = React.useState<boolean>(false);
  /** ダイアログを開く判定 */
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  /** 読み込んだファイル */
  const [readFile, setReadFile] = React.useState<File | null>(null);
  return (
    <>
      <SelectVBButton
        processing={processing}
        setProcessing={setProcessing}
        setDialogOpen={setDialogOpen}
        setReadFile={setReadFile}
      />
      {readFile !== null && (
        <LoadVBDialog
          dialogOpen={dialogOpen}
          readFile={readFile}
          setProcessing={setProcessing}
          setDialogOpen={setDialogOpen}
          setReadFile={setReadFile}
        />
      )}
    </>
  );
};

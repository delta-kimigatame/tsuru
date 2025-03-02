import * as React from "react";
import { SelectVBButton } from "./SelectVbButton";

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
      {/* TODO LoadVBDialogを作成後追加する */}
    </>
  );
};

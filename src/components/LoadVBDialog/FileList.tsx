import { Box, LinearProgress } from "@mui/material";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import * as React from "react";

/**
 * LoadVBDialog内において、読み込んだzipファイル内にあるファイル一覧を表示するためのコンポーネント
 * ユーザーはこのコンポーネントの表示を確認し、zipを解凍に使用している文字コードが適切か判断する。
 */
export const FileList: React.FC<FileListProps> = (props) => {
  return (
    <>
      {props.processing ? (
        <LinearProgress />
      ) : (
        <Box sx={{ m: 1 }}>
          <Typography variant="body2">
            {props.files.map((f) => (
              <>
                {f}
                <Divider />
              </>
            ))}
          </Typography>
        </Box>
      )}
    </>
  );
};

export interface FileListProps {
  /**
   * zipファイルの読込状況
   */
  processing: boolean;
  /**
   * zipファイル内のファイル名一覧
   */
  files: Array<string>;
}

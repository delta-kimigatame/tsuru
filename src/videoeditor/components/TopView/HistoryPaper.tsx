import { Box, Divider, Typography } from "@mui/material";
import React from "react";
import { BasePaper } from "../../../components/common/BasePaper";

const HISTORY = [
  "2026/05/31\nVideo Editorページを追加。UST→WAV→編集画面の導線を実装。",
];

export const HistoryPaper: React.FC = () => {
  return (
    <BasePaper title="Video Editor 更新履歴">
      <Box sx={{ m: 1, p: 1 }}>
        {HISTORY.map((item) => (
          <React.Fragment key={item}>
            <Typography variant="body2">
              {item.split("\n").map((line) => (
                <React.Fragment key={line}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </Typography>
            <Divider />
          </React.Fragment>
        ))}
      </Box>
    </BasePaper>
  );
};

import { Box, Link, Typography } from "@mui/material";
import React from "react";
import { BasePaper } from "../../../components/common/BasePaper";

export const LinkPaper: React.FC = () => {
  return (
    <BasePaper title="ページリンク">
      <Box sx={{ m: 1, p: 1 }}>
        <Typography variant="subtitle2">相互リンク</Typography>
        <ul style={{ marginTop: 0 }}>
          <li>
            <Link variant="body2" href="./index.html">
              UTAlet本体へ戻る
            </Link>
          </li>
          <li>
            <Link variant="body2" href="./videoeditor.html">
              Video Editor トップ
            </Link>
          </li>
        </ul>
      </Box>
    </BasePaper>
  );
};

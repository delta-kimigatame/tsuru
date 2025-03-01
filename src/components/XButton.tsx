import Button, { ButtonProps } from "@mui/material/Button";
import { styled } from "@mui/material/styles";

/**
 * Xに共有するボタンを作るための色を設定したstyledコンポーネント
 */
export const XButton = styled(Button)<ButtonProps>(({ theme }) => ({
  color: "#FFFFFF",
  backgroundColor: "#101010",
  "&:hover": {
    backgroundColor: "#303030",
  },
}));

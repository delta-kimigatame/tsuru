import XIcon from "@mui/icons-material/X";
import { ButtonProps } from "@mui/material";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import React from "react";

/**
 * SNSでのシェア用のXButtonコンポーネント。
 * デフォルトでXIconをstartIconとして表示し、hrefとtarget="_blank"を必須にする。
 */
export interface XButtonProps extends ButtonProps {
  href: string; // hrefは必須
  target?: string; // targetは任意に設定
}

const StyledXButton = styled(Button)<XButtonProps>(({ theme }) => ({
  color: "#FFFFFF",
  backgroundColor: "#101010",
  "&:hover": {
    backgroundColor: "#303030",
  },
}));

/**
 * XButton - SNSシェアボタン
 *
 * 必ずXIconをstartIconとして表示し、hrefとtarget="_blank"を設定します。
 */
const XButton: React.FC<XButtonProps> = ({
  href,
  children,
  target = "_blank",
  ...props
}) => {
  return (
    <StyledXButton href={href} target={target} startIcon={<XIcon />} {...props}>
      {children}
    </StyledXButton>
  );
};

export { XButton };

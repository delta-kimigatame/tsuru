import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import React from "react";

/**
 * 休符後（1つ目のポルタメントが自由）なアクセントピッチを表すアイコン
 * 上 → 下 → 中
 */
export const FromAccentPitchIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <circle
      cx={4}
      cy={4}
      r={2}
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M 6 4 Q 9 8, 10 20"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <circle
      cx={12}
      cy={20}
      r={2}
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M 14 20 Q 17 16, 18 12"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <circle
      cx={20}
      cy={12}
      r={2}
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
  </SvgIcon>
);

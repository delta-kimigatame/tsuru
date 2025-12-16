import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import React from "react";

/**
 * ノート後（1つ目のポルタメントの音程が固定）な溜めピッチを表すアイコン
 * 上 → 下 → 上 → 中 → 上
 */
export const ReservePitchIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <circle
      cx={2}
      cy={4}
      r={2}
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M 4 4 Q 5 12, 6 20"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <circle
      cx={8}
      cy={20}
      r={2}
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M 10 20 Q 11 12, 12 4"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <circle
      cx={14}
      cy={4}
      r={2}
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M 16 4 Q 17 8, 18 12"
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
    <path
      d="M 22 12 Q 22.5 8, 23 4"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <circle
      cx={24}
      cy={4}
      r={2}
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
  </SvgIcon>
);

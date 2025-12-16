import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import React from "react";

/**
 * 休符後（1つ目のポルタメントが自由）な状態で上から下のピッチを表すアイコン
 */
export const FromAbovePitchIcon: React.FC<SvgIconProps> = (props) => (
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
      d="M 6 4 Q 10 2, 12 12 T 18 20"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <circle
      cx={20}
      cy={20}
      r={2}
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
  </SvgIcon>
);

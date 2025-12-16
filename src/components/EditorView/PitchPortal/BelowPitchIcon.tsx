import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import React from "react";

export const BelowPitchIcon: React.FC<SvgIconProps> = (props) => (
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
      d="M 6 4 Q 8 8, 10 20"
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
      d="M 14 20 Q 16 8, 18 4"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <circle
      cx={20}
      cy={4}
      r={2}
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
  </SvgIcon>
);

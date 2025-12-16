import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import React from "react";

export const FromBelowPitchIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <circle
      cx={4}
      cy={20}
      r={2}
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M 6 20 Q 10 22, 12 12 T 18 4"
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

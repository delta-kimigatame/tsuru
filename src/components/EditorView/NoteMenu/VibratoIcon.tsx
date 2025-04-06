import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import React from "react";

export const VibratoIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <path
      d="M 2,12 A5,5 0 1 1 12,12"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M 22,12 A5,5 0 1 1 12,12"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </SvgIcon>
);

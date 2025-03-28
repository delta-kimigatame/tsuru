import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import React from "react";

export const DividerNoteIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <rect
      x="1"
      width="22"
      height="12"
      y="6"
      fill="transparent"
      stroke="currentColor"
      strokeWidth="2"
    />
    <text
      x="3"
      y="13"
      fontSize="10"
      dominantBaseline="middle"
      stroke="currentColor"
    >
      A
    </text>
    <line
      x1="12"
      x2="12"
      y1="0"
      y2="24"
      strokeWidth="2"
      stroke="currentColor"
      stroke-dasharray="4 1"
    />
  </SvgIcon>
);

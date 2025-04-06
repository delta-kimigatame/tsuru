import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import React from "react";

export const EnvelopeNoteIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <line
      x1="1"
      x2="23"
      y1="20"
      y2="20"
      stroke="currentColor"
      strokeWidth="2"
    />
    <line x1="1" x2="3" y1="20" y2="2" stroke="currentColor" strokeWidth="2" />
    <line x1="3" x2="8" y1="2" y2="7" stroke="currentColor" strokeWidth="2" />
    <line x1="8" x2="19" y1="7" y2="7" stroke="currentColor" strokeWidth="2" />
    <line
      x1="19"
      x2="23"
      y1="7"
      y2="20"
      stroke="currentColor"
      strokeWidth="2"
    />
    <text
      x="5"
      y="14"
      fontSize="10"
      dominantBaseline="middle"
      stroke="currentColor"
    >
      A
    </text>
  </SvgIcon>
);

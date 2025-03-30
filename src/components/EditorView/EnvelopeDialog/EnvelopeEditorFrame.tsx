import React from "react";
import { Pallet } from "../../../config/pallet";

export const EnvelopeEditorFrame: React.FC<{
  svgSize: { width: number; height: number };
  pallet: Pallet;
}> = ({ svgSize, pallet }) => {
  return (
    <>
      <line
        strokeWidth="1"
        x1="0"
        x2="0"
        y1="0"
        y2={svgSize.height}
        stroke={pallet["verticalSeparator"]}
      />
      <line
        strokeWidth="1"
        x1={svgSize.width}
        x2={svgSize.width}
        y1="0"
        y2={svgSize.height}
        stroke={pallet["verticalSeparator"]}
      />
      <line
        strokeWidth="1"
        x1="0"
        x2={svgSize.width}
        y1="0"
        y2="0"
        stroke={pallet["verticalSeparator"]}
      />
      <line
        strokeWidth="1"
        x1="0"
        x2={svgSize.width}
        y1={svgSize.height / 2}
        y2={svgSize.height / 2}
        stroke={pallet["verticalSeparator"]}
      />
      <line
        strokeWidth="1"
        x1="0"
        x2={svgSize.width}
        y1={svgSize.height}
        y2={svgSize.height}
        stroke={pallet["verticalSeparator"]}
      />
    </>
  );
};

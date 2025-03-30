import React from "react";
import { Pallet } from "../../../config/pallet";

export const EnvelopeEditorTimingLine: React.FC<{
  svgSize: {
    width: number;
    height: number;
  };
  pallet: Pallet;
  overlapX: number;
  preutterX: number;
}> = ({ svgSize, pallet, overlapX, preutterX }) => {
  return (
    <>
      <line
        strokeWidth="1"
        x1={overlapX}
        x2={overlapX}
        y1="0"
        y2={svgSize.height}
        stroke={pallet["restNote"]}
      />
      <line
        strokeWidth="1"
        x1={preutterX}
        x2={preutterX}
        y1="0"
        y2={svgSize.height}
        stroke={pallet["note"]}
      />
    </>
  );
};

import React from "react";
import { Pallet } from "../../../config/pallet";

export const EnvelopeEditorPoltament: React.FC<{
  svgSize: {
    width: number;
    height: number;
  };
  pallet: Pallet;
  pointX: number[];
  pointY: number[];
}> = ({ svgSize, pallet, pointX, pointY }) => {
  return (
    <>
      {pointX.map((p, i) => (
        <>
          <circle
            key={i}
            r="10"
            stroke={pallet["pitch"]}
            fill="none"
            cx={p}
            cy={pointY[i]}
          />
        </>
      ))}

      <line
        stroke={pallet["pitch"]}
        strokeWidth={1}
        x1={pointX[0]}
        x2={0}
        y1={pointY[0]}
        y2={svgSize.height}
      />
      <line
        stroke={pallet["pitch"]}
        strokeWidth={1}
        x1={pointX[1]}
        x2={pointX[0]}
        y1={pointY[1]}
        y2={pointY[0]}
      />
      <line
        stroke={pallet["pitch"]}
        strokeWidth={1}
        x1={pointX[1]}
        x2={pointX[pointX.length === 5 ? 4 : 2]}
        y1={pointY[1]}
        y2={pointY[pointX.length === 5 ? 4 : 2]}
      />
      {pointX.length >= 4 && (
        <line
          stroke={pallet["pitch"]}
          strokeWidth={1}
          x1={pointX[2]}
          x2={pointX[3]}
          y1={pointY[2]}
          y2={pointY[3]}
        />
      )}
      {pointX.length >= 5 && (
        <line
          stroke={pallet["pitch"]}
          strokeWidth={1}
          x1={pointX[4]}
          x2={pointX[2]}
          y1={pointY[4]}
          y2={pointY[2]}
        />
      )}
      <line
        stroke={pallet["pitch"]}
        strokeWidth={1}
        x1={pointX[pointX.length >= 4 ? 3 : 2]}
        x2={svgSize.width}
        y1={pointY[pointX.length >= 4 ? 3 : 2]}
        y2={svgSize.height}
      />
    </>
  );
};

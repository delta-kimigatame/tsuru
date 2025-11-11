import React from "react";
import { EnvelopeEditorFrame } from "../../../components/EditorView/EnvelopeDialog/EnvelopeEditorFrame";
import { EnvelopeEditorPoltament } from "../../../components/EditorView/EnvelopeDialog/EnvelopeEditorPoltament";
import { EnvelopeEditorTimingLine } from "../../../components/EditorView/EnvelopeDialog/EnvelopeEditorTimingLine";
import { Pallet } from "../../../config/pallet";

export const EnvelopeEditorSvg: React.FC<{
  svgSize: {
    width: number;
    height: number;
  };
  pallet: Pallet;
  overlapX: number;
  preutterX: number;
  pointX: number[];
  pointY: number[];
  msLength: number;
  setPoint: (index: number, value: string) => void;
  setValue: (index: number, value: string) => void;
}> = ({
  svgSize,
  pallet,
  overlapX,
  preutterX,
  pointX,
  pointY,
  msLength,
  setPoint,
  setValue,
}) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [targetIndex, setTargetIndex] = React.useState<number | undefined>(
    undefined
  );
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    // タッチデバイスでのスクロール防止
    event.preventDefault();
    event.stopPropagation();

    const svg = event.currentTarget;

    // ポインターキャプチャを設定（重要：タッチ操作の追跡を確実にする）
    svg.setPointerCapture(event.pointerId);

    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    // SVGの座標系に変換する
    const svgPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    let minIndex: number | undefined = undefined;
    let minDistance: number = 40;
    pointX.forEach((p, i) => {
      const distance = Math.sqrt(
        (svgPoint.x - p) ** 2 + (svgPoint.y - pointY[i]) ** 2
      );
      if (distance <= minDistance) {
        minDistance = distance;
        minIndex = i;
      }
    });
    setTargetIndex(minIndex);
    setIsDragging(minIndex !== undefined);
  };

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    event.preventDefault();
    event.stopPropagation();

    // ポインターキャプチャを解放
    const svg = event.currentTarget;
    svg.releasePointerCapture(event.pointerId);

    setTargetIndex(undefined);
    setIsDragging(false);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    // ドラッグ中でない場合は何もしない
    if (targetIndex === undefined || !isDragging) return;

    // スクロール防止
    event.preventDefault();
    event.stopPropagation();

    const svg = event.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    // SVGの座標系に変換する
    const svgPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    const p = (svgPoint.x * msLength) / svgSize.width;
    const v = Math.floor(200 - (200 * svgPoint.y) / svgSize.height);
    setPoint(targetIndex, p.toString());
    setValue(targetIndex, v.toString());
  };

  const handlePointerCancel = (event: React.PointerEvent<SVGSVGElement>) => {
    event.preventDefault();
    const svg = event.currentTarget;
    svg.releasePointerCapture(event.pointerId);
    setTargetIndex(undefined);
    setIsDragging(false);
  };

  return (
    <svg
      width={svgSize.width}
      height={svgSize.height}
      onPointerUp={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerCancel={handlePointerCancel}
      style={{
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
    >
      <g id="frame">
        <EnvelopeEditorFrame svgSize={svgSize} pallet={pallet} />
      </g>
      <g id="timing">
        <EnvelopeEditorTimingLine
          svgSize={svgSize}
          pallet={pallet}
          overlapX={overlapX}
          preutterX={preutterX}
        />
      </g>
      <g id="poltament">
        <EnvelopeEditorPoltament
          svgSize={svgSize}
          pallet={pallet}
          pointX={pointX}
          pointY={pointY}
        />
      </g>
    </svg>
  );
};

import { Box } from "@mui/material";
import React from "react";
import { EnvelopeTextField } from "./EnvelopeTextField";
export const EnvelopeTextGroup: React.FC<{
  points: string[];
  values: string[];
  index: number;
  setPoint: (index: number, value: string) => void;
  setValue: (index: number, value: string) => void;
  onPointBlur: (index: number) => void;
  onValueBlur: (index: number) => void;
}> = (props) => {
  return (
    <Box>
      <EnvelopeTextField
        label={`p${props.index + 1}`}
        value={props.points[props.index] ?? ""}
        index={props.index}
        setValue={props.setPoint}
        onBlur={props.onPointBlur}
      />
      <br />
      <EnvelopeTextField
        label={`v${props.index + 1}`}
        value={props.values[props.index] ?? ""}
        index={props.index}
        setValue={props.setValue}
        onBlur={props.onValueBlur}
      />
    </Box>
  );
};

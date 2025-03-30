import { Box } from "@mui/material";
import React from "react";
import { EnvelopeTextField } from "./EnvelopeTextField";
export const EnvelopeTextGroup: React.FC<{
  points: number[];
  values: number[];
  index: number;
  setPoint: (index: number, value: string) => void;
  setValue: (index: number, value: string) => void;
}> = (props) => {
  return (
    <Box>
      <EnvelopeTextField
        label={`p${props.index + 1}`}
        value={props.points[props.index]}
        index={props.index}
        setValue={props.setPoint}
      />
      <br />
      <EnvelopeTextField
        label={`v${props.index + 1}`}
        value={props.values[props.index]}
        index={props.index}
        setValue={props.setValue}
      />
    </Box>
  );
};

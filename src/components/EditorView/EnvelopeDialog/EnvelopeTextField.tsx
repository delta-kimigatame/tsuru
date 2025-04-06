import { TextField } from "@mui/material";
import React from "react";
export const EnvelopeTextField: React.FC<{
  label: string;
  index: number;
  value: number;
  setValue: (index: number, value: string) => void;
}> = (props) => {
  return (
    <TextField
      sx={{ my: 1 }}
      label={props.label}
      size="small"
      type="number"
      variant="outlined"
      value={props.value ?? ""}
      onChange={(e) => props.setValue(props.index, e.target.value)}
    />
  );
};

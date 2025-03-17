import React from "react";
import { FooterMenu } from "./FooterMenu/FooterMenu";
import { Pianoroll } from "./Pianoroll/Pianoroll";

export const EditorView: React.FC = () => {
  return (
    <>
      <Pianoroll />
      <br />
      <br />
      <FooterMenu />
    </>
  );
};

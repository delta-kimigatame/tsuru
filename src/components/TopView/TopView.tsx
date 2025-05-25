import * as React from "react";

import { InstallPaper } from "../../features/TopView/InstallPaper";
import { DescriptionPaper } from "./DescriptionPaper";
import { HistoryPaper } from "./HistoryPaper";
import { LinkPaper } from "./LinkPaper";
import { PrivacyPaper } from "./PrivacyPaper";
import { RulePaper } from "./RulePaper";

/**
 */
export const TopView: React.FC = () => {
  return (
    <>
      <DescriptionPaper />
      <RulePaper />
      <PrivacyPaper />
      <LinkPaper />
      <HistoryPaper />
      <InstallPaper />
    </>
  );
};

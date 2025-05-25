import * as React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";

import { Divider, Link, Typography } from "@mui/material";
import { BasePaper } from "../common/BasePaper";

/**
 * トップビューに表示する、利用規約
 * @returns トップビューに表示する、利用規約
 */
export const LinkPaper: React.FC = () => {
  const { t } = useTranslation();
  return (
    <BasePaper title={t("top.linkTitle")}>
      <Box sx={{ m: 1, p: 1 }}>
        <Typography variant="subtitle2">{t("top.linkSynthesis")}</Typography>
        <ul style={{ marginTop: 0 }}>
          <li>
            <Link
              variant="body2"
              href="https://utau2008.xrea.jp/"
              target="_blank"
            >
              {t("top.linkPureUtau")}
            </Link>
          </li>
          <li>
            <Link
              variant="body2"
              href="https://www.openutau.com/"
              target="_blank"
            >
              {t("top.linkOpenUtau")}
            </Link>
          </li>
        </ul>
        <Divider />
        <br />
        <Typography variant="subtitle2">{t("top.linkSeries")}</Typography>
        <ul style={{ marginTop: 0 }}>
          <li>
            <Link
              variant="body2"
              href="https://k-uta.jp/laberu/"
              target="_blank"
            >
              {t("top.linkLaberu")}
            </Link>
          </li>
          <li>
            <Link
              variant="body2"
              href="https://k-uta.jp/gakuya/"
              target="_blank"
            >
              {t("top.linkGakuya")}
            </Link>
          </li>
        </ul>
        <Divider />
        <br />
        <Typography variant="subtitle2">{t("top.linkThirdParty")}</Typography>
        <ul style={{ marginTop: 0 }}>
          <li>
            <Link
              variant="body2"
              href="https://github.com/sdercolin/recstar"
              target="_blank"
            >
              {t("top.linkRecstar")}
            </Link>
          </li>
          <li>
            <Link
              variant="body2"
              href="https://sdercolin.github.io/utaformatix3/"
              target="_blank"
            >
              {t("top.linkUtaformatix")}
            </Link>
          </li>
        </ul>
      </Box>
    </BasePaper>
  );
};

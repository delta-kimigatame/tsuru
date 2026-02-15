import * as React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";

import { Collapse, Divider, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { BasePaper } from "../../components/common/BasePaper";
import { LOG } from "../../lib/Logging";

/** 表示するキャンペーンのインデックス */
const campaignIndex = 0;

export const CampaignPaper: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const regulations = t(`top.campaigns.${campaignIndex}.regulations`, {
    returnObjects: true,
  }) as string[] | string;
  const regulationList = Array.isArray(regulations) ? regulations : [];
  const eventTag = t(`top.campaigns.${campaignIndex}.eventTag`);
  const tagLabel = eventTag.startsWith("#") ? eventTag : `#${eventTag}`;

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    LOG.gtag("campaign", {
      tag: eventTag,
    });
  }, [isOpen, eventTag]);
  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        sx={{
          width: "calc(100% - 16px)",
          m: 1,
          minHeight: "18vh",
          maxHeight: "25vh",
          borderRadius: 2,
          p: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 0.5,
          color: theme.palette.primary.contrastText,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          boxShadow: 2,
          cursor: "pointer",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: 4,
          },
          "&:focus-visible": {
            outline: `2px solid ${theme.palette.secondary.light}`,
            outlineOffset: 2,
          },
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t(`top.campaigns.${campaignIndex}.title`)}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          {t(`top.campaigns.${campaignIndex}.startDatetime`)} -{" "}
          {t(`top.campaigns.${campaignIndex}.endDatetime`)}
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {tagLabel}
        </Typography>
      </Box>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <BasePaper title={t(`top.campaigns.${campaignIndex}.title`)}>
          <Box sx={{ m: 1, p: 1 }}>
            <Typography variant="body2">
              {t(`top.campaigns.${campaignIndex}.about`)}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6">{t(`top.campaign.datetime`)}</Typography>
            <Typography variant="body2">
              {t(`top.campaigns.${campaignIndex}.startDatetime`)} -{" "}
              {t(`top.campaigns.${campaignIndex}.endDatetime`)}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6">{t(`top.campaign.eventTag`)}</Typography>
            <Typography variant="body2">{tagLabel}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6">{t(`top.campaign.regulation`)}</Typography>
            <Box component="ul" sx={{ mt: 0.5, mb: 0, pl: 2 }}>
              {regulationList.map((regulation, index) => (
                <Box component="li" key={`${regulation}-${index}`}>
                  <Typography variant="body2">{regulation}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </BasePaper>
      </Collapse>
    </>
  );
};

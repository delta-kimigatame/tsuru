import { Box, CircularProgress, Modal, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

export interface ResamplerLoadingModalProps {
  /** モーダルの表示状態。新しいresamplerの読込中にtrueとする */
  open: boolean;
}

/**
 * resamplerの読込中に操作を止めるためのモーダル
 */
export const ResamplerLoadingModal: React.FC<ResamplerLoadingModalProps> = ({
  open,
}) => {
  const { t } = useTranslation();
  return (
    <Modal open={open} aria-label={t("resampler.loading")}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          p: 4,
          bgcolor: "background.paper",
          borderRadius: 2,
          outline: "none",
        }}
      >
        <CircularProgress />
        <Typography>{t("resampler.loading")}</Typography>
      </Box>
    </Modal>
  );
};

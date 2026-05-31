import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  isFontLoaded,
  loadGoogleFont,
  type FontLoadState,
} from "../utils/fontLoader";
import { FONT_CATEGORY_KEYS, GOOGLE_FONTS } from "../utils/googleFonts";

interface Props {
  /** 現在選択中のフォントファミリー。空文字 = システムフォント（デフォルト） */
  value: string;
  onChange: (family: string) => void;
  /** ラベルの i18n キー。省略時は "videoEditor.fontSelector" */
  labelKey?: string;
}

export const FontSelector: React.FC<Props> = ({
  value,
  onChange,
  labelKey,
}) => {
  const { t } = useTranslation();
  const [loadState, setLoadState] = React.useState<FontLoadState>(() =>
    value && isFontLoaded(value) ? "loaded" : value ? "idle" : "idle",
  );

  const handleChange = (e: SelectChangeEvent) => {
    const family = e.target.value;
    onChange(family);
    if (!family) {
      setLoadState("idle");
      return;
    }
    if (isFontLoaded(family)) {
      setLoadState("loaded");
      return;
    }
    setLoadState("loading");
    loadGoogleFont(family).then(
      () => setLoadState("loaded"),
      () => setLoadState("error"),
    );
  };

  const labelText = t(labelKey ?? "videoEditor.fontSelector");

  const endAdornment =
    loadState === "loading" ? (
      <CircularProgress size={14} sx={{ mr: 3 }} />
    ) : loadState === "error" ? (
      <Tooltip title={t("videoEditor.fontLoadFailed")}>
        <span style={{ marginRight: 12, cursor: "help", color: "orange" }}>
          ⚠
        </span>
      </Tooltip>
    ) : null;

  return (
    <FormControl size="small" fullWidth>
      <InputLabel>{labelText}</InputLabel>
      <Select
        value={value}
        label={labelText}
        onChange={handleChange}
        endAdornment={endAdornment}
        renderValue={(v) =>
          v ? (
            <span style={{ fontFamily: `"${v}", sans-serif` }}>{v}</span>
          ) : (
            <span>{t("videoEditor.fontDefault")}</span>
          )
        }
      >
        {/* デフォルト（システムフォント） */}
        <MenuItem value="">
          <em>{t("videoEditor.fontDefault")}</em>
        </MenuItem>

        {FONT_CATEGORY_KEYS.map((categoryKey) => {
          const fonts = GOOGLE_FONTS.filter(
            (f) => f.categoryKey === categoryKey,
          );
          return [
            <ListSubheader key={`cat-${categoryKey}`}>
              {t(categoryKey)}
            </ListSubheader>,
            ...fonts.map((font) => (
              <MenuItem
                key={font.family}
                value={font.family}
                sx={{ fontFamily: `"${font.family}", sans-serif` }}
              >
                {font.family}
              </MenuItem>
            )),
          ];
        })}
      </Select>
    </FormControl>
  );
};

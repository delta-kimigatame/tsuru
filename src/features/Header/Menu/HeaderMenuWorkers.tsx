import WorkspacesIcon from "@mui/icons-material/Workspaces";
import { FormControl, Select, SelectChangeEvent } from "@mui/material";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import React from "react";
import { useTranslation } from "react-i18next";
import { HeaderMenuItemProps } from "../../../components/Header/HeaderMenuItemBase";
import { useCookieStore } from "../../../store/cookieStore";
import { range } from "../../../utils/array";
export const HeaderMenuWorkers: React.FC<HeaderMenuItemProps> = (props) => {
  const { t } = useTranslation();
  const { workersCount, setWorkersCount } = useCookieStore();
  const handleChange = (e: SelectChangeEvent) => {
    setWorkersCount(parseInt(e.target.value));
    props.onMenuClose();
  };
  return (
    <>
      <MenuItem>
        <ListItemIcon>
          <WorkspacesIcon />
        </ListItemIcon>
        <FormControl size="small">
          <ListItemText>
            {t("menu.workers")}
            <Select
              variant="filled"
              defaultValue=""
              value={workersCount.toString()}
              onChange={handleChange}
              data-testid="workersCount-select"
              sx={{ mx: 1 }}
            >
              {range(1, 9).map((i) => (
                <MenuItem value={i} key={`workers${i}`}>
                  {i}
                </MenuItem>
              ))}
            </Select>
          </ListItemText>
        </FormControl>
      </MenuItem>
    </>
  );
};

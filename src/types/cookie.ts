import { ColorTheme } from "./colorTheme";
import { Language } from "./language";
import { Mode } from "./mode";
import { defaultParam } from "./note";

export interface CookieData {
  mode: Mode;
  language: Language;
  colorTheme: ColorTheme;
  defaultNote: defaultParam;
}

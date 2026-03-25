import { AntdColor } from "@reearth-cms/utils/style";

export function parseConfigBoolean(value: string | boolean | undefined | null): boolean {
  if (value === true) return true;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
}

type StateType = "DRAFT" | "PUBLIC" | "REVIEW";

export const stateColors: Record<StateType, string> = {
  DRAFT: AntdColor.GREY.GREY_0,
  PUBLIC: AntdColor.GREEN.GREEN_5,
  REVIEW: AntdColor.ORANGE.ORANGE_5,
};

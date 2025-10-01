export function parseConfigBoolean(value: string | boolean | undefined | null): boolean {
  if (value === true) return true;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
}

type ColorType = string;
type StateType = "DRAFT" | "PUBLIC" | "REVIEW";

export const stateColors: Record<StateType, ColorType> = {
  DRAFT: "#BFBFBF",
  PUBLIC: "#52C41A",
  REVIEW: "#FA8C16",
};

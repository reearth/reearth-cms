import { ColorType, StateType } from "@reearth-cms/components/molecules/Content/Table/types";

export const stateColors: {
  [K in StateType]: ColorType;
} = {
  DRAFT: "#BFBFBF",
  PUBLIC: "#52C41A",
  REVIEW: "#FA8C16",
};

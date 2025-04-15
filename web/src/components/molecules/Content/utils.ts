import { ColorType, StateType } from "@reearth-cms/components/molecules/Content/Table/types";
import { Tag } from "@reearth-cms/components/molecules/Schema/types";

export const stateColors: Record<StateType, ColorType> = {
  DRAFT: "#BFBFBF",
  PUBLIC: "#52C41A",
  REVIEW: "#FA8C16",
};

export const selectedTagIdsGet = (value: string[], tags: Tag[]) =>
  value.length ? tags.filter(tag => value.includes(tag.id)).map(({ id }) => id) : [];

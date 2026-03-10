import { ColorType, StateType } from "@reearth-cms/components/molecules/Content/Table/types";
import { Tag } from "@reearth-cms/components/molecules/Schema/types";
import { AntdColor } from "@reearth-cms/utils/color";

export const stateColors: Record<StateType, ColorType> = {
  DRAFT: AntdColor.GREY.GREY_0, // originally #BFBFBF
  PUBLIC: AntdColor.GREEN.GREEN_5,
  REVIEW: AntdColor.ORANGE.ORANGE_5,
};

export const selectedTagIdsGet = (value: string[], tags: Tag[]) =>
  value.length ? tags.filter(tag => value.includes(tag.id)).map(({ id }) => id) : [];

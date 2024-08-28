import { ItemValue } from "@reearth-cms/components/molecules/Content/types";
import dayjs from "dayjs";

export function dateConvert(value?: ItemValue) {
  if (Array.isArray(value)) {
    return (value as string[]).map(valueItem => (valueItem ? dayjs(valueItem) : ""));
  } else {
    return value ? dayjs(value as string) : "";
  }
}

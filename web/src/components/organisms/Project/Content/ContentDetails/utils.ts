import dayjs from "dayjs";

import { ItemValue } from "@reearth-cms/components/molecules/Content/types";

export function dateConvert(value?: ItemValue | null) {
  if (Array.isArray(value)) {
    return (value as string[]).map(valueItem => (valueItem ? dayjs(valueItem) : ""));
  } else {
    return value ? dayjs(value as string) : "";
  }
}

import { AntdColor } from "@reearth-cms/utils/style";

import { RequestState } from "./types";

export const badgeColors: Record<RequestState, string> = {
  APPROVED: AntdColor.GREEN.GREEN_5,
  CLOSED: AntdColor.RED.RED_5,
  WAITING: AntdColor.ORANGE.ORANGE_5,
  DRAFT: "",
};

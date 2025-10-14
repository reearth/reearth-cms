import { RequestState } from "./types";

export const badgeColors: Record<RequestState, string> = {
  APPROVED: "#52C41A",
  CLOSED: "#F5222D",
  WAITING: "#FA8C16",
  DRAFT: "",
};

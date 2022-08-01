import moment from "moment";

export const dateTimeFormat = (date: Date, format = "YYYY-MM-DD hh:mm") => {
  return `${moment(date).format(format)}`;
};

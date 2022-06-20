import moment from "moment";

type SortFunction<T> = (a: T, b: T) => number;

export const dateSort: SortFunction<Date> = (a, b) => moment(a).diff(moment(b));

export const numberSort: SortFunction<number> = (a, b) => a - b;

export const stringSort: SortFunction<string> = (a, b) => a.localeCompare(b);

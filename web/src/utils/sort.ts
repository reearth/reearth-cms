import moment from "moment";

type SortCallback<T> = (a: T, b: T) => number;

export const dateSortCallback: SortCallback<Date> = (a, b) => moment(a).diff(moment(b));

export const numberSortCallback: SortCallback<number> = (a, b) => a - b;

export const stringSortCallback: SortCallback<string> = (a, b) => a.localeCompare(b);

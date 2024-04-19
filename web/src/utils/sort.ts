import dayjs from "dayjs";

type SortCallback<T> = (a: T, b: T) => number;

export const dateSortCallback: SortCallback<Date | string> = (a, b) => dayjs(a).diff(dayjs(b));

export const numberSortCallback: SortCallback<number> = (a, b) => a - b;

export const stringSortCallback: SortCallback<string> = (a, b) => a.localeCompare(b);

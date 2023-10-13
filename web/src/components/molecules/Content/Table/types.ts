export type ColorType = "#BFBFBF" | "#52C41A" | "#FA8C16";
export type StateType = "DRAFT" | "PUBLIC" | "REVIEW";
export type FilterType = {
  dataIndex: string | string[];
  option: FilterOptions;
  value: string;
};

export enum FilterOptions {
  Is,
  IsNot,
  Contains,
  NotContain,
  IsEmpty,
  IsNotEmpty,
  GreaterThan,
  LessThan,
  Before,
  After,
  OfThisWeek,
  OfThisMonth,
  OfThisYear,
}

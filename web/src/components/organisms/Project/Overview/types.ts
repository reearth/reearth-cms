export type SortModelBy = "createdAt" | "updatedAt" | "name";

export type ModelSortOption = {
  key: SortModelBy;
  value: SortModelBy;
  label: string;
};

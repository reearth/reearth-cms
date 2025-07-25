export type SortProjectBy = "createdAt" | "updatedAt" | "name";


export type ProjectSortOption = {
  key: SortProjectBy;
  value: SortProjectBy;
  label: string;
};
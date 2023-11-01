export type View = {
  id: string;
  name: string;
  modelId: string;
  projectId: string;
  sort?: ItemSort | null;
  filter?: Condition | null;
  columns?: FieldSelector[];
  // update this type after completing searchItem graphQL API
};

export type ItemSort = {
  field: FieldSelector | null;
  direction: SortDirection | null;
};

export type FieldSelector = {
  type: FieldType;
  id: string | null;
};

export enum FieldType {
  ID = "ID",
  CREATION_DATE = "CREATION_DATE",
  CREATION_USER = "CREATION_USER",
  MODIFICATION_DATE = "MODIFICATION_DATE",
  MODIFICATION_USER = "MODIFICATION_USER",
  STATUS = "STATUS",
  FIELD = "FIELD",
  META_FIELD = "META_FIELD",
}

export enum SortDirection {
  ASC = "ASC",
  DESC = "DESC",
}

export type Condition =
  | AndCondition
  | OrCondition
  | BasicFieldCondition
  | NullableFieldCondition
  | MultipleFieldCondition
  | BoolFieldCondition
  | StringFieldCondition
  | NumberFieldCondition
  | TimeFieldCondition;

export type AndCondition = {
  conditions: Condition[];
};

export type OrCondition = {
  conditions: Condition[];
};

export type BasicFieldCondition = {
  fieldId: FieldSelector;
  operator: BasicOperator;
  value: any;
};

export enum BasicOperator {
  EQUALS = "EQUALS",
  NOT_EQUALS = "NOT_EQUALS",
}

export type NullableFieldCondition = {
  fieldId: FieldSelector;
  operator: NullableOperator;
};

export type MultipleFieldCondition = {
  fieldId: FieldSelector;
  operator: MultipleOperator;
  value: [any];
};

export enum NullableOperator {
  EMPTY = "EMPTY",
  NOT_EMPTY = "NOT_EMPTY",
}

export enum BoolOperator {
  EQUALS = "EQUALS",
  NOT_EQUALS = "NOT_EQUALS",
}

export enum MultipleOperator {
  INCLUDES_ANY = "INCLUDES_ANY",
  NOT_INCLUDES_ANY = "NOT_INCLUDES_ANY",
  INCLUDES_ALL = "INCLUDES_ALL",
  NOT_INCLUDES_ALL = "NOT_INCLUDES_ALL",
}

export type BoolFieldCondition = {
  fieldId: FieldSelector;
  operator: BoolOperator;
  value: boolean;
};

export type StringFieldCondition = {
  fieldId: FieldSelector;
  operator: StringOperator;
  value: boolean;
};

export enum StringOperator {
  CONTAINS = "CONTAINS",
  NOT_CONTAINS = "NOT_CONTAINS",
  STARTS_WITH = "STARTS_WITH",
  ENDS_WITH = "ENDS_WITH",
  NOT_STARTS_WITH = "NOT_STARTS_WITH",
  NOT_ENDS_WITH = "NOT_ENDS_WITH",
}

export type NumberFieldCondition = {
  fieldId: FieldSelector;
  operator: StringOperator;
  value: boolean;
};

export enum NumberOperator {
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN = "LESS_THAN",
  GREATER_THAN_OR_EQUAL_TO = "GREATER_THAN_OR_EQUAL_TO",
  LESS_THAN_OR_EQUAL_TO = "LESS_THAN_OR_EQUAL_TO",
}

export type TimeFieldCondition = {
  fieldId: FieldSelector;
  operator: TimeOperator;
  value: boolean;
};

export enum TimeOperator {
  BEFORE = "BEFORE",
  AFTER = "AFTER",
  BEFORE_OR_ON = "BEFORE_OR_ON",
  AFTER_OR_ON = "AFTER_OR_ON",
  OF_THIS_WEEK = "OF_THIS_WEEK",
  OF_THIS_MONTH = "OF_THIS_MONTH",
  OF_THIS_YEAR = "OF_THIS_YEAR",
}

export interface View {
  id: string;
  name: string;
  modelId: string;
  projectId: string;
  order: number;
  sort?: ItemSort;
  filter?: ConditionInput;
  columns?: Column[];
}

export type CurrentView = Partial<View>;

export interface Column {
  field: FieldSelector;
  visible: boolean;
  fixed?: "left" | "right";
}

export interface ColumnSelectionInput {
  field: FieldSelector;
  visible: boolean;
}

export interface ItemSort {
  field: FieldSelector;
  direction: SortDirection;
}

export interface FieldSelector {
  type: FieldType;
  id?: string;
}

export type FieldType =
  | "ID"
  | "CREATION_DATE"
  | "CREATION_USER"
  | "MODIFICATION_DATE"
  | "MODIFICATION_USER"
  | "STATUS"
  | "FIELD"
  | "META_FIELD";

export type SortDirection = "ASC" | "DESC";

export interface ConditionInput {
  and?: AndConditionInput;
  or?: OrConditionInput;
  basic?: BasicFieldConditionInput;
  nullable?: NumberFieldConditionInput;
  multiple?: MultipleFieldConditionInput;
  bool?: BoolFieldConditionInput;
  string?: StringFieldConditionInput;
  number?: NumberFieldConditionInput;
  time?: TimeFieldConditionInput;
}

export interface AndConditionInput {
  conditions: ConditionInput[];
}

export interface OrConditionInput {
  conditions: ConditionInput[];
}

export interface BasicFieldConditionInput {
  fieldId: FieldSelector;
  operator: BasicOperator;
  value: any;
}

export interface NullableFieldConditionInput {
  fieldId: FieldSelector;
  operator: NullableOperator;
}

export interface MultipleFieldConditionInput {
  fieldId: FieldSelector;
  operator: MultipleOperator;
  value: any[];
}

export interface BoolFieldConditionInput {
  fieldId: FieldSelector;
  operator: BoolOperator;
  value: boolean;
}

export interface StringFieldConditionInput {
  fieldId: FieldSelector;
  operator: StringOperator;
  value: boolean;
}

export interface NumberFieldConditionInput {
  fieldId: FieldSelector;
  operator: StringOperator;
  value: boolean;
}

export interface TimeFieldConditionInput {
  fieldId: FieldSelector;
  operator: TimeOperator;
  value: boolean;
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

export interface AndCondition {
  conditions: Condition[];
}

export interface OrCondition {
  conditions: Condition[];
}

export interface BasicFieldCondition {
  fieldId: FieldSelector;
  operator: BasicOperator;
  value: any;
}

export interface NullableFieldCondition {
  fieldId: FieldSelector;
  operator: NullableOperator;
}

export interface MultipleFieldCondition {
  fieldId: FieldSelector;
  operator: MultipleOperator;
  value: any[];
}

export interface BoolFieldCondition {
  fieldId: FieldSelector;
  operator: BoolOperator;
  value: boolean;
}

export interface StringFieldCondition {
  fieldId: FieldSelector;
  operator: StringOperator;
  value: boolean;
}

export interface NumberFieldCondition {
  fieldId: FieldSelector;
  operator: NumberOperator;
  value: boolean;
}

export interface TimeFieldCondition {
  fieldId: FieldSelector;
  operator: TimeOperator;
  value: boolean;
}

export enum BasicOperator {
  Equals = "EQUALS",
  NotEquals = "NOT_EQUALS",
}

export enum BoolOperator {
  Equals = "EQUALS",
  NotEquals = "NOT_EQUALS",
}

export enum NullableOperator {
  Empty = "EMPTY",
  NotEmpty = "NOT_EMPTY",
}

export enum MultipleOperator {
  IncludesAll = "INCLUDES_ALL",
  IncludesAny = "INCLUDES_ANY",
  NotIncludesAll = "NOT_INCLUDES_ALL",
  NotIncludesAny = "NOT_INCLUDES_ANY",
}

export enum StringOperator {
  Contains = "CONTAINS",
  EndsWith = "ENDS_WITH",
  NotContains = "NOT_CONTAINS",
  NotEndsWith = "NOT_ENDS_WITH",
  NotStartsWith = "NOT_STARTS_WITH",
  StartsWith = "STARTS_WITH",
}

export enum NumberOperator {
  GreaterThan = "GREATER_THAN",
  GreaterThanOrEqualTo = "GREATER_THAN_OR_EQUAL_TO",
  LessThan = "LESS_THAN",
  LessThanOrEqualTo = "LESS_THAN_OR_EQUAL_TO",
}

export enum TimeOperator {
  After = "AFTER",
  AfterOrOn = "AFTER_OR_ON",
  Before = "BEFORE",
  BeforeOrOn = "BEFORE_OR_ON",
  OfThisMonth = "OF_THIS_MONTH",
  OfThisWeek = "OF_THIS_WEEK",
  OfThisYear = "OF_THIS_YEAR",
}

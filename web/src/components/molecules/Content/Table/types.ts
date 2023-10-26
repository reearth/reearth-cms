import {
  BasicOperator,
  BoolOperator,
  NullableOperator,
  NumberOperator,
  TimeOperator,
  StringOperator,
  MultipleOperator,
} from "@reearth-cms/gql/graphql-client-api";

export type ColorType = "#BFBFBF" | "#52C41A" | "#FA8C16";
export type StateType = "DRAFT" | "PUBLIC" | "REVIEW";
export type DefaultFilterValueType = {
  operatorType: string;
  operator: Operator;
  value: string;
};
export type DropdownFilterType = {
  dataIndex: string | string[];
  title: string;
  type: string;
  typeProperty: { values?: string[] };
  members: { user: { name: string } }[];
  id: string;
};

export type Operator =
  | BasicOperator
  | BoolOperator
  | NullableOperator
  | NumberOperator
  | TimeOperator
  | StringOperator
  | MultipleOperator;

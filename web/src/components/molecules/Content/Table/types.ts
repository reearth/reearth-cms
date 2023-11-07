import {
  BasicOperator,
  BoolOperator,
  NullableOperator,
  NumberOperator,
  TimeOperator,
  StringOperator,
  MultipleOperator,
} from "@reearth-cms/gql/graphql-client-api";

import { FieldType } from "../../Schema/types";

export type ColorType = "#BFBFBF" | "#52C41A" | "#FA8C16";
export type StateType = "DRAFT" | "PUBLIC" | "REVIEW";
export type DefaultFilterValueType = {
  operatorType: string;
  operator: Operator;
  value: string;
};

export type FilterType = FieldType | "Person";

export type DropdownFilterType = {
  dataIndex: string | string[];
  title: string;
  type: FilterType;
  typeProperty: { values?: string[]; tags?: { id: string; name: string }[] };
  members: { user: { name: string } }[];
  id: string;
  multiple: boolean;
  required: boolean;
};

export type Operator =
  | BasicOperator
  | BoolOperator
  | NullableOperator
  | NumberOperator
  | TimeOperator
  | StringOperator
  | MultipleOperator;

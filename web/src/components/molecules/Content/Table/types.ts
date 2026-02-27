import { StretchColumn } from "@reearth-cms/components/atoms/ProTable";
import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";
import { SchemaFieldType, TypeProperty } from "@reearth-cms/components/molecules/Schema/types";
import {
  BasicOperator,
  BoolOperator,
  FieldType as ColumnType,
  MultipleOperator,
  NullableOperator,
  NumberOperator,
  StringOperator,
  TimeOperator,
} from "@reearth-cms/components/molecules/View/types";
import { Member } from "@reearth-cms/components/molecules/Workspace/types";
import { t } from "@reearth-cms/i18n";

export type ColorType = "#52C41A" | "#BFBFBF" | "#FA8C16";
export type StateType = "DRAFT" | "PUBLIC" | "REVIEW";
t("DRAFT");
t("PUBLIC");
t("REVIEW");

export type DefaultFilterValueType = {
  operator: Operator;
  operatorType: string;
  value?: string;
};

export type FilterType = "Person" | SchemaFieldType;

export type DropdownFilterType = {
  dataIndex: string | string[];
  id: string;
  members: Member[];
  multiple: boolean;
  required: boolean;
  title: string;
  type: FilterType;
  typeProperty: { tags?: { color: string; id: string; name: string }[]; values?: string[]; };
};

export type Operator =
  | BasicOperator
  | BoolOperator
  | MultipleOperator
  | NullableOperator
  | NumberOperator
  | StringOperator
  | TimeOperator;

export type ExtendedColumns = {
  fieldType: "commentsCount" | "EDIT_ICON" | ColumnType;
  multiple?: boolean;
  required?: boolean;
  sortOrder?: "ascend" | "descend" | null;
  type?: "Person" | SchemaFieldType;
  typeProperty?: TypeProperty;
} & StretchColumn<ContentTableField>;

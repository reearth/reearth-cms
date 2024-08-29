import { StretchColumn } from "@reearth-cms/components/atoms/ProTable";
import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";
import { FieldType, TypeProperty } from "@reearth-cms/components/molecules/Schema/types";
import {
  BasicOperator,
  BoolOperator,
  NullableOperator,
  NumberOperator,
  TimeOperator,
  StringOperator,
  MultipleOperator,
  FieldType as ColumnType,
} from "@reearth-cms/components/molecules/View/types";
import { Member } from "@reearth-cms/components/molecules/Workspace/types";
import { t } from "@reearth-cms/i18n";

export type ColorType = "#BFBFBF" | "#52C41A" | "#FA8C16";
export type StateType = "DRAFT" | "PUBLIC" | "REVIEW";
t("DRAFT");
t("PUBLIC");
t("REVIEW");

export type DefaultFilterValueType = {
  operatorType: string;
  operator: Operator;
  value?: string;
};

export type FilterType = FieldType | "Person";

export type DropdownFilterType = {
  dataIndex: string | string[];
  title: string;
  type: FilterType;
  typeProperty: { values?: string[]; tags?: { color: string; id: string; name: string }[] };
  members: Member[];
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

export type ExtendedColumns = StretchColumn<ContentTableField> & {
  type?: FieldType | "Person";
  fieldType: ColumnType | "EDIT_ICON" | "commentsCount";
  sortOrder?: "descend" | "ascend" | null;
  typeProperty?: TypeProperty;
  required?: boolean;
  multiple?: boolean;
};

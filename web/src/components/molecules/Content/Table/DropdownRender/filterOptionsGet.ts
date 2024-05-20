import { useMemo } from "react";

import { Operator, FilterType } from "@reearth-cms/components/molecules/Content/Table/types";
import {
  ConditionInput,
  BasicOperator,
  BoolOperator,
  NullableOperator,
  NumberOperator,
  TimeOperator,
  // MultipleOperator,
  StringOperator,
  SortDirection,
} from "@reearth-cms/components/molecules/View/types";
import { useT } from "@reearth-cms/i18n";

type filterOptionsType = {
  operatorType: keyof ConditionInput | "sort";
  value: Operator | SortDirection;
  label: string;
}[];

export default (isFilter: boolean, column?: { type?: FilterType; required?: boolean }) => {
  const t = useT();
  const options = useMemo(() => {
    const result: filterOptionsType = [];

    if (isFilter) {
      switch (column?.type) {
        case "Bool":
        case "Checkbox":
          result.push(
            { operatorType: "bool", value: BoolOperator.Equals, label: t("is") },
            { operatorType: "bool", value: BoolOperator.NotEquals, label: t("is not") },
          );
          break;
        case "Person":
          result.push(
            { operatorType: "basic", value: BasicOperator.Equals, label: t("is") },
            { operatorType: "basic", value: BasicOperator.NotEquals, label: t("is not") },
          );
          break;
        case "Text":
        case "TextArea":
        case "MarkdownText":
        case "Asset":
        case "URL":
          // case "RichText":
          result.push(
            { operatorType: "basic", value: BasicOperator.Equals, label: t("is") },
            { operatorType: "basic", value: BasicOperator.NotEquals, label: t("is not") },
            { operatorType: "string", value: StringOperator.Contains, label: t("contains") },
            {
              operatorType: "string",
              value: StringOperator.NotContains,
              label: t("doesn't contain"),
            },
            { operatorType: "string", value: StringOperator.StartsWith, label: t("start with") },
            {
              operatorType: "string",
              value: StringOperator.NotStartsWith,
              label: t("doesn't start with"),
            },
            {
              operatorType: "string",
              value: StringOperator.EndsWith,
              label: t("end with"),
            },
            {
              operatorType: "string",
              value: StringOperator.NotEndsWith,
              label: t("doesn't end with"),
            },
          );
          break;
        case "Select":
        case "Tag":
          result.push(
            { operatorType: "basic", value: BasicOperator.Equals, label: t("is") },
            { operatorType: "basic", value: BasicOperator.NotEquals, label: t("is not") },
            // { operatorType: "string", value: StringOperator.Contains, label: t("contains") },
            // {
            //   operatorType: "string",
            //   value: StringOperator.NotContains,
            //   label: t("doesn't contain"),
            // },
          );
          break;
        case "Integer":
          // case "Float":
          result.push(
            { operatorType: "basic", value: BasicOperator.Equals, label: t("is") },
            { operatorType: "basic", value: BasicOperator.NotEquals, label: t("is not") },
            { operatorType: "number", value: NumberOperator.GreaterThan, label: t("greater than") },
            {
              operatorType: "number",
              value: NumberOperator.GreaterThanOrEqualTo,
              label: t("greater than or equal to"),
            },
            { operatorType: "number", value: NumberOperator.LessThan, label: t("less than") },
            {
              operatorType: "number",
              value: NumberOperator.LessThanOrEqualTo,
              label: t("less than or equal to"),
            },
          );
          break;
        case "Date":
          result.push(
            { operatorType: "basic", value: BasicOperator.Equals, label: t("is") },
            { operatorType: "basic", value: BasicOperator.NotEquals, label: t("is not") },
            { operatorType: "time", value: TimeOperator.After, label: t("after") },
            { operatorType: "time", value: TimeOperator.AfterOrOn, label: t("after or on") },
            { operatorType: "time", value: TimeOperator.Before, label: t("before") },
            { operatorType: "time", value: TimeOperator.BeforeOrOn, label: t("before or on") },
            { operatorType: "time", value: TimeOperator.OfThisWeek, label: t("of this week") },
            { operatorType: "time", value: TimeOperator.OfThisMonth, label: t("of this month") },
            { operatorType: "time", value: TimeOperator.OfThisYear, label: t("of this year") },
          );
          break;
      }
      // add nullable operator to all non required columns
      if (!column?.required) {
        result.push(
          { operatorType: "nullable", value: NullableOperator.Empty, label: t("is empty") },
          {
            operatorType: "nullable",
            value: NullableOperator.NotEmpty,
            label: t("is not empty"),
          },
        );
      }
      // add multiple operator to all multiple columns
      // TODO: Uncomment this when we have a way to filter by multiple
      // if (filter.multiple || filter.type === "Select" || filter.type === "Tag") {
      //   result.push(
      //     {
      //       operatorType: "multiple",
      //       value: MultipleOperator.IncludesAll,
      //       label: t("Includes all"),
      //     },
      //     {
      //       operatorType: "multiple",
      //       value: MultipleOperator.IncludesAny,
      //       label: t("Includes any"),
      //     },
      //     {
      //       operatorType: "multiple",
      //       value: MultipleOperator.NotIncludesAll,
      //       label: t("Not include all"),
      //     },
      //     {
      //       operatorType: "multiple",
      //       value: MultipleOperator.NotIncludesAny,
      //       label: t("Not Include any"),
      //     },
      //   );
      // }
    } else {
      result.push(
        { operatorType: "sort", value: "ASC", label: t("Ascending") },
        { operatorType: "sort", value: "DESC", label: t("Descending") },
      );
    }

    return result;
  }, [/*filter.multiple,*/ column?.required, column?.type, isFilter, t]);

  return options;
};

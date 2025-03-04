import dayjs, { Dayjs } from "dayjs";
import { useRef, useEffect, useCallback, useMemo, useState, Dispatch, SetStateAction } from "react";

import { DatePickerProps } from "@reearth-cms/components/atoms/DatePicker";
import Form from "@reearth-cms/components/atoms/Form";
import {
  DefaultFilterValueType,
  Operator,
  DropdownFilterType,
} from "@reearth-cms/components/molecules/Content/Table/types";
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
  FieldType,
  CurrentView,
  FieldSelector,
} from "@reearth-cms/components/molecules/View/types";
import { useT } from "@reearth-cms/i18n";

export default (
  filter: DropdownFilterType,
  close: () => void,
  open: boolean,
  isFilter: boolean,
  index: number,
  currentView: CurrentView,
  setCurrentView: Dispatch<SetStateAction<CurrentView>>,
  onFilterChange: (filter?: ConditionInput[]) => void,
  defaultValue?: DefaultFilterValueType,
) => {
  const t = useT();
  const [form] = Form.useForm();

  const defaultValueGet = useCallback(() => {
    switch (filter.type) {
      case "Select":
      case "Tag":
      case "Person":
      case "Bool":
      case "Checkbox":
        return defaultValue?.value?.toString();
      case "Date":
        return defaultValue && defaultValue.value !== "" ? dayjs(defaultValue.value) : undefined;
      default:
        return defaultValue?.value;
    }
  }, [defaultValue, filter.type]);

  useEffect(() => {
    if (open) {
      if (defaultValue) {
        form.setFieldsValue({ condition: defaultValue.operator, value: defaultValueGet() });
      } else {
        form.resetFields();
        setIsShowInputField(true);
        if (!isFilter && filterOption.current) {
          filterOption.current.value = "ASC";
        }
      }
    }
  }, [open, form, defaultValue, isFilter, defaultValueGet]);

  const options = useMemo(() => {
    const result: {
      operatorType: keyof ConditionInput | "sort";
      value: Operator | SortDirection;
      label: string;
    }[] = [];

    if (isFilter) {
      switch (filter.type) {
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
        case "Number":
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
      if (!filter.required) {
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
  }, [/*filter.multiple,*/ filter.required, filter.type, isFilter, t]);

  const valueOptions = useMemo<
    {
      value: string;
      label: string;
      color?: string;
    }[]
  >(() => {
    const options = [];

    if (filter.type === "Select") {
      if (filter.typeProperty?.values) {
        for (const value of Object.values(filter.typeProperty.values)) {
          options.push({ value, label: value });
        }
      }
    } else if (filter.type === "Tag") {
      if (filter?.typeProperty?.tags) {
        for (const tag of Object.values(filter.typeProperty.tags)) {
          options.push({ value: tag.id, label: tag.name, color: tag.color });
        }
      }
    } else if (filter.type === "Person") {
      if (filter?.members?.length) {
        for (const member of Object.values(filter.members)) {
          if ("user" in member) {
            options.push({ value: member.user?.name, label: member.user?.name });
          }
        }
      }
    } else if (filter.type === "Bool" || filter.type === "Checkbox") {
      options.push({ value: "true", label: "True" }, { value: "false", label: "False" });
    }

    return options;
  }, [filter]);

  const filterOption = useRef<{ value: Operator | SortDirection; operatorType: string }>();
  const filterValue = useRef<string>();

  useEffect(() => {
    let isShow = true;
    if (defaultValue) {
      const { operator, operatorType, value } = defaultValue;
      filterOption.current = {
        value: operator,
        operatorType,
      };
      filterValue.current = value;
      if (
        operatorType === "nullable" ||
        operator === TimeOperator.OfThisWeek ||
        operator === TimeOperator.OfThisMonth ||
        operator === TimeOperator.OfThisYear
      ) {
        isShow = false;
      }
    } else {
      const { value, operatorType } = options[0];
      filterOption.current = {
        value,
        operatorType,
      };
      if (operatorType === "nullable") {
        isShow = false;
      }
    }
    setIsShowInputField(isShow);
  }, [defaultValue, options]);

  const confirm = useCallback(() => {
    if (filterOption.current === undefined) return;
    close();
    if (isFilter) {
      const operatorType = filterOption.current.operatorType;
      const type =
        typeof filter.dataIndex === "string"
          ? "ID"
          : filter.dataIndex[0] === "fields"
            ? "FIELD"
            : "META_FIELD";
      const operatorValue = filterOption.current.value as Operator;
      const currentFilters =
        currentView.filter && currentView.filter.and ? [...currentView.filter.and.conditions] : [];
      const newFilter: Record<
        string,
        {
          fieldId: FieldSelector;
          operator: Operator;
          value?: string | boolean | number | Date;
        }
      > = { [operatorType]: { fieldId: { type, id: filter.id }, operator: operatorValue } };

      let value: string | boolean | number | Date = filterValue.current ?? "";
      if (filter.type === "Bool" || filter.type === "Checkbox") {
        if (typeof value !== "boolean") {
          value = value === "true";
        }
      } else if (filter.type === "Integer" || filter.type === "Number") {
        value = Number(value);
      } else if (filter.type === "Date") {
        value = value ? new Date(value) : new Date();
      }

      if (operatorType !== "nullable") {
        newFilter[operatorType].value = value;
        if (
          operatorValue === TimeOperator.OfThisWeek ||
          operatorValue === TimeOperator.OfThisMonth ||
          operatorValue === TimeOperator.OfThisYear
        ) {
          form.resetFields(["value"]);
        }
      } else {
        form.resetFields(["value"]);
      }

      currentFilters[index] = newFilter;

      onFilterChange(currentFilters.filter(Boolean));
    } else {
      const direction: SortDirection = filterOption.current.value === "ASC" ? "ASC" : "DESC";
      let fieldId = "";
      const fieldType: FieldType = (() => {
        if (
          filter.id === "CREATION_DATE" ||
          filter.id === "CREATION_USER" ||
          filter.id === "MODIFICATION_DATE" ||
          filter.id === "MODIFICATION_USER" ||
          filter.id === "STATUS"
        ) {
          return filter.id;
        } else {
          fieldId = filter.id;
          if (filter.dataIndex[0] === "fields") {
            return "FIELD";
          } else {
            return "META_FIELD";
          }
        }
      })();
      const sort = {
        field: {
          id: fieldId ?? undefined,
          type: fieldType,
        },
        direction: direction,
      };
      setCurrentView(prev => ({
        ...prev,
        sort: sort,
      }));
    }
  }, [
    close,
    isFilter,
    filter.dataIndex,
    filter.id,
    filter.type,
    currentView?.filter,
    index,
    setCurrentView,
    form,
    onFilterChange,
  ]);

  const [isShowInputField, setIsShowInputField] = useState(true);

  const onFilterSelect = useCallback(
    (value: Operator | SortDirection, option: { operatorType: string }) => {
      if (
        option.operatorType === "nullable" ||
        value === TimeOperator.OfThisWeek ||
        value === TimeOperator.OfThisMonth ||
        value === TimeOperator.OfThisYear
      ) {
        setIsShowInputField(false);
      } else {
        setIsShowInputField(true);
      }
      filterOption.current = { value, operatorType: option.operatorType };
    },
    [],
  );

  const onValueSelect = useCallback((value: string) => {
    filterValue.current = value;
  }, []);

  const onNumberChange = useCallback((value: string | null) => {
    if (value) {
      filterValue.current = value;
    }
  }, []);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    filterValue.current = e.target.value;
  }, []);

  const onDateChange: DatePickerProps["onChange"] = useCallback(
    (_date: Dayjs | null, dateString: string | string[]) => {
      if (typeof dateString === "string") filterValue.current = dateString;
    },
    [],
  );

  return {
    valueOptions,
    options,
    form,
    confirm,
    isShowInputField,
    onFilterSelect,
    onValueSelect,
    onNumberChange,
    onInputChange,
    onDateChange,
  };
};

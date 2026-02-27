import dayjs, { Dayjs } from "dayjs";
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DatePickerProps } from "@reearth-cms/components/atoms/DatePicker";
import Form from "@reearth-cms/components/atoms/Form";
import {
  DefaultFilterValueType,
  DropdownFilterType,
  Operator,
} from "@reearth-cms/components/molecules/Content/Table/types";
import {
  BasicOperator,
  BoolOperator,
  ConditionInput,
  CurrentView,
  FieldSelector,
  FieldType,
  NullableOperator,
  NumberOperator,
  SortDirection,
  // MultipleOperator,
  StringOperator,
  TimeOperator,
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
      label: string;
      operatorType: "sort" | keyof ConditionInput;
      value: Operator | SortDirection;
    }[] = [];

    if (isFilter) {
      switch (filter.type) {
        case "Bool":
        case "Checkbox":
          result.push(
            { label: t("is"), operatorType: "bool", value: BoolOperator.Equals },
            { label: t("is not"), operatorType: "bool", value: BoolOperator.NotEquals },
          );
          break;
        case "Person":
          result.push(
            { label: t("is"), operatorType: "basic", value: BasicOperator.Equals },
            { label: t("is not"), operatorType: "basic", value: BasicOperator.NotEquals },
          );
          break;
        case "Text":
        case "TextArea":
        case "MarkdownText":
        case "Asset":
        case "URL":
          // case "RichText":
          result.push(
            { label: t("is"), operatorType: "basic", value: BasicOperator.Equals },
            { label: t("is not"), operatorType: "basic", value: BasicOperator.NotEquals },
            { label: t("contains"), operatorType: "string", value: StringOperator.Contains },
            {
              label: t("doesn't contain"),
              operatorType: "string",
              value: StringOperator.NotContains,
            },
            { label: t("start with"), operatorType: "string", value: StringOperator.StartsWith },
            {
              label: t("doesn't start with"),
              operatorType: "string",
              value: StringOperator.NotStartsWith,
            },
            {
              label: t("end with"),
              operatorType: "string",
              value: StringOperator.EndsWith,
            },
            {
              label: t("doesn't end with"),
              operatorType: "string",
              value: StringOperator.NotEndsWith,
            },
          );
          break;
        case "Select":
        case "Tag":
          result.push(
            { label: t("is"), operatorType: "basic", value: BasicOperator.Equals },
            { label: t("is not"), operatorType: "basic", value: BasicOperator.NotEquals },
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
            { label: t("is"), operatorType: "basic", value: BasicOperator.Equals },
            { label: t("is not"), operatorType: "basic", value: BasicOperator.NotEquals },
            { label: t("greater than"), operatorType: "number", value: NumberOperator.GreaterThan },
            {
              label: t("greater than or equal to"),
              operatorType: "number",
              value: NumberOperator.GreaterThanOrEqualTo,
            },
            { label: t("less than"), operatorType: "number", value: NumberOperator.LessThan },
            {
              label: t("less than or equal to"),
              operatorType: "number",
              value: NumberOperator.LessThanOrEqualTo,
            },
          );
          break;
        case "Date":
          result.push(
            { label: t("is"), operatorType: "basic", value: BasicOperator.Equals },
            { label: t("is not"), operatorType: "basic", value: BasicOperator.NotEquals },
            { label: t("after"), operatorType: "time", value: TimeOperator.After },
            { label: t("after or on"), operatorType: "time", value: TimeOperator.AfterOrOn },
            { label: t("before"), operatorType: "time", value: TimeOperator.Before },
            { label: t("before or on"), operatorType: "time", value: TimeOperator.BeforeOrOn },
            { label: t("of this week"), operatorType: "time", value: TimeOperator.OfThisWeek },
            { label: t("of this month"), operatorType: "time", value: TimeOperator.OfThisMonth },
            { label: t("of this year"), operatorType: "time", value: TimeOperator.OfThisYear },
          );
          break;
      }
      // add nullable operator to all non required columns
      if (!filter.required) {
        result.push(
          { label: t("is empty"), operatorType: "nullable", value: NullableOperator.Empty },
          {
            label: t("is not empty"),
            operatorType: "nullable",
            value: NullableOperator.NotEmpty,
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
        { label: t("Ascending"), operatorType: "sort", value: "ASC" },
        { label: t("Descending"), operatorType: "sort", value: "DESC" },
      );
    }

    return result;
  }, [/*filter.multiple,*/ filter.required, filter.type, isFilter, t]);

  const valueOptions = useMemo<
    {
      color?: string;
      label: string;
      value: string;
    }[]
  >(() => {
    const options = [];

    if (filter.type === "Select") {
      if (filter.typeProperty?.values) {
        for (const value of Object.values(filter.typeProperty.values)) {
          options.push({ label: value, value });
        }
      }
    } else if (filter.type === "Tag") {
      if (filter?.typeProperty?.tags) {
        for (const tag of Object.values(filter.typeProperty.tags)) {
          options.push({ color: tag.color, label: tag.name, value: tag.id });
        }
      }
    } else if (filter.type === "Person") {
      if (filter?.members?.length) {
        for (const member of Object.values(filter.members)) {
          if ("user" in member) {
            options.push({ label: member.user?.name, value: member.user?.name });
          }
        }
      }
    } else if (filter.type === "Bool" || filter.type === "Checkbox") {
      options.push({ label: "True", value: "true" }, { label: "False", value: "false" });
    }

    return options;
  }, [filter]);

  const filterOption = useRef<{ operatorType: string; value: Operator | SortDirection; }>();
  const filterValue = useRef<string>();

  useEffect(() => {
    let isShow = true;
    if (defaultValue) {
      const { operator, operatorType, value } = defaultValue;
      filterOption.current = {
        operatorType,
        value: operator,
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
      const { operatorType, value } = options[0];
      filterOption.current = {
        operatorType,
        value,
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
          value?: boolean | Date | number | string;
        }
      > = { [operatorType]: { fieldId: { id: filter.id, type }, operator: operatorValue } };

      let value: boolean | Date | number | string = filterValue.current ?? "";
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
        direction: direction,
        field: {
          id: fieldId ?? undefined,
          type: fieldType,
        },
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
      filterOption.current = { operatorType: option.operatorType, value };
    },
    [],
  );

  const onValueSelect = useCallback((value: string) => {
    filterValue.current = value;
  }, []);

  const onNumberChange = useCallback((value: null | string) => {
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
    confirm,
    form,
    isShowInputField,
    onDateChange,
    onFilterSelect,
    onInputChange,
    onNumberChange,
    onValueSelect,
    options,
    valueOptions,
  };
};

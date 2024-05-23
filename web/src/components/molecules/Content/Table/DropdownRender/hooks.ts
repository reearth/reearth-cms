import { Dayjs } from "dayjs";
import { useRef, useEffect, useCallback, useState, Dispatch, SetStateAction } from "react";

import { DatePickerProps } from "@reearth-cms/components/atoms/DatePicker";
import Form from "@reearth-cms/components/atoms/Form";
import {
  DefaultFilterValueType,
  Operator,
  DropdownFilterType,
} from "@reearth-cms/components/molecules/Content/Table/types";
import {
  ConditionInput,
  TimeOperator,
  SortDirection,
  FieldType,
  CurrentView,
  FieldSelector,
} from "@reearth-cms/components/molecules/View/types";

import filterOptionsGet from "./filterOptionsGet";
import valueOptionsGet from "./valueOptionsGet";

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
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && !defaultValue) {
      form.resetFields();
      setIsShowInputField(true);
      if (!isFilter && filterOption.current) {
        filterOption.current.value = "ASC";
      }
    }
  }, [open, form, defaultValue, isFilter]);

  const options = filterOptionsGet(isFilter, filter);

  const valueOptions = valueOptionsGet(filter?.members, filter);

  const filterOption = useRef<{ value: Operator | SortDirection; operatorType: string }>();
  const filterValue = useRef<string>();

  useEffect(() => {
    if (defaultValue) {
      filterOption.current = {
        value: defaultValue.operator,
        operatorType: defaultValue.operatorType,
      };
      filterValue.current = defaultValue.value;
    } else {
      filterOption.current = {
        value: options[0].value,
        operatorType: options[0].operatorType,
      };
    }

    if (defaultValue?.operatorType === "nullable") {
      setIsShowInputField(false);
    } else if (
      defaultValue?.operator === TimeOperator.OfThisWeek ||
      defaultValue?.operator === TimeOperator.OfThisMonth ||
      defaultValue?.operator === TimeOperator.OfThisYear
    ) {
      setIsShowInputField(false);
      defaultValue.value = "";
    } else {
      setIsShowInputField(true);
    }
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
      const newFilter: {
        [key: string]: {
          fieldId: FieldSelector;
          operator: Operator;
          value?: string | boolean | number | Date;
        };
      } = { [operatorType]: { fieldId: { type, id: filter.id }, operator: operatorValue } };

      let value: string | boolean | number | Date = filterValue.current ?? "";
      if (filter.type === "Bool" || filter.type === "Checkbox") {
        if (typeof value !== "boolean") {
          value = value === "true";
        }
      } else if (filter.type === "Integer" /*|| filter.type === "Float"*/) {
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

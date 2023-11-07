import styled from "@emotion/styled";
import moment, { Moment } from "moment";
import { useRef, useEffect, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import DatePicker, { DatePickerProps } from "@reearth-cms/components/atoms/DatePicker";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import Select from "@reearth-cms/components/atoms/Select";
import Space from "@reearth-cms/components/atoms/Space";
import {
  DefaultFilterValueType,
  Operator,
  DropdownFilterType,
} from "@reearth-cms/components/molecules/Content/Table/types";
import { CurrentViewType } from "@reearth-cms/components/organisms/Project/Content/ContentList/hooks";
import {
  BasicOperator,
  BoolOperator,
  NullableOperator,
  NumberOperator,
  TimeOperator,
  MultipleOperator,
  StringOperator,
  SortDirection,
  ConditionInput,
  ItemSortInput,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

type Props = {
  filter: DropdownFilterType;
  close: () => void;
  defaultValue?: DefaultFilterValueType;
  open: boolean;
  isFilter: boolean;
  index: number;
  currentView: CurrentViewType;
  onTableControl: (sort?: ItemSortInput, filter?: ConditionInput[]) => void;
};

const DropdownRender: React.FC<Props> = ({
  filter,
  close,
  defaultValue,
  open,
  isFilter,
  index,
  currentView,
  onTableControl,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const t = useT();
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && !defaultValue) {
      form.resetFields();
      setIsShowInputField(true);
    }
  }, [open, form, defaultValue]);

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
        case "RichText":
        case "MarkdownText":
        case "Asset":
        case "URL":
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
            { operatorType: "string", value: StringOperator.Contains, label: t("contains") },
            {
              operatorType: "string",
              value: StringOperator.NotContains,
              label: t("doesn't contain"),
            },
          );
          break;
        case "Integer":
        case "Float":
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
      if (filter.multiple || filter.type === "Select" || filter.type === "Tag") {
        result.push(
          {
            operatorType: "multiple",
            value: MultipleOperator.IncludesAll,
            label: t("Includes all"),
          },
          {
            operatorType: "multiple",
            value: MultipleOperator.IncludesAny,
            label: t("Includes any"),
          },
          {
            operatorType: "multiple",
            value: MultipleOperator.NotIncludesAll,
            label: t("Not include all"),
          },
          {
            operatorType: "multiple",
            value: MultipleOperator.NotIncludesAny,
            label: t("Not Include any"),
          },
        );
      }
    } else {
      result.push(
        { operatorType: "sort", value: SortDirection.Asc, label: t("Ascending") },
        { operatorType: "sort", value: SortDirection.Desc, label: t("Descending") },
      );
    }

    return result;
  }, [filter.multiple, filter.required, filter.type, isFilter, t]);

  const valueOptions = useMemo<
    {
      value: string;
      label: string;
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
          options.push({ value: tag.id, label: tag.name });
        }
      }
    } else if (filter.type === "Person") {
      if (filter?.members?.length) {
        for (const member of Object.values(filter.members)) {
          options.push({ value: member.user?.name, label: member.user?.name });
        }
      }
    } else if (filter.type === "Bool" || filter.type === "Checkbox") {
      options.push({ value: "true", label: "True" }, { value: "false", label: "False" });
    }

    return options;
  }, [filter]);

  const filterOption = useRef<{ value: Operator | SortDirection; operatorType: string }>();

  if (defaultValue) {
    filterOption.current = {
      value: defaultValue.operator,
      operatorType: defaultValue.operatorType,
    };
  }
  const filterValue = useRef<string>();

  const confirm = useCallback(() => {
    if (filterOption.current === undefined) return;
    close();
    if (isFilter) {
      const operatorType = filterOption.current.operatorType;
      let value: string | boolean | number | Date = filterValue.current ?? "";
      const type =
        typeof filter.dataIndex === "string"
          ? filter.id
          : filter.dataIndex[0] === "fields"
          ? "FIELD"
          : "META_FIELD";
      const operatorValue = filterOption.current.value;
      const currentFilters = currentView.filter?.conditions
        ? [...currentView.filter.conditions]
        : [];
      const newFilter: {
        [x: keyof ConditionInput | string]: {
          fieldId: {
            type: string;
            id: string;
          };
          operator: Operator | SortDirection;
          value?: string | boolean | number | Date;
        };
      } = {
        [operatorType]: { fieldId: { type, id: filter.id }, operator: operatorValue },
      };

      if (filter.type === "Bool") {
        value = value === "true";
      } else if (filter.type === "Integer" || filter.type === "Float") {
        value = Number(value);
      } else if (filter.type === "Date") {
        value = value ? new Date(value) : new Date();
      }

      if (operatorType !== "nullable") {
        newFilter[operatorType].value = value;
      }

      currentFilters[index] = newFilter;

      onTableControl(undefined, currentFilters.filter(Boolean));
    } else {
      searchParams.set("direction", filterOption.current.value === "ASC" ? "ASC" : "DESC");
      switch (filter.id as string) {
        case "CREATION_DATE":
        case "CREATION_USER":
        case "MODIFICATION_DATE":
        case "MODIFICATION_USER":
        case "STATUS":
          searchParams.set("sortFieldType", filter.id);
          break;
        default:
          if (filter.dataIndex[0] === "fields") searchParams.set("sortFieldType", "FIELD");
          else searchParams.set("sortFieldType", "META_FIELD");
          searchParams.set("sortFieldId", filter.id);
      }
      setSearchParams(searchParams);
    }
  }, [
    close,
    isFilter,
    filter.dataIndex,
    filter.id,
    filter.type,
    currentView.filter,
    index,
    onTableControl,
    searchParams,
    setSearchParams,
  ]);

  const isDefaultShow = useMemo(() => {
    if (
      defaultValue?.operatorType === "nullable" ||
      defaultValue?.operator === TimeOperator.OfThisWeek ||
      defaultValue?.operator === TimeOperator.OfThisMonth ||
      defaultValue?.operator === TimeOperator.OfThisYear
    ) {
      return false;
    } else {
      return true;
    }
  }, [defaultValue]);

  const [isShowInputField, setIsShowInputField] = useState(isDefaultShow);

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

  const onNumberChange = (value: string | null) => {
    if (value) {
      filterValue.current = value;
    }
  };

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    filterValue.current = e.target.value;
  }, []);

  const onDateChange: DatePickerProps["onChange"] = useCallback(
    (_date: Moment | null, dateString: string) => {
      filterValue.current = dateString;
    },
    [],
  );

  return (
    <Container>
      <Form form={form} name="basic" autoComplete="off">
        <Form.Item label={filter.title} name="condition">
          <Select
            style={{ width: 160 }}
            options={options}
            onSelect={onFilterSelect}
            defaultValue={defaultValue?.operator}
          />
        </Form.Item>
        {isFilter && isShowInputField && (
          <Form.Item name="value">
            {filter.type === "Select" ||
            filter.type === "Tag" ||
            filter.type === "Person" ||
            filter.type === "Bool" ||
            filter.type === "Checkbox" ? (
              <Select
                placeholder="Select the value"
                options={valueOptions}
                onSelect={onValueSelect}
                defaultValue={defaultValue?.value.toString()}
              />
            ) : filter.type === "Integer" || filter.type === "Float" ? (
              <InputNumber
                onChange={onNumberChange}
                stringMode
                defaultValue={defaultValue?.value}
                style={{ width: "100%" }}
                placeholder="Enter the value"
              />
            ) : filter.type === "Date" ? (
              <DatePicker
                onChange={onDateChange}
                style={{ width: "100%" }}
                placeholder="Select the date"
                showToday={false}
                defaultValue={
                  defaultValue && defaultValue.value !== "" ? moment(defaultValue.value) : undefined
                }
              />
            ) : (
              <Input
                onChange={onInputChange}
                defaultValue={defaultValue?.value}
                placeholder="Enter the value"
              />
            )}
          </Form.Item>
        )}
        <Form.Item style={{ textAlign: "right" }}>
          <Space size="small">
            <Button type="default" style={{ marginRight: 10 }} onClick={close}>
              {t("Cancel")}
            </Button>
            <Button type="primary" htmlType="submit" onClick={confirm}>
              {t("Confirm")}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Container>
  );
};

const Container = styled.div`
  background-color: white;
  padding: 10px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
`;

export default DropdownRender;

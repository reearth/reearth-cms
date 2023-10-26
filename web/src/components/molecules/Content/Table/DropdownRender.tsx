import styled from "@emotion/styled";
import moment from "moment";
import { useRef, useEffect } from "react";
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
import {
  BasicOperator,
  BoolOperator,
  NullableOperator,
  NumberOperator,
  TimeOperator,
  StringOperator,
  SortDirection,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

type Props = {
  filter: DropdownFilterType;
  close: () => void;
  defaultValue?: DefaultFilterValueType;
  open: boolean;
  isFilter: boolean;
  index: number;
};

const DropdownRender: React.FC<Props> = ({
  filter,
  close,
  defaultValue,
  open,
  isFilter,
  index,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const t = useT();
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && !defaultValue) {
      form.resetFields();
    }
  }, [open, form, defaultValue]);

  const options: {
    operatorType: string;
    value: Operator | SortDirection;
    label: string;
  }[] = [];

  if (isFilter) {
    switch (filter.type) {
      case "Bool":
        options.push(
          { operatorType: "bool", value: BoolOperator.Equals, label: t("is") },
          { operatorType: "bool", value: BoolOperator.NotEquals, label: t("is not") },
        );
        break;
      case "Person":
        options.push(
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
      case "Select":
      case "Tag":
        options.push(
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
          { operatorType: "nullable", value: NullableOperator.Empty, label: t("is empty") },
          { operatorType: "nullable", value: NullableOperator.NotEmpty, label: t("is not empty") },
        );
        break;
      case "Integer":
      case "Flaot":
        options.push(
          { operatorType: "basic", value: BasicOperator.Equals, label: t("is") },
          { operatorType: "basic", value: BasicOperator.NotEquals, label: t("is not") },
          { operatorType: "basic", value: NumberOperator.GreaterThan, label: t("greater than") },
          {
            operatorType: "number",
            value: NumberOperator.GreaterThanOrEqualTo,
            label: t("greater than or equal to"),
          },
          { operatorType: "basic", value: NumberOperator.LessThan, label: t("less than") },
          {
            operatorType: "number",
            value: NumberOperator.LessThanOrEqualTo,
            label: t("less than or equal to"),
          },
          { operatorType: "nullable", value: NullableOperator.Empty, label: t("is empty") },
          { operatorType: "nullable", value: NullableOperator.NotEmpty, label: t("is not empty") },
        );
        break;
      case "Date":
        options.push(
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
  } else {
    options.push(
      { operatorType: "sort", value: SortDirection.Asc, label: t("Ascending") },
      { operatorType: "sort", value: SortDirection.Desc, label: t("Descending") },
    );
  }

  const valueOptions: {
    value: string;
    label: string;
  }[] = [];

  if (filter.type === "Select") {
    if (filter.typeProperty?.values) {
      for (const value of Object.values(filter.typeProperty.values)) {
        valueOptions.push({ value, label: t(value) });
      }
    }
  } else if (filter.type === "Person") {
    if (filter?.members?.length) {
      for (const member of Object.values(filter.members)) {
        valueOptions.push({ value: member.user.name, label: member.user.name });
      }
    }
  } else if (filter.type === "Bool") {
    valueOptions.push({ value: "true", label: "True" }, { value: "false", label: "False" });
  }

  const filterOption = useRef<{ value: Operator | SortDirection; operatorType: string }>();

  if (defaultValue) {
    filterOption.current = {
      value: defaultValue.operator,
      operatorType: defaultValue.operatorType,
    };
  }
  const filterValue = useRef<string>();

  const confirm = () => {
    if (filterOption.current === undefined) return;
    close();
    if (isFilter) {
      const operatorType = filterOption.current.operatorType;
      const value = filterValue.current ?? "";
      const type = typeof filter.dataIndex === "string" ? filter.id : "FIELD";
      const operatorValue = filterOption.current.value;
      let params = searchParams.get("filter") ?? "";
      const newCondition = `${operatorType}:${value};${type}:${filter.id};${operatorValue}`;
      const conditions = params.split(",");
      conditions[index] = newCondition;
      params = conditions.filter(Boolean).join(",");
      searchParams.set("filter", params);
      setSearchParams(searchParams);
    } else {
      searchParams.set("direction", filterOption.current.value === "ASC" ? "ASC" : "DESC");
      setSearchParams(searchParams);
    }
  };

  const onFilterSelect = (value: Operator | SortDirection, option: { operatorType: string }) => {
    filterOption.current = { value, operatorType: option.operatorType };
  };

  const onValueSelect = (value: string) => {
    filterValue.current = value;
  };

  const onNumberChange = (value: string | null) => {
    if (value) {
      filterValue.current = value;
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    filterValue.current = e.target.value;
  };

  const onDateChange: DatePickerProps["onChange"] = (date, dateString) => {
    filterValue.current = dateString;
  };

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
        {isFilter && (
          <Form.Item name="value">
            {filter.type === "Select" ||
            filter.type === "Tag" ||
            filter.type === "Person" ||
            filter.type === "Bool" ? (
              <Select
                placeholder="Select the value"
                options={valueOptions}
                onSelect={onValueSelect}
                defaultValue={defaultValue?.value}
              />
            ) : filter.type === "Integer" || filter.type === "Float" ? (
              <InputNumber
                onChange={onNumberChange}
                stringMode
                defaultValue={defaultValue?.value}
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
              <Input onChange={onInputChange} defaultValue={defaultValue?.value} />
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

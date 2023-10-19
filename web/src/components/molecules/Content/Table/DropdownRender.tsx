import styled from "@emotion/styled";
import moment from "moment";
import { useRef, useEffect } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import DatePicker, { DatePickerProps } from "@reearth-cms/components/atoms/DatePicker";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import Select from "@reearth-cms/components/atoms/Select";
import Space from "@reearth-cms/components/atoms/Space";
import { FilterType, FilterOptions } from "@reearth-cms/components/molecules/Content/Table/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  filter: {
    dataIndex: string | string[];
    title: string;
    type: string;
    typeProperty?: { values?: string[] };
    members?: { user: { name: string } }[];
  };
  itemFilter?: (filter: FilterType, index: number) => void;
  index: number;
  close: () => void;
  defaultValue?: FilterType;
  open: boolean;
  isFilter: boolean;
};

const DropdownRender: React.FC<Props> = ({
  filter,
  itemFilter,
  index,
  close,
  defaultValue,
  open,
  isFilter,
}) => {
  const t = useT();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open && !defaultValue) {
      form.resetFields();
    }
  }, [open, form, defaultValue]);

  const options: {
    value: FilterOptions;
    label: string;
  }[] = [];

  if (isFilter) {
    switch (filter.type) {
      case "Person":
        options.push(
          { value: FilterOptions.Is, label: t("is") },
          { value: FilterOptions.IsNot, label: t("is not") },
          { value: FilterOptions.Contains, label: t("contains") },
          { value: FilterOptions.NotContain, label: t("doesn't contain") },
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
          { value: FilterOptions.Is, label: t("is") },
          { value: FilterOptions.IsNot, label: t("is not") },
          { value: FilterOptions.Contains, label: t("contains") },
          { value: FilterOptions.NotContain, label: t("doesn't contain") },
          { value: FilterOptions.IsEmpty, label: t("is empty") },
          { value: FilterOptions.IsNotEmpty, label: t("is not empty") },
        );
        break;
      case "Integer":
      case "Flaot":
        options.push(
          { value: FilterOptions.Is, label: t("is") },
          { value: FilterOptions.IsNot, label: t("is not") },
          { value: FilterOptions.GreaterThan, label: t("greater than") },
          { value: FilterOptions.LessThan, label: t("less than") },
          { value: FilterOptions.IsEmpty, label: t("is empty") },
          { value: FilterOptions.IsNotEmpty, label: t("is not empty") },
        );
        break;
      case "Date":
        options.push(
          { value: FilterOptions.DateIs, label: t("is") },
          { value: FilterOptions.DateIsNot, label: t("is not") },
          { value: FilterOptions.Before, label: t("before") },
          { value: FilterOptions.After, label: t("after") },
          { value: FilterOptions.OfThisWeek, label: t("of this week") },
          { value: FilterOptions.OfThisMonth, label: t("of this month") },
          { value: FilterOptions.OfThisYear, label: t("of this year") },
        );
        break;
    }
  } else {
    options.push(
      { value: FilterOptions.Ascending, label: t("Ascending") },
      { value: FilterOptions.Descending, label: t("Descending") },
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

  const filterOption = useRef<FilterOptions>();
  filterOption.current = defaultValue?.option;
  const filterValue = useRef<string>();

  const confirm = () => {
    if (filterOption.current === undefined) return;
    close();
    if (isFilter) {
      const value = filterValue.current ?? "";
      if (itemFilter) {
        itemFilter({ dataIndex: filter.dataIndex, option: filterOption.current, value }, index);
      }
    } else {
      console.log("sort");
    }
  };

  const onFilterSelect = (value: FilterOptions) => {
    filterOption.current = value;
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
            defaultValue={defaultValue?.option}
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

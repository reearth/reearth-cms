import styled from "@emotion/styled";
import { useState, useRef } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Button from "@reearth-cms/components/atoms/Button";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
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
  };
  itemFilter: (filter: FilterType, index: number) => void;
  index: number;
};

const FilterDropdown: React.FC<Props> = ({ filter, itemFilter, index }) => {
  const t = useT();
  const options = [
    { value: FilterOptions.Is, label: t("is") },
    { value: FilterOptions.IsNot, label: t("is not") },
  ];

  switch (filter.type) {
    case "Person":
      options.push(
        { value: FilterOptions.Contains, label: t("contains") },
        { value: FilterOptions.NotContain, label: t("doesn't contain") },
      );
      break;
    case "Text" ||
      "TextArea" ||
      "RichText" ||
      "MarkdownText" ||
      "Asset" ||
      "URL" ||
      "Select" ||
      "Tag":
      options.push(
        { value: FilterOptions.Contains, label: t("contains") },
        { value: FilterOptions.NotContain, label: t("doesn't contain") },
        { value: FilterOptions.IsEmpty, label: t("is empty") },
        { value: FilterOptions.IsNotEmpty, label: t("is not empty") },
      );
      break;
    case "Integer" || "Flaot":
      options.push(
        { value: FilterOptions.GreaterThan, label: t("greater than") },
        { value: FilterOptions.LessThan, label: t("less than") },
        { value: FilterOptions.IsEmpty, label: t("is empty") },
        { value: FilterOptions.IsNotEmpty, label: t("is not empty") },
      );
      break;
    case "Date":
      options.push(
        { value: FilterOptions.Before, label: t("before") },
        { value: FilterOptions.After, label: t("after") },
        { value: FilterOptions.OfThisWeek, label: t("of this week") },
        { value: FilterOptions.OfThisMonth, label: t("of this month") },
        { value: FilterOptions.OfThisYear, label: t("of this year") },
      );
      break;
  }

  const userOptions: {
    value: string;
    label: string;
  }[] = [];
  if (filter.typeProperty?.values) {
    for (const value of Object.values(filter.typeProperty.values)) {
      userOptions.push({ value, label: t(value) });
    }
  }

  const [open, setOpen] = useState(false);
  const filterOption = useRef<FilterOptions>();
  const filterValue = useRef<string>();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const close = () => {
    setOpen(false);
  };

  const confirm = () => {
    if (filterOption.current === undefined) return;
    setOpen(false);
    const value = filterValue.current ?? "";
    itemFilter({ dataIndex: filter.dataIndex, option: filterOption.current, value }, index);
  };

  const onFilterSelect = (value: FilterOptions) => {
    filterOption.current = value;
  };

  const onValueSelect = (value: string) => {
    console.log(value);

    filterValue.current = value;
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    filterValue.current = e.target.value;
  };

  return (
    <Dropdown
      key={filter.title}
      dropdownRender={() => (
        <DropdownRender>
          <Form name="basic" autoComplete="off">
            <Form.Item label={filter.title} name="condition">
              <Select style={{ width: 160 }} options={options} onSelect={onFilterSelect} />
            </Form.Item>
            <Form.Item>
              {filter.type === "Select" ? (
                <Select
                  placeholder="Select the value"
                  options={userOptions}
                  onSelect={onValueSelect}
                />
              ) : (
                <Input onChange={onChange} />
              )}
            </Form.Item>
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
        </DropdownRender>
      )}
      trigger={["click"]}
      placement="bottomLeft"
      arrow
      open={open}
      onOpenChange={handleOpenChange}>
      <Badge offset={[-3, 3]} color="blue" dot>
        <StyledButton type="text">{filter.title}</StyledButton>
      </Badge>
    </Dropdown>
  );
};

const DropdownRender = styled.div`
  background-color: white;
  padding: 10px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
`;

const StyledButton = styled(Button)`
  color: rgba(0, 0, 0, 0.45);
  background-color: #f8f8f8;
  margin: 0 5px;
`;

export default FilterDropdown;

import dayjs, { Dayjs } from "dayjs";

import DatePicker from "@reearth-cms/components/atoms/DatePicker";
import Input from "@reearth-cms/components/atoms/Input";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import Select from "@reearth-cms/components/atoms/Select";
import Tag from "@reearth-cms/components/atoms/Tag";
import { FilterType } from "@reearth-cms/components/molecules/Content/Table/types";

type Props = {
  type?: FilterType | "Person";
  defaultValue?: string;
  options?: {
    value: string;
    label: string;
    color?: string | undefined;
  }[];
  onSelect?: (value: string) => void;
  onNumberChange?: (value: string | null) => void;
  onDateChange?: (date: Dayjs, dateString: string | string[]) => void;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};
const { Option } = Select;

const ValueField: React.FC<Props> = ({
  type,
  defaultValue,
  options,
  onSelect,
  onNumberChange,
  onDateChange,
  onInputChange,
}: Props) => {
  switch (type) {
    case "Select":
    case "Tag":
    case "Person":
    case "Bool":
    case "Checkbox":
      return (
        <Select
          placeholder="Select the value"
          onSelect={onSelect}
          defaultValue={defaultValue?.toString()}
          getPopupContainer={trigger => trigger.parentNode}>
          {options?.map(option => (
            <Option key={option.value} value={option.value} label={option.label}>
              {type === "Tag" ? (
                <Tag color={option.color?.toLocaleLowerCase()}>{option.label}</Tag>
              ) : (
                option.label
              )}
            </Option>
          ))}
        </Select>
      );
    case "Integer":
      return (
        <InputNumber
          onChange={onNumberChange}
          stringMode
          defaultValue={defaultValue}
          style={{ width: "100%" }}
          placeholder="Enter the value"
        />
      );
    case "Date":
      return (
        <DatePicker
          onChange={onDateChange}
          style={{ width: "100%" }}
          placeholder="Select the date"
          showNow={false}
          defaultValue={defaultValue && defaultValue !== "" ? dayjs(defaultValue) : undefined}
        />
      );
    default:
      return (
        <Input onChange={onInputChange} defaultValue={defaultValue} placeholder="Enter the value" />
      );
  }
};

export default ValueField;

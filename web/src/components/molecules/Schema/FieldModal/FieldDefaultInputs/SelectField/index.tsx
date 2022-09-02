import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";

export interface Props {
  selectedValues: string[];
}

const SelectField: React.FC<Props> = ({ selectedValues }) => {
  const { Option } = Select;

  return (
    <Form.Item name="defaultValue" label="Set default value">
      <Select>
        {selectedValues?.map((value: string) => (
          <Option key={value} value={value}>
            {value}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default SelectField;

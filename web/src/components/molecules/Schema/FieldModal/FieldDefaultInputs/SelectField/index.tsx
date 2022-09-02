import { FormInstance } from "rc-field-form/lib/interface";
import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";

export interface Props {
  form: FormInstance<any>;
}

const SelectField: React.FC<Props> = ({ form }) => {
  const { Option } = Select;
  return (
    <Form.Item name="defaultValue" label="Set default value">
      <Select>
        {form.getFieldValue("values").map((value: string) => (
          <Option key={value} value={value}>
            {value}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default SelectField;

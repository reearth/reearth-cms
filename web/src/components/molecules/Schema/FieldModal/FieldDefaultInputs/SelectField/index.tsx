import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";

export interface Props {
  selectedValues: string[];
}

const SelectField: React.FC<Props> = ({ selectedValues }) => {
  const t = useT();
  const { Option } = Select;

  return (
    <Form.Item name="defaultValue" label={t("Set default value")}>
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

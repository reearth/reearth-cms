import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";
import MultiValueSelect from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueSelect";
import { useT } from "@reearth-cms/i18n";

type Props = {
  multiple: boolean;
  selectedValues?: string[];
};

const SelectField: React.FC<Props> = ({ multiple, selectedValues }) => {
  const t = useT();
  const { Option } = Select;

  return (
    <Form.Item label={t("Set default value")} name="defaultValue">
      {multiple ? (
        <MultiValueSelect selectedValues={selectedValues} />
      ) : (
        <Select allowClear>
          {selectedValues?.map((value: string) => (
            <Option key={value} value={value}>
              {value}
            </Option>
          ))}
        </Select>
      )}
    </Form.Item>
  );
};

export default SelectField;

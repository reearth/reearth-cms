import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";
import Space from "@reearth-cms/components/atoms/Space";
import Tag from "@reearth-cms/components/atoms/Tag";
import { useT } from "@reearth-cms/i18n";

export interface Props {
  selectedValues: string[];
  allowMultiple?: boolean;
}

const TagField: React.FC<Props> = ({ selectedValues }) => {
  const t = useT();
  const { Option } = Select;

  return (
    <Form.Item name="defaultValue" label={t("Set default value")}>
      <Select allowClear>
        {selectedValues?.map((value: string) => (
          <Option key={value} value={value}>
            <Space>
              <Tag>{value}</Tag>
            </Space>
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default TagField;

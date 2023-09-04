import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";
import Tag from "@reearth-cms/components/atoms/Tag";
import { useT } from "@reearth-cms/i18n";

export interface Props {
  selectedTags: { id: string; name: string; color: string }[];
  multiple?: boolean;
}

const TagField: React.FC<Props> = ({ selectedTags, multiple }) => {
  const t = useT();

  const capitalizeFirstLetter = (input: string) => {
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
  };

  return (
    <Form.Item name="defaultValue" label={t("Set default value")}>
      {multiple ? (
        <Select mode="multiple" showArrow style={{ width: "100%" }}>
          {selectedTags?.map(tag => (
            <Select.Option key={tag.name} value={tag.name}>
              <Tag color={capitalizeFirstLetter(tag.color)}>{tag.name}</Tag>
            </Select.Option>
          ))}
        </Select>
      ) : (
        <Select showArrow style={{ width: "100%" }}>
          {selectedTags?.map(tag => (
            <Select.Option key={tag.id} value={tag.id}>
              <Tag color={capitalizeFirstLetter(tag.color)}>{tag.name}</Tag>
            </Select.Option>
          ))}
        </Select>
      )}
    </Form.Item>
  );
};

export default TagField;

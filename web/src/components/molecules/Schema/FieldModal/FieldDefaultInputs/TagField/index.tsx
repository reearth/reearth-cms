import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";
import Tag from "@reearth-cms/components/atoms/Tag";
import MultiValueSelect from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueSelect";
import { useT } from "@reearth-cms/i18n";

export interface Props {
  selectedValues: string[];
  multiple?: boolean;
}

const tagRender = (props: any) => {
  const { label, value, closable, onClose } = props;
  const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      color={value}
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ marginRight: 3 }}>
      {label}
    </Tag>
  );
};

const options = [{ value: "gold" }, { value: "lime" }, { value: "green" }, { value: "cyan" }];

const TagField: React.FC<Props> = ({ selectedValues, multiple }) => {
  const t = useT();

  return (
    <Form.Item name="defaultValue" label={t("Set default value")}>
      {multiple ? (
        <Select
          mode="multiple"
          showArrow
          tagRender={tagRender}
          defaultValue={["gold", "cyan"]}
          style={{ width: "100%" }}
          options={options}
        />
      ) : (
        <Select
          mode="multiple"
          showArrow
          tagRender={tagRender}
          defaultValue={["gold", "cyan"]}
          style={{ width: "100%" }}
          options={options}
        />
      )}
    </Form.Item>
  );
};

export default TagField;

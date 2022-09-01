import Upload from "antd/lib/upload/Upload";
import { FormInstance } from "rc-field-form/lib/interface";
import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Select from "@reearth-cms/components/atoms/Select";
import TextArea from "@reearth-cms/components/atoms/TextArea";

import { FieldType } from "../../types";

export interface Props {
  selectedType: FieldType;
  form: FormInstance<any>;
}

const FieldDefaultInputs: React.FC<Props> = ({ selectedType, form }) => {
  const { Option } = Select;
  if (selectedType === "Text") {
    return (
      <Form.Item name="defaultValue" label="Set default value">
        <Input />
      </Form.Item>
    );
  } else if (selectedType === "TextArea" || selectedType === "MarkdownText") {
    return (
      <Form.Item name="defaultValue" label="Set default value">
        <TextArea rows={3} showCount />
      </Form.Item>
    );
  } else if (selectedType === "Asset") {
    return (
      <Form.Item name="defaultValue" label="Set default value">
        <Upload action="/upload.do" listType="picture-card">
          <div>
            <Icon icon="link" />
            <div style={{ marginTop: 8 }}>Asset</div>
          </div>
        </Upload>
      </Form.Item>
    );
  } else if (selectedType === "Select") {
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
  } else if (selectedType === "Integer") {
    return (
      <Form.Item name="defaultValue" label="Set default value">
        <Input type="number" />
      </Form.Item>
    );
  } else {
    return (
      <Form.Item name="defaultValue" label="Set default value">
        <Input />
      </Form.Item>
    );
  }
};

export default FieldDefaultInputs;

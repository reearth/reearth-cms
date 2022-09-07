import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";

import { FieldType } from "../../types";

export interface Props {
  selectedType: FieldType;
}

const FieldValidationInputs: React.FC<Props> = ({ selectedType }) => {
  return selectedType ? (
    selectedType === "Text" || selectedType === "TextArea" || selectedType === "MarkdownText" ? (
      <Form.Item name="maxLength" label="Set maximum length">
        <Input type="number" />
      </Form.Item>
    ) : selectedType === "Integer" ? (
      <>
        <Form.Item name="min" label="Set minimum value">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="max" label="Set maximum value">
          <Input type="number" />
        </Form.Item>
      </>
    ) : null
  ) : null;
};

export default FieldValidationInputs;

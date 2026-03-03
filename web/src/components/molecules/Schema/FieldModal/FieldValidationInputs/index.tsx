import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import { useT } from "@reearth-cms/i18n";

import { SchemaFieldType } from "../../types";

type Props = {
  max?: number;
  min?: number;
  selectedType: SchemaFieldType;
};

const FieldValidationInputs: React.FC<Props> = ({ max, min, selectedType }) => {
  const t = useT();
  return selectedType === "Text" ||
    selectedType === "TextArea" ||
    selectedType === "MarkdownText" ? (
    <Form.Item label={t("Set maximum length")} name="maxLength">
      <InputNumber min={1} type="number" />
    </Form.Item>
  ) : selectedType === "Integer" || selectedType === "Number" ? (
    <>
      <Form.Item label={t("Set minimum value")} name="min">
        <InputNumber max={max} type="number" />
      </Form.Item>
      <Form.Item label={t("Set maximum value")} name="max">
        <InputNumber min={min} type="number" />
      </Form.Item>
    </>
  ) : null;
};

export default FieldValidationInputs;

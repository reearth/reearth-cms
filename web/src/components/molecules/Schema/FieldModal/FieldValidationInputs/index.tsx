import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import { useT } from "@reearth-cms/i18n";

import { FieldType } from "../../types";

type Props = {
  selectedType: FieldType;
  min?: number;
  max?: number;
};

const FieldValidationInputs: React.FC<Props> = ({ selectedType, min, max }) => {
  const t = useT();
  return selectedType === "Text" ||
    selectedType === "TextArea" ||
    selectedType === "MarkdownText" ? (
    <Form.Item name="maxLength" label={t("Set maximum length")}>
      <InputNumber type="number" min={1} />
    </Form.Item>
  ) : selectedType === "Integer" || selectedType === "Number" ? (
    <>
      <Form.Item name="min" label={t("Set minimum value")}>
        <InputNumber type="number" max={max} />
      </Form.Item>
      <Form.Item name="max" label={t("Set maximum value")}>
        <InputNumber type="number" min={min} />
      </Form.Item>
    </>
  ) : null;
};

export default FieldValidationInputs;

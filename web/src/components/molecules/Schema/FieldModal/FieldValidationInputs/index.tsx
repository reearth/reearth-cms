import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { SchemaFieldType } from "../../types";

type Props = {
  selectedType: SchemaFieldType;
  min?: number;
  max?: number;
};

const FieldValidationInputs: React.FC<Props> = ({ selectedType, min, max }) => {
  const t = useT();
  return selectedType === "Text" ||
    selectedType === "TextArea" ||
    selectedType === "MarkdownText" ? (
    <Form.Item name="maxLength" label={t("Set maximum length")}>
      <InputNumber data-testid={DATA_TEST_ID.FieldModal__MaxLengthInput} type="number" min={1} />
    </Form.Item>
  ) : selectedType === "Integer" || selectedType === "Number" ? (
    <>
      <Form.Item name="min" label={t("Set minimum value")}>
        <InputNumber data-testid={DATA_TEST_ID.FieldModal__MinValueInput} type="number" max={max} />
      </Form.Item>
      <Form.Item name="max" label={t("Set maximum value")}>
        <InputNumber data-testid={DATA_TEST_ID.FieldModal__MaxValueInput} type="number" min={min} />
      </Form.Item>
    </>
  ) : null;
};

export default FieldValidationInputs;

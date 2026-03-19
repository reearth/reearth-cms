import React, { useCallback } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

type Props = {
  multiple: boolean;
  min?: number;
  max?: number;
};

const NumberField: React.FC<Props> = ({ multiple, min, max }) => {
  const t = useT();

  const validate = useCallback(
    (value: unknown) => {
      if (typeof value === "number") {
        if ((typeof min === "number" && value < min) || (typeof max === "number" && value > max)) {
          return true;
        }
      }
      return false;
    },
    [max, min],
  );

  return (
    <Form.Item
      name="defaultValue"
      label={t("Set default value")}
      validateStatus="success"
      rules={[
        {
          validator: (_, value) => {
            const isError = Array.isArray(value) ? value.some(v => validate(v)) : validate(value);
            if (isError) {
              return Promise.reject();
            }
            return Promise.resolve();
          },
          message: "",
        },
      ]}>
      {multiple ? (
        <MultiValueField
          type="number"
          FieldInput={InputNumber}
          min={min}
          max={max}
          data-testid={DATA_TEST_ID.FieldModal__SetDefaultValueInput}
        />
      ) : (
        <InputNumber
          type="number"
          min={min}
          max={max}
          data-testid={DATA_TEST_ID.FieldModal__SetDefaultValueInput}
        />
      )}
    </Form.Item>
  );
};

export default NumberField;

import React, { useCallback } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { useT } from "@reearth-cms/i18n";

type Props = {
  max?: number;
  min?: number;
  multiple: boolean;
};

const NumberField: React.FC<Props> = ({ max, min, multiple }) => {
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
      label={t("Set default value")}
      name="defaultValue"
      rules={[
        {
          message: "",
          validator: (_, value) => {
            const isError = Array.isArray(value) ? value.some(v => validate(v)) : validate(value);
            if (isError) {
              return Promise.reject();
            }
            return Promise.resolve();
          },
        },
      ]}
      validateStatus="success">
      {multiple ? (
        <MultiValueField FieldInput={InputNumber} max={max} min={min} type="number" />
      ) : (
        <InputNumber max={max} min={min} type="number" />
      )}
    </Form.Item>
  );
};

export default NumberField;

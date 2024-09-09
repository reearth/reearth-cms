import { useMemo, useCallback } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";

type DefaultFieldProps = {
  field: Field;
  itemGroupId?: string;
  disabled?: boolean;
};

const IntegerField: React.FC<DefaultFieldProps> = ({ field, itemGroupId, disabled }) => {
  const t = useT();
  const min = useMemo(() => field.typeProperty?.min, [field.typeProperty?.min]);
  const max = useMemo(() => field.typeProperty?.max, [field.typeProperty?.max]);
  const validate = useCallback(
    (value: unknown) => {
      if (typeof value === "number") {
        if (min) {
          if (value < min) {
            return true;
          }
        }
        if (max) {
          if (max < value) {
            return true;
          }
        }
      }
      return false;
    },
    [max, min],
  );

  return (
    <Form.Item
      extra={field.description}
      rules={[
        {
          required: field.required,
          message: t("Please input field!"),
        },
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
      ]}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />}>
      {field.multiple ? (
        <MultiValueField
          type="number"
          min={min}
          max={max}
          FieldInput={InputNumber}
          disabled={disabled}
        />
      ) : (
        <InputNumber type="number" min={min} max={max} disabled={disabled} />
      )}
    </Form.Item>
  );
};

export default IntegerField;

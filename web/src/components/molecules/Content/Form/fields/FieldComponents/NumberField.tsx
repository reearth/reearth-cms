import styled from "@emotion/styled";
import { useMemo, useCallback } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import ResponsiveHeight from "@reearth-cms/components/molecules/Content/Form/fields/ResponsiveHeight";
import { FieldProps } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";
import { requiredValidator } from "../utils";

const NumberField: React.FC<FieldProps> = ({
  field,
  itemGroupId,
  disabled,
  itemHeights,
  onItemHeightChange,
}) => {
  const t = useT();
  const min = useMemo(
    () => field?.typeProperty?.min ?? field?.typeProperty?.numberMin,
    [field?.typeProperty?.min, field?.typeProperty?.numberMin],
  );
  const max = useMemo(
    () => field?.typeProperty?.max ?? field?.typeProperty?.numberMax,
    [field?.typeProperty?.max, field?.typeProperty?.numberMax],
  );
  const validate = useCallback(
    (value: unknown) => {
      if (typeof value === "number") {
        if ((min && value < min) || (max && value > max)) {
          return true;
        }
      }
      return false;
    },
    [max, min],
  );

  return (
    <StyledFormItem
      extra={field.description}
      rules={[
        {
          required: field.required,
          validator: requiredValidator,
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
        <ResponsiveHeight itemHeights={itemHeights} onItemHeightChange={onItemHeightChange}>
          <MultiValueField
            type="number"
            min={min}
            max={max}
            FieldInput={InputNumber}
            disabled={disabled}
          />
        </ResponsiveHeight>
      ) : (
        <InputNumber type="number" min={min} max={max} disabled={disabled} />
      )}
    </StyledFormItem>
  );
};

const StyledFormItem = styled(Form.Item)`
  .ant-input-number-disabled {
    color: inherit;
  }
`;

export default NumberField;

import styled from "@emotion/styled";
import { useCallback, useMemo } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import ResponsiveHeight from "@reearth-cms/components/molecules/Content/Form/fields/ResponsiveHeight";
import { FieldProps } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";
import { requiredValidator } from "../utils";

const NumberField: React.FC<FieldProps> = ({
  disabled,
  field,
  itemGroupId,
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
      label={<FieldTitle isTitle={field.isTitle} isUnique={field.unique} title={field.title} />}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      rules={[
        {
          message: t("Please input field!"),
          required: field.required,
          validator: requiredValidator,
        },
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
      ]}>
      {field.multiple ? (
        <ResponsiveHeight itemHeights={itemHeights} onItemHeightChange={onItemHeightChange}>
          <MultiValueField
            disabled={disabled}
            FieldInput={InputNumber}
            max={max}
            min={min}
            type="number"
          />
        </ResponsiveHeight>
      ) : (
        <InputNumber disabled={disabled} max={max} min={min} type="number" />
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

import styled from "@emotion/styled";
import { useMemo } from "react";
import { runes } from "runes2";

import Form from "@reearth-cms/components/atoms/Form";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import ResponsiveHeight from "@reearth-cms/components/molecules/Content/Form/fields/ResponsiveHeight";
import { FieldProps } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";
import { requiredValidator } from "../utils";

const TextareaField: React.FC<FieldProps> = ({
  field,
  itemGroupId,
  disabled,
  itemHeights,
  onItemHeightChange,
}) => {
  const t = useT();
  const maxLength = useMemo(() => field.typeProperty?.maxLength, [field.typeProperty?.maxLength]);

  const required = useMemo(() => field.required, [field.required]);

  return (
    <StyledFormItem
      extra={field.description}
      validateStatus="success"
      rules={[
        {
          required,
          validator: requiredValidator,
          message: t("Please input field!"),
        },
        {
          validator: (_, value) => {
            if (value && maxLength) {
              if (Array.isArray(value)) {
                if (value.some(v => typeof v === "string" && maxLength < runes(v).length)) {
                  return Promise.reject();
                }
              } else if (typeof value === "string" && maxLength < runes(value).length) {
                return Promise.reject();
              }
            }
            return Promise.resolve();
          },
          message: "",
        },
      ]}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />}>
      <ResponsiveHeight itemHeights={itemHeights} onItemHeightChange={onItemHeightChange}>
        {field.multiple ? (
          <MultiValueField
            rows={3}
            showCount
            maxLength={maxLength}
            FieldInput={TextArea}
            disabled={disabled}
            required={required}
          />
        ) : (
          <TextArea
            rows={3}
            showCount
            maxLength={maxLength}
            disabled={disabled}
            required={required}
          />
        )}
      </ResponsiveHeight>
    </StyledFormItem>
  );
};

const StyledFormItem = styled(Form.Item)`
  .ant-input-disabled {
    color: inherit;
  }
`;

export default TextareaField;

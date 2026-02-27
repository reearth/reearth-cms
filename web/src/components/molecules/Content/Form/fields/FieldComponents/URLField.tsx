import styled from "@emotion/styled";
import { useMemo, useState } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import ResponsiveHeight from "@reearth-cms/components/molecules/Content/Form/fields/ResponsiveHeight";
import { FieldProps } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";
import { requiredValidator, urlErrorIndexesGet } from "../utils";

const URLField: React.FC<FieldProps> = ({
  disabled,
  field,
  itemGroupId,
  itemHeights,
  onItemHeightChange,
}) => {
  const t = useT();

  const required = useMemo(() => field.required, [field.required]);
  const [errorIndexes, setErrorIndexes] = useState(new Set<number>());

  return (
    <StyledFormItem
      extra={field.description}
      label={<FieldTitle isTitle={field.isTitle} isUnique={field.unique} title={field.title} />}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      rules={[
        {
          message: t("Please input field!"),
          required,
          validator: requiredValidator,
        },
        {
          message: t("URL is not valid"),
          validator: async (_, value) => {
            const indexes = urlErrorIndexesGet(value);
            setErrorIndexes(new Set(indexes));
            if (indexes.length) {
              return Promise.reject();
            }
            return Promise.resolve();
          },
        },
      ]}
      validateStatus="success">
      {field.multiple ? (
        <ResponsiveHeight itemHeights={itemHeights} onItemHeightChange={onItemHeightChange}>
          <MultiValueField
            disabled={disabled}
            errorIndexes={errorIndexes}
            FieldInput={Input}
            required={required}
          />
        </ResponsiveHeight>
      ) : (
        <Input disabled={disabled} isError={errorIndexes.has(0)} required={required} />
      )}
    </StyledFormItem>
  );
};

const StyledFormItem = styled(Form.Item)`
  .ant-input-disabled {
    color: inherit;
  }
`;

export default URLField;

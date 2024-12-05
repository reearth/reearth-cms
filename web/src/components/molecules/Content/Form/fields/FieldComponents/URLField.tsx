import { useMemo, useState } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";
import { requiredValidator, urlErrorIndexesGet } from "../utils";

type URLFieldProps = {
  field: Field;
  itemGroupId?: string;
  onMetaUpdate?: () => Promise<void>;
  disabled: boolean;
};

const URLField: React.FC<URLFieldProps> = ({ field, itemGroupId, onMetaUpdate, disabled }) => {
  const t = useT();

  const required = useMemo(() => field.required, [field.required]);
  const [errorIndexes, setErrorIndexes] = useState(new Set<number>());

  return (
    <Form.Item
      extra={field.description}
      validateStatus="success"
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />}
      rules={[
        {
          required,
          validator: requiredValidator,
          message: t("Please input field!"),
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
      ]}>
      {field.multiple ? (
        <MultiValueField
          FieldInput={Input}
          onBlur={onMetaUpdate}
          disabled={disabled}
          required={required}
          errorIndexes={errorIndexes}
        />
      ) : (
        <Input
          onBlur={onMetaUpdate}
          disabled={disabled}
          required={required}
          isError={errorIndexes.has(0)}
        />
      )}
    </Form.Item>
  );
};

export default URLField;

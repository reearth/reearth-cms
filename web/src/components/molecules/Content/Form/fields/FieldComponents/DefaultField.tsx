import { useMemo } from "react";
import { runes } from "runes2";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";

type DefaultFieldProps = {
  field: Field;
  itemGroupId?: string;
  onMetaUpdate?: () => Promise<void>;
  disabled?: boolean;
};

const DefaultField: React.FC<DefaultFieldProps> = ({
  field,
  itemGroupId,
  onMetaUpdate,
  disabled,
}) => {
  const t = useT();
  const maxLength = useMemo(() => field.typeProperty?.maxLength, [field.typeProperty?.maxLength]);

  return (
    <Form.Item
      extra={field.description}
      validateStatus="success"
      rules={[
        {
          required: field.required,
          message: t("Please input field!"),
        },
        {
          validator: (_, value) => {
            if (value && maxLength) {
              if (Array.isArray(value)) {
                if (value.some(v => maxLength < runes(v).length)) {
                  return Promise.reject();
                }
              } else if (maxLength < runes(value).length) {
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
      {field.multiple ? (
        <MultiValueField
          onBlur={onMetaUpdate}
          showCount={true}
          maxLength={maxLength}
          FieldInput={Input}
          disabled={disabled}
        />
      ) : (
        <Input onBlur={onMetaUpdate} showCount={true} maxLength={maxLength} disabled={disabled} />
      )}
    </Form.Item>
  );
};

export default DefaultField;

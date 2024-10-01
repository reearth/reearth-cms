import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { validateURL } from "@reearth-cms/utils/regex";

import FieldTitle from "../../FieldTitle";

type URLFieldProps = {
  field: Field;
  itemGroupId?: string;
  onMetaUpdate?: () => Promise<void>;
  disabled?: boolean;
};

const URLField: React.FC<URLFieldProps> = ({ field, itemGroupId, onMetaUpdate, disabled }) => {
  const t = useT();

  return (
    <Form.Item
      extra={field.description}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />}
      rules={[
        {
          required: field.required,
          message: t("Please input field!"),
        },
        {
          message: t("URL is not valid"),
          validator: async (_, value) => {
            if (value) {
              if (
                Array.isArray(value) &&
                value.some((valueItem: string) => !validateURL(valueItem) && valueItem.length > 0)
              )
                return Promise.reject();
              else if (!Array.isArray(value) && !validateURL(value) && value?.length > 0)
                return Promise.reject();
            }
            return Promise.resolve();
          },
        },
      ]}>
      {field.multiple ? (
        <MultiValueField
          showCount={true}
          maxLength={field.typeProperty?.maxLength ?? 500}
          FieldInput={Input}
          onBlur={onMetaUpdate}
          disabled={disabled}
        />
      ) : (
        <Input
          showCount={true}
          maxLength={field.typeProperty?.maxLength ?? 500}
          onBlur={onMetaUpdate}
          disabled={disabled}
        />
      )}
    </Form.Item>
  );
};

export default URLField;

import Form from "@reearth-cms/components/atoms/Form";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";

type DefaultFieldProps = {
  field: Field;
  itemGroupId?: string;
  disabled?: boolean;
};

const TextareaField: React.FC<DefaultFieldProps> = ({ field, itemGroupId, disabled }) => {
  const t = useT();

  return (
    <Form.Item
      extra={field.description}
      rules={[
        {
          required: field.required,
          message: t("Please input field!"),
        },
      ]}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />}>
      {field.multiple ? (
        <MultiValueField
          rows={3}
          showCount
          maxLength={field.typeProperty?.maxLength}
          FieldInput={TextArea}
          disabled={disabled}
        />
      ) : (
        <TextArea
          rows={3}
          showCount
          maxLength={field.typeProperty?.maxLength}
          disabled={disabled}
        />
      )}
    </Form.Item>
  );
};

export default TextareaField;

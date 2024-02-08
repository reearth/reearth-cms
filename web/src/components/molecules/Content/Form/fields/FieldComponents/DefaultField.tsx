import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";

interface DefaultFieldProps {
  field: Field;
  onMetaUpdate?: () => Promise<void>;
}

const DefaultField: React.FC<DefaultFieldProps> = ({ field, onMetaUpdate }) => {
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
      name={field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />}>
      {field.multiple ? (
        <MultiValueField
          onBlur={onMetaUpdate}
          showCount={true}
          maxLength={field.typeProperty?.maxLength ?? 500}
          FieldInput={Input}
        />
      ) : (
        <Input
          onBlur={onMetaUpdate}
          showCount={true}
          maxLength={field.typeProperty?.maxLength ?? 500}
        />
      )}
    </Form.Item>
  );
};

export default DefaultField;

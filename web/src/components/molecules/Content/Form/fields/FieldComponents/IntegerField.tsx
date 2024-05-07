import Form from "@reearth-cms/components/atoms/Form";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";

interface DefaultFieldProps {
  field: Field;
  itemGroupId?: string;
  disabled?: boolean;
}

const IntegerField: React.FC<DefaultFieldProps> = ({ field, itemGroupId, disabled }) => {
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
          type="number"
          min={field.typeProperty?.min}
          max={field.typeProperty?.max}
          FieldInput={InputNumber}
          disabled={disabled}
        />
      ) : (
        <InputNumber
          type="number"
          min={field.typeProperty?.min}
          max={field.typeProperty?.max}
          disabled={disabled}
        />
      )}
    </Form.Item>
  );
};

export default IntegerField;

import Form from "@reearth-cms/components/atoms/Form";
import GeometryItem from "@reearth-cms/components/molecules/Common/Form/GeometryItem";
import MultiValueGeometry from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueGeometry";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";

interface DefaultFieldProps {
  field: Field;
  itemGroupId?: string;
  disabled?: boolean;
}

const GeometryField: React.FC<DefaultFieldProps> = ({ field, itemGroupId, disabled }) => {
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
        <MultiValueGeometry field={field} disabled={disabled} />
      ) : (
        <GeometryItem field={field} />
      )}
    </Form.Item>
  );
};

export default GeometryField;

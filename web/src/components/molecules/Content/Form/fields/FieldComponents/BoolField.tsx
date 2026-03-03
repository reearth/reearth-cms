import Form from "@reearth-cms/components/atoms/Form";
import Switch from "@reearth-cms/components/atoms/Switch";
import MultiValueBooleanField from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueBooleanField";
import ResponsiveHeight from "@reearth-cms/components/molecules/Content/Form/fields/ResponsiveHeight";
import { FieldProps } from "@reearth-cms/components/molecules/Schema/types";

import FieldTitle from "../../FieldTitle";

const BoolField: React.FC<FieldProps> = ({
  disabled,
  field,
  itemGroupId,
  itemHeights,
  onItemHeightChange,
}) => {
  return (
    <Form.Item
      extra={field.description}
      label={<FieldTitle isTitle={field.isTitle} isUnique={field.unique} title={field.title} />}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      valuePropName="checked">
      {field.multiple ? (
        <ResponsiveHeight itemHeights={itemHeights} onItemHeightChange={onItemHeightChange}>
          <MultiValueBooleanField disabled={disabled} FieldInput={Switch} />
        </ResponsiveHeight>
      ) : (
        <Switch disabled={disabled} />
      )}
    </Form.Item>
  );
};

export default BoolField;

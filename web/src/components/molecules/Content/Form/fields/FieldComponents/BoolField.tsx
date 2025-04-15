import Form from "@reearth-cms/components/atoms/Form";
import Switch from "@reearth-cms/components/atoms/Switch";
import MultiValueBooleanField from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueBooleanField";
import ResponsiveHeight from "@reearth-cms/components/molecules/Content/Form/fields/ResponsiveHeight";
import { FieldProps } from "@reearth-cms/components/molecules/Schema/types";

import FieldTitle from "../../FieldTitle";

const BoolField: React.FC<FieldProps> = ({
  field,
  itemGroupId,
  disabled,
  itemHeights,
  onItemHeightChange,
}) => {
  return (
    <Form.Item
      extra={field.description}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      valuePropName="checked"
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />}>
      {field.multiple ? (
        <ResponsiveHeight itemHeights={itemHeights} onItemHeightChange={onItemHeightChange}>
          <MultiValueBooleanField FieldInput={Switch} disabled={disabled} />
        </ResponsiveHeight>
      ) : (
        <Switch disabled={disabled} />
      )}
    </Form.Item>
  );
};

export default BoolField;

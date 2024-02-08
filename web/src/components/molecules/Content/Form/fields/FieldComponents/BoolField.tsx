import Form from "@reearth-cms/components/atoms/Form";
import Switch from "@reearth-cms/components/atoms/Switch";
import MultiValueBooleanField from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueBooleanField";
import { Field } from "@reearth-cms/components/molecules/Schema/types";

import FieldTitle from "../../FieldTitle";

interface BoolFieldProps {
  field: Field;
  handleMetaUpdate?: () => void;
}

const BoolField: React.FC<BoolFieldProps> = ({ field, handleMetaUpdate }) => {
  return (
    <Form.Item
      extra={field.description}
      name={field.id}
      valuePropName="checked"
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />}>
      {field.multiple ? (
        <MultiValueBooleanField onChange={handleMetaUpdate} FieldInput={Switch} />
      ) : (
        <Switch onChange={handleMetaUpdate} />
      )}
    </Form.Item>
  );
};

export default BoolField;

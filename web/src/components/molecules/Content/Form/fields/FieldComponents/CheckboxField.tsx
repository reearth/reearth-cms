import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form from "@reearth-cms/components/atoms/Form";
import MultiValueBooleanField from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueBooleanField";
import { Field } from "@reearth-cms/components/molecules/Schema/types";

import FieldTitle from "../../FieldTitle";

type CheckboxFieldProps = {
  field: Field;
  onMetaUpdate?: () => void;
  disabled: boolean;
};

const CheckboxField: React.FC<CheckboxFieldProps> = ({ field, onMetaUpdate, disabled }) => {
  return (
    <Form.Item
      extra={field.description}
      name={field.id}
      valuePropName="checked"
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />}>
      {field.multiple ? (
        <MultiValueBooleanField onChange={onMetaUpdate} FieldInput={Checkbox} disabled={disabled} />
      ) : (
        <Checkbox onChange={onMetaUpdate} disabled={disabled} />
      )}
    </Form.Item>
  );
};

export default CheckboxField;

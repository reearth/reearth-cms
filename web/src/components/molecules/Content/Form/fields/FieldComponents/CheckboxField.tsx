import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form from "@reearth-cms/components/atoms/Form";
import MultiValueBooleanField from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueBooleanField";
import { FieldProps } from "@reearth-cms/components/molecules/Schema/types";

import FieldTitle from "../../FieldTitle";

const CheckboxField: React.FC<FieldProps> = ({ field, disabled }) => {
  return (
    <Form.Item
      extra={field.description}
      name={field.id}
      valuePropName="checked"
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />}>
      {field.multiple ? (
        <MultiValueBooleanField FieldInput={Checkbox} disabled={disabled} />
      ) : (
        <Checkbox disabled={disabled} />
      )}
    </Form.Item>
  );
};

export default CheckboxField;

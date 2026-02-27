import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form from "@reearth-cms/components/atoms/Form";
import MultiValueBooleanField from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueBooleanField";
import { FieldProps } from "@reearth-cms/components/molecules/Schema/types";

import FieldTitle from "../../FieldTitle";

const CheckboxField: React.FC<FieldProps> = ({ disabled, field }) => {
  return (
    <Form.Item
      extra={field.description}
      label={<FieldTitle isTitle={false} isUnique={field.unique} title={field.title} />}
      name={field.id}
      valuePropName="checked">
      {field.multiple ? (
        <MultiValueBooleanField disabled={disabled} FieldInput={Checkbox} />
      ) : (
        <Checkbox disabled={disabled} />
      )}
    </Form.Item>
  );
};

export default CheckboxField;

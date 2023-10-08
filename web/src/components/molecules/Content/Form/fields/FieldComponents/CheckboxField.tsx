import { Form, Checkbox } from "antd"; // Import antd components
import React from "react";

import MultiValueBooleanField from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueBooleanField";
import { Field } from "@reearth-cms/components/molecules/Schema/types";

import FieldTitle from "../../FieldTitle";

interface CheckboxFieldProps {
  field: Field;
  handleMetaUpdate: () => void; // Update to the actual type
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ field, handleMetaUpdate }) => {
  return (
    <Form.Item
      extra={field.description}
      name={field.id}
      valuePropName="checked"
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />}>
      {field.multiple ? (
        <MultiValueBooleanField onChange={handleMetaUpdate} FieldInput={Checkbox} />
      ) : (
        <Checkbox onChange={handleMetaUpdate} />
      )}
    </Form.Item>
  );
};

export default CheckboxField;

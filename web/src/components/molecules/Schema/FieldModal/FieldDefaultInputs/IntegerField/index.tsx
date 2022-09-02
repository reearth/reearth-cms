import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";

const IntegerField: React.FC = () => {
  return (
    <Form.Item name="defaultValue" label="Set default value">
      <Input type="number" />
    </Form.Item>
  );
};

export default IntegerField;

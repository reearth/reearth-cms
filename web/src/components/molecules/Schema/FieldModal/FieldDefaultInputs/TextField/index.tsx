import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";

const TextField: React.FC = () => {
  return (
    <Form.Item name="defaultValue" label="Set default value">
      <Input />
    </Form.Item>
  );
};

export default TextField;

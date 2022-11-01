import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { validateURL } from "@reearth-cms/utils/regex";

const URLField: React.FC = () => {
  return (
    <Form.Item
      name="defaultValue"
      label="Set default value"
      rules={[
        {
          message: "URL is not valid",
          validator: async (_, value) => {
            if (!validateURL(value) && value?.length > 0) return Promise.reject();
            return Promise.resolve();
          },
        },
      ]}>
      <Input />
    </Form.Item>
  );
};

export default URLField;

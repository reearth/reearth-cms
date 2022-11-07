import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";
import { validateURL } from "@reearth-cms/utils/regex";

const URLField: React.FC = () => {
  const t = useT();
  return (
    <Form.Item
      name="defaultValue"
      label="Set default value"
      extra={t("Default value must be a valid URL and start with 'http://' or 'https://'.")}
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

import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import TextArea from "@reearth-cms/components/atoms/TextArea";

const TextAreaField: React.FC = () => {
  return (
    <Form.Item name="defaultValue" label="Set default value">
      <TextArea rows={3} showCount />
    </Form.Item>
  );
};

export default TextAreaField;

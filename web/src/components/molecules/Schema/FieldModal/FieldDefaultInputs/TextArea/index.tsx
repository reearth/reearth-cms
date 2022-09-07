import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { useT } from "@reearth-cms/i18n";

const TextAreaField: React.FC = () => {
  const t = useT();

  return (
    <Form.Item name="defaultValue" label={t("Set default value")}>
      <TextArea rows={3} showCount />
    </Form.Item>
  );
};

export default TextAreaField;

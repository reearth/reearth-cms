import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import MarkdownInput from "@reearth-cms/components/atoms/Markdown";
import { useT } from "@reearth-cms/i18n";

const MarkdownField: React.FC = () => {
  const t = useT();

  return (
    <Form.Item name="defaultValue" label={t("Set default value")}>
      <MarkdownInput />
    </Form.Item>
  );
};

export default MarkdownField;

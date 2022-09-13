import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

const IntegerField: React.FC = () => {
  const t = useT();

  return (
    <Form.Item name="defaultValue" label={t("Set default value")}>
      <Input type="number" />
    </Form.Item>
  );
};

export default IntegerField;

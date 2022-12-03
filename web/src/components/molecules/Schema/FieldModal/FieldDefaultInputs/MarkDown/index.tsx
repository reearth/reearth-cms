import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import MarkDownInput from "@reearth-cms/components/atoms/MarkDown";
import { useT } from "@reearth-cms/i18n";

const MarkDownField: React.FC = () => {
  const t = useT();

  return (
    <Form.Item name="defaultValue" label={t("Set default value")}>
      <MarkDownInput />
    </Form.Item>
  );
};

export default MarkDownField;

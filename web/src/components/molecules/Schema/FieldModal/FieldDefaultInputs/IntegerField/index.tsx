import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { useT } from "@reearth-cms/i18n";

type Props = {
  multiple: boolean;
  min?: number;
  max?: number;
};

const IntegerField: React.FC<Props> = ({ multiple, min, max }) => {
  const t = useT();

  return (
    <Form.Item
      name="defaultValue"
      label={t("Set default value")}
      rules={[{ type: "number", min, max }]}>
      {multiple ? (
        <MultiValueField type="number" FieldInput={InputNumber} min={min} max={max} />
      ) : (
        <InputNumber type="number" min={min} max={max} />
      )}
    </Form.Item>
  );
};

export default IntegerField;

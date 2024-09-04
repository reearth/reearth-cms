import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { useT } from "@reearth-cms/i18n";

type Props = {
  multiple: boolean;
  maxLength?: number;
};

const TextField: React.FC<Props> = ({ multiple, maxLength }) => {
  const t = useT();

  return (
    <Form.Item name="defaultValue" label={t("Set default value")} rules={[{ max: maxLength }]}>
      {multiple ? (
        <MultiValueField FieldInput={Input} showCount maxLength={maxLength} />
      ) : (
        <Input showCount maxLength={maxLength} />
      )}
    </Form.Item>
  );
};

export default TextField;

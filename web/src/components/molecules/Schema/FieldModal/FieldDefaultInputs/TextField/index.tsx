import React from "react";
import { runes } from "runes2";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { useT } from "@reearth-cms/i18n";

type Props = {
  maxLength?: number;
  multiple: boolean;
};

const TextField: React.FC<Props> = ({ maxLength, multiple }) => {
  const t = useT();

  return (
    <Form.Item
      label={t("Set default value")}
      name="defaultValue"
      rules={[
        {
          message: "",
          validator: (_, value) => {
            if (value && maxLength) {
              if (Array.isArray(value)) {
                if (value.some(v => typeof v === "string" && maxLength < runes(v).length)) {
                  return Promise.reject();
                }
              } else if (typeof value === "string" && maxLength < runes(value).length) {
                return Promise.reject();
              }
            }
            return Promise.resolve();
          },
        },
      ]}
      validateStatus="success">
      {multiple ? (
        <MultiValueField FieldInput={Input} maxLength={maxLength} showCount />
      ) : (
        <Input maxLength={maxLength} showCount />
      )}
    </Form.Item>
  );
};

export default TextField;

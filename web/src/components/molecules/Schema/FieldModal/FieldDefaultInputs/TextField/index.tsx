import React from "react";
import { runes } from "runes2";

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
    <Form.Item
      name="defaultValue"
      label={t("Set default value")}
      validateStatus="success"
      rules={[
        {
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
          message: "",
        },
      ]}>
      {multiple ? (
        <MultiValueField FieldInput={Input} showCount maxLength={maxLength} />
      ) : (
        <Input showCount maxLength={maxLength} />
      )}
    </Form.Item>
  );
};

export default TextField;

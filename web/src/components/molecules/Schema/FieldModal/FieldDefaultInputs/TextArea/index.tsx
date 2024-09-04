import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { useT } from "@reearth-cms/i18n";

type Props = {
  multiple: boolean;
  maxLength?: number;
};

const TextAreaField: React.FC<Props> = ({ multiple, maxLength }) => {
  const t = useT();

  return (
    <Form.Item name="defaultValue" label={t("Set default value")} rules={[{ max: maxLength }]}>
      {multiple ? (
        <MultiValueField rows={1} showCount maxLength={maxLength} FieldInput={TextArea} />
      ) : (
        <TextArea rows={3} showCount maxLength={maxLength} />
      )}
    </Form.Item>
  );
};

export default TextAreaField;

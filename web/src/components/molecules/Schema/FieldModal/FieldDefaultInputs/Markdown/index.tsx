import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import MarkdownInput from "@reearth-cms/components/atoms/Markdown";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { useT } from "@reearth-cms/i18n";

type Props = {
  multiple: boolean;
  maxLength?: number;
};

const MarkdownField: React.FC<Props> = ({ multiple, maxLength }) => {
  const t = useT();

  return (
    <Form.Item name="defaultValue" label={t("Set default value")} rules={[{ max: maxLength }]}>
      {multiple ? (
        <MultiValueField maxLength={maxLength} FieldInput={MarkdownInput} />
      ) : (
        <MarkdownInput maxLength={maxLength} />
      )}
    </Form.Item>
  );
};

export default MarkdownField;

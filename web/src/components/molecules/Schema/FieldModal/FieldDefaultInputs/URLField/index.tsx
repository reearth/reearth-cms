import { useState } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { urlErrorIndexesGet } from "@reearth-cms/components/molecules/Content/Form/fields/utils";
import { useT } from "@reearth-cms/i18n";

type Props = {
  multiple: boolean;
};

const URLField: React.FC<Props> = ({ multiple }) => {
  const t = useT();
  const [errorIndexes, setErrorIndexes] = useState(new Set<number>());

  return (
    <Form.Item
      extra={t("Default value must be a valid URL and start with 'http://' or 'https://'.")}
      label={t("Set default value")}
      name="defaultValue"
      rules={[
        {
          message: t("URL is not valid"),
          validator: async (_, value) => {
            const indexes = urlErrorIndexesGet(value);
            setErrorIndexes(new Set(indexes));
            if (indexes.length) {
              return Promise.reject();
            }
            return Promise.resolve();
          },
        },
      ]}
      validateStatus="success">
      {multiple ? (
        <MultiValueField errorIndexes={errorIndexes} FieldInput={Input} />
      ) : (
        <Input isError={errorIndexes.has(0)} />
      )}
    </Form.Item>
  );
};

export default URLField;

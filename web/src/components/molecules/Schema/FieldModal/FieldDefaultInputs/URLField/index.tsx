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
      name="defaultValue"
      validateStatus="success"
      label={t("Set default value")}
      extra={t("Default value must be a valid URL and start with 'http://' or 'https://'.")}
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
      ]}>
      {multiple ? (
        <MultiValueField FieldInput={Input} errorIndexes={errorIndexes} />
      ) : (
        <Input isError={errorIndexes.has(0)} />
      )}
    </Form.Item>
  );
};

export default URLField;

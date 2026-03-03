import { useEffect, useMemo } from "react";

import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

type Props = {
  setUploadUrl: (uploadUrl: { autoUnzip: boolean; url: string }) => void;
  uploadUrl: { autoUnzip: boolean; url: string };
};

export type FormValues = {
  url: string;
};

const UrlTab: React.FC<Props> = ({ setUploadUrl, uploadUrl }) => {
  const isCompressedFile = useMemo(() => uploadUrl.url.match(/\.zip|\.7z$/), [uploadUrl]);
  const t = useT();
  const [form] = Form.useForm();

  const initialValues: FormValues = {
    url: "",
  };

  useEffect(() => {
    form.setFieldValue("url", uploadUrl.url);
  }, [form, uploadUrl.url]);

  return (
    <Form form={form} initialValues={initialValues} layout="vertical">
      <Form.Item
        label={t("URL")}
        name="url"
        rules={[
          { required: true },
          { message: t("Please input the URL of the asset!") },
          { type: "url", warningOnly: true },
        ]}>
        <Input
          onChange={e =>
            setUploadUrl({
              ...uploadUrl,
              url: e.target.value,
            })
          }
          placeholder={t("Please input a valid URL")}
        />
      </Form.Item>
      {isCompressedFile && (
        <Checkbox
          checked={uploadUrl.autoUnzip}
          onChange={() => {
            setUploadUrl({
              ...uploadUrl,
              autoUnzip: !uploadUrl.autoUnzip,
            });
          }}>
          {t("Auto Unzip")}
        </Checkbox>
      )}
    </Form>
  );
};

export default UrlTab;

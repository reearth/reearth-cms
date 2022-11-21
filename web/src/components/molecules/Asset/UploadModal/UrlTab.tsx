import { useEffect } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

type Props = {
  uploadUrl: string;
  setUploadUrl: (url: string) => void;
};

export type FormValues = {
  url: string;
};

const UrlTab: React.FC<Props> = ({ uploadUrl, setUploadUrl }) => {
  const t = useT();
  const [form] = Form.useForm();

  const initialValues: FormValues = {
    url: "",
  };

  useEffect(() => {
    form.setFieldValue("url", uploadUrl);
  }, [form, uploadUrl]);

  return (
    <Form form={form} layout="vertical" initialValues={initialValues}>
      <Form.Item
        name="url"
        label={t("URL")}
        rules={[
          { required: true },
          { message: t("Please input the URL of the asset!") },
          { type: "url", warningOnly: true },
        ]}>
        <Input
          placeholder={t("Please input a valid URL")}
          onChange={e => setUploadUrl(e.target.value)}
        />
      </Form.Item>
    </Form>
  );
};

export default UrlTab;

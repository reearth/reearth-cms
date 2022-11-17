import { ChangeEventHandler } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

type Props = {
  setUploadUrl: (url: string) => void;
};

export type FormValues = {
  url: string;
};

const initialValues: FormValues = {
  url: "",
};

const UrlTab: React.FC<Props> = ({ setUploadUrl }) => {
  const t = useT();
  const [form] = Form.useForm();

  const handleChange: ChangeEventHandler<HTMLInputElement> = async e => {
    setUploadUrl(e.target.value);
  };

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
        <Input placeholder={t("Please input a valid URL")} onChange={handleChange} />
      </Form.Item>
    </Form>
  );
};

export default UrlTab;

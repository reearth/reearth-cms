import { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  user?: User;
  onLanguageUpdate: (lang?: string | undefined) => Promise<void>;
};

const AccountServiceForm: React.FC<Props> = ({ user, onLanguageUpdate }) => {
  const [form] = Form.useForm();
  const t = useT();

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      await onLanguageUpdate?.(values.lang);
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  }, [form, onLanguageUpdate]);

  return (
    <Form
      style={{ maxWidth: 400 }}
      form={form}
      initialValues={user}
      layout="vertical"
      autoComplete="off">
      <Form.Item
        name="lang"
        label={t("Service Language")}
        extra={t("This will change the UI langauge")}>
        <Input />
      </Form.Item>
      <Button onClick={handleSubmit} type="primary" htmlType="submit">
        {t("Save")}
      </Button>
    </Form>
  );
};

export default AccountServiceForm;

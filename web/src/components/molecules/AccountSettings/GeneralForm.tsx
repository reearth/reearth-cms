import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

export type Props = {};

const AccountGeneralForm: React.FC<Props> = () => {
  const [form] = Form.useForm();
  const t = useT();

  return (
    <Form style={{ maxWidth: 400 }} form={form} layout="vertical" autoComplete="off">
      <Form.Item
        name="name"
        label={t("Account Name")}
        extra={t("This is your id in Re:Earth and Re:Earth CMS")}>
        <Input />
      </Form.Item>
      <Form.Item
        name="email"
        label={t("Your Email")}
        extra={t("Please enter the email address you want to use to log in with Re:Earth CMS.")}>
        <Input />
      </Form.Item>
      <Button onClick={() => {}} type="primary" htmlType="submit">
        {t("Save")}
      </Button>
    </Form>
  );
};

export default AccountGeneralForm;

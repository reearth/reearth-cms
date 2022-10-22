import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

export type Props = {};

const AccountServiceForm: React.FC<Props> = () => {
  const [form] = Form.useForm();
  const t = useT();

  return (
    <Form style={{ maxWidth: 400 }} form={form} layout="vertical" autoComplete="off">
      <Form.Item
        name="lang"
        label={t("Service Language")}
        extra={t("This will change the UI langauge")}>
        <Input />
      </Form.Item>
      <Button onClick={() => {}} type="primary" htmlType="submit">
        {t("Save")}
      </Button>
    </Form>
  );
};

export default AccountServiceForm;

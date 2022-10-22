import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

export type Props = {};

const WorkspaceForm: React.FC<Props> = () => {
  const [form] = Form.useForm();
  const t = useT();

  return (
    <Form style={{ maxWidth: 400 }} form={form} layout="vertical" autoComplete="off">
      <Form.Item
        name="name"
        label={t("Workspace Name")}
        extra={t(
          "This is your team's visible name within Re:Earth and Re:Earth CMS. For example, the name of your company or department.",
        )}>
        <Input />
      </Form.Item>
      <Button onClick={() => {}} type="primary" htmlType="submit">
        {t("Save")}
      </Button>
    </Form>
  );
};

export default WorkspaceForm;

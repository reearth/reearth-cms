import styled from "@emotion/styled";
import { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

interface Props {
  workspaceName?: string;
  onWorkspaceUpdate: (name: string) => Promise<void>;
}

interface FormType {
  name: string;
}

const WorkspaceGeneralForm: React.FC<Props> = ({ workspaceName, onWorkspaceUpdate }) => {
  const [form] = Form.useForm<FormType>();
  const t = useT();

  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields();
    await onWorkspaceUpdate(values.name);
  }, [form, onWorkspaceUpdate]);

  return (
    <StyledForm
      form={form}
      initialValues={{ name: workspaceName }}
      layout="vertical"
      autoComplete="off">
      <Form.Item
        name="name"
        label={t("Workspace Name")}
        extra={t(
          "This is the name that will be visible within Re:Earth and Re:Earth CMS. This could be your company's name, department's name, the theme of your projects, etc.",
        )}>
        <Input />
      </Form.Item>
      <Button onClick={handleSubmit} type="primary" htmlType="submit">
        {t("Save changes")}
      </Button>
    </StyledForm>
  );
};

const StyledForm = styled(Form)`
  max-width: 400px;
`;

export default WorkspaceGeneralForm;

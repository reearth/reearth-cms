import styled from "@emotion/styled";
import { useCallback, useState, useEffect } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

type Props = {
  workspaceName?: string;
  updateWorkspaceLoading: boolean;
  hasUpdateRight: boolean;
  onWorkspaceUpdate: (name: string) => Promise<void>;
};

type FormType = {
  name: string;
};

const WorkspaceGeneralForm: React.FC<Props> = ({
  workspaceName,
  updateWorkspaceLoading,
  hasUpdateRight,
  onWorkspaceUpdate,
}) => {
  const t = useT();
  const [form] = Form.useForm<FormType>();
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    form.setFieldsValue({ name: workspaceName });
  }, [form, workspaceName]);

  const handleValuesChange = useCallback(
    async (_: unknown, values: FormType) => {
      if (workspaceName === values.name) {
        setIsDisabled(true);
        return;
      }
      const hasError = await form
        .validateFields()
        .then(() => false)
        .catch((errorInfo: ValidateErrorEntity) => errorInfo.errorFields.length > 0);
      setIsDisabled(hasError);
    },
    [form, workspaceName],
  );

  const handleSubmit = useCallback(async () => {
    setIsDisabled(true);
    try {
      const values = await form.validateFields();
      await onWorkspaceUpdate(values.name);
    } catch (_) {
      setIsDisabled(false);
    }
  }, [form, onWorkspaceUpdate]);

  return (
    <StyledForm
      form={form}
      layout="vertical"
      autoComplete="off"
      onValuesChange={handleValuesChange}
      requiredMark={false}>
      <Form.Item
        name="name"
        label={t("Workspace Name")}
        extra={t(
          "This is the name that will be visible within Re:Earth and Re:Earth CMS. This could be your company's name, department's name, the theme of your projects, etc.",
        )}
        rules={[
          {
            required: true,
            message: t("Please input a new workspace name!"),
          },
        ]}>
        <Input disabled={!hasUpdateRight} />
      </Form.Item>
      <Button
        onClick={handleSubmit}
        type="primary"
        loading={updateWorkspaceLoading}
        disabled={isDisabled}>
        {t("Save changes")}
      </Button>
    </StyledForm>
  );
};

const StyledForm = styled(Form<FormType>)`
  max-width: 400px;
`;

export default WorkspaceGeneralForm;

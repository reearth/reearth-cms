import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

type Props = {
  hasUpdateRight: boolean;
  onWorkspaceUpdate: (name: string) => Promise<void>;
  updateWorkspaceLoading: boolean;
  workspaceName?: string;
};

type FormType = {
  name: string;
};

const WorkspaceGeneralForm: React.FC<Props> = ({
  hasUpdateRight,
  onWorkspaceUpdate,
  updateWorkspaceLoading,
  workspaceName,
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
      autoComplete="off"
      form={form}
      layout="vertical"
      onValuesChange={handleValuesChange}
      requiredMark={false}>
      <Form.Item
        extra={t(
          "This is the name that will be visible within Re:Earth and Re:Earth CMS. This could be your company's name, department's name, the theme of your projects, etc.",
        )}
        label={t("Workspace Name")}
        name="name"
        rules={[
          {
            message: t("Please input a new workspace name!"),
            required: true,
          },
        ]}>
        <Input disabled={!hasUpdateRight} />
      </Form.Item>
      <Button
        disabled={isDisabled}
        loading={updateWorkspaceLoading}
        onClick={handleSubmit}
        type="primary">
        {t("Save changes")}
      </Button>
    </StyledForm>
  );
};

const StyledForm = styled(Form<FormType>)`
  max-width: 400px;
`;

export default WorkspaceGeneralForm;

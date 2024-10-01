import styled from "@emotion/styled";
import { useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { useT } from "@reearth-cms/i18n";
import { validateKey } from "@reearth-cms/utils/regex";

import { Project } from "../Workspace/types";

type Props = {
  project: Project;
  onProjectUpdate: (name?: string, alias?: string, description?: string) => Promise<void>;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
};

type FormType = {
  name: string;
  alias: string;
  description: string;
};

const ProjectGeneralForm: React.FC<Props> = ({ project, onProjectUpdate, onProjectAliasCheck }) => {
  const [form] = Form.useForm<FormType>();
  const t = useT();
  const [isDisabled, setIsDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    setIsDisabled(true);
    setIsLoading(true);
    try {
      const values = await form.validateFields();
      await onProjectUpdate(values.name, values.alias, values.description);
    } catch (_) {
      setIsDisabled(false);
    } finally {
      setIsLoading(false);
    }
  }, [form, onProjectUpdate]);

  const handleValuesChange = useCallback(
    async (_: unknown, values: FormType) => {
      if (
        project.name === values.name &&
        project.alias === values.alias &&
        project.description === values.description
      ) {
        setIsDisabled(true);
        return;
      }
      const hasError = await form
        .validateFields()
        .then(() => false)
        .catch((errorInfo: ValidateErrorEntity) => errorInfo.errorFields.length > 0);
      setIsDisabled(hasError);
    },
    [form, project.alias, project.description, project.name],
  );

  return (
    <StyledForm
      form={form}
      layout="vertical"
      autoComplete="off"
      initialValues={project}
      onFinish={handleSubmit}
      onValuesChange={handleValuesChange}>
      <Form.Item
        name="name"
        label={t("Name")}
        rules={[{ required: true, message: t("Please input the name of project!") }]}>
        <Input />
      </Form.Item>
      <Form.Item
        name="alias"
        label={t("Alias")}
        rules={[
          {
            required: true,
            message: t("Project alias is not valid"),
            validator: async (_, value) => {
              if (!validateKey(value) || value.length <= 4) {
                return Promise.reject();
              }
              const isProjectAliasAvailable = await onProjectAliasCheck(value);
              return isProjectAliasAvailable || project?.alias === value
                ? Promise.resolve()
                : Promise.reject();
            },
          },
        ]}>
        <Input />
      </Form.Item>
      <Form.Item
        name="description"
        label={t("Description")}
        extra={t("Write something here to describe this record.")}>
        <TextArea rows={4} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" disabled={isDisabled} loading={isLoading}>
          {t("Save changes")}
        </Button>
      </Form.Item>
    </StyledForm>
  );
};

const StyledForm = styled(Form<FormType>)`
  max-width: 400px;
`;

export default ProjectGeneralForm;

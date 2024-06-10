import styled from "@emotion/styled";
import { useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { FieldError } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { useT } from "@reearth-cms/i18n";
import { validateKey } from "@reearth-cms/utils/regex";

import { Project } from "../Workspace/types";

interface Props {
  project: Project;
  onProjectUpdate: (name?: string, alias?: string, description?: string) => Promise<void>;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
}

const ProjectGeneralForm: React.FC<Props> = ({ project, onProjectUpdate, onProjectAliasCheck }) => {
  const [form] = Form.useForm();
  const t = useT();
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async values => {
        await onProjectUpdate(values.name, values.alias, values.description);
      })
      .catch(fieldsError => {
        console.log("Validate Failed:", fieldsError);
      });
  }, [form, onProjectUpdate]);

  const handleFormValues = useCallback(() => {
    form
      .validateFields()
      .then(() => {
        setButtonDisabled(false);
      })
      .catch(fieldsError => {
        setButtonDisabled(
          fieldsError.errorFields.some((item: FieldError) => item.errors.length > 0),
        );
      });
  }, [form]);

  return (
    <StyledForm
      form={form}
      layout="vertical"
      autoComplete="off"
      initialValues={project}
      onFinish={handleSubmit}
      onValuesChange={handleFormValues}>
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
        <Button type="primary" htmlType="submit" disabled={buttonDisabled}>
          {t("Save changes")}
        </Button>
      </Form.Item>
    </StyledForm>
  );
};

const StyledForm = styled(Form)`
  max-width: 400px;
`;

export default ProjectGeneralForm;

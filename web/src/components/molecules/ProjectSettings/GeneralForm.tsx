import styled from "@emotion/styled";
import { useCallback, useState, useRef } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { keyReplace } from "@reearth-cms/components/molecules/Common/Form/utils";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { Constant } from "@reearth-cms/utils/constant";

import { Project } from "../Workspace/types";

import useHook from "./hook";

type Props = {
  project: Project;
  hasUpdateRight: boolean;
  onProjectUpdate: (name: string, alias: string, description: string) => Promise<void>;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
};

type FormType = {
  name: string;
  alias: string;
  description: string;
};

const GeneralForm: React.FC<Props> = ({
  project,
  hasUpdateRight,
  onProjectUpdate,
  onProjectAliasCheck,
}) => {
  const [form] = Form.useForm<FormType>();
  const t = useT();
  const [isDisabled, setIsDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { aliasValidate } = useHook(onProjectAliasCheck, project.alias);

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

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleValuesChange = useCallback(
    async (_: unknown, values: FormType) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = null;
      }
      const validate = async () => {
        const hasError = await form
          .validateFields()
          .then(() => false)
          .catch((errorInfo: ValidateErrorEntity) => errorInfo.errorFields.length > 0);
        if (
          project.name === values.name &&
          project.alias === values.alias &&
          project.description === values.description
        ) {
          setIsDisabled(true);
        } else {
          setIsDisabled(hasError);
        }
      };
      timeout.current = setTimeout(validate, 300);
    },
    [form, project.alias, project.description, project.name],
  );

  const handleAliasChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      keyReplace(e, { form, key: "alias" });
    },
    [form],
  );

  return (
    <StyledForm
      form={form}
      layout="vertical"
      autoComplete="off"
      initialValues={project}
      onFinish={handleSubmit}
      onValuesChange={handleValuesChange}
      validateTrigger="">
      <Form.Item
        name="name"
        label={t("Name")}
        rules={[{ required: true, message: t("Please input the name of project!") }]}>
        <Input
          disabled={!hasUpdateRight}
          data-testid={DATA_TEST_ID.ProjectSettings__GeneralForm__NameInput}
        />
      </Form.Item>
      <div data-testid={DATA_TEST_ID.ProjectSettings__GeneralForm__AliasField}>
        <Form.Item
          name="alias"
          label={t("Alias")}
          extra={t("A simpler way to access to the project.")}
          rules={[{ validator: async (_, value) => await aliasValidate(value) }]}>
          <Input
            disabled={!hasUpdateRight}
            onChange={handleAliasChange}
            showCount
            maxLength={Constant.PROJECT_ALIAS.MAX_LENGTH}
            data-testid={DATA_TEST_ID.ProjectSettings__GeneralForm__AliasInput}
          />
        </Form.Item>
      </div>
      <Form.Item
        name="description"
        label={t("Description")}
        extra={t("Write something here to describe this record.")}>
        <TextArea
          rows={4}
          disabled={!hasUpdateRight}
          data-testid={DATA_TEST_ID.ProjectSettings__GeneralForm__DescriptionInput}
        />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          disabled={isDisabled}
          loading={isLoading}
          data-testid={DATA_TEST_ID.ProjectSettings__GeneralForm__SaveButton}>
          {t("Save changes")}
        </Button>
      </Form.Item>
    </StyledForm>
  );
};

const StyledForm = styled(Form<FormType>)`
  max-width: 400px;
`;

export default GeneralForm;

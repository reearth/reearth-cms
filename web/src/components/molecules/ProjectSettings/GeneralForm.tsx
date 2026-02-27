import styled from "@emotion/styled";
import { useCallback, useRef, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { keyReplace } from "@reearth-cms/components/molecules/Common/Form/utils";
import { useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";

import { Project } from "../Workspace/types";
import useHook from "./hook";

type Props = {
  hasUpdateRight: boolean;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
  onProjectUpdate: (name: string, alias: string, description: string) => Promise<void>;
  project: Project;
};

type FormType = {
  alias: string;
  description: string;
  name: string;
};

const GeneralForm: React.FC<Props> = ({
  hasUpdateRight,
  onProjectAliasCheck,
  onProjectUpdate,
  project,
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

  const timeout = useRef<null | ReturnType<typeof setTimeout>>(null);
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
      autoComplete="off"
      form={form}
      initialValues={project}
      layout="vertical"
      onFinish={handleSubmit}
      onValuesChange={handleValuesChange}
      validateTrigger="">
      <Form.Item
        label={t("Name")}
        name="name"
        rules={[{ message: t("Please input the name of project!"), required: true }]}>
        <Input disabled={!hasUpdateRight} />
      </Form.Item>
      <Form.Item
        extra={t("A simpler way to access to the project.")}
        label={t("Alias")}
        name="alias"
        rules={[{ validator: async (_, value) => await aliasValidate(value) }]}>
        <Input
          disabled={!hasUpdateRight}
          maxLength={Constant.PROJECT_ALIAS.MAX_LENGTH}
          onChange={handleAliasChange}
          showCount
        />
      </Form.Item>
      <Form.Item
        extra={t("Write something here to describe this record.")}
        label={t("Description")}
        name="description">
        <TextArea disabled={!hasUpdateRight} rows={4} />
      </Form.Item>
      <Form.Item>
        <Button disabled={isDisabled} htmlType="submit" loading={isLoading} type="primary">
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

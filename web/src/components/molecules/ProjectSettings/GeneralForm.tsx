import styled from "@emotion/styled";
import { useCallback, useState, useRef } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { keyReplace } from "@reearth-cms/components/molecules/Common/Form/utils";
import { useT } from "@reearth-cms/i18n";
import { validateKey, MAX_KEY_LENGTH } from "@reearth-cms/utils/regex";

import { Project } from "../Workspace/types";

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

  const prevAlias = useRef<{ alias: string; isSuccess: boolean }>();
  const aliasValidate = useCallback(
    async (value: string) => {
      if (project.alias === value) {
        return Promise.resolve();
      } else if (prevAlias.current?.alias === value) {
        return prevAlias.current?.isSuccess ? Promise.resolve() : Promise.reject();
      } else if (value.length >= 5 && validateKey(value) && (await onProjectAliasCheck(value))) {
        prevAlias.current = { alias: value, isSuccess: true };
        return Promise.resolve();
      } else {
        prevAlias.current = { alias: value, isSuccess: false };
        return Promise.reject();
      }
    },
    [onProjectAliasCheck, project.alias],
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
        <Input disabled={!hasUpdateRight} />
      </Form.Item>
      <Form.Item
        name="alias"
        label={t("Alias")}
        extra={t("A simpler way to access to the project.")}
        rules={[
          {
            required: true,
            message: t("Project alias is not valid"),
            validator: async (_, value) => {
              await aliasValidate(value);
            },
          },
        ]}>
        <Input
          disabled={!hasUpdateRight}
          onChange={handleAliasChange}
          showCount
          maxLength={MAX_KEY_LENGTH}
        />
      </Form.Item>
      <Form.Item
        name="description"
        label={t("Description")}
        extra={t("Write something here to describe this record.")}>
        <TextArea rows={4} disabled={!hasUpdateRight} />
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

export default GeneralForm;

import styled from "@emotion/styled";
import { useCallback, useState, useRef } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { keyReplace } from "@reearth-cms/components/molecules/Common/Form/utils";
import { useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";
import { aliasRegex } from "@reearth-cms/utils/regex";

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

  const prevAliases = useRef<Map<string, boolean>>(new Map());

  const aliasValidate = useCallback(
    async (value: string) => {
      // empty value, throw error
      if (!value) return Promise.reject(t("Required field error", { field: "alias" }));

      // equal original value, then bypass
      if (project.alias === value) return Promise.resolve();

      // use previous validation
      if (prevAliases.current.has(value)) {
        return prevAliases.current.get(value)
          ? Promise.resolve()
          : Promise.reject(t("Project alias is already taken"));
      }

      // check length of alias in range
      if (
        value.length < Constant.PROJECT_ALIAS.MIN_LENGTH ||
        value.length > Constant.PROJECT_ALIAS.MAX_LENGTH
      ) {
        return Promise.reject(
          t(`Your alias must be between {{min}} and {{max}} characters long.`, {
            min: Constant.PROJECT_ALIAS.MIN_LENGTH,
            max: Constant.PROJECT_ALIAS.MAX_LENGTH,
          }),
        );
      }

      // check illegal characters
      if (!aliasRegex.test(value)) {
        return Promise.reject(
          t(
            "Alias is invalid. Please use lowercase alphanumeric, hyphen, underscore, and dot characters only.",
          ),
        );
      }

      // duplicate alias
      const checkResult = await onProjectAliasCheck(value);
      if (!checkResult) {
        prevAliases.current.set(value, false);
        return Promise.reject(t("Project alias is already taken"));
      }

      prevAliases.current.set(value, true);

      return Promise.resolve();
    },
    [onProjectAliasCheck, project.alias, t],
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
        rules={[{ validator: async (_, value) => await aliasValidate(value) }]}>
        <Input
          disabled={!hasUpdateRight}
          onChange={handleAliasChange}
          showCount
          maxLength={Constant.PROJECT_ALIAS.MAX_LENGTH}
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

import styled from "@emotion/styled";
import { useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { useT } from "@reearth-cms/i18n";

interface Props {
  user: User;
  onUserUpdate: (name: string, email: string) => Promise<void>;
}

interface FormType {
  name: string;
  email: string;
}

const AccountGeneralForm: React.FC<Props> = ({ user, onUserUpdate }) => {
  const [form] = Form.useForm<FormType>();
  const t = useT();
  const [isDisabled, setIsDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleValuesChange = useCallback(
    async (_: unknown, values: FormType) => {
      if (user.name === values.name && user.email === values.email) {
        setIsDisabled(true);
        return;
      }
      const hasError = await form
        .validateFields()
        .then(() => false)
        .catch((errorInfo: ValidateErrorEntity) => errorInfo.errorFields.length > 0);
      setIsDisabled(hasError);
    },
    [form, user.email, user.name],
  );

  const handleSubmit = useCallback(async () => {
    setIsDisabled(true);
    setIsLoading(true);
    try {
      const values = await form.validateFields();
      await onUserUpdate(values.name, values.email);
    } catch (_) {
      setIsDisabled(false);
    } finally {
      setIsLoading(false);
    }
  }, [form, onUserUpdate]);

  return (
    <StyledForm
      form={form}
      initialValues={user}
      layout="vertical"
      autoComplete="on"
      requiredMark={false}
      onValuesChange={handleValuesChange}>
      <Form.Item
        name="name"
        label={t("Account Name")}
        extra={t("This is your ID that is used between Re:Earth and Re:Earth CMS.")}
        rules={[
          {
            required: true,
            message: t("Please input Account Name!"),
          },
        ]}>
        <Input />
      </Form.Item>
      <Form.Item
        name="email"
        label={t("Your Email")}
        extra={t("Please enter the email address you want to use to log in with Re:Earth CMS.")}
        rules={[
          {
            required: true,
            message: t("Please input Your Email!"),
          },
        ]}>
        <Input />
      </Form.Item>
      <Button onClick={handleSubmit} type="primary" disabled={isDisabled} loading={isLoading}>
        {t("Save")}
      </Button>
    </StyledForm>
  );
};

const StyledForm = styled(Form<FormType>)`
  max-width: 400px;
`;

export default AccountGeneralForm;

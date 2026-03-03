import styled from "@emotion/styled";
import { useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

type Props = {
  initialValues: FormType;
  onUserUpdate: (name: string, email: string) => Promise<void>;
};

type FormType = {
  email: string;
  name: string;
};

const GeneralForm: React.FC<Props> = ({ initialValues, onUserUpdate }) => {
  const t = useT();

  const [form] = Form.useForm<FormType>();
  const [isDisabled, setIsDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleValuesChange = useCallback(
    async (_: unknown, values: FormType) => {
      if (initialValues.name === values.name && initialValues.email === values.email) {
        setIsDisabled(true);
        return;
      }
      const hasError = await form
        .validateFields()
        .then(() => false)
        .catch((errorInfo: ValidateErrorEntity) => errorInfo.errorFields.length > 0);
      setIsDisabled(hasError);
    },
    [form, initialValues.email, initialValues.name],
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
      autoComplete="on"
      form={form}
      initialValues={initialValues}
      layout="vertical"
      onValuesChange={handleValuesChange}
      requiredMark={false}>
      <Form.Item
        extra={t("This is your ID that is used between Re:Earth and Re:Earth CMS.")}
        label={t("Account Name")}
        name="name"
        rules={[
          {
            message: t("Please input Account Name!"),
            required: true,
          },
        ]}>
        <Input />
      </Form.Item>
      <Form.Item
        extra={t("Please enter the email address you want to use to log in with Re:Earth CMS.")}
        label={t("Your Email")}
        name="email"
        rules={[
          {
            message: t("Please input Your Email!"),
            required: true,
          },
        ]}>
        <Input />
      </Form.Item>
      <Button disabled={isDisabled} loading={isLoading} onClick={handleSubmit} type="primary">
        {t("Save")}
      </Button>
    </StyledForm>
  );
};

const StyledForm = styled(Form<FormType>)`
  max-width: 400px;
`;

export default GeneralForm;

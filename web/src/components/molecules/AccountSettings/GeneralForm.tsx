import styled from "@emotion/styled";
import { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import AvatarUploader from "@reearth-cms/components/molecules/Common/Settings/AvatarUploader";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  user?: User;
  onUserUpdate: (name?: string | undefined, email?: string | undefined) => Promise<void>;
};

const AccountGeneralForm: React.FC<Props> = ({ user, onUserUpdate }) => {
  const [form] = Form.useForm();
  const t = useT();

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      await onUserUpdate?.(values.name, values.email);
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  }, [form, onUserUpdate]);

  return (
    <StyledForm form={form} initialValues={user} layout="vertical" autoComplete="on">
      <Wrapper>
        <Form.Item
          name="name"
          label={t("Account Name")}
          extra={t("This is your ID that is used between Re:Earth and Re:Earth CMS.")}>
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label={t("Your Email")}
          extra={t("Please enter the email address you want to use to log in with Re:Earth CMS.")}>
          <Input />
        </Form.Item>
        <Button onClick={handleSubmit} type="primary" htmlType="submit">
          {t("Save")}
        </Button>
      </Wrapper>
      <AvatarUploader />
    </StyledForm>
  );
};

export default AccountGeneralForm;

const StyledForm = styled(Form)`
  display: flex;
`;

const Wrapper = styled.div`
  max-width: 400px;
`;

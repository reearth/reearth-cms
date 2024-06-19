import styled from "@emotion/styled";
import { useCallback, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { localesWithLabel, useT } from "@reearth-cms/i18n";

interface Props {
  user: User;
  onLanguageUpdate: (lang: string) => Promise<void>;
}

interface FormType {
  lang: string;
}

const AccountServiceForm: React.FC<Props> = ({ user, onLanguageUpdate }) => {
  const [form] = Form.useForm<FormType>();
  const { Option } = Select;
  const t = useT();
  const [isDisabled, setIsDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const langItems = useMemo(
    () => [
      { key: "und", label: t("Auto") },
      ...Object.keys(localesWithLabel).map(l => ({
        key: l as keyof typeof localesWithLabel,
        label: localesWithLabel[l as keyof typeof localesWithLabel],
      })),
    ],
    [t],
  );

  const handleSelect = useCallback(
    (value: string) => {
      setIsDisabled(value === user?.lang);
    },
    [user?.lang],
  );

  const handleSubmit = useCallback(async () => {
    setIsDisabled(true);
    setIsLoading(true);
    try {
      const values = await form.validateFields();
      await onLanguageUpdate(values.lang);
    } catch (_) {
      setIsDisabled(false);
    } finally {
      setIsLoading(false);
    }
  }, [form, onLanguageUpdate]);

  return (
    <StyledForm form={form} initialValues={user} layout="vertical" autoComplete="off">
      <Form.Item
        name="lang"
        label={t("Service Language")}
        extra={t("This will change the UI language")}>
        <Select placeholder={t("Language")} onSelect={handleSelect}>
          {langItems?.map(langItem => (
            <Option key={langItem.key} value={langItem.key}>
              {langItem.label}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Button onClick={handleSubmit} type="primary" disabled={isDisabled} loading={isLoading}>
        {t("Save")}
      </Button>
    </StyledForm>
  );
};

const StyledForm = styled(Form)`
  max-width: 400px;
`;

export default AccountServiceForm;

import styled from "@emotion/styled";
import { useCallback, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";
import { localesWithLabel, useT } from "@reearth-cms/i18n";

type Props = {
  initialValues: FormType;
  onLanguageUpdate: (lang: string) => Promise<void>;
};

type FormType = {
  lang: string;
};

const ServiceForm: React.FC<Props> = ({ initialValues, onLanguageUpdate }) => {
  const t = useT();

  const [form] = Form.useForm<FormType>();
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
      setIsDisabled(value === initialValues.lang);
    },
    [initialValues.lang],
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
    <StyledForm autoComplete="off" form={form} initialValues={initialValues} layout="vertical">
      <Form.Item
        extra={t("This will change the UI language")}
        label={t("Service Language")}
        name="lang">
        <Select onSelect={handleSelect} placeholder={t("Language")}>
          {langItems?.map(langItem => (
            <Select.Option key={langItem.key} value={langItem.key}>
              {langItem.label}
            </Select.Option>
          ))}
        </Select>
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

export default ServiceForm;

import styled from "@emotion/styled";
import { useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Col from "@reearth-cms/components/atoms/Col";
import Divider from "@reearth-cms/components/atoms/Divider";
import Form, { ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Row from "@reearth-cms/components/atoms/Row";
import {
  WebhookTrigger,
  TriggerKey,
  WebhookValues,
  NewWebhook,
  Webhook,
} from "@reearth-cms/components/molecules/MyIntegrations/types";
import { useT } from "@reearth-cms/i18n";
import { validateURL } from "@reearth-cms/utils/regex";

type Props = {
  webhookInitialValues?: WebhookValues;
  loading: boolean;
  onBack: () => void;
  onWebhookCreate: (data: NewWebhook) => Promise<void>;
  onWebhookUpdate: (data: Webhook) => Promise<void>;
};

type FormType = {
  name: string;
  url: string;
  secret: string;
  trigger?: TriggerKey[];
};

const WebhookForm: React.FC<Props> = ({
  webhookInitialValues,
  loading,
  onBack,
  onWebhookCreate,
  onWebhookUpdate,
}) => {
  const t = useT();
  const [form] = Form.useForm<FormType>();
  const [isDisabled, setIsDisabled] = useState(true);

  const itemOptions = [
    { label: t("Create"), value: "onItemCreate" },
    { label: t("Update"), value: "onItemUpdate" },
    { label: t("Delete"), value: "onItemDelete" },
    { label: t("Publish"), value: "onItemPublish" },
    { label: t("Unpublish"), value: "onItemUnPublish" },
  ];

  const assetOptions = [
    { label: t("Upload"), value: "onAssetUpload" },
    { label: t("Decompress"), value: "onAssetDecompress" },
    { label: t("Delete"), value: "onAssetDelete" },
  ];

  const checkIfArrayEquals = useCallback(
    (ary1: unknown[], ary2: unknown[]) =>
      ary1.length === ary2.length && ary1.every(value => ary2.includes(value)),
    [],
  );

  const handleValuesChange = useCallback(
    async (_: unknown, values: FormType) => {
      const hasError = await form
        .validateFields()
        .then(() => false)
        .catch((errorInfo: ValidateErrorEntity) => errorInfo.errorFields.length > 0);
      if (!hasError && webhookInitialValues) {
        let isSame = true;
        for (const newValueKey in values) {
          const initialValue = webhookInitialValues?.[newValueKey as keyof FormType];
          const newValue = values[newValueKey as keyof FormType];
          if (Array.isArray(initialValue) && Array.isArray(newValue)) {
            if (!checkIfArrayEquals(initialValue, newValue)) {
              isSame = false;
              break;
            }
          } else if (initialValue !== newValue) {
            isSame = false;
            break;
          }
        }
        setIsDisabled(isSame);
      } else {
        setIsDisabled(hasError);
      }
    },
    [checkIfArrayEquals, form, webhookInitialValues],
  );

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const trigger: WebhookTrigger = {};
      values.trigger?.forEach(t => (trigger[t] = true));

      const payload = {
        ...values,
        trigger,
      };
      if (webhookInitialValues) {
        await onWebhookUpdate({
          ...payload,
          active: webhookInitialValues.active,
          id: webhookInitialValues.id,
        });
      } else {
        await onWebhookCreate({
          ...payload,
          active: false,
        });
      }
      setIsDisabled(true);
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  }, [form, onWebhookCreate, onWebhookUpdate, webhookInitialValues]);

  return (
    <>
      <Button
        icon={<Icon icon="arrowLeft" />}
        onClick={onBack}
        size="small"
        color="default"
        variant="link"
      />
      <StyledForm
        form={form}
        name="webhook"
        layout="vertical"
        initialValues={webhookInitialValues}
        onValuesChange={handleValuesChange}>
        <Row gutter={32}>
          <Col span={11}>
            <Form.Item
              name="name"
              label={t("Name")}
              extra={t("This is your webhook name")}
              rules={[
                {
                  required: true,
                  message: t("Please input the name of the webhook!"),
                },
              ]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="url"
              label={t("Url")}
              extra={t("Please note that all webhook URLs must start with http://.")}
              rules={[
                {
                  required: true,
                  message: t("URL is not valid"),
                  validator: async (_, value) => {
                    return validateURL(value) ? Promise.resolve() : Promise.reject();
                  },
                },
              ]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="secret"
              label={t("Secret")}
              extra={t("This secret will be used to sign Webhook request")}
              rules={[
                {
                  required: true,
                  message: t("Please input secret!"),
                },
              ]}>
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleSubmit} disabled={isDisabled} loading={loading}>
                {t("Save")}
              </Button>
            </Form.Item>
          </Col>
          <Col>
            <StyledDivider type="vertical" />
          </Col>
          <Col span={11}>
            <CheckboxTitle>{t("Trigger Event")}</CheckboxTitle>
            <Form.Item name="trigger">
              <StyledCheckboxGroup>
                <CheckboxLabel>{t("Item")}</CheckboxLabel>
                <Row>
                  {itemOptions.map(item => (
                    <Col key={item.value}>
                      <Checkbox value={item.value}>{item.label}</Checkbox>
                    </Col>
                  ))}
                </Row>
                <CheckboxLabel>{t("Asset")}</CheckboxLabel>
                <Row>
                  {assetOptions.map(item => (
                    <Col key={item.value}>
                      <Checkbox value={item.value}>{item.label}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </StyledCheckboxGroup>
            </Form.Item>
          </Col>
        </Row>
      </StyledForm>
    </>
  );
};

const StyledCheckboxGroup = styled(Checkbox.Group)`
  display: block;
`;

const CheckboxLabel = styled.p`
  margin-top: 24px;
  margin-bottom: 8px;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #000000d9;
`;

const StyledForm = styled(Form<FormType>)`
  margin-top: 36px;
`;

const CheckboxTitle = styled.h5`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #000000d9;
  margin-bottom: 24px;
`;

const StyledDivider = styled(Divider)`
  height: 100%;
`;

export default WebhookForm;

import styled from "@emotion/styled";
import { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Checkbox, { CheckboxOptionType } from "@reearth-cms/components/atoms/Checkbox";
import Col from "@reearth-cms/components/atoms/Col";
import Divider from "@reearth-cms/components/atoms/Divider";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Row from "@reearth-cms/components/atoms/Row";
import { WebhookTrigger } from "@reearth-cms/components/molecules/MyIntegrations/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  onBack?: () => void;
  webhookInitialValues?: any;
  onWebhookCreate: (data: {
    name: string;
    url: string;
    active: boolean;
    trigger: WebhookTrigger;
  }) => Promise<void>;
  onWebhookUpdate: (data: {
    webhookId: string;
    name: string;
    url: string;
    active: boolean;
    trigger: WebhookTrigger;
  }) => Promise<void>;
};

const WebhookForm: React.FC<Props> = ({
  onWebhookCreate,
  onWebhookUpdate,
  webhookInitialValues,
  onBack,
}) => {
  const t = useT();

  const [form] = Form.useForm();

  const itemOptions: CheckboxOptionType[] = [
    { label: t("Create"), value: "onItemCreate" },
    { label: t("Update"), value: "onItemUpdate" },
    { label: t("Delete"), value: "onItemDelete" },
    { label: t("Publish"), value: "onItemPublish" },
    { label: t("Unpublish"), value: "onItemUnPublish" },
  ];

  const assetOptions: CheckboxOptionType[] = [
    { label: t("Upload"), value: "onAssetUpload" },
    { label: t("Delete"), value: "onAssetDeleted" },
  ];

  const urlRegex =
    /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const trigger: WebhookTrigger = ((values.trigger as string[]) ?? []).reduce(
        (ac, a) => ({ ...ac, [a]: true }),
        {},
      ) as WebhookTrigger;
      // TODO: refactor
      values.active = false;
      if (webhookInitialValues?.id) {
        await onWebhookUpdate({ ...values, webhookId: webhookInitialValues.id, trigger });
        onBack?.();
      } else {
        await onWebhookCreate?.({ ...values, trigger });
        form.resetFields();
      }
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  }, [form, onWebhookCreate, onWebhookUpdate, onBack, webhookInitialValues]);

  return (
    <>
      <Icon icon="arrowLeft" onClick={onBack} />
      <StyledForm form={form} layout="vertical" initialValues={webhookInitialValues}>
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
                  message: t("Please input the name of the webhook!"),
                },
                {
                  message: t("URL is not valid"),
                  validator: async (_, value) => {
                    if (!urlRegex.test(value) && value.length > 0) return Promise.reject();

                    return Promise.resolve();
                  },
                },
              ]}>
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" onClick={handleSubmit}>
                {t("Save")}
              </Button>
            </Form.Item>
          </Col>
          <Col>
            <Divider type="vertical" style={{ height: "100%" }} />
          </Col>
          <Col span={11}>
            <CheckboxTitle>{t("Trigger Event")}</CheckboxTitle>
            <Form.Item name="trigger">
              <Checkbox.Group>
                <CheckboxLabel>{t("Item")}</CheckboxLabel>
                <Row>
                  {itemOptions.map((item, index) => (
                    <Col key={index}>
                      <Checkbox value={item.value}>{item.label}</Checkbox>
                    </Col>
                  ))}
                </Row>
                <CheckboxLabel>{t("Asset")}</CheckboxLabel>
                <Row>
                  {assetOptions.map((item, index) => (
                    <Col key={index}>
                      <Checkbox value={item.value}>{item.label}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </Col>
        </Row>
      </StyledForm>
    </>
  );
};

const CheckboxLabel = styled.p`
  margin-top: 24px;
  margin-bottom: 8px;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #000000d9;
`;

const StyledForm = styled(Form)`
  margin-top: 36px;
`;

const CheckboxTitle = styled.h5`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #000000d9;
  margin-bottom: 24px;
`;

export default WebhookForm;

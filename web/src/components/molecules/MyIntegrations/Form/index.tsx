import { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Col from "@reearth-cms/components/atoms/Col";
import Divider from "@reearth-cms/components/atoms/Divider";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Row from "@reearth-cms/components/atoms/Row";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  integration: Integration;
  onIntegrationUpdate: (data: { name: string; description: string; logoUrl: string }) => void;
};

const MyIntegrationForm: React.FC<Props> = ({ integration, onIntegrationUpdate }) => {
  const t = useT();
  const [form] = Form.useForm();

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      // TODO: when assets upload is ready to use
      values.logoUrl = "_";
      await onIntegrationUpdate?.(values);
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  }, [form, onIntegrationUpdate]);

  return (
    <Form form={form} layout="vertical" initialValues={integration}>
      <Row gutter={32}>
        <Col span={11}>
          <Form.Item
            name="name"
            label={t("Integration Name")}
            rules={[
              {
                required: true,
                message: t("Please input the title of the integration!"),
              },
            ]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label={t("Description")}>
            <TextArea rows={3} showCount maxLength={100} />
          </Form.Item>
          <Form.Item label={t("Integration Token")}>
            <Input.Password value={integration.config.token} contentEditable={false} />
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
        <Col span={11} />
      </Row>
    </Form>
  );
};

export default MyIntegrationForm;
